import os
import sys
from pathlib import Path

# Add the backend directory to sys.path to allow importing musb_backend
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'musb_backend.settings')
import django
django.setup()

from musb_backend.mongodb import get_db

def init_indexes():
    db = get_db()
    
    # If using MockDatabase, we can't create real Mongo indexes
    from musb_backend.mongodb import MockDatabase
    if isinstance(db, MockDatabase):
        print("INFO: Using MockDatabase. Skipping real MongoDB index creation.")
        print("INFO: Geo-filtering will be simulated in MockCollection logic.")
        return

    print("INFO: Initializing Geospatial Indexes in MongoDB...")
    
    # 1. Appointments Index (on 'coordinates' field)
    appointments = db['appointments']
    appointments.create_index([("coordinates", "2dsphere")])
    print("SUCCESS: Created 2dsphere index on appointments.coordinates")
    
    # 2. Phlebotomists Index (on 'current_location' field)
    phlebotomists = db['phlebotomists']
    phlebotomists.create_index([("current_location", "2dsphere")])
    print("SUCCESS: Created 2dsphere index on phlebotomists.current_location")

if __name__ == "__main__":
    try:
        init_indexes()
    except Exception as e:
        print(f"ERROR: {e}")
