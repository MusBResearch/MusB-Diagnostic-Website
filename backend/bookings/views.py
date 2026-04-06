from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import datetime
from musb_backend.mongodb import get_appointments_collection, get_lab_tests_collection, transform_doc


@api_view(['POST'])
def create_booking(request):
    """POST /api/bookings/ — Create a new appointment in MongoDB."""
    data = request.data
    full_name = data.get('fullName') or data.get('full_name')
    phone = data.get('phone')
    email = data.get('email')
    test_id = data.get('testId') or data.get('test_id')
    date = data.get('date') or data.get('preferred_date')
    time_slot = data.get('timeSlot') or data.get('preferred_time')
    visit_type = data.get('visitType') or data.get('visit_type')

    if not all([full_name, phone, email, test_id, date, time_slot, visit_type]):
        return Response(
            {'error': 'Missing required fields. Please fill out all booking details.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    coll = get_appointments_collection()
    new_booking = {
        'full_name': full_name,
        'phone': phone,
        'email': email,
        'test_id': test_id,
        'preferred_date': date,
        'preferred_time': time_slot,
        'visit_type': visit_type,
        'status': 'pending',
        'created_at': datetime.datetime.utcnow()
    }
    
    result = coll.insert_one(new_booking)
    
    return Response(
        {
            'message': 'Booking confirmed! Our team will contact you shortly.',
            'booking': transform_doc(new_booking)
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def bookable_tests(request):
    """GET /api/bookings/tests/ — Available tests for booking dropdown (from MongoDB)."""
    coll = get_lab_tests_collection()
    tests = list(coll.find())
    
    # Map for the dropdown format
    formatted = [{'value': str(t.get('id', t['_id'])), 'label': t['title']} for t in tests]
    return Response(formatted)
