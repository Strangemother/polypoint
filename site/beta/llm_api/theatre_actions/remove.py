"""Remove owned theatres."""

from django.utils import timezone

from ..api_common import (
    json_response,
    not_found_response,
    find_owned_theatre,
    revision_conflict_response,
    revision_required_response,
)
from ..models import TheatreExample


def remove_theatre(user, data):
    theatre = find_owned_theatre(user, data["selector"], data["value"])
    if theatre is None:
        return not_found_response()

    revision = data["revision"]
    if revision is None:
        return revision_required_response(theatre.revision)
    if revision != theatre.revision:
        return revision_conflict_response(theatre.revision)

    removed = TheatreExample.objects.filter(
        pk=theatre.pk,
        owner=user,
        is_deleted=False,
        revision=revision,
    ).update(is_deleted=True, source="", updated_at=timezone.now())
    if not removed:
        current = find_owned_theatre(user, "id", theatre.pk)
        if current is None:
            return not_found_response()
        return revision_conflict_response(current.revision)

    return json_response(
        {
            "ok": True,
            "id": theatre.pk,
            "name": theatre.name,
            "removed": True,
            "revision": revision,
        }
    )
