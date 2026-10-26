"""Validation, authentication, and responses shared by theatre endpoints."""

import re
from urllib.parse import parse_qsl

from django.core.exceptions import RequestDataTooBig
from django.db.models import Q
from django.http import JsonResponse
from django.urls import reverse
from django.utils import timezone

from .models import THEATRE_NAME_PATTERN, TheatreAPIKey, TheatreExample

MAX_SOURCE_BYTES = 1_048_576
MAX_REVISION = 9_223_372_036_854_775_807
NAME_PATTERN = re.compile(THEATRE_NAME_PATTERN)
BAD_PERCENT_ESCAPE = re.compile(r"%(?![0-9A-Fa-f]{2})")


def json_response(data, status=200, headers=None):
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


def error_response(status, code, message, current_revision=None, headers=None):
    error = {"code": code, "message": message}
    if current_revision is not None:
        error["current_revision"] = current_revision
    response_headers = headers or {}
    return json_response({"ok": False, "error": error}, status, response_headers)


def parse_form(request):
    if request.content_type.lower() != "application/x-www-form-urlencoded":
        return None, error_response(
            415,
            "unsupported_media_type",
            "Use a UTF-8 URL-encoded form.",
        )

    charset = request.content_params.get("charset")
    if charset and charset.lower().replace("_", "-") not in ("utf-8", "utf8"):
        return None, error_response(
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
        return None, error_response(
            413,
            "content_too_large",
            "The request body exceeds the supported limit.",
        )
    except (UnicodeDecodeError, ValueError):
        return None, error_response(400, "invalid_request", "Malformed form data.")

    fields = {}
    for name, value in pairs:
        if name in fields:
            return None, error_response(400, "invalid_request", "Duplicate form fields.")
        fields[name] = value
    return fields, None


def validate_fields(fields):
    action = fields.get("action")
    if action not in ("store", "read", "remove"):
        return None, error_response(400, "invalid_request", "Unsupported or missing action.")

    allowed = {
        "store": {"action", "name", "id", "theatre_file_content", "revision"},
        "read": {"action", "name", "id", "scope"},
        "remove": {"action", "name", "id", "revision"},
    }[action]
    if set(fields) - allowed:
        return None, error_response(400, "invalid_request", "Unsupported field for action.")

    selectors = [field for field in ("name", "id") if field in fields]
    if len(selectors) != 1 or not fields[selectors[0]]:
        return None, error_response(
            400,
            "invalid_request",
            "Supply exactly one nonempty name or id.",
        )
    selector, value = selectors[0], fields[selectors[0]]

    if selector == "name" and not NAME_PATTERN.fullmatch(value):
        return None, error_response(400, "invalid_request", "Invalid example name.")

    if action == "store" and "theatre_file_content" not in fields:
        return None, error_response(400, "invalid_request", "Source content is required.")
    if action == "store" and len(fields["theatre_file_content"].encode("utf-8")) > MAX_SOURCE_BYTES:
        return None, error_response(
            413,
            "content_too_large",
            "Source exceeds the 1 MiB limit.",
        )

    scope = fields.get("scope", "personal")
    if action == "read" and scope not in ("personal", "public"):
        return None, error_response(400, "invalid_request", "Invalid read scope.")
    if action == "read" and "scope" in fields and selector != "name":
        return None, error_response(
            400,
            "invalid_request",
            "Read scope is only valid with a name.",
        )

    revision = None
    if "revision" in fields:
        raw_revision = fields["revision"]
        if len(raw_revision) > 19 or not re.fullmatch(r"[0-9]+", raw_revision):
            return None, error_response(400, "invalid_request", "Invalid revision.")
        revision = int(raw_revision)
        if not 1 <= revision <= MAX_REVISION:
            return None, error_response(400, "invalid_request", "Invalid revision.")

    return {
        "action": action,
        "selector": selector,
        "value": value,
        "scope": scope,
        "revision": revision,
        "source": fields.get("theatre_file_content"),
    }, None


def authenticate(request):
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


def theatre_url(request, theatre):
    return reverse("llm_api:theatre_view", kwargs={"example_id": theatre.pk})


def not_found_response():
    return error_response(404, "not_found", "The example was not found.")


def revision_required_response(revision):
    return error_response(
        409,
        "revision_required",
        "A current revision is required for this mutation.",
        current_revision=revision,
    )


def revision_conflict_response(revision=None):
    return error_response(
        409,
        "revision_conflict",
        "The example has changed. Read it again before retrying.",
        current_revision=revision,
    )


def find_owned_theatre(user, selector, value):
    lookup = {"owner": user, "is_deleted": False, selector: value}
    return TheatreExample.objects.filter(**lookup).first()
