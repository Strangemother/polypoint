"""Form API and account views."""

import logging

from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import FormView, TemplateView, View

from .api_common import authenticate, error_response, parse_form, validate_fields
from .forms import TheatreAPIKeyForm
from .models import TheatreAPIKey
from .theatre_actions.read import read_theatre
from .theatre_actions.remove import remove_theatre
from .theatre_actions.store import store_theatre
from .viewer_views import (
    TheatreViewerSourceView,
    TheatreViewerView,
    UserTheatreViewerLatestChangeView,
    UserTheatreViewerView,
)

__all__ = [
    "IndexView",
    "TheatreAPIKeyCreateView",
    "TheatreAPIView",
    "TheatreViewerSourceView",
    "TheatreViewerView",
    "UserTheatreViewerLatestChangeView",
    "UserTheatreViewerView",
]

logger = logging.getLogger(__name__)


class IndexView(TemplateView):
    template_name = "llm_api/index.html"


class TheatreAPIKeyCreateView(
    LoginRequiredMixin,
    UserPassesTestMixin,
    FormView,
):
    form_class = TheatreAPIKeyForm
    template_name = "llm_api/create_api_key.html"
    login_url = "admin:login"

    def test_func(self):
        return self.request.user.is_staff

    def render_to_response(self, context, **response_kwargs):
        response = super().render_to_response(context, **response_kwargs)
        response["Cache-Control"] = "no-store"
        return response

    def form_valid(self, form):
        user = form.cleaned_data["user"]
        _, token = TheatreAPIKey.issue_for(user)
        return self.render_to_response(
            self.get_context_data(
                form=form,
                generated_key=token,
                generated_user=user,
            )
        )


@method_decorator(csrf_exempt, name="dispatch")
class TheatreAPIView(View):
    http_method_names = ["post"]

    def http_method_not_allowed(self, request, *args, **kwargs):
        return error_response(
            405,
            "method_not_allowed",
            "Use POST for this endpoint.",
            headers={"Allow": "POST"},
        )

    def post(self, request, *args, **kwargs):
        fields, error = parse_form(request)
        if error is not None:
            return error
        data, error = validate_fields(fields)
        if error is not None:
            return error

        try:
            user = authenticate(request)
            if user is None:
                return error_response(401, "unauthorized", "Valid API credentials are required.")

            if data["action"] == "store":
                return store_theatre(request, user, data)
            if data["action"] == "read":
                return read_theatre(request, user, data)
            return remove_theatre(user, data)
        except Exception:
            logger.exception("Unexpected error handling llm_api request")
            return error_response(500, "internal_error", "An unexpected server error occurred.")
