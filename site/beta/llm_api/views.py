import logging
import re
from datetime import datetime, timezone as datetime_timezone
from urllib.parse import parse_qsl

from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.exceptions import RequestDataTooBig
from django.db import IntegrityError, transaction
from django.db.models import F, Q
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import FormView, TemplateView, View

from .forms import TheatreAPIKeyForm
from .models import (
    THEATRE_NAME_PATTERN,
    TheatreAPIKey,
    TheatreExample,
)


logger = logging.getLogger(__name__)
MAX_SOURCE_BYTES = 1_048_576
MAX_REVISION = 9_223_372_036_854_775_807
NAME_PATTERN = re.compile(THEATRE_NAME_PATTERN)
BAD_PERCENT_ESCAPE = re.compile(r"%(?![0-9A-Fa-f]{2})")


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


def _json_response(data, status=200, headers=None):
    response = JsonResponse(
        data,
        status=status,
        content_type="application/json; charset=utf-8",
        json_dumps_params={"ensure_ascii": False},
    )
    response["Cache-Control"] = "no-store"
    if headers:
        for name, value in headers.items():
            response[name] = value
    return response


def _error(status, code, message, current_revision=None, headers=None):
    error = {"code": code, "message": message}
    if current_revision is not None:
        error["current_revision"] = current_revision
    response_headers = headers or {}
    return _json_response({"ok": False, "error": error}, status, response_headers)


def _parse_form(request):
    if request.content_type.lower() != "application/x-www-form-urlencoded":
        return None, _error(
            415,
            "unsupported_media_type",
            "Use a UTF-8 URL-encoded form.",
        )

    charset = request.content_params.get("charset")
    if charset and charset.lower().replace("_", "-") not in ("utf-8", "utf8"):
        return None, _error(
            415,
            "unsupported_media_type",
            "Use a UTF-8 URL-encoded form.",
        )

    try:
        encoded_form = request.body.decode("utf-8")
        if BAD_PERCENT_ESCAPE.search(encoded_form):
            raise ValueError("Malformed percent escape")
        pairs = parse_qsl(
            encoded_form,
            keep_blank_values=True,
            strict_parsing=True,
            encoding="utf-8",
            errors="strict",
            max_num_fields=16,
        )
    except RequestDataTooBig:
        return None, _error(
            413,
            "content_too_large",
            "The request body exceeds the supported limit.",
        )
    except (UnicodeDecodeError, ValueError):
        return None, _error(400, "invalid_request", "Malformed form data.")

    fields = {}
    for name, value in pairs:
        if name in fields:
            return None, _error(400, "invalid_request", "Duplicate form fields.")
        fields[name] = value
    return fields, None


def _validate_fields(fields):
    action = fields.get("action")
    if action not in ("store", "read", "remove"):
        return None, _error(400, "invalid_request", "Unsupported or missing action.")

    allowed = {
        "store": {"action", "name", "id", "theatre_file_content", "revision"},
        "read": {"action", "name", "id", "scope"},
        "remove": {"action", "name", "id", "revision"},
    }[action]
    if set(fields) - allowed:
        return None, _error(400, "invalid_request", "Unsupported field for action.")

    selectors = [field for field in ("name", "id") if field in fields]
    if len(selectors) != 1 or not fields[selectors[0]]:
        return None, _error(
            400,
            "invalid_request",
            "Supply exactly one nonempty name or id.",
        )
    selector, value = selectors[0], fields[selectors[0]]

    if selector == "name" and not NAME_PATTERN.fullmatch(value):
        return None, _error(400, "invalid_request", "Invalid example name.")

    if action == "store" and "theatre_file_content" not in fields:
        return None, _error(400, "invalid_request", "Source content is required.")
    if (
        action == "store"
        and len(fields["theatre_file_content"].encode("utf-8")) > MAX_SOURCE_BYTES
    ):
        return None, _error(
            413,
            "content_too_large",
            "Source exceeds the 1 MiB limit.",
        )

    scope = fields.get("scope", "personal")
    if action == "read" and scope not in ("personal", "public"):
        return None, _error(400, "invalid_request", "Invalid read scope.")
    if action == "read" and "scope" in fields and selector != "name":
        return None, _error(
            400,
            "invalid_request",
            "Read scope is only valid with a name.",
        )

    revision = None
    if "revision" in fields:
        raw_revision = fields["revision"]
        if len(raw_revision) > 19 or not re.fullmatch(r"[0-9]+", raw_revision):
            return None, _error(400, "invalid_request", "Invalid revision.")
        revision = int(raw_revision)
        if not 1 <= revision <= MAX_REVISION:
            return None, _error(400, "invalid_request", "Invalid revision.")

    return {
        "action": action,
        "selector": selector,
        "value": value,
        "scope": scope,
        "revision": revision,
        "source": fields.get("theatre_file_content"),
    }, None


