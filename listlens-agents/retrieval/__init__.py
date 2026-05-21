"""Retrieval — vector store, similarity search, reference data.

Public API:
    VectorManager        upsert / query vectors
    SimilaritySearch     k-NN over a VectorManager
    ReferenceStore       category-specific reference catalogues
"""

from .vector_manager import VectorManager, VectorRecord
from .similarity_search import SimilaritySearch, SearchHit
from .reference_store import ReferenceStore

__all__ = [
    "ReferenceStore",
    "SearchHit",
    "SimilaritySearch",
    "VectorManager",
    "VectorRecord",
]
