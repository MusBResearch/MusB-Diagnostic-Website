import os
from django.conf import settings
from django.core.management.commands.runserver import Command as RunserverCommand
from musb_backend.mongodb import get_client

class Command(RunserverCommand):
    """
    Custom runserver command that displays a premium startup header.
    """
    def inner_run(self, *args, **options):
        # 1. Get the port safely
        addrport = options.get('addrport') or '8000'
        port = addrport.split(':')[-1]
        
        # 2. Check MongoDB Status silently
        try:
            # Import here to avoid circular imports during startup if any
            from musb_backend import mongodb
            mongodb.get_client(silent=True)
            if mongodb._use_fallback:
                db_status = "Mock DB (Fallback)"
            else:
                db_status = "MongoDB Connected"
        except Exception:
            db_status = "Connection Error"

        # 3. Print the Premium Header
        # Using simple ASCII for maximum compatibility across terminals
        print("\n" + "=" * 41)
        print(f">>> SERVER STATUS: RUNNING on port {port}")
        print(f">>> DATABASE STATUS: {db_status}")
        print("=" * 41 + "\n")

        # 4. Continue with standard Django runserver
        super().inner_run(*args, **options)