def _authenticate(request):
    token = request.headers.get("Authorization", "")
    if not token or not token.isascii():
        return None

    # Accept standard bearer credentials while preserving pre-MCP raw keys.
    parts = token.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
    elif len(parts) != 1:
        return None

    key_hash = TheatreAPIKey.hash_token(token)
    key = (
        TheatreAPIKey.objects.select_related("user")
        .filter(key_hash=key_hash, revoked_at__isnull=True)
        .filter(Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now()))
        .first()
    )
    if key is None or not key.user.is_active:
        return None
    return key.user


def _theatre_url(request, theatre):
    return reverse("llm_api:theatre_view", kwargs={"example_id": theatre.pk})

def _not_found():
    return _error(404, "not_found", "The example was not found.")


def _revision_required(revision):
    return _error(
        409,
        "revision_required",
        "A current revision is required for this mutation.",
        current_revision=revision,
    )


def _revision_conflict(revision=None):
    return _error(
        409,
        "revision_conflict",
        "The example has changed. Read it again before retrying.",
        current_revision=revision,
    )


def _owned_example(user, selector, value):
    lookup = {"owner": user, "is_deleted": False, selector: value}
    return TheatreExample.objects.filter(**lookup).first()


def _store(request, user, data):
    source = data["source"]
    if data["selector"] == "name":
        theatre = _owned_example(user, "name", data["value"])
        if theatre is None:
            if data["revision"] is not None:
                return _revision_conflict()
            try:
                with transaction.atomic():
                    theatre = TheatreExample.objects.create(
                        owner=user,
                        name=data["value"],
                        source=source,
                    )
            except IntegrityError:
                theatre = _owned_example(user, "name", data["value"])
                if theatre is None:
                    raise
                return _revision_required(theatre.revision)

            return _json_response(
                {
                    "ok": True,
                    "id": theatre.pk,
                    "name": theatre.name,
                    "revision": theatre.revision,
                    "created": True,
                    "url": _theatre_url(request, theatre),
                },
                status=201,
            )
    else:
        theatre = _owned_example(user, "id", data["value"])
        if theatre is None:
            return _not_found()

    revision = data["revision"]
    if revision is None:
        return _revision_required(theatre.revision)
    if revision != theatre.revision:
        return _revision_conflict(theatre.revision)

    updated = TheatreExample.objects.filter(
        pk=theatre.pk,
        owner=user,
        is_deleted=False,
        revision=revision,
    ).update(
        source=source,
        revision=F("revision") + 1,
        updated_at=timezone.now(),
    )
    if not updated:
        current = _owned_example(user, "id", theatre.pk)
        if current is None:
            return _not_found()
        return _revision_conflict(current.revision)

    return _json_response(
        {
            "ok": True,
            "id": theatre.pk,
            "name": theatre.name,
            "revision": revision + 1,
            "created": False,
            "url": _theatre_url(request, theatre),
        }
    )


def _read(request, user, data):
    if data["selector"] == "id":
        theatre = TheatreExample.objects.filter(
            pk=data["value"],
            is_deleted=False,
        ).first()
        if theatre is None:
            return _not_found()
        if (
            theatre.owner_id != user.pk
            and theatre.visibility != TheatreExample.Visibility.PUBLIC
        ):
            return _not_found()
    elif data["scope"] == "public":
        matches = list(
            TheatreExample.objects.filter(
                name=data["value"],
                visibility=TheatreExample.Visibility.PUBLIC,
                is_deleted=False,
            )[:2]
        )
        if not matches:
            return _not_found()
        if len(matches) > 1:
            return _error(
                409,
                "ambiguous_name",
                "Multiple public examples match this name; read by id.",
            )
        theatre = matches[0]
    else:
        theatre = _owned_example(user, "name", data["value"])
        if theatre is None:
            return _not_found()

    return _json_response(
        {
            "ok": True,
            "id": theatre.pk,
            "name": theatre.name,
            "revision": theatre.revision,
            "url": _theatre_url(request, theatre),
            "visibility": theatre.visibility,
            "owned": theatre.owner_id == user.pk,
            "theatre_file_content": theatre.source,
        }
    )


