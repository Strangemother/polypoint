import re


def normalize_search_text(value):
    text = (value or "").lower()
    text = re.sub(r"[^a-z0-9_./]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def build_symbol_search_text(
    source_file,
    symbol_type,
    name,
    qualified_name,
    owner_name="",
    kind="",
    signature="",
    params_text="",
    comments_text="",
):
    tokens = [
        source_file,
        symbol_type,
        name,
        qualified_name,
        owner_name,
        kind,
        signature,
        params_text,
        comments_text,
    ]
    return normalize_search_text(" ".join(v for v in tokens if v))


def levenshtein_distance(left, right):
    left = left or ""
    right = right or ""

    if left == right:
        return 0
    if not left:
        return len(right)
    if not right:
        return len(left)

    if len(left) > len(right):
        left, right = right, left

    previous = list(range(len(left) + 1))
    for i, rc in enumerate(right, start=1):
        current = [i]
        for j, lc in enumerate(left, start=1):
            insert_cost = current[j - 1] + 1
            delete_cost = previous[j] + 1
            replace_cost = previous[j - 1] + (0 if lc == rc else 1)
            current.append(min(insert_cost, delete_cost, replace_cost))
        previous = current

    return previous[-1]


def rank_symbol_match(query, name, qualified_name):
    q = normalize_search_text(query)
    n = normalize_search_text(name)
    qn = normalize_search_text(qualified_name)

    exact = 0 if q and (q == n or q == qn) else 1

    candidates = [v for v in (n, qn) if v]
    if not q or not candidates:
        distance = 0
    else:
        distance = min(levenshtein_distance(q, c) for c in candidates)

    return (exact, distance)


def field_boost_score(
    query,
    name,
    qualified_name,
    owner_name="",
    symbol_type="",
    search_text="",
):
    q = normalize_search_text(query)
    n = normalize_search_text(name)
    qn = normalize_search_text(qualified_name)
    owner = normalize_search_text(owner_name)
    stype = normalize_search_text(symbol_type)
    haystack = normalize_search_text(search_text)

    if not q:
        return 0

    score = 0

    # Exact and near-exact path/name intent.
    if q == qn:
        score += 2000
    if q == n:
        score += 1200
    if qn.startswith(q):
        score += 900
    if n.startswith(q):
        score += 700

    # Query fragments in dotted paths should still boost strongly.
    if q in qn:
        score += 450
    if q in n:
        score += 300
    if q and q in owner:
        score += 120
    if q and q in haystack:
        score += 80

    # Type preferences, slightly favor callable/class API units.
    if stype == "class":
        score += 35
    elif stype in ("method", "function", "constructor", "getter", "setter"):
        score += 25

    # Token overlap bonus.
    q_tokens = set(v for v in q.replace(".", " ").split(" ") if v)
    n_tokens = set(v for v in n.replace(".", " ").split(" ") if v)
    qn_tokens = set(v for v in qn.replace(".", " ").split(" ") if v)
    overlap = len(q_tokens & (n_tokens | qn_tokens))
    score += overlap * 60

    return score
