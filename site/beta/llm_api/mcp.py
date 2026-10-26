"""Stateless Streamable HTTP transport for the theatre MCP tools."""

import json
import logging

from django.conf import settings
from django.core.exceptions import RequestDataTooBig
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .api_common import authenticate
from .mcp_protocol import result as _result, rpc_error as _rpc_error
from .mcp_tools import HANDLERS, TOOLS
from .oauth import authenticate_oauth, metadata_url

logger = logging.getLogger(__name__)
VERSIONS = ("2025-03-26", "2025-06-18")
MAX_BODY_BYTES = 8 * 1024 * 1024


def _reject_constant(value):
    raise ValueError("Non-JSON number")


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON member")
        result[key] = value
    return result


@method_decorator(csrf_exempt, name="dispatch")
class TheatreMCPView(View):
    """No sessions, SSE, or server-initiated messages; JSON responses only."""

    http_method_names = ["post", "get", "delete"]

    def dispatch(self, request, *args, **kwargs):
        origin = request.headers.get("Origin")
        allowed = set(getattr(settings, "LLM_API_MCP_ALLOWED_ORIGINS", []))
        allowed.add(f"{request.scheme}://{request.get_host()}")
        if origin is not None and origin not in allowed:
            return _rpc_error(None, -32000, "Origin is not allowed.", 403)
        try:
            user = authenticate(request) or authenticate_oauth(request)
        except Exception:
            logger.exception("MCP authentication failed")
            return _rpc_error(None, -32603, "Internal server error.", 500)
        if user is None:
            response = _rpc_error(None, -32000, "Valid API credentials are required.", 401)
            response["WWW-Authenticate"] = (
                f'Bearer resource_metadata="{metadata_url()}", scope="theatre"'
            )
            return response
        request.theatre_api_user = user
        version = request.headers.get("MCP-Protocol-Version")
        if version is not None and version not in VERSIONS:
            return _rpc_error(None, -32600, "Unsupported MCP protocol version.", 400)
        return super().dispatch(request, *args, **kwargs)

    def http_method_not_allowed(self, request, *args, **kwargs):
        response = _rpc_error(None, -32000, "No SSE stream or session deletion; use POST.", 405)
        response["Allow"] = "POST"
        return response

    get = http_method_not_allowed
    delete = http_method_not_allowed

    def post(self, request):
        if request.content_type != "application/json":
            return _rpc_error(None, -32600, "Use application/json.", 415)
        charset = request.content_params.get("charset", "utf-8").lower().replace("_", "-")
        if charset not in ("utf-8", "utf8"):
            return _rpc_error(None, -32600, "Use UTF-8 JSON.", 415)
        accepted = {
            part.split(";", 1)[0].strip() for part in request.headers.get("Accept", "").split(",")
        }
        if not {"application/json", "text/event-stream"}.issubset(accepted):
            return _rpc_error(
                None, -32600, "Accept must include application/json and text/event-stream.", 406
            )
        try:
            body = request.body
            if len(body) > MAX_BODY_BYTES:
                raise RequestDataTooBig()
            message = json.loads(
                body.decode("utf-8"),
                parse_constant=_reject_constant,
                object_pairs_hook=_unique_object,
            )
        except RequestDataTooBig:
            return _rpc_error(None, -32600, "Request body is too large.", 413)
        except (UnicodeDecodeError, ValueError, RecursionError):
            return _rpc_error(None, -32700, "Invalid JSON.", 400)
        if not isinstance(message, dict):
            return _rpc_error(None, -32600, "Expected one JSON-RPC message, not a batch.", 400)
        request_id = message.get("id")
        if (
            message.get("jsonrpc") != "2.0"
            or not isinstance(message.get("method"), str)
            or ("id" in message and (type(request_id) not in (str, int)))
        ):
            return _rpc_error(None, -32600, "Invalid JSON-RPC request.", 400)
        params = message.get("params", {})
        if not isinstance(params, dict):
            return _rpc_error(request_id, -32602, "Parameters must be an object.", 400)
        method = message["method"]
        if "id" not in message:
            # JSON-RPC notifications never trigger tools or receive RPC responses.
            if not method.startswith("notifications/"):
                return HttpResponse(status=400, headers={"Cache-Control": "no-store"})
            return HttpResponse(status=202, headers={"Cache-Control": "no-store"})
        if method == "initialize":
            info = params.get("clientInfo")
            if (
                not isinstance(params.get("protocolVersion"), str)
                or not isinstance(params.get("capabilities"), dict)
                or not isinstance(info, dict)
                or not all(isinstance(info.get(k), str) for k in ("name", "version"))
            ):
                return _rpc_error(request_id, -32602, "Invalid initialization parameters.")
            version = params["protocolVersion"]
            return _result(
                request_id,
                {
                    "protocolVersion": version if version in VERSIONS else VERSIONS[-1],
                    "capabilities": {"tools": {"listChanged": False}},
                    "serverInfo": {"name": "polypoint-theatre", "version": "1.0.0"},
                },
            )
        if method == "ping":
            return _result(request_id, {})
        if method == "tools/list":
            if params.get("cursor") is not None:
                return _rpc_error(request_id, -32602, "No pagination cursor is supported.")
            return _result(request_id, {"tools": TOOLS})
        if method != "tools/call":
            return _rpc_error(request_id, -32601, "Method not found.")
        name = params.get("name")
        if not isinstance(name, str) or name not in HANDLERS:
            return _rpc_error(request_id, -32602, "Unknown tool.")
        arguments = params.get("arguments", {})
        if not isinstance(arguments, dict):
            return _rpc_error(request_id, -32602, "Tool arguments must be an object.")
        return HANDLERS[name](request, request_id, arguments)
