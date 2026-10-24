"""Versioned, local authoring guides and conservative static diagnostics."""
import re
from pathlib import Path

DOCS = Path(__file__).parent
TOPICS = ("overview", "imports", "stage", "canvas", "animation", "3d-projection")
MAX_SOURCE = 1_048_576


def get_guide(topic="overview"):
    if topic not in TOPICS:
        return {"ok": False, "error": {"code": "invalid_topic", "message": "Unknown topic."}, "topics": list(TOPICS)}
    path = DOCS / (topic + ".md")
    return {"ok": True, "topic": topic, "topics": list(TOPICS),
            "format": "text/markdown", "content": path.read_text(encoding="utf-8")}


def validate_source(source):
    """Static sanity checks only; do NOT execute any supplied JavaScript."""
    if len(source.encode("utf-8")) > MAX_SOURCE:
        return {"ok": False, "diagnostics": [{"severity": "error", "code": "size_limit", "message": "Source exceeds 1 MiB."}]}
    diagnostics = []
    def add(code, message, severity="warning"):
        diagnostics.append({"severity": severity, "code": code, "message": message})
    header = re.match(r"\s*/\*([\s\S]*?)\*/", source)
    if not header:
        add("missing_header", "Start with a /* ... */ theatre metadata header.", "error")
    else:
        meta = header.group(1)
        if not re.search(r"(?m)^title\s*:", meta):
            add("missing_title", "Metadata header needs title:.", "warning")
        if not re.search(r"(?m)^files\s*:\s*$", meta):
            add("missing_files", "Metadata header needs files: listing required point_src modules.", "error")
        elif "../point_src/stage.js" not in meta:
            add("missing_stage_import", "files: should include ../point_src/stage.js.", "error")
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
