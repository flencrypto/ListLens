"""Pure-function risk + confidence scoring.

PRODUCTION-READY for the scoring math. Tuning constants are PLACEHOLDERS and
should be calibrated against labelled fixtures before any user-visible launch.

Design rules (see agent instructions §11 and §24):
    - Risk and confidence stay separate. Never collapse them.
    - Price alone never determines risk.
    - Missing evidence reduces confidence, never inflates risk on its own.
"""

from __future__ import annotations

from typing import Iterable, Sequence

from .evidence_types import Evidence, EvidenceKind, MissingEvidence, RiskLevel


# Tuning constants — PLACEHOLDER, calibrate with fixtures.
_KIND_TRUST: dict[EvidenceKind, float] = {
    EvidenceKind.OBSERVED_FACT: 1.0,
    EvidenceKind.REFERENCE_MATCH: 0.9,
    EvidenceKind.AI_INFERENCE: 0.55,
    EvidenceKind.USER_CLAIM: 0.4,
    EvidenceKind.SELLER_CLAIM: 0.25,
}

_MISSING_PENALTY_PER_ITEM = 0.08
_MAX_MISSING_PENALTY = 0.6


def score_confidence(
    evidence: Sequence[Evidence],
    missing: Sequence[MissingEvidence] = (),
) -> float:
    """Return a 0..1 confidence score.

    Combines weighted evidence and subtracts a penalty per piece of missing
    evidence so that "we have lots of seller text but no photos" stays low
    confidence, not high.
    """

    if not evidence:
        return 0.0

    weighted = 0.0
    total_weight = 0.0
    for ev in evidence:
        trust = _KIND_TRUST.get(ev.kind, 0.3)
        w = float(ev.weight) * trust
        weighted += w
        total_weight += float(ev.weight)

    base = weighted / total_weight if total_weight else 0.0

    penalty = min(
        _MAX_MISSING_PENALTY,
        len(missing) * _MISSING_PENALTY_PER_ITEM,
    )
    return max(0.0, min(1.0, base - penalty))


def score_risk(
    red_flags: Iterable[str],
    confidence: float,
    *,
    has_price_anomaly: bool = False,
) -> RiskLevel:
    """Map qualitative red flags + confidence to a RiskLevel.

    Price anomalies *raise the need for evidence* but never push to HIGH on
    their own (agent instructions §18).
    """

    flag_count = sum(1 for _ in red_flags)

    if confidence < 0.25 and flag_count == 0:
        return RiskLevel.INCONCLUSIVE
    if flag_count >= 3:
        return RiskLevel.HIGH
    if flag_count == 2:
        return RiskLevel.HIGH if confidence >= 0.5 else RiskLevel.MEDIUM
    if flag_count == 1 or has_price_anomaly:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW
