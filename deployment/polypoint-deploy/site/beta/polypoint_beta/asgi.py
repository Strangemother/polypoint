from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'polypoint_beta.settings')

application = get_asgi_application()