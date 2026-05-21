"""Reference data catalogue.

Per-Lens reference rows (e.g. RecordLens pressings, SoleLens style codes).

PROTOTYPE: in-memory namespace. PRODUCTION: backed by Postgres tables and
synced from Discogs / brand catalogues / grader databases.
"""

from __future__ import annotations

from typing import Dict, Iterable, List, Optional


class ReferenceStore:
    def __init__(self) -> None:
        self._namespaces: Dict[str, Dict[str, dict]] = {}

    def upsert(self, namespace: str, record_id: str, data: dict) -> None:
        ns = self._namespaces.setdefault(namespace, {})
        ns[record_id] = data

    def get(self, namespace: str, record_id: str) -> Optional[dict]:
        return self._namespaces.get(namespace, {}).get(record_id)

    def find(
        self, namespace: str, **filters: object
    ) -> List[dict]:
        rows = self._namespaces.get(namespace, {}).values()
        return [
            r for r in rows
            if all(r.get(k) == v for k, v in filters.items())
        ]

    def namespaces(self) -> Iterable[str]:
        return self._namespaces.keys()
