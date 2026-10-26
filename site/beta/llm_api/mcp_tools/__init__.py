"""MCP tool registry: discovery and dispatch use the same definitions."""

from . import (
    get_knowledge,
    list_public_theatres,
    list_theatre_files,
    read_theatre,
    read_theatre_file,
    remove_theatre,
    request_view_action,
    store_theatre,
    validate_theatre,
)

TOOL_MODULES = (
    store_theatre,
    read_theatre,
    remove_theatre,
    list_public_theatres,
    list_theatre_files,
    read_theatre_file,
    request_view_action,
    get_knowledge,
    validate_theatre,
)
TOOLS = [module.TOOL for module in TOOL_MODULES]
HANDLERS = {module.TOOL["name"]: module.handle for module in TOOL_MODULES}

if len(TOOLS) != len(HANDLERS):
    raise RuntimeError("Duplicate MCP tool name in registry.")
