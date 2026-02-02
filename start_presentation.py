"""
Simple HTTP Server for Power BI Training Presentation
Serves the training portal locally on http://localhost:8000
"""
import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

# Configuration
PORT = 8000
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    print("=" * 60)
    print("🎓 Power BI Training - Presentation Server")
    print("=" * 60)
    print(f"\n✅ Starting server at http://localhost:{PORT}")
    print(f"📁 Serving from: {DIRECTORY}")
    print("\n📚 Available URLs:")
    print(f"   Student Portal: http://localhost:{PORT}/PowerBI_Training_Portal.html")
    print(f"   Admin Portal:   http://localhost:{PORT}/Admin_Portal.html")
    print("\n💡 Tips for presentation:")
    print("   - Use Python CLI to unlock days: python scripts/admin_fabric.py unlock <day>")
    print("   - Changes sync with Fabric automatically")
    print("   - Refresh browser to see updates")
    print("\n⚠️  Press Ctrl+C to stop the server")
    print("=" * 60)
    
    # Start server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        # Open browser automatically
        webbrowser.open(f'http://localhost:{PORT}/PowerBI_Training_Portal.html')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✅ Server stopped. Presentation ended.")
            print("=" * 60)

if __name__ == "__main__":
    main()
