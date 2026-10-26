"""JSON-RPC and MCP response helpers."""

import json

from .api_common import json_response


def rpc_error(request_id, code, message, status=200):
    return json_response(
        {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}},
        status,
    )


def result(request_id, payload):
    return json_response({"jsonrpc": "2.0", "id": request_id, "result": payload})


def tool_result(request_id, payload, *, ensure_ascii=False):
    return result(
        request_id,
        {
            "content": [{"type": "text", "text": json.dumps(payload, ensure_ascii=ensure_ascii)}],
            "isError": not payload["ok"],
        },
    )
