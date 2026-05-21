"""Shared scaffolding for specialist Lenses.

Provides ``BaseLens`` so individual Lens modules stay focused on category
knowledge (which evidence to look for, which questions to ask). Boilerplate
(report IDs, timestamps, safe-wording, missing-evidence rendering) lives here.
"""

from __future__ import annotations

import uuid
from abc import abstractmethod
from typing import List, Sequence

from core.base_swarm import LensAgent, SwarmInput
from core.confidence_model import score_confidence, score_risk
from core.evidence_types import (
    Evidence,
    GuardReport,
    LensName,
    MissingEvidence,
    RiskLevel,
    StudioDraft,
)


class BaseLens(LensAgent):
    """Convenience base. Subclasses override the four hooks below."""

    name: LensName

    # ------------------------------------------------------------------
    # Hooks for subclasses
    # ------------------------------------------------------------------

    @abstractmethod
    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        """Return what evidence we *did* find. PROTOTYPE: returns []."""

    @abstractmethod
    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        """Return what the Lens expects to see for a confident answer."""

    @abstractmethod
    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        """Return qualitative red-flag identifiers (not user-visible text)."""

    @abstractmethod
    def seller_questions(self, missing: Sequence[MissingEvidence]) -> List[str]:
        """Return copy-pasteable questions a buyer can ask the seller."""

    # ------------------------------------------------------------------
    # Default Guard + Studio assembly
    # ------------------------------------------------------------------

    def analyse_guard(self, payload: SwarmInput) -> GuardReport:
        evidence = self.collect_evidence(payload)
        expected = self.expected_evidence(payload)
        missing = self._missing(expected, evidence)
        confidence = score_confidence(evidence, missing)
        red_flags = self.red_flags(payload, evidence)
        risk = score_risk(red_flags, confidence)

        summary = self._summary_for(risk, confidence, missing)
        return GuardReport(
            report_id=f"gr_{uuid.uuid4().hex[:12]}",
            lens=self.name,
            marketplace=payload.marketplace,
            listing_url=payload.listing_url,
            item_title=payload.title,
            price_amount=payload.price_amount,
            price_currency=payload.price_currency,
            evidence=list(evidence),
            missing_evidence=list(missing),
            confidence=confidence,
            risk_level=risk,
            risk_label=self._label_for(risk),
            risk_summary=summary,
            seller_questions=self.seller_questions(missing),
            platform_protection_notes=self._platform_protection_notes(payload),
        )

    def analyse_studio(self, payload: SwarmInput) -> StudioDraft:
        # PROTOTYPE — Studio uses the same evidence backbone but each Lens
        # should override this for category-specific item-specifics + copy.
        evidence = self.collect_evidence(payload)
        expected = self.expected_evidence(payload)
        missing = self._missing(expected, evidence)
        confidence = score_confidence(evidence, missing)
        warnings = [m.why_it_matters for m in missing]

        return StudioDraft(
            draft_id=f"sd_{uuid.uuid4().hex[:12]}",
            lens=self.name,
            evidence=list(evidence),
            missing_evidence=list(missing),
            confidence=confidence,
            detected_title=payload.title,
            listing_title=payload.title,
            listing_description=payload.description,
            confidence_warnings=warnings,
            price_confidence=confidence,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _missing(
        expected: Sequence[MissingEvidence],
        found: Sequence[Evidence],
    ) -> List[MissingEvidence]:
        found_keys = {e.key for e in found}
        return [m for m in expected if m.key not in found_keys]

    @staticmethod
    def _label_for(risk: RiskLevel) -> str:
        return {
            RiskLevel.LOW: "Low risk indicators",
            RiskLevel.MEDIUM: "Some risk indicators",
            RiskLevel.HIGH: "High risk indicators",
            RiskLevel.INCONCLUSIVE: "Not enough evidence",
        }[risk]

    @staticmethod
    def _summary_for(
        risk: RiskLevel,
        confidence: float,
        missing: Sequence[MissingEvidence],
    ) -> str:
        if risk is RiskLevel.INCONCLUSIVE or confidence < 0.25:
            return (
                "There is not enough evidence in this listing to give a "
                "confident answer. Ask the seller for the missing photos "
                "before buying."
            )
        if risk is RiskLevel.HIGH:
            return (
                "There are high risk indicators in this listing. "
                "Authenticity cannot be confirmed from the visible evidence."
            )
        if risk is RiskLevel.MEDIUM:
            return (
                "Some evidence is present but important details are missing. "
                "Ask the seller for more photos before buying."
            )
        return (
            "The listing shows the main expected evidence, but this is an "
            "AI-assisted screen, not formal authentication."
        )

    @staticmethod
    def _platform_protection_notes(payload: SwarmInput) -> List[str]:
        notes: List[str] = []
        mk = (payload.marketplace or "").lower()
        if "ebay" in mk:
            notes.append(
                "Pay through eBay so the eBay Money Back Guarantee applies."
            )
        if "vinted" in mk:
            notes.append(
                "Pay through Vinted Buyer Protection. Do not pay off-platform."
            )
        return notes
