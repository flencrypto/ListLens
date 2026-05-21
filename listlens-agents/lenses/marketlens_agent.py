"""MarketLens — price comparison and sold-comp analysis.

PROTOTYPE. Used by Studio (pricing.recommended/quickSale/high) and Guard
(priceCheck.status). Price alone NEVER determines risk (instructions §11).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import (
    Evidence,
    EvidenceKind,
    EvidenceWeight,
    LensName,
    MissingEvidence,
)
from ._base_lens import BaseLens


@dataclass(frozen=True)
class PriceBand:
    quick_sale: float
    recommended: float
    high: float
    confidence: float
    basis: str   # short description of how the band was derived


class MarketLensAgent(BaseLens):
    name = LensName.MARKET

    # ------------------------------------------------------------------
    # Public helper used by other Lenses (not just Guard/Studio entry points).
    # ------------------------------------------------------------------

    def price_band(self, payload: SwarmInput) -> Optional[PriceBand]:
        # TODO(production): query retrieval/reference_store for sold comps,
        # filter by condition + region, return a calibrated band.
        return None  # PLACEHOLDER

    def price_check(
        self, payload: SwarmInput, band: Optional[PriceBand]
    ) -> tuple[str, Optional[str]]:
        """Return (status, note) where status is normal|low|high|unknown."""

        if band is None or payload.price_amount is None:
            return "unknown", None
        if payload.price_amount < band.quick_sale * 0.7:
            return (
                "low",
                "The asking price is well below comparable sold listings. "
                "This does not prove the item is fake or misdescribed, but "
                "it increases the need for stronger evidence.",
            )
        if payload.price_amount > band.high * 1.3:
            return (
                "high",
                "The asking price is above comparable sold listings.",
            )
        return "normal", None

    # ------------------------------------------------------------------
    # LensAgent interface
    # ------------------------------------------------------------------

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        band = self.price_band(payload)
        if band is None:
            return []
        return [
            Evidence(
                key="price_band",
                label="Sold-comp price band",
                kind=EvidenceKind.REFERENCE_MATCH,
                weight=EvidenceWeight.MEDIUM,
                value=f"quick={band.quick_sale} rec={band.recommended} high={band.high}",
                notes=band.basis,
            )
        ]

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return []

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        return []

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        return []
