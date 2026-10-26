"""Read indexed theatre files without leaving the configured theatre directory."""

import logging
from pathlib import Path

from django.conf import settings

from .knowledge.guide import read_header_metadata

logger = logging.getLogger(__name__)
MAX_SIGNED_BIGINT = 9_223_372_036_854_775_807


class TheatreSourceError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message

    def as_dict(self):
        return {"code": self.code, "message": self.message}


def read_source(theatre):
    try:
        root = Path(settings.POLYPOINT_THEATRE_DIR).resolve()
        relative = Path(theatre.filepath)
        if relative.is_absolute() or ".." in relative.parts or not relative.parts:
            raise TheatreSourceError(
                "invalid_path", "The indexed file path is outside the theatre directory."
            )
        target = (root / relative).resolve()
        if not target.is_relative_to(root):
            raise TheatreSourceError(
                "invalid_path", "The indexed file path is outside the theatre directory."
            )
        with target.open("r", encoding="utf-8", newline="") as source_file:
            return source_file.read()
    except FileNotFoundError as exc:
        logger.warning("Indexed theatre file %s is missing: %s", theatre.pk, exc)
        raise TheatreSourceError(
            "source_not_found", "The indexed theatre file is missing."
        ) from exc
    except UnicodeError as exc:
        logger.warning("Indexed theatre file %s is not UTF-8: %s", theatre.pk, exc)
        raise TheatreSourceError(
            "invalid_encoding", "The indexed theatre file is not valid UTF-8."
        ) from exc
    except (ValueError, RuntimeError) as exc:
        logger.warning("Indexed theatre file %s has an invalid path: %s", theatre.pk, exc)
        raise TheatreSourceError("invalid_path", "The indexed file path is invalid.") from exc
    except OSError as exc:
        logger.warning("Unable to read indexed theatre file %s: %s", theatre.pk, exc)
        raise TheatreSourceError(
            "source_unreadable", "The indexed theatre file could not be read."
        ) from exc


def theatre_details(theatre, source=None):
    metadata = (read_header_metadata(source) or {}) if source is not None else {}
    title = next((value.strip() for value in metadata.get("title", ()) if value.strip()), None)
    return {
        "id": theatre.pk,
        "name": theatre.name,
        "title": title or theatre.name or Path(theatre.filepath).stem,
        "filepath": theatre.filepath,
        "filename": Path(theatre.filepath).name,
        "description": theatre.description,
    }


def theatre_summary(theatre):
    try:
        source = read_source(theatre)
    except TheatreSourceError as exc:
        details = theatre_details(theatre)
        details["source_error"] = exc.as_dict()
    else:
        details = theatre_details(theatre, source)
    details["description"] = (details["description"] or "")[:240]
    return details
