"""
Dispatch smoke test. Uses real MongoDB by default (MONGO_URI / MONGO_DB_NAME).

Offline / no server:   set MONGO_USE_MOCK=true before running.
"""
import os
import sys
from pathlib import Path

# Setup paths
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'musb_backend.settings')

import django
django.setup()

from super_admin.views import approve_booking
from musb_backend.mongodb import get_appointments_collection, get_phlebotomists_collection, get_db
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

def test_dispatch_logic():
    db = get_db()
    appointments = get_appointments_collection()
    phlebotomists = get_phlebotomists_collection()

    print("--- TESTING TACTICAL DISPATCH LOOP ---")

    # 1. Create a mock booking in Times Square [ -73.9855, 40.7580 ]
    mock_booking = {
        'full_name': 'Test Patient',
        'address': 'Times Square, NY',
        'coordinates': { 'type': 'Point', 'coordinates': [-73.9855, 40.7580] },
        'status': 'pending_approval',
        'visit_type': 'home'
    }
    res = appointments.insert_one(mock_booking)
    booking_id = str(res.inserted_id)
    print(f"INFO: Created mock booking: {booking_id}")

    # 2. Trigger approval view
    factory = APIRequestFactory()
    request = factory.post(f'/api/superadmin/bookings/{booking_id}/approve/')
    
    # We call the view function directly for testing
    from super_admin.views import approve_booking
    response = approve_booking(request, booking_id)

    print(f"STATUS: Dispatch Response: {response.data.get('message') or response.data.get('error')}")
    
    if response.status_code == 200:
        print(f"INFO: Assigned to: {response.data.get('specialist', {}).get('name')}")
    else:
        print("ERROR: Dispatch failed.")

    # Cleanup
    appointments.delete_one({'_id': res.inserted_id})
    print("CLEANUP: Cleanup complete.")

if __name__ == "__main__":
    test_dispatch_logic()
