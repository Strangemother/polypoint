from urllib.parse import urlsplit

from django.core.management.base import BaseCommand, CommandError
from oauth2_provider.models import get_application_model


class Command(BaseCommand):
    help = "Register the fixed public ChatGPT OAuth client (authorization code + PKCE)."

    def add_arguments(self, parser):
        parser.add_argument("--redirect-uri", required=True)
        parser.add_argument("--client-id", default="polypoint-chatgpt")

    def handle(self, *args, **options):
        redirect = options["redirect_uri"]
        parsed = urlsplit(redirect)
        if (parsed.scheme != "https" or parsed.hostname != "chatgpt.com"
                or parsed.port not in (None, 443) or parsed.username or parsed.password
                or parsed.query or parsed.fragment or any(c.isspace() for c in redirect)
                or not parsed.path.startswith("/connector/oauth/")
                or not parsed.path.removeprefix("/connector/oauth/")):
            raise CommandError("Use the exact HTTPS chatgpt.com/connector/oauth/ callback shown in your connector form.")
        Application = get_application_model()
        application, created = Application.objects.get_or_create(
            client_id=options["client_id"],
            defaults={"name": "ChatGPT Polypoint Theatre", "redirect_uris": redirect,
                      "client_type": Application.CLIENT_PUBLIC,
                      "authorization_grant_type": Application.GRANT_AUTHORIZATION_CODE,
                      "skip_authorization": False},
        )
        if not created and (application.redirect_uris != redirect
                or application.client_type != Application.CLIENT_PUBLIC
                or application.authorization_grant_type != Application.GRANT_AUTHORIZATION_CODE
                or application.skip_authorization):
            raise CommandError("Client ID already exists with different settings. Inspect it in Django admin or choose another --client-id; nothing changed.")
        self.stdout.write(self.style.SUCCESS("Created OAuth client." if created else "OAuth client already matches."))
        self.stdout.write("Client ID: " + application.client_id)
        self.stdout.write("Token endpoint auth method: none; client secret: leave blank; PKCE: S256.")
