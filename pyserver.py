import http.server
import socketserver

PORT = 8000

import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')


class HttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.manifest': 'text/cache-manifest',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml',
        '.css': 'text/css',
        '.js':'application/javascript',
        # '.js':'application/x-javascript',
        '.wasm': 'application/wasm',
        '.json': 'application/json',
        '.xml': 'application/xml',
    }

httpd = socketserver.TCPServer(("localhost", PORT), HttpRequestHandler)

#Use to create local host
# import http.server
# import socketserver

# PORT = 1337

# Handler = http.server.SimpleHTTPRequestHandler
# Handler.extensions_map.update({
#       ".js": "application/javascript",
# });

# httpd = socketserver.TCPServer(("", PORT), Handler)
# httpd.serve_forever()


try:
    print(f"serving at http://localhost:{PORT}")
    httpd.serve_forever()
except KeyboardInterrupt:
    pass