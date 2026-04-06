import requests
import json

def test_api():
    urls = [
        "http://127.0.0.1:8000/api/home/hero/",
        "http://127.0.0.1:8000/api/home/services/",
        "http://127.0.0.1:8000/api/offers/",
        "http://127.0.0.1:8000/api/catalog/categories/",
        "http://127.0.0.1:8000/api/catalog/tests/"
    ]
    
    print("Testing API endpoints...")
    for url in urls:
        try:
            response = requests.get(url)
            print(f"URL: {url}")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Items found: {len(data)}")
                if len(data) > 0:
                    print(f"First item keys: {list(data[0].keys())}")
            else:
                print(f"Error: {response.text[:200]}")
            print("-" * 30)
        except Exception as e:
            print(f"❌ Failed to reach {url}: {e}")

if __name__ == "__main__":
    test_api()
