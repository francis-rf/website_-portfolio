import os, http.server, socketserver
os.chdir(r'D:\portfolio website')
# Write debug info
with open(r'C:\Users\franc\AppData\Local\Temp\serve_debug.txt', 'w') as f:
    f.write(f"CWD: {os.getcwd()}\n")
    f.write(f"Files: {os.listdir('.')[:10]}\n")
with socketserver.TCPServer(("", 5500), http.server.SimpleHTTPRequestHandler) as httpd:
    httpd.serve_forever()
