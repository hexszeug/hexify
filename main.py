from http.server import BaseHTTPRequestHandler, HTTPServer
import time

hostName = "localhost"
serverPort = 2020

class MyServer(BaseHTTPRequestHandler):
    
    def do_GET(self):
        try:
            file_path = self.path.split("?")[0][1:]
            if file_path == "":
                file_path = "index.html"
            file_suffix = file_path.split(".")[-1]
            content_type = "text/plain"
            file_type = "text"
            if file_suffix == "html":
                content_type = "text/html"
            if file_suffix == "js":
                content_type = "text/javascript"
            if file_suffix == "css":
                content_type = "text/css"
            if file_suffix == "json":
                content_type = "json"
            if file_suffix == "png" or file_suffix == "jpg" or file_suffix == "ico":
                content_type = "image/" + file_suffix
                file_type = "binary"
            self.send_response(200)
            self.send_header("Content-type", content_type)
            self.end_headers()
            file_path = "html/" + file_path
            if file_type == "binary":
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                with open(file_path, "r") as f:
                    self.wfile.write(bytes(f.read(), "utf-8"))
        except:
            self.send_response(404)
            self.end_headers()

            

if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://{}:{}".format(hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")