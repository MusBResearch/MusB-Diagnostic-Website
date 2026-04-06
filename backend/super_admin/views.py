from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def super_admin_login(request):
    """
    Handle Super Admin Login.
    In a real app, this would verify against a superuser account or a custom SuperAdmin model.
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '').strip()
    
    # For demonstration/development, we allow 'admin@musb.com' / 'admin123'
    # In production, use Django's authenticate() and JWT/Token Auth.
    if email == "admin@musb.com" and password == "admin123":
        return Response({
            'token': 'super-secret-admin-token-xyz789',
            'user': {
                'id': 1,
                'email': email,
                'role': 'SUPER_ADMIN',
                'name': 'Master Admin'
            }
        }, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([AllowAny]) # In production, use IsAuthenticated and check for superadmin role
def dashboard_stats(request):
    """
    Fetch KPI and activity data for the Super Admin Dashboard.
    """
    stats = {
        'kpis': {
            'revenue': {'value': '$128,450', 'change': '+12%', 'trend': 'up'},
            'orders': {'value': '1,240', 'change': '+8%', 'trend': 'up'},
            'bookings': {'value': '850', 'change': '-2%', 'trend': 'down'},
            'conversions': {'value': '4.2%', 'change': '+0.5%', 'trend': 'up'},
            'offer_performance': {'value': '68%', 'change': '+5%', 'trend': 'up'},
        },
        'activity': [
            {'id': 1, 'type': 'appointment', 'title': 'John Doe - Phlebotomy', 'time': '10:30 AM', 'status': 'Confirmed'},
            {'id': 2, 'type': 'route', 'title': 'Route Alpha - 5 Stops', 'time': 'Ongoing', 'status': 'In Progress'},
            {'id': 3, 'type': 'event', 'title': 'Tech Corp Onsite', 'time': '2:00 PM', 'status': 'Scheduled'},
        ],
        'signups': {
            'employers': 12,
            'physicians': 5,
            'facilities': 3,
            'affiliates': 8,
            'research_clients': 2
        },
        'alerts': [
            {'id': 101, 'type': 'payment', 'msg': 'Failed payment from MedCenter Inc.', 'urgency': 'high'},
            {'id': 102, 'type': 'lis', 'msg': 'LIS Sync delayed for Lab-01', 'urgency': 'medium'},
            {'id': 103, 'type': 'storage', 'msg': 'Biorepository at 85% capacity', 'urgency': 'low'},
        ]
    }
    return Response(stats)
