import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/research/portal"

def test_login():
    print("Testing Client (University) Login...")
    res = requests.post(f"{BASE_URL}/login/", json={
        "email": "investigator@university.edu",
        "password": "research2026"
    })
    if res.status_code == 200:
        data = res.json()
        print("✅ Login Successful")
        print(f"User: {data['user']['name']} ({data['user']['role']})")
        print(f"Institution: {data['user']['institution']}")
        return data['token']
    else:
        print(f"❌ Login Failed: {res.text}")
        return None

def test_dashboard(token):
    print("\nTesting Dashboard Stats...")
    res = requests.get(f"{BASE_URL}/dashboard/", headers={
        "Authorization": f"Bearer {token}"
    })
    if res.status_code == 200:
        print("✅ Dashboard Fetch Successful")
        print(json.dumps(res.json(), indent=4))
    else:
        print(f"❌ Dashboard Fetch Failed: {res.text}")

if __name__ == "__main__":
    token = test_login()
    if token:
        test_dashboard(token)
