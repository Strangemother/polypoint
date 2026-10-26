"""Shared schemas and adapter for the form API's theatre operations."""

import json
import logging

from ..api_common import MAX_REVISION, validate_fields
from ..mcp_protocol import rpc_error, tool_result

logger = logging.getLogger("llm_api.mcp")


def theatre_schema(action):
    properties = {
        "name": {"type": "string", "pattern": "^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$"},
        "id": {"type": "string", "minLength": 1},
    }
    required = []
    if action == "store":
        properties["theatre_file_content"] = {
            "type": "string",
            "description": "Complete JavaScript source; at most 1 MiB of UTF-8.",
        }
        required.append("theatre_file_content")
    if action in ("store", "remove"):
        properties["revision"] = {
            "type": "integer",
            "minimum": 1,
            "maximum": MAX_REVISION,
            "description": "Current revision from read; required for updates and removals.",
        }
    if action == "remove":
        required.append("revision")
    if action == "read":
        properties["scope"] = {
            "type": "string",
            "enum": ["personal", "public"],
            "description": "Only with name; defaults to personal. Omit when using id.",
        }
    return {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": False,
        "oneOf": [{"required": ["name"]}, {"required": ["id"]}],
    }


def handle_theatre_action(request, request_id, arguments, action, operation):
    schema = theatre_schema(action)
    if set(arguments) - set(schema["properties"]) or any(
        key not in arguments for key in schema["required"]
    ):
        return rpc_error(request_id, -32602, "Unknown or missing tool arguments.")
    for key, value in arguments.items():
        if key == "revision":
            if type(value) is not int or not 1 <= value <= MAX_REVISION:
                return rpc_error(request_id, -32602, "Revision must be a positive integer.")
        elif not isinstance(value, str):
            return rpc_error(request_id, -32602, "Tool fields must be strings.")
    fields = {key: str(value) for key, value in arguments.items()}
    fields["action"] = action
    try:
        data, error = validate_fields(fields)
        if error is not None:
            payload = json.loads(error.content)
            return rpc_error(request_id, -32602, payload["error"]["message"])
        response = operation(request, request.theatre_api_user, data)
        payload = json.loads(response.content)
    except Exception:
        logger.exception("Unexpected MCP tool failure")
        return rpc_error(request_id, -32603, "Internal server error.")
    return tool_result(request_id, payload)
