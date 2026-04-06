import requests
import json

url = "http://localhost:8000/api/employers/login/"
data = {"email": "employer@musb.com", "password": "MusB123"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
