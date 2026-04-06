import os
import sys
import django
from pathlib import Path

# Setup Django path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'musb_backend.settings')
django.setup()

from home.views import hero_content
from rest_framework.test import APIRequestFactory

def debug_views():
    factory = APIRequestFactory()
    request = factory.get('/api/home/hero/')
    
    print("🐞 Debugging hero_content view...")
    try:
        response = hero_content(request)
        print(f"Status Code: {response.status_code}")
        print(f"Data: {response.data}")
    except Exception as e:
        import traceback
        print("❌ View execution failed:")
        traceback.print_exc()

if __name__ == "__main__":
    debug_views()
