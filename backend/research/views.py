from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import uuid
import datetime
from .auth import login_manual, verify_token
from musb_backend.mongodb import (
    get_research_studies_collection, get_research_samples_collection,
    get_research_shipments_collection, get_research_universities_collection,
    get_research_services_collection, get_research_biorepository_collection,
    get_research_collaborations_collection, get_research_quotes_collection,
    get_research_subscriptions_collection, get_research_users_collection, transform_doc
)


@api_view(['GET'])
def services_list(request):
    """GET /api/research/services/ — Study support services (from MongoDB)."""
    coll = get_research_services_collection()
    docs = list(coll.find())
    return Response([transform_doc(d) for d in docs])


@api_view(['GET'])
def biorepository_info(request):
    """GET /api/research/biorepository/ — Biorepository stats (from MongoDB)."""
    coll = get_research_biorepository_collection()
    docs = list(coll.find())
    return Response([transform_doc(d) for d in docs])


@api_view(['GET'])
def collaborations_list(request):
    """GET /api/research/collaborations/ — Academic collaboration info (from MongoDB)."""
    coll = get_research_collaborations_collection()
    docs = list(coll.find())
    return Response([transform_doc(d) for d in docs])


@api_view(['GET'])
def research_stats(request):
    """GET /api/research/stats/ — Aggregated research stats."""
    return Response({'reliability': '99.99%', 'capacity': '10M+'})


