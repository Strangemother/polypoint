"""Fixed-client OAuth authorization code + S256 PKCE for the theatre MCP server."""

from django.conf import settings
from django.contrib.auth.views import LoginView
from django.urls import path, reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from oauthlib.oauth2.rfc6749.errors import CustomOAuth2Error
from oauth2_provider.oauth2_backends import get_oauthlib_core
from oauth2_provider.oauth2_validators import OAuth2Validator
from oauth2_provider.views import (
    AuthorizationView, TokenView, RevokeTokenView,
    OAuthServerMetadataView, OAuthProtectedResourceMetadataView,
)


def resource_identifier():
    return settings.LLM_API_OAUTH_ORIGIN + "/llm_api/mcp/"


def metadata_url():
    return settings.LLM_API_OAUTH_ORIGIN + "/.well-known/oauth-protected-resource/llm_api/mcp/"


class TheatreOAuthValidator(OAuth2Validator):
    """Use toolkit validation, requiring tokens bound to this one MCP resource."""

    def _create_authorization_code(self, request, code, expires=None):
        resources = getattr(request, "resource", [])
        if resources != [resource_identifier()]:
            raise CustomOAuth2Error(error="invalid_target", description="Use the Polypoint MCP resource.", request=request)
        return super()._create_authorization_code(request, code, expires)

    def _check_and_set_request_resource(self, request):
        super()._check_and_set_request_resource(request)
        if request.resource != [resource_identifier()]:
            raise CustomOAuth2Error(error="invalid_target", description="Use the Polypoint MCP resource.", request=request)

    def validate_bearer_token(self, token, scopes, request):
        if not super().validate_bearer_token(token, scopes, request):
            return False
        return bool(request.user and request.user.is_active
                    and request.access_token.resource == [resource_identifier()])


def authenticate_oauth(request):
    # OAuth tokens are accepted only in the standard Authorization header.
    parts = request.headers.get("Authorization", "").split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    valid, oauth_request = get_oauthlib_core().verify_request(request, scopes=["theatre"])
    return oauth_request.user if valid else None


@method_decorator(never_cache, name="dispatch")
class TheatreAuthorizationView(AuthorizationView):
    template_name = "llm_api/oauth_authorize.html"
    login_url = reverse_lazy("oauth2_provider:login")


oauth_urlpatterns = [
    path("login/", LoginView.as_view(template_name="llm_api/oauth_login.html"), name="login"),
    path("authorize/", TheatreAuthorizationView.as_view(), name="authorize"),
    path("token/", TokenView.as_view(), name="token"),
    path("revoke/", RevokeTokenView.as_view(), name="revoke-token"),
]

# Published at the domain root before Wagtail's catch-all.
discovery_urlpatterns = [
    path(".well-known/oauth-authorization-server", OAuthServerMetadataView.as_view()),
    path(".well-known/oauth-protected-resource", OAuthProtectedResourceMetadataView.as_view()),
    path(".well-known/oauth-protected-resource/llm_api/mcp/", OAuthProtectedResourceMetadataView.as_view()),
]
