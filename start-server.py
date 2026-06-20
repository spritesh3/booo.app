import http.server, socketserver, webbrowser, threading, time, os

PORT = 3000
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    threading.Thread(target=lambda: (time.sleep(1), webbrowser.open(f"http://localhost:{PORT}")), daemon=True).start()
    httpd.serve_forever()
