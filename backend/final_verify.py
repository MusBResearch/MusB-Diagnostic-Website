import os
import sys
import django
from pathlib import Path

# Setup Django path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'musb_backend.settings')
django.setup()

from django.test import Client
import json

def test_live_api():
    client = Client()
    endpoints = [
        '/api/home/hero/',
        '/api/home/services/',
        '/api/offers/',
        '/api/catalog/categories/',
        '/api/catalog/tests/'
    ]
    
    print("🧪 Verifying live API endpoints through Django Test Client...")
    for endpoint in endpoints:
        try:
            response = client.get(endpoint)
            print(f"Endpoint: {endpoint}")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Items: {len(data)}")
                if len(data) > 0:
                    print(f"First Item: {data[0].get('title', data[0].get('name', 'N/A'))}")
            else:
                print(f"Error Body: {response.content[:200]}")
            print("-" * 40)
        except Exception as e:
            print(f"❌ Failed to test {endpoint}: {e}")

if __name__ == "__main__":
    test_live_api()
