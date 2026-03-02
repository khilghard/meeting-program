#!/usr/bin/env python3
import http.server
import ssl

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def guess_type(self, path=None):
        if path is None:
            path = str(self.translate_path(self.path))
        if path.endswith('.webmanifest'):
            return 'application/manifest+json'
        if path.endswith('.svg'):
            return 'image/svg+xml'
        return super().guess_type(path)

server_address = ('', 8000)
httpd = http.server.HTTPServer(server_address, MyHTTPRequestHandler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('cert.pem', 'key.pem')
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print('HTTPS server running at https://localhost:8000')
httpd.serve_forever()
