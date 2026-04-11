from django.apps import AppConfig


class HomeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'home'

    def ready(self):
        # Trigger auto-seed on startup to ensure production environment is user-ready
        import os
        # Avoid double-execution in dev server reload
        if os.environ.get('RUN_MAIN') != 'true':
            try:
                from musb_backend.seeder import seed_production_if_empty
                seed_production_if_empty()
            except ImportError:
                pass
