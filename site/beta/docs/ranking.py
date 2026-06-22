import json
import re
from collections import Counter
from pathlib import Path


IDENTIFIER_RE = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")


def normalize_token(value):
    return (value or "").strip().lower()


def iter_program_identifier_words(node):
    stack = [node]
    while stack:
        current = stack.pop()
        if isinstance(current, dict):
            if current.get("type") == "Identifier":
                word = current.get("word") or current.get("name")
                if isinstance(word, str) and word:
                    yield normalize_token(word)

            for val in current.values():
                if isinstance(val, (dict, list)):
                    stack.append(val)
        elif isinstance(current, list):
            for item in current:
                if isinstance(item, (dict, list)):
                    stack.append(item)


def count_program_identifiers(program_path):
    counts = Counter()
    try:
        payload = json.loads(Path(program_path).read_text())
    except Exception:
        return counts

    for word in iter_program_identifier_words(payload):
        counts[word] += 1

    return counts


def count_js_identifiers(js_path):
    counts = Counter()
    try:
        text = Path(js_path).read_text()
    except Exception:
        return counts

    for token in IDENTIFIER_RE.findall(text):
        counts[normalize_token(token)] += 1

    return counts


def collect_reference_ranking_counts(docs_dir, theatre_dir):
    counts = Counter()

    stash_root = Path(docs_dir) / "trees" / "clean" / "stash"
    if stash_root.exists():
        for program_path in stash_root.glob("*/program.json"):
            counts.update(count_program_identifiers(program_path))

    theatre_root = Path(theatre_dir)
    if theatre_root.exists():
        for js_path in theatre_root.rglob("*.js"):
            counts.update(count_js_identifiers(js_path))

    return counts


def score_symbol_ranking(name, qualified_name, counts):
    tokens = set()

    for token in IDENTIFIER_RE.findall(name or ""):
        tokens.add(normalize_token(token))

    for token in IDENTIFIER_RE.findall(qualified_name or ""):
        tokens.add(normalize_token(token))

    return sum(counts.get(token, 0) for token in tokens)
