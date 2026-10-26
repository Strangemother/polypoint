"""Read owned or public theatres."""

from ..api_common import (
    error_response,
    json_response,
    not_found_response,
    find_owned_theatre,
    theatre_url,
)
from ..models import TheatreExample


def read_theatre(request, user, data):
    if data["selector"] == "id":
        theatre = TheatreExample.objects.filter(
            pk=data["value"],
            is_deleted=False,
        ).first()
        if theatre is None:
            return not_found_response()
        if theatre.owner_id != user.pk and theatre.visibility != TheatreExample.Visibility.PUBLIC:
            return not_found_response()
    elif data["scope"] == "public":
        matches = list(
            TheatreExample.objects.filter(
                name=data["value"],
                visibility=TheatreExample.Visibility.PUBLIC,
                is_deleted=False,
            )[:2]
        )
        if not matches:
            return not_found_response()
        if len(matches) > 1:
            return error_response(
                409,
                "ambiguous_name",
                "Multiple public examples match this name; read by id.",
            )
        theatre = matches[0]
    else:
        theatre = find_owned_theatre(user, "name", data["value"])
        if theatre is None:
            return not_found_response()

    return json_response(
        {
            "ok": True,
            "id": theatre.pk,
            "name": theatre.name,
            "revision": theatre.revision,
            "url": theatre_url(request, theatre),
            "visibility": theatre.visibility,
            "owned": theatre.owner_id == user.pk,
            "theatre_file_content": theatre.source,
        }
    )
