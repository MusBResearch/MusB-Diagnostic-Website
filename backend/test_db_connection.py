import os
import sys
import django
from pathlib import Path

# Add the backend directory to the system path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'musb_backend.settings')
django.setup()

from musb_backend.mongodb import get_db

def test_connection():
    try:
        db = get_db()
        # Ping the database to check if the connection is successful
        db.command('ping')
        print("✅ Successfully connected to MongoDB!")
        print(f"Database: {db.name}")
        
        # Check collections
        collections = db.list_collection_names()
        print(f"Collections: {collections}")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_connection()
