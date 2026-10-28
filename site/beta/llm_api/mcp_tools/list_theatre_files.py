"""MCP tool for listing and searching indexed theatre files."""

from examples.models import TheatreFile

from ..mcp_protocol import rpc_error, tool_result
from ..theatre_catalogue import MAX_SIGNED_BIGINT, theatre_summary

TOOL = {
    "name": "list_theatre_files",
    "description": (
        "List indexed repository theatre files or search their metadata title or filename. "
        "Use read_theatre_file with a returned id or filepath to read the full source."
    ),
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "maxLength": 100,
                "description": "Optional case-insensitive substring of the title or filename.",
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
                "maximum": MAX_SIGNED_BIGINT,
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
        or not 0 <= arguments.get("offset", 0) <= MAX_SIGNED_BIGINT
    ):
        return rpc_error(request_id, -32602, "Invalid theatre file search arguments.")

    query = arguments.get("query", "").strip().casefold()
    offset, limit = arguments.get("offset", 0), arguments.get("limit", 30)
    records = TheatreFile.objects.order_by("filepath", "id").only(
        "id", "name", "filepath", "description"
    )
    warnings = []
    if query:
        matches = []
        unavailable = 0
        for theatre in records.iterator():
            item = theatre_summary(theatre)
            if "source_error" in item:
                unavailable += 1
            if query in item["title"].casefold() or query in item["filepath"].casefold():
                matches.append(item)
        page = matches[offset : offset + limit]
        has_more = len(matches) > offset + limit
        if unavailable:
            warnings.append(
                {
                    "code": "title_search_incomplete",
                    "message": "Some indexed files could not be read, so their metadata titles could not be searched.",
                    "affected_count": unavailable,
                }
            )
    else:
        batch = list(records[offset : offset + limit + 1])
        page = [theatre_summary(theatre) for theatre in batch[:limit]]
        has_more = len(batch) > limit

    payload = {
        "ok": True,
        "theatres": page,
        "count": len(page),
        "offset": offset,
        "next_offset": offset + limit if has_more else None,
        "warnings": warnings,
    }
    return tool_result(request_id, payload)
