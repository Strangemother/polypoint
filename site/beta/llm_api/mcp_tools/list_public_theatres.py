"""MCP tool for discovering public theatres."""

from django.urls import reverse

from ..knowledge.guide import read_header_metadata
from ..mcp_protocol import rpc_error, tool_result
from ..models import TheatreExample

TOOL = {
    "name": "list_public_theatres",
    "description": "Discover public Polypoint theatres by optional name search. Returns names, short source-header descriptions and direct links. Use read_theatre by id for full source.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "maxLength": 100,
                "description": "Optional case-insensitive name search.",
            },
            "limit": {
                "type": "integer",
                "minimum": 1,
                "maximum": 100,
                "description": "Results per page; defaults to 30.",
            },
            "offset": {
                "type": "integer",
                "minimum": 0,
                "description": "Result offset; defaults to 0.",
            },
        },
        "additionalProperties": False,
    },
    "annotations": {
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
}


def handle(request, request_id, arguments):
    if (
        set(arguments) - {"query", "limit", "offset"}
        or not isinstance(arguments.get("query", ""), str)
        or len(arguments.get("query", "")) > 100
        or type(arguments.get("limit", 30)) is not int
        or not 1 <= arguments.get("limit", 30) <= 100
        or type(arguments.get("offset", 0)) is not int
        or arguments.get("offset", 0) < 0
    ):
        return rpc_error(request_id, -32602, "Invalid public theatre search arguments.")
    theatres = TheatreExample.objects.filter(
        visibility=TheatreExample.Visibility.PUBLIC,
        is_deleted=False,
    )
    query = arguments.get("query", "").strip()
    if query:
        theatres = theatres.filter(name__icontains=query)
    theatres = theatres.order_by("name", "id")
    offset, limit = arguments.get("offset", 0), arguments.get("limit", 30)
    batch = list(theatres[offset : offset + limit + 1])
    examples = []
    for theatre in batch[:limit]:
        metadata = read_header_metadata(theatre.source[:4096]) or {}
        description = next(
            (
                value.strip()
                for key in ("description", "summary")
                for value in metadata.get(key, ())
                if value.strip()
            ),
            "",
        )[:240]
        url = request.build_absolute_uri(
            reverse("llm_api:theatre_view", kwargs={"example_id": theatre.pk})
        )
        examples.append(
            {"id": theatre.pk, "name": theatre.name, "description": description, "url": url}
        )
    payload = {
        "ok": True,
        "theatres": examples,
        "count": len(examples),
        "offset": offset,
        "next_offset": offset + limit if len(batch) > limit else None,
    }
    return tool_result(request_id, payload)
