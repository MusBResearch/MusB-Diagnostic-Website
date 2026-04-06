import requests
import re

try:
    r = requests.post('http://localhost:8000/api/employers/login/', json={'email':'employer@musb.com','password':'MusB123'})
    # Try to find the exception message in the HTML
    match = re.search(r'<th>Exception Value:</th>\s*<td><pre>(.*?)</pre></td>', r.text, re.DOTALL)
    if match:
        print(f"Exception: {match.group(1)}")
    else:
        print(f"Status: {r.status_code}")
        print("Couldn't find exception message in HTML.")
except Exception as e:
    print(f"Network Error: {e}")
