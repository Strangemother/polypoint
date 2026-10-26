"""Versioned, local authoring guides and conservative static diagnostics."""
import re
import textwrap
from pathlib import Path

import markdown

DOCS = Path(__file__).parent
EXAMPLES = {
    "example-point": (
        "minimal-example.js", "A point at the stage center",
        "A small baseline using the head, point, and stage bundles.",
    ),
    "example-click": (
        "general-event-position.js", "Create a point from a canvas click",
        "The click handler uses canvas-relative event offsets, including when x is zero.",
    ),
    "example-pointer-direction": (
        "stage-center-example.js", "Turn a point toward the pointer",
        "Uses the automatically mounted mouse and Point.lookAt.",
    ),
    "example-line": (
        "line-example.js", "A line with draggable endpoints",
        "Line comes from curve-extras.js; drag either endpoint.",
    ),
    "example-bezier": (
        "bezier-curve-example.js", "A cubic Bezier curve with draggable endpoints",
        "The endpoints' radius and rotation determine the projected control handles.",
    ),
    "example-arcs": (
        "arc-angles.js", "Arcs between point rotations",
        "The two points start at the same position; move or rotate them to explore the arcs.",
    ),
    "example-polygon": (
        "ngon-example.js", "Draw a regular polygon",
        "Change the side count, radius, color, and angle in pen.ngon.",
    ),
    "example-grid": (
        "grid-3.js", "Generate and drag a grid of points",
        "PointList.generate.grid takes point count, points per row, and spacing.",
    ),
    "example-random-points": (
        "random-pointlist-speckle.js", "Randomly distributed and animated points",
        "This original uses frame counts for movement; use elapsed time for frame-rate independence.",
    ),
    "example-text": (
        "text-example-2.js", "Text and labels attached to points",
        "Click to change rotations; text.string is unrotated, while text.label rotates with the point.",
    ),
    "example-fps": (
        "fps-example.js", "Display the frame-rate counter",
        "The example displays the FPS counter; its registered draggable point is not drawn.",
    ),
    "example-gradient": (
        "gradient-linear-two-point.js", "A linear gradient with draggable controls",
        "Refreshes the gradient as its two control points move.",
    ),
    "example-stroke": (
        "stroke-example.js", "A styled, animated dashed stroke",
        "Stroke.set and Stroke.unset bracket the drawing that uses the style.",
    ),
    "example-wave": (
        "sin-wave-plot.js", "Animate a sine-wave point list",
        "This original advances its phase per frame, so speed varies with frame rate.",
    ),
    "example-bisector": (
        "bisect-example.js", "Show the angle bisector of three draggable points",
        "acuteBisect returns radians; assign them to point.radians.",
    ),
    "example-quantize": (
        "quantize-point.js", "Snap a point to a grid as the mouse moves",
        "Canvas event methods update the unsnapped and quantized points.",
    ),
    "example-follow": (
        "follow-point.js", "A chain following the mouse",
        "Uses followPoint from constrain-distance-locked.js and updates once per draw.",
    ),
    "example-motion": (
        "motion-line-example.js", "An interpolated line trailing a moving point",
        "The original uses frame-based interpolation and random movement.",
    ),
    "example-rectangles": (
        "rectangle-example.js", "Draw rectangles from a point list",
        "rectangle.js adds rectangle pen methods; the rounded rectangle uses canvas roundRect.",
    ),
    "example-projection": (
        "pseudo3DRotate-projection-types.js", "Compare perspective and orthographic rotations",
        "The rotation advances per frame. The bundled version also handles perspective=false.",
    ),
}
GUIDE_TOPICS = (
    "overview", "imports", "stage", "points", "pointlists", "drawing",
    "interaction", "canvas", "animation", "3d-projection", "examples",
)
TOPICS = GUIDE_TOPICS + tuple(EXAMPLES)
MAX_SOURCE = 1_048_576


def get_guide(topic="overview"):
    if topic not in TOPICS:
        return {"ok": False, "error": {"code": "invalid_topic", "message": "Unknown topic."}, "topics": list(TOPICS)}
    if topic in EXAMPLES:
        filename, summary, notes = EXAMPLES[topic]
        source = (DOCS / "examples" / filename).read_text(encoding="utf-8")
        content = (
            f"# {summary}\n\n"
            f"Bundled starter adapted from `theatre/{filename}`. "
            "Copy the entire JavaScript block, including its metadata header.\n\n"
            f"{notes}\n\n```javascript\n{source.rstrip()}\n```\n"
        )
    else:
        content = (DOCS / (topic + ".md")).read_text(encoding="utf-8")
        if topic == "examples":
            content += "\n" + "\n".join(
                f"- `{name}`: {summary}. {notes}"
                for name, (_, summary, notes) in EXAMPLES.items()
            ) + "\n"
    return {"ok": True, "topic": topic, "topics": list(TOPICS),
            "format": "text/markdown", "content": content}


def read_header_metadata(source):
    header = re.match(r"\s*/\*([\s\S]*?)\*/", source)
    if header is None:
        return None
    text = textwrap.dedent(header.group(1).replace("\r\n", "\n").replace("\r", "\n")).strip()
    parser = markdown.Markdown(extensions=["meta"])
    lines = parser.preprocessors["normalize_whitespace"].run(text.splitlines())
    parser.preprocessors["meta"].run(lines)
    return parser.Meta


def validate_source(source):
    """Static sanity checks only; do NOT execute any supplied JavaScript."""
    if len(source.encode("utf-8")) > MAX_SOURCE:
        return {"ok": False, "diagnostics": [{"severity": "error", "code": "size_limit", "message": "Source exceeds 1 MiB."}]}
    diagnostics = []
    def add(code, message, severity="warning"):
        diagnostics.append({"severity": severity, "code": code, "message": message})
    meta = read_header_metadata(source)
    if meta is None:
        add("missing_header", "Start with a /* ... */ theatre metadata header.", "error")
    else:
        if not any(value.strip() for value in meta.get("title", ())):
            add("missing_title", "Metadata header needs title:.", "warning")
        files = {value.strip() for value in meta.get("files", ()) if value.strip()}
        if not files:
            add("missing_files", "Metadata header needs files: listing required point_src modules.", "error")
        elif not files.intersection({"stage", "other", "everything", "../point_src/stage.js"}):
            add("missing_stage_import", "files: should include the stage bundle or ../point_src/stage.js.", "error")
    if re.search(r"class\s+\w+\s+extends\s+Stage", source):
        if not re.search(r"\bcanvas\s*=\s*['\"]playspace['\"]", source):
            add("canvas_binding", "Set canvas = 'playspace' on the Stage class.")
    else:
        add("missing_stage", "No class extending Stage found.")
    if re.search(r"\bfunction\s+\w+\s*\([^)]*\)\s*\{[^{}]{0,600}\bthis\.", source):
        add("this_function_context", "A nested function references this; verify binding or use an arrow function.")
    return {"ok": not any(d["severity"] == "error" for d in diagnostics),
            "diagnostics": diagnostics,
            "note": "Static advisory checks only. This is not a JavaScript parser or browser execution test."}
