import socket
import ssl

def check_port(host, port):
    try:
        print(f"Checking {host}:{port}...")
        with socket.create_connection((host, port), timeout=5) as sock:
            print("  TCP connection successful.")
            context = ssl.create_default_context()
            try:
                with context.wrap_socket(sock, server_hostname=host) as ssock:
                    print(f"  SSL handshake successful. Protocol: {ssock.version()}")
            except Exception as e:
                print(f"  SSL handshake FAILED: {e}")
    except Exception as e:
        print(f"  TCP connection FAILED: {e}")

hosts = [
    "ac-ndhwfl2-shard-00-00.hxubld0.mongodb.net",
    "ac-ndhwfl2-shard-00-01.hxubld0.mongodb.net",
    "ac-ndhwfl2-shard-00-02.hxubld0.mongodb.net"
]

for h in hosts:
    check_port(h, 27017)
