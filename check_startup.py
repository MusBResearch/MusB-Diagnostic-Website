import os
import sys

# Setup paths
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
sys.path.append(BACKEND_DIR)

print(f"Adding {BACKEND_DIR} to sys.path")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'musb_backend.settings')

try:
    import django
    django.setup()
    print("SUCCESS: Django setup.")
    
    print("Importing URL config...")
    from django.urls import get_resolver
    # This will trigger imports of all URL included modules
    get_resolver().urlconf_module
    print("SUCCESS: All URL configurations loaded.")
    
except Exception as e:
    import traceback
    print("FAILURE: Startup simulation error:")
    traceback.print_exc()
    sys.exit(1)
