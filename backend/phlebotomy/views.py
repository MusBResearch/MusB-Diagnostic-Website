from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import datetime
from .auth import login_phleb, verify_token
from musb_backend.mongodb import get_phlebotomists_collection, transform_doc

@api_view(['POST'])
def signup_view(request):
    """POST /api/phleb/signup/ — Register a new phlebotomist."""
    coll = get_phlebotomists_collection()
    data = request.data
    
    # Check if user already exists
    if coll.find_one({'email': data.get('email')}):
        return Response({'error': 'Email already registered.'}, status=400)
    
    # Map fields from the registration form
    phleb_data = {
        'name': data.get('name'),
        'company': data.get('company_name'),
        'email': data.get('email'),
        'phone': data.get('phone'),
        'location': data.get('location'),
        'password': data.get('password'),
        'status': 'active',
        'created_at': str(datetime.datetime.utcnow())
    }
    
    coll.insert_one(phleb_data)
    
    # Auto log them in after signup
    login_data = login_phleb(phleb_data['email'], phleb_data['password'])
    return Response(login_data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_view(request):
    """POST /api/phleb/login/ — Phlebotomist authentication."""
    email = request.data.get('email')
    password = request.data.get('password')
    login_data = login_phleb(email, password)
    if login_data:
        return Response(login_data)
    return Response({'error': 'Invalid phlebotomist credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def dashboard_stats(request):
    """GET /api/phleb/dashboard/ — Metrics, history, and achievements for the individual phlebotomist."""
    # Optimized Field Structure
    stats = {
        'metrics': {
            'rating': '4.95',
            'completed_collections': 142,
            'integrity_score': '99.8%',
            'earnings_today': '$215.00',
            'on_time_rate': '98%'
        },
        'dispatch': {
            'next_stop': {
                'id': 'APP-902',
                'patient': 'R. Thompson',
                'time': '10:45 AM',
                'address': '450 Park Ave, NY',
                'distance': '1.2 miles'
            },
            'today_route': [
                {'id': 'APP-901', 'time': '09:00 AM', 'status': 'Completed', 'addr': '120 Broadway'},
                {'id': 'APP-902', 'time': '10:45 AM', 'status': 'Next', 'addr': '450 Park Ave'},
                {'id': 'APP-903', 'time': '01:15 PM', 'status': 'Scheduled', 'addr': '78 W 52nd St'},
                {'id': 'APP-904', 'time': '03:00 PM', 'status': 'Scheduled', 'addr': '12 Hudson Yard'}
            ]
        },
        'active_case': {
            'patient_id': 'PT-5512',
            'initials': 'RT',
            'age': 45,
            'gender': 'M',
            'instructions': 'Fast 12h, Cold-Chain Box A needed.',
            'associated_facility': 'Northwell Health',
            'doctor': 'Dr. Aris Thorne',
            'payment_status': 'Prepaid',
            'specimens': ['SST (Gold)', 'EDTA (Purple)', 'Sodium Citrate (Blue)'],
            'notes': 'Patient is a difficult stick. Use pediatric needle if needed.'
        },
        'admin': {
            'roster': [
                {'name': 'Sarah J.', 'status': 'Active', 'zone': 'Manhattan'},
                {'name': 'Mike R.', 'status': 'On Break', 'zone': 'Brooklyn'},
                {'name': 'Eli W.', 'status': 'Offline', 'zone': 'Queens'}
            ],
            'performance_history': [
                {'month': 'Jan', 'visits': 120, 'no_shows': 2, 'issues': 1},
                {'month': 'Feb', 'visits': 142, 'no_shows': 1, 'issues': 0},
                {'month': 'Mar', 'visits': 165, 'no_shows': 3, 'issues': 2}
            ],
            'coverage': ['Zone 1 (High)', 'Zone 2 (Normal)', 'Zone 5 (Peak)'],
            'detailed_metrics': {
                'completed_visits': 165,
                'no_shows': 3,
                'collection_issues': 2,
                'avg_time_per_visit': '12.4m'
            }
        },
        'achievements': [
            {'id': 1, 'title': 'Eagle Eye', 'icon': 'Target', 'earned': 'True', 'description': '100% first-stick success rate.'},
            {'id': 2, 'title': 'Sprint Master', 'icon': 'Zap', 'earned': 'True', 'description': 'Arrived early to 50 locations.'},
            {'id': 3, 'title': 'Cold-Chain Expert', 'icon': 'Thermometer', 'earned': 'True', 'description': 'Zero temperature integrity issues.'},
            {'id': 4, 'title': 'Patient Hero', 'icon': 'Heart', 'earned': 'False', 'description': 'Receive 50 five-star reviews.'}
        ],
        'updates': [
            {'id': 1, 'type': 'urgent', 'title': 'New STAT Request', 'message': 'New collection request at 450 Park Ave (ETA 30m).', 'time': '5 mins ago'},
            {'id': 2, 'type': 'info', 'title': 'Route Update', 'message': 'Optimized route available for your afternoon schedule.', 'time': '1 hour ago'},
            {'id': 102, 'type': 'success', 'title': 'Weekly Bonus', 'message': 'Performance bonus of $50 added to your account.', 'time': '3 hours ago'}
        ],
        'booking_history': [
            {'id': '1042', 'date': '2026-03-28', 'location': 'Brooklyn, NY', 'patient': 'A. S.', 'status': 'Completed', 'earnings': '$45.00'},
            {'id': '1039', 'date': '2026-03-27', 'location': 'Queens, NY', 'patient': 'B. K.', 'status': 'Completed', 'earnings': '$40.00'},
            {'id': '1035', 'date': '2026-03-25', 'location': 'Manhattan, NY', 'patient': 'J. L.', 'status': 'Completed', 'earnings': '$55.00'}
        ]
    }

    return Response(stats)