@api_view(['POST'])
def submit_quote(request):
    """POST /api/research/quote/ — Submit proposal request."""
    coll = get_research_quotes_collection()
    data = request.data
    data['status'] = 'pending'
    data['created_at'] = str(datetime.datetime.utcnow())
    coll.insert_one(data)
    return Response({'message': 'Proposal request sent successfully!'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def newsletter_subscribe(request):
    """POST /api/research/newsletter/ — Research newsletter signup."""
    coll = get_research_subscriptions_collection()
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=400)
    coll.insert_one({'email': email, 'subscribed_at': str(datetime.datetime.utcnow())})
    return Response({'message': 'Subscribed!'}, status=status.HTTP_201_CREATED)

# --- Research Portal Authentication ---

@api_view(['POST'])
def login_view(request):
    """POST /api/research/portal/login/ — Portal authentication."""
    email = request.data.get('email')
    password = request.data.get('password')
    login_data = login_manual(email, password)
    if login_data:
        return Response(login_data)
    return Response({'error': 'Invalid research credentials'}, status=status.HTTP_401_UNAUTHORIZED)

def get_current_user(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    return verify_token(token)

@api_view(['POST'])
def signup_view(request):
    """POST /api/research/portal/signup/ — Register a new research lab/user."""
    coll = get_research_users_collection()
    data = request.data
    
    # Check if user already exists
    if coll.find_one({'email': data.get('email')}):
        return Response({'error': 'Email already registered in the repository.'}, status=400)
    
    # Map 'lab_name' to 'institution' for consistency with JWT/Auth
    if 'lab_name' in data:
        data['institution'] = data.pop('lab_name')
        
    data['role'] = 'client'  # Default role for new signups
    data['created_at'] = str(datetime.datetime.utcnow())
    
    coll.insert_one(data)
    
    # Automaticaly log them in after signup
    login_data = login_manual(data['email'], data['password'])
    return Response(login_data, status=status.HTTP_201_CREATED)

# --- Research Client & Admin Dashboard Modules ---

@api_view(['GET'])
def dashboard_overview(request):
    """GET /api/research/portal/dashboard/ — Aggregated stats for both roles."""
    user = get_current_user(request)
    if not user: return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    
    studies_coll = get_research_studies_collection()
    samples_coll = get_research_samples_collection()
    
    if user['role'] == 'client':
        # Clients only see their own institution's summary
        studies = list(studies_coll.find({'sponsor': user['institution']}))
        study_ids = [s.get('study_id') for s in studies]
        sample_count = len(list(samples_coll.find({'study_id': {'$in': study_ids}})))
        shipments_coll = get_research_shipments_collection()
        shipment_count = len(list(shipments_coll.find({'study_id': {'$in': study_ids}})))
        
        return Response({
            'active_studies': len(studies),
            'total_samples': sample_count,
            'recent_shipments': shipment_count,
            'pending_requests': 0
        })
    else:
        # Admins see global summary
        total_studies = len(list(studies_coll.find()))
        total_samples = len(list(samples_coll.find()))
        
        # Calculate storage utilization based on total sample capacity (let's assume 1M capacity for now)
        utilization = (total_samples / 1000000) * 100
        
        return Response({
            'active_studies': total_studies,
            'total_samples': total_samples,
            'storage_utilization': f"{utilization:.1f}%",
            'critical_alerts': 0
        })

@api_view(['GET', 'POST', 'DELETE'])
def study_management(request):
    """GET/POST/DELETE /api/research/portal/studies/ — Study protocols."""
    user = get_current_user(request)
    if not user: return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    
    coll = get_research_studies_collection()
    
    if request.method == 'GET':
        query = {} if user['role'] == 'admin' else {'sponsor': user['institution']}
        studies = list(coll.find(query))
        return Response([transform_doc(s) for s in studies])
    
    elif request.method == 'POST':
        if user['role'] != 'admin': return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        data['study_id'] = f"STUDY-{uuid.uuid4().hex[:6].upper()}"
        data['created_at'] = str(datetime.datetime.utcnow())
        coll.insert_one(data)
        return Response(transform_doc(data), status=status.HTTP_201_CREATED)
    
    elif request.method == 'DELETE':
        if user['role'] != 'admin': return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
        study_id = request.GET.get('study_id')
        if not study_id: return Response({'error': 'Missing study_id'}, status=status.HTTP_400_BAD_REQUEST)
        coll.delete_one({'study_id': study_id})
        return Response({'success': True})

@api_view(['GET', 'POST'])
def sample_tracking(request):
    """GET/POST /api/research/portal/samples/ — LIMS Accessioning."""
    user = get_current_user(request)
    if not user: return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    
    coll = get_research_samples_collection()
    
    if request.method == 'GET':
        study_id = request.GET.get('study_id')
        query = {'study_id': study_id} if study_id else {}
        samples = list(coll.find(query))
        return Response([transform_doc(s) for s in samples])
        
    elif request.method == 'POST':
        if user['role'] != 'admin': return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        data['barcode'] = f"MUSB-{uuid.uuid4().hex[:8].upper()}"
        data['status'] = 'Received'
        coll.insert_one(data)
        return Response(transform_doc(data), status=status.HTTP_201_CREATED)

@api_view(['GET'])
def inventory_reporting(request):
    """GET /api/research/portal/reporting/ — Utilization reports."""
    user = get_current_user(request)
    if not user or user['role'] != 'admin': return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    
    samples_coll = get_research_samples_collection()
    samples = list(samples_coll.find({}))
    
    # Aggregation for reporting
    types = ['Whole Blood', 'Plasma', 'Serum', 'DNA', 'RNA']
    by_type = {t: len([s for s in samples if s.get('type') == t]) for t in types}
    
    # Storage trends: group by some date field if available, or mock for now but based on reality
    # For a real implementation, we'd group by created_at. Since we have limited mock data:
    report = {
        'total_inventory': len(samples),
        'by_type': by_type,
        'storage_trends': [120, 150, 400, 800, len(samples)],
        'storage_utilization': (len(samples) / 1000000) * 100
    }
    return Response(report)

@api_view(['GET', 'POST', 'DELETE'])
def university_directory(request):
    """GET/POST /api/research/portal/universities/ — Partnership management."""
    user = get_current_user(request)
    if not user or user['role'] != 'admin': return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    
    coll = get_research_universities_collection()
    
    if request.method == 'GET':
        universities = list(coll.find({}))
        return Response([transform_doc(u) for u in universities])
        
    elif request.method == 'POST':
        data = request.data
        coll.insert_one(data)
        return Response(transform_doc(data), status=status.HTTP_201_CREATED)
    
    elif request.method == 'DELETE':
        uni_id = request.data.get('id')
        coll.delete_one({'_id': uni_id})
        return Response({'success': True})
