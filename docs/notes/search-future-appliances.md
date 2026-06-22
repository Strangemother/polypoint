# Search Future Appliances

This document tracks next-stage improvements for search quality, ranking control, and performance.

## 1. Weighted Composite Score

Use a combined score with tunable coefficients:

- field boost score (query-to-field relevance)
- rank weight (manual strategic boost)
- code reference ranking (usage frequency in parsed sources)
- fuzzy distance penalties

Goal: strong intent matching while keeping important API symbols discoverable.

## 2. DB Weight Rules

Current static `WEIGHTS` can be complemented/replaced by DB rules (`SearchWeightRule`).

Recommended enhancements:

- admin UI for add/edit/disable rules
- optional priority ordering among rules
- optional source scope (`point_src`, `theatre`, `all`)
- optional symbol type scope (`class`, `method`, `function`, `constant`)

## 3. Query Language

Support query operators:

- `type:method add`
- `class:Point add`
- `owner:Point`
- `file:point.js`
- quoted exact search: `"Point.add"`

Goal: deterministic filters before scoring.

## 4. Better Fuzzy Matching

Current Levenshtein fallback can evolve toward indexed fuzzy search.

Options:

- SQLite FTS5 + BM25 for text relevance
- Postgres trigram + full-text search for larger datasets
- keep Levenshtein as tie-breaker on top-N candidates

## 5. Explainable Ranking

Expose score breakdown in results/debug mode:

- exact/prefix/token field boosts
- rank weight contribution
- reference ranking contribution
- fuzzy penalty

Goal: faster tuning and confidence in relevance decisions.

## 6. Behavioral Feedback Loop

Optional analytics for iterative tuning:

- capture clicked result position
- aggregate per query term
- lightweight boost for consistently clicked symbols

Goal: adapt ranking to real usage patterns.

## 7. Ingestion Controls

Add command flags for ranking experiments:

- `--weights-file <json>` to load external weight map
- `--no-db-weights` to ignore rule table
- `--dry-run` to compute summary without DB writes

Goal: safer tuning during development and deployment.
