"""Create and update owned theatres."""

from django.db import IntegrityError, transaction
from django.db.models import F
from django.utils import timezone

from ..api_common import (
    json_response,
    not_found_response,
    find_owned_theatre,
    revision_conflict_response,
    revision_required_response,
    theatre_url,
)
from ..models import TheatreExample


def store_theatre(request, user, data):
    source = data["source"]
    if data["selector"] == "name":
        theatre = find_owned_theatre(user, "name", data["value"])
        if theatre is None:
            if data["revision"] is not None:
                return revision_conflict_response()
            try:
                with transaction.atomic():
                    theatre = TheatreExample.objects.create(
                        owner=user,
                        name=data["value"],
                        source=source,
                    )
            except IntegrityError:
                theatre = find_owned_theatre(user, "name", data["value"])
                if theatre is None:
                    raise
                return revision_required_response(theatre.revision)

            return json_response(
                {
                    "ok": True,
                    "id": theatre.pk,
                    "name": theatre.name,
                    "revision": theatre.revision,
                    "created": True,
                    "url": theatre_url(request, theatre),
                },
                status=201,
            )
    else:
        theatre = find_owned_theatre(user, "id", data["value"])
        if theatre is None:
            return not_found_response()

    revision = data["revision"]
    if revision is None:
        return revision_required_response(theatre.revision)
    if revision != theatre.revision:
        return revision_conflict_response(theatre.revision)

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
        current = find_owned_theatre(user, "id", theatre.pk)
        if current is None:
            return not_found_response()
        return revision_conflict_response(current.revision)

    return json_response(
        {
            "ok": True,
            "id": theatre.pk,
            "name": theatre.name,
            "revision": revision + 1,
            "created": False,
            "url": theatre_url(request, theatre),
        }
    )
