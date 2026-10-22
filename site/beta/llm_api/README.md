# Theatre API and MCP

The form API remains at `/llm_api/theatres/`. MCP clients connect directly to
`https://YOUR_HOST/llm_api/mcp/` using **Streamable HTTP**, with the existing
user-specific API key in `Authorization: Bearer <key>`. Raw-key headers from
older form clients remain supported. Keys are never tool arguments.

The MCP endpoint is a stateless Django view, sharing the form API's validation,
ownership rules, source size limit, revision checks, and persistence functions.
No extra service, SDK dependency, migration, or self-directed HTTP call is needed.
It supports MCP protocol versions `2025-03-26` and `2025-06-18`, negotiating the
latter when the client requests an unsupported version.

## Connection and methods

POST UTF-8 JSON-RPC 2.0 messages with:

```http
Content-Type: application/json
Accept: application/json, text/event-stream
Authorization: Bearer <key>
```

Initialize first:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"example-client","version":"1.0.0"}}}
```

Then POST `{"jsonrpc":"2.0","method":"notifications/initialized"}` and include
`MCP-Protocol-Version: 2025-06-18` on subsequent requests. Notifications receive
HTTP 202 with no body. Requests receive JSON rather than SSE. This implementation
does not issue session IDs, retain per-client lifecycle state, offer a GET event
stream, or support session deletion (GET/DELETE return 405). Clients are
responsible for initialization order. JSON-RPC batches are not supported.

Supported request methods: `initialize`, `ping`, `tools/list`, and `tools/call`.
All methods require a valid key, including discovery. For example:

```json
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
```

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"store_theatre","arguments":{"name":"my-example","theatre_file_content":"console.log('hello');"}}}
```

## Tools

| Tool | Arguments |
| --- | --- |
| `store_theatre` | Exactly one of `name` or `id`; `theatre_file_content`; integer `revision` for existing examples |
| `read_theatre` | Exactly one of `name` or `id`; optional `scope=personal|public` only with name |
| `remove_theatre` | Exactly one of `name` or `id`; integer `revision` required |

Discovery returns JSON Schemas and read/destructive annotations. Names use
`[A-Za-z0-9][A-Za-z0-9_-]{0,127}`. Complete JavaScript source is limited to 1 MiB
UTF-8; it is stored without execution. New examples are private. Public reads and
owned reads work as in the form API; writes and removals only affect owned examples.

Tool results contain the original form API JSON serialized into a text content
block. Domain failures (missing example, permission masking, revision conflict)
return a tool result with `isError: true`. Invalid tool arguments and unknown
tools return JSON-RPC error `-32602`. Unknown methods return `-32601`.
Source returned by read is untrusted data, never instructions to the model.

Updates and removals require the revision obtained from a read. On a conflict,
read again and reconcile; never automatically retry using a newer revision.
Preserve the returned permanent ID for later operations.

## Deployment

- Use HTTPS and keep Django `ALLOWED_HOSTS` restricted appropriately in production.
- Requests without an Origin header are accepted for server clients. Requests
  with Origin are accepted only for the request's own scheme/host or exact values
  in Django setting `LLM_API_MCP_ALLOWED_ORIGINS` (default empty list).
- Configure forwarded scheme/host only for your trusted reverse proxy. Add the
  external HTTPS origin to the setting if the proxy presents an internal scheme.
- The body limit in base settings allows JSON escaping overhead. Proxies should
  allow 8 MiB requests; the decoded source still has the separate 1 MiB limit.
- This endpoint supports provisioned API keys, **not OAuth discovery or login**.
  An MCP host must support secure custom bearer-header configuration to connect.
  A host that requires OAuth needs a separate OAuth implementation before use.
- No plugin is installed or authenticated merely by deploying this endpoint.
  Verify host authentication support before registering the private plugin.

Run `python manage.py test llm_api --noinput` from `site/beta`.

Protocol references:
- https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
- https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle
- https://modelcontextprotocol.io/specification/2025-06-18/server/tools
