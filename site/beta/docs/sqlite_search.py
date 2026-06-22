from django.db import connection

from docs.models import SourceReference
from docs.search_text import normalize_search_text


FTS_TABLE = "docs_sourcereference_fts"


def is_sqlite():
    return connection.vendor == "sqlite"


def ensure_fts_table():
    if not is_sqlite():
        return False

    sql = f"""
    CREATE VIRTUAL TABLE IF NOT EXISTS {FTS_TABLE}
    USING fts5(
        qualified_name,
        name,
        owner_name,
        symbol_type,
        search_text
    )
    """

    with connection.cursor() as cursor:
        cursor.execute(sql)

    return True


def rebuild_fts_index():
    if not ensure_fts_table():
        return 0

    rows = list(
        SourceReference.objects.values_list(
            "id",
            "qualified_name",
            "name",
            "owner_name",
            "symbol_type",
            "search_text",
        )
    )

    with connection.cursor() as cursor:
        cursor.execute(f"DELETE FROM {FTS_TABLE}")
        cursor.executemany(
            f"""
            INSERT INTO {FTS_TABLE}
                (rowid, qualified_name, name, owner_name, symbol_type, search_text)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            rows,
        )

    return len(rows)


def _build_fts_query(query):
    clean = normalize_search_text(query)
    if not clean:
        return ""

    tokens = [token for token in clean.replace(".", " ").split(" ") if token]
    if not tokens:
        return ""

    # Prefix terms usually give better fuzzy recall for code symbols.
    return " ".join(f"{token}*" for token in tokens)


def sqlite_fts_ranked_ids(query, limit=500):
    if not ensure_fts_table():
        return [], {}

    match_query = _build_fts_query(query)
    if not match_query:
        return [], {}

    sql = f"""
        SELECT rowid, bm25({FTS_TABLE}, 5.0, 4.0, 1.5, 1.2, 0.8) AS rank
        FROM {FTS_TABLE}
        WHERE {FTS_TABLE} MATCH ?
        ORDER BY rank ASC
        LIMIT ?
    """

    ids = []
    rank_map = {}
    with connection.cursor() as cursor:
        cursor.execute(sql, [match_query, int(limit)])
        for rowid, rank in cursor.fetchall():
            rid = int(rowid)
            ids.append(rid)
            rank_map[rid] = float(rank)

    return ids, rank_map
