import http.server
import socketserver
import os

DB_PATH = os.path.join('data', 'tracker_backup.db')
PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/load':
            content = b'{"habits":[],"history":{}}'
            if os.path.exists(DB_PATH):
                with open(DB_PATH, 'rb') as f:
                    content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/octet-stream')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(content)
            return
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/save':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
            try:
                with open(DB_PATH, 'wb') as f:
                    f.write(body)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status":"ok"}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        if args and str(args[1]) not in ('200', '304'):
            super().log_message(format, *args)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"✅ Сервер запущен: http://localhost:{PORT}")
        print(f"📁 Файл базы данных: {os.path.abspath(DB_PATH)}")
        print("⏹  Нажмите Ctrl+C для остановки\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен.")