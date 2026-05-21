"""Vector store abstraction.

PROTOTYPE: in-memory dict backend. PRODUCTION: swap ``_Backend`` for pgvector
or a managed vector DB. The ``VectorManager`` public API is stable.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional, Sequence


@dataclass(frozen=True)
class VectorRecord:
    id: str
    vector: tuple[float, ...]
    metadata: Dict[str, str] = field(default_factory=dict)


class _Backend:
    """In-memory backend. Replace in production."""

    def __init__(self) -> None:
        self._data: Dict[str, VectorRecord] = {}

    def upsert(self, records: Iterable[VectorRecord]) -> None:
        for r in records:
            self._data[r.id] = r

    def all(self) -> List[VectorRecord]:
        return list(self._data.values())

    def get(self, record_id: str) -> Optional[VectorRecord]:
        return self._data.get(record_id)

    def delete(self, record_id: str) -> bool:
        return self._data.pop(record_id, None) is not None


class VectorManager:
    """Thin wrapper around the active backend."""

    def __init__(self, dim: int) -> None:
        if dim <= 0:
            raise ValueError("dim must be positive")
        self.dim = dim
        self._backend = _Backend()

    def upsert(self, records: Sequence[VectorRecord]) -> None:
        for r in records:
            if len(r.vector) != self.dim:
                raise ValueError(
                    f"vector for {r.id} has dim {len(r.vector)}, expected {self.dim}"
                )
        self._backend.upsert(records)

    def get(self, record_id: str) -> Optional[VectorRecord]:
        return self._backend.get(record_id)

    def delete(self, record_id: str) -> bool:
        return self._backend.delete(record_id)

    def all(self) -> List[VectorRecord]:
        return self._backend.all()


def cosine(a: Sequence[float], b: Sequence[float]) -> float:
    if len(a) != len(b):
        raise ValueError("dim mismatch")
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)
