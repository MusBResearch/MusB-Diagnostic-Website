import jwt
import datetime
from django.conf import settings
from musb_backend.mongodb import get_phlebotomists_collection

def generate_token(user_payload):
    """Generate a JWT for the phlebotomist."""
    payload = {
        'user_id': user_payload['id'],
        'email': user_payload['email'],
        'name': user_payload['name'],
        'company': user_payload['company'],
        'role': 'phlebotomist',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def login_phleb(email, password):
    """Verify phlebotomist credentials and return user info + token."""
    # Hardcoded demo user for developer testing
    if email == 'phleb@musb.com' and password == 'phleb123':
        demo_user = {
            'id': 'demo_phleb_1',
            'email': email,
            'name': 'Demo Specialist',
            'company': 'MusB Field Ops'
        }
        token = generate_token(demo_user)
        return {
            'token': token,
            'user': demo_user
        }

    coll = get_phlebotomists_collection()
    user = coll.find_one({'email': email})
    
    if user and user.get('password') == password:
        user_data = {
            'id': str(user['_id']),
            'email': user['email'],
            'name': user['name'],
            'company': user.get('company', 'MusB Logistics')
        }
        token = generate_token(user_data)
        return {
            'token': token,
            'user': user_data
        }
    return None

def verify_token(token):
    """Decode and verify the phlebotomist portal token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
