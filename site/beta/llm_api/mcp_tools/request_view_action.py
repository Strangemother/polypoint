"""MCP tool for requesting navigation in the owner's viewer."""

import uuid

from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone

from ..mcp_protocol import rpc_error, tool_result
from ..models import TheatreExample

TOOL = {
    "name": "request_view_action",
    "description": "Ask the signed-in owner's Polypoint viewer to navigate to an owned or public theatre by exact ID or name. Command expires after 60 seconds; never accepts arbitrary URLs. Viewer must be open and signed in as the same user.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "id": {"type": "string", "minLength": 1},
            "name": {"type": "string", "pattern": "^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$"},
            "scope": {
                "type": "string",
                "enum": ["personal", "public"],
                "description": "Only for name lookup; defaults to personal.",
            },
        },
        "oneOf": [{"required": ["id"]}, {"required": ["name"]}],
        "additionalProperties": False,
    },
    "annotations": {
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    },
}


def handle(request, request_id, arguments):
    if (
        set(arguments) - {"id", "name", "scope"}
        or ("id" in arguments) == ("name" in arguments)
        or not all(isinstance(value, str) for value in arguments.values())
        or (
            "scope" in arguments
            and ("id" in arguments or arguments["scope"] not in ("personal", "public"))
        )
    ):
        return rpc_error(request_id, -32602, "Invalid theatre selector.")
    user = request.theatre_api_user
    if "id" in arguments:
        theatres = TheatreExample.objects.filter(pk=arguments["id"], is_deleted=False)
        theatre = theatres.first()
        if (
            theatre
            and theatre.owner_id != user.pk
            and theatre.visibility == TheatreExample.Visibility.PRIVATE
        ):
            theatre = None
    else:
        theatres = TheatreExample.objects.filter(name=arguments["name"], is_deleted=False)
        if arguments.get("scope", "personal") == "public":
            theatres = theatres.filter(visibility=TheatreExample.Visibility.PUBLIC)
        else:
            theatres = theatres.filter(owner=user)
        matches = list(theatres[:2])
        if len(matches) > 1:
            payload = {
                "ok": False,
                "error": {
                    "code": "ambiguous_name",
                    "message": "Multiple theatres match; select by ID.",
                },
            }
            return tool_result(request_id, payload, ensure_ascii=True)
        theatre = matches[0] if matches else None
    if theatre is None:
        payload = {"ok": False, "error": {"code": "not_found", "message": "Theatre not found."}}
        return tool_result(request_id, payload, ensure_ascii=True)
    command = {
        "id": uuid.uuid4().hex,
        "theatre_id": theatre.pk,
        "issued_at": timezone.now().timestamp(),
    }
    cache.set(f"llm_api:view_command:{user.pk}", command, timeout=60)
    payload = {
        "ok": True,
        "command_id": command["id"],
        "name": theatre.name,
        "url": request.build_absolute_uri(
            reverse("llm_api:theatre_view", kwargs={"example_id": theatre.pk})
        ),
        "expires_in_seconds": 60,
    }
    return tool_result(request_id, payload, ensure_ascii=True)
