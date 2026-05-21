"""k-NN similarity search over a VectorManager.

PROTOTYPE: linear scan. PRODUCTION: delegate to the vector DB's native query.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Sequence

from .vector_manager import VectorManager, cosine


@dataclass(frozen=True)
class SearchHit:
    id: str
    score: float
    metadata: dict


class SimilaritySearch:
    def __init__(self, manager: VectorManager) -> None:
        self.manager = manager

    def query(
        self, vector: Sequence[float], *, top_k: int = 5
    ) -> List[SearchHit]:
        if top_k <= 0:
            return []
        scored: List[SearchHit] = []
        for record in self.manager.all():
            score = cosine(vector, record.vector)
            scored.append(
                SearchHit(id=record.id, score=score, metadata=dict(record.metadata))
            )
        scored.sort(key=lambda h: h.score, reverse=True)
        return scored[:top_k]
