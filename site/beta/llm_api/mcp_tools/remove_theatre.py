"""MCP tool for removing a theatre."""

from ..theatre_actions.remove import remove_theatre
from .common import handle_theatre_action, theatre_schema

TOOL = {
    "name": "remove_theatre",
    "description": "Remove an owned Polypoint example by name or id with its current revision.",
    "inputSchema": theatre_schema("remove"),
    "annotations": {
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": False,
        "openWorldHint": False,
    },
}


def _remove_for_request(request, user, data):
    return remove_theatre(user, data)


def handle(request, request_id, arguments):
    return handle_theatre_action(request, request_id, arguments, "remove", _remove_for_request)
