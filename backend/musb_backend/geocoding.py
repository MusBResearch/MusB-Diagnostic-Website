import math
import requests
import time


def haversine_meters(lon1, lat1, lon2, lat2):
    """Great-circle distance between two WGS84 points in meters."""
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return r * c


def geocode_address(address, attempt=1):
    """
    Convert an address string to coordinates [lng, lat] using OpenStreetMap Nominatim.
    Includes a recursive fallback search up to 3 times by simplifying the address.
    Returns [lng, lat] or None if not found.
    """
    if not address or attempt > 3:
        return None
        
    url = "https://nominatim.openstreetmap.org/search"
    headers = {
        'User-Agent': 'MusB-Diagnostic-Automation/1.0 (Mobile Phlebotomy Dispatch System)'
    }
    params = {
        'q': address,
        'format': 'json',
        'limit': 1
    }
    
    try:
        # Nominatim usage policy requires a delay between requests
        time.sleep(1) 
        response = requests.get(url, headers=headers, params=params, timeout=10)
        data = response.json()
        
        if data and len(data) > 0:
            lat = float(data[0]['lat'])
            lng = float(data[0]['lon'])
            return [lng, lat]
            
        # Fallback Strategy: Trim the first part (usually house number/building) and try again
        parts = [p.strip() for p in address.split(',')]
        if len(parts) > 1:
            simpler_address = ", ".join(parts[1:])
            print(f"[GEOCODE] No results for '{address}'. Falling back to: '{simpler_address}'")
            return geocode_address(simpler_address, attempt + 1)
            
    except Exception as e:
        print(f"Geocoding error for address '{address}': {e}")
        
    return None
