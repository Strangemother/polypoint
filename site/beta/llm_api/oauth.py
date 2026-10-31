"""Fixed-client OAuth authorization code + S256 PKCE for the theatre MCP server."""

from copy import copy
from urllib.parse import urlencode

from django.conf import settings
from django.urls import path, reverse, reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from oauthlib.oauth2.rfc6749.errors import CustomOAuth2Error
from oauth2_provider.oauth2_backends import get_oauthlib_core
from oauth2_provider.oauth2_validators import OAuth2Validator
from oauth2_provider.views import (
    AuthorizationView, TokenView, RevokeTokenView,
    OAuthServerMetadataView, OAuthProtectedResourceMetadataView,
)

from account.models import UserProfile
from account.views import LoginView, SubAccountCreateView

from .forms import TheatreAuthorizationForm


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
    form_class = TheatreAuthorizationForm

    def get(self, request, *args, **kwargs):
        # Always show account selection, even after an earlier authorization.
        request.GET = request.GET.copy()
        request.GET["approval_prompt"] = "force"
        return super().get(request, *args, **kwargs)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["user"] = self.request.user
        return kwargs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if not UserProfile.objects.filter(user=self.request.user, sub_account=True).exists():
            query = urlencode({
                field.name: field.value()
                for field in context["form"]
                if field.is_hidden and field.value() is not None
            })
            context["create_sub_account_url"] = reverse("oauth2_provider:create") + "?" + query
        return context

    def form_valid(self, form):
        self.authorization_user = form.cleaned_data["sub_account"] or self.request.user
        return super().form_valid(form)

    def create_authorization_response(self, request, scopes, credentials, allow):
        if request.method == "POST" and allow:
            # Bind the grant to the selected user without changing the owner's session.
            request = copy(request)
            request.user = self.authorization_user
        return super().create_authorization_response(request, scopes, credentials, allow)


class TheatreSubAccountCreateView(SubAccountCreateView):
    login_url = reverse_lazy("oauth2_provider:login")

    def get_success_url(self):
        return reverse("oauth2_provider:authorize") + "?" + self.request.GET.urlencode()


oauth_urlpatterns = [
    path("login/", LoginView.as_view(template_name="llm_api/oauth_login.html"), name="login"),
    path("create/", TheatreSubAccountCreateView.as_view(), name="create"),
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
