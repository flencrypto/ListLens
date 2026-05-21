"""Core primitives shared by every Lens.

PRODUCTION-READY:
    - evidence_types     (typed dataclasses, stable enums)
    - confidence_model   (pure-function scoring)
    - safe_wording       (post-processor used by base_swarm)

PROTOTYPE:
    - base_swarm         (in-process orchestrator; replace with real queue
                          / TS adapter in production)
    - lens_router        (deterministic router with AI-fallback stub)
"""

from .evidence_types import (
    Evidence,
    EvidenceKind,
    EvidenceWeight,
    GuardReport,
    LensName,
    LensResult,
    MissingEvidence,
    RiskLevel,
    StudioDraft,
)
from .confidence_model import score_confidence, score_risk
from .lens_router import LensRouter, RoutingDecision
from .base_swarm import BaseSwarm, LensAgent

__all__ = [
    "BaseSwarm",
    "Evidence",
    "EvidenceKind",
    "EvidenceWeight",
    "GuardReport",
    "LensAgent",
    "LensName",
    "LensResult",
    "LensRouter",
    "MissingEvidence",
    "RiskLevel",
    "RoutingDecision",
    "StudioDraft",
    "score_confidence",
    "score_risk",
]