def _remove(user, data):
    theatre = _owned_example(user, data["selector"], data["value"])
    if theatre is None:
        return _not_found()

    revision = data["revision"]
    if revision is None:
        return _revision_required(theatre.revision)
    if revision != theatre.revision:
        return _revision_conflict(theatre.revision)

    removed = TheatreExample.objects.filter(
        pk=theatre.pk,
        owner=user,
        is_deleted=False,
        revision=revision,
    ).update(is_deleted=True, source="", updated_at=timezone.now())
    if not removed:
        current = _owned_example(user, "id", theatre.pk)
        if current is None:
            return _not_found()
        return _revision_conflict(current.revision)

    return _json_response(
        {
            "ok": True,
            "id": theatre.pk,
            "name": theatre.name,
            "removed": True,
            "revision": revision,
        }
    )


@method_decorator(csrf_exempt, name="dispatch")
class TheatreAPIView(View):
    http_method_names = ["post"]

    def http_method_not_allowed(self, request, *args, **kwargs):
        return _error(
            405,
            "method_not_allowed",
            "Use POST for this endpoint.",
            headers={"Allow": "POST"},
        )

    def post(self, request, *args, **kwargs):
        fields, error = _parse_form(request)
        if error is not None:
            return error
        data, error = _validate_fields(fields)
        if error is not None:
            return error

        try:
            user = _authenticate(request)
            if user is None:
                return _error(401, "unauthorized", "Valid API credentials are required.")

            if data["action"] == "store":
                return _store(request, user, data)
            if data["action"] == "read":
                return _read(request, user, data)
            return _remove(user, data)
        except Exception:
            logger.exception("Unexpected error handling llm_api request")
            return _error(500, "internal_error", "An unexpected server error occurred.")


class TheatreViewerSourceView(View):
    http_method_names = ["get", "head"]

    def http_method_not_allowed(self, request, *args, **kwargs):
        return _error(
            405,
            "method_not_allowed",
            "Use GET for this viewer.",
            headers={"Allow": "GET, HEAD"},
        )

    def get(self, request, example_id, *args, **kwargs):
        try:
            user = _authenticate(request)
            if user is None and request.user.is_authenticated:
                user = request.user
            if user is None:
                return _error(401, "unauthorized", "Valid credentials are required.")

            theatre = TheatreExample.objects.filter(
                pk=example_id,
                is_deleted=False,
            ).first()
            if theatre is None:
                return _not_found()
            if (
                theatre.owner_id != user.pk
                and theatre.visibility != TheatreExample.Visibility.PUBLIC
            ):
                return _not_found()

            response = HttpResponse(
                theatre.source,
                content_type="text/javascript; charset=utf-8",
            )
            response["Cache-Control"] = "no-store"
            response["X-Content-Type-Options"] = "nosniff"
            return response
        except Exception:
            logger.exception("Unexpected error serving llm_api viewer")
            return _error(500, "internal_error", "An unexpected server error occurred.")


from examples.views import ExampleFileView
from pathlib import Path
from examples.theatre import get_source_metadata

from trim import views as t_views


class UserTheatreViewerView(t_views.ListView):
    """Show a users list of examples. Will be live view."""
    model = TheatreExample

    def get_queryset(self):
        u = self.kwargs.get('username')
        return self.model.objects.filter(owner__username=u)


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
            return _error(400, "invalid_stamp", "Stamp must be a Unix timestamp.")

        theatre = (
            TheatreExample.objects.filter(
                owner__username=username,
                updated_at__gt=since,
            )
            .order_by("-updated_at", "-pk")
            .first()
        )
        if theatre is None:
            return _json_response({"latest_change": stamp, "url": None})

        return _json_response(
            {
                "latest_change": theatre.updated_at.timestamp(),
                "url": _theatre_url(request, theatre),
            }
        )


class TheatreViewerView(ExampleFileView):

    template_name = 'llm_api/theatreexample_view.html'

    def get_context_data(self, **kwargs):
        r = super().get_context_data(**kwargs)
        example_id = self.kwargs.get('example_id')
        # p = Path(example_id).with_suffix('')
        r['part_name'] = 'example'

        tfm = TheatreExample.objects.filter(id=example_id)
        obj = None
        if tfm.exists():
            obj = tfm.get()
            r['theatreexample_object'] = obj

        meta = get_source_metadata(obj.source)

        ## flag to call the _single file_ endpoint
        ## rather than list all files individually.
        r['concat_file'] = False

        r['metadata'] = meta
        md = meta.get('markdown', None)
        if md:
            r['markdown'] = md
            del meta['markdown']
        return r
