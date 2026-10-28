"""MCP tool for advisory theatre-source validation."""

from ..knowledge.guide import validate_source
from ..mcp_protocol import rpc_error, tool_result

TOOL = {
    "name": "validate_theatre",
    "description": "Run non-executing advisory static checks on complete JavaScript theatre source before storing. Does not guarantee rendering correctness.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "theatre_file_content": {
                "type": "string",
                "description": "Complete JavaScript source, maximum 1 MiB.",
            }
        },
        "required": ["theatre_file_content"],
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
    if set(arguments) != {"theatre_file_content"} or not isinstance(
        arguments["theatre_file_content"], str
    ):
        return rpc_error(request_id, -32602, "Expected theatre_file_content string.")
    return tool_result(request_id, validate_source(arguments["theatre_file_content"]))
