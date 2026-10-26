"""MCP tool for creating or updating a theatre."""

from ..theatre_actions.store import store_theatre
from .common import handle_theatre_action, theatre_schema

TOOL = {
    "name": "store_theatre",
    "description": (
        "Create an unlisted Polypoint example by new name or replace an owned example. "
        "Use exactly one of name or id. Existing examples require their current revision. "
        "Read and reconcile on conflicts; never blindly retry. Source is stored, not executed."
    ),
    "inputSchema": theatre_schema("store"),
    "annotations": {
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": False,
        "openWorldHint": False,
    },
}


def handle(request, request_id, arguments):
    return handle_theatre_action(request, request_id, arguments, "store", store_theatre)
