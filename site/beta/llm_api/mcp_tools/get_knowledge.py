"""MCP tool for reading authoring knowledge."""

from ..knowledge.guide import TOPICS, get_guide
from ..mcp_protocol import rpc_error, tool_result

TOOL = {
    "name": "get_knowledge",
    "description": "Read version-matched Polypoint authoring guidance. Use topic 'examples' to discover 20 complete, individually retrievable theatre starters.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "topic": {
                "type": "string",
                "enum": list(TOPICS),
                "description": "Deck or example topic; defaults to overview.",
            }
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
        set(arguments) - {"topic"}
        or not isinstance(arguments.get("topic", "overview"), str)
        or arguments.get("topic", "overview") not in TOPICS
    ):
        return rpc_error(request_id, -32602, "Invalid knowledge topic.")
    return tool_result(request_id, get_guide(arguments.get("topic", "overview")))
