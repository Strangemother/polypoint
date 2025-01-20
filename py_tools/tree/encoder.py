"""
Read the AST tree of the js files within the docs/trees.
"""
import os
import json
from pathlib import Path
from datetime import datetime as dt


from collections import defaultdict


class ComplexEncoder(json.JSONEncoder):
    """
        from .encoder import ComplexEncoder
        json.dumps({}, cls=ComplexEncoder)
    """
    def default(self, obj):
        if hasattr(obj, 'as_json'):
            return obj.as_json()

        if isinstance(obj, Path):
            return str(obj.as_posix())

        if isinstance(obj, Coord):
            return vars(obj)
        # Let the base class default method raise the TypeError
        return super().default(obj)

