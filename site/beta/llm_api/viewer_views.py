"""Views for theatre source, rendered theatres, and live updates."""

import logging
from datetime import datetime, timezone as datetime_timezone

from django.core.cache import cache
from django.http import HttpResponse
from django.utils import timezone
from django.views import View
from examples.theatre import get_source_metadata
from examples.views import ExampleFileView
from trim import views as t_views

from .api_common import authenticate, error_response, json_response, not_found_response, theatre_url
from .models import TheatreExample

logger = logging.getLogger(__name__)


class TheatreViewerSourceView(View):
    http_method_names = ["get", "head"]

    def http_method_not_allowed(self, request, *args, **kwargs):
        return error_response(
            405,
            "method_not_allowed",
            "Use GET for this viewer.",
            headers={"Allow": "GET, HEAD"},
        )

    def get(self, request, example_id, *args, **kwargs):
        try:
            user = authenticate(request)
            if user is None and request.user.is_authenticated:
                user = request.user

            theatre = TheatreExample.objects.filter(
                pk=example_id,
                is_deleted=False,
            ).first()
            if theatre is None:
                return not_found_response()
            if (
                user is None or theatre.owner_id != user.pk
            ) and theatre.visibility == TheatreExample.Visibility.PRIVATE:
                return not_found_response()

            response = HttpResponse(
                theatre.source,
                content_type="text/javascript; charset=utf-8",
            )
            response["Cache-Control"] = "no-store"
            response["X-Content-Type-Options"] = "nosniff"
            return response
        except Exception:
            logger.exception("Unexpected error serving llm_api viewer")
            return error_response(500, "internal_error", "An unexpected server error occurred.")


class UserTheatreViewerView(t_views.ListView):
    """Show a users list of examples. Will be live view."""

    model = TheatreExample

    def get_queryset(self):
        u = self.kwargs.get("username")
        return self.model.objects.filter(owner__username=u, is_deleted=False).exclude(
            visibility=TheatreExample.Visibility.PRIVATE
        )


class UserTheatreViewerLatestChangeView(t_views.View):
    """Return JSON indicating the latest change for a user's theatre examples.

        http://localhost:8000/llm_api/u/ghostly/latest_change/?stamp=1234567890

    Returns the latest changed example's timestamp and URL, or the supplied
    stamp and a null URL when there has been no newer change.

        {
            "latest_change": 1234567890.0,
            "url": "http://localhost:8000/llm_api/theatres/th_.../",
        }
    """

    def get(self, request, username, *args, **kwargs):
        try:
            stamp = float(request.GET.get("stamp", "0"))
            since = datetime.fromtimestamp(stamp, tz=datetime_timezone.utc)
        except (OverflowError, OSError, ValueError):
            return error_response(400, "invalid_stamp", "Stamp must be a Unix timestamp.")

        # Navigation commands are only visible to the logged-in owner, never
        # to other users or anonymous visitors viewing public theatres.
        navigation = None
        if request.user.is_authenticated and request.user.username == username:
            command = cache.get(f"llm_api:view_command:{request.user.pk}")
            if command and command["issued_at"] + 60 > timezone.now().timestamp():
                target = TheatreExample.objects.filter(
                    pk=command["theatre_id"], is_deleted=False
                ).first()
                if target and (
                    target.owner_id == request.user.pk
                    or target.visibility == TheatreExample.Visibility.PUBLIC
                ):
                    navigation = {
                        "id": command["id"],
                        "issued_at": command["issued_at"],
                        "url": theatre_url(request, target),
                    }

        theatre = (
            TheatreExample.objects.filter(
                owner__username=username,
                is_deleted=False,
                updated_at__gt=since,
            )
            .exclude(visibility=TheatreExample.Visibility.PRIVATE)
            .order_by("-updated_at", "-pk")
            .first()
        )
        if theatre is None:
            return json_response({"latest_change": stamp, "url": None, "navigation": navigation})

        return json_response(
            {
                "latest_change": theatre.updated_at.timestamp(),
                "url": theatre_url(request, theatre),
                "navigation": navigation,
            }
        )


class TheatreViewerView(ExampleFileView):

    template_name = "llm_api/theatreexample_view.html"

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        example_id = self.kwargs.get("example_id")
        # p = Path(example_id).with_suffix('')
        r["part_name"] = "example"

        tfm = TheatreExample.objects.filter(id=example_id, is_deleted=False)
        obj = None
        if tfm.exists():
            obj = tfm.get()
            r["theatreexample_object"] = obj

        if obj is None or (
            obj.visibility == TheatreExample.Visibility.PRIVATE
            and not (self.request.user.is_authenticated and self.request.user.pk == obj.owner_id)
        ):
            from django.http import Http404

            raise Http404

        meta = get_source_metadata(obj.source)

        ## flag to call the _single file_ endpoint
        ## rather than list all files individually.
        r["concat_file"] = False

        r["metadata"] = meta
        md = meta.get("markdown", None)
        if md:
            r["markdown"] = md
            del meta["markdown"]
        return r
