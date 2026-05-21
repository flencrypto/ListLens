"""Base swarm + LensAgent contract.

PROTOTYPE orchestrator. In production this is replaced by a real job queue or
the existing TypeScript API server (see ``artifacts/api-server/src/routes``).
The ``LensAgent`` protocol and ``BaseSwarm.run`` signature are stable and
should not change when the executor is swapped.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence

from .evidence_types import GuardReport, LensName, LensResult, StudioDraft
from .lens_router import LensRouter, RoutingDecision
from .safe_wording import safe_wording


log = logging.getLogger("listlens.swarm")


# ---------------------------------------------------------------------------
# Input envelope
# ---------------------------------------------------------------------------


@dataclass
class SwarmInput:
    """Everything a Lens may need. Build via marketplace adapter + uploads."""

    mode: str                                  # "buyer_guard" | "seller_listing"
    images: Sequence[str] = field(default_factory=list)   # URLs or paths
    title: Optional[str] = None
    description: Optional[str] = None
    marketplace: Optional[str] = None
    marketplace_category: Optional[str] = None
    listing_url: Optional[str] = None
    price_amount: Optional[float] = None
    price_currency: Optional[str] = None
    user_selected_lens: Optional[LensName] = None
    user_hints: Dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Lens contract
# ---------------------------------------------------------------------------


class LensAgent(ABC):
    """Every Lens implements this contract.

    Lenses MUST be pure with respect to their inputs (no globals, no shared
    mutable state) so they can be parallelised or moved to workers.
    """

    name: LensName

    @abstractmethod
    def analyse_guard(self, payload: SwarmInput) -> GuardReport:
        """Buyer-side risk screen. Must apply safe wording before returning."""

    @abstractmethod
    def analyse_studio(self, payload: SwarmInput) -> StudioDraft:
        """Seller-side listing draft. Confidence warnings required."""


# ---------------------------------------------------------------------------
# Swarm
# ---------------------------------------------------------------------------


class BaseSwarm:
    """In-process orchestrator. Routes input to the right Lens and post-
    processes the result.
    """

    def __init__(
        self,
        agents: Sequence[LensAgent],
        *,
        router: Optional[LensRouter] = None,
    ) -> None:
        self._agents: Dict[LensName, LensAgent] = {a.name: a for a in agents}
        self.router = router or LensRouter()

    # ------------------------------------------------------------------

    def run(self, payload: SwarmInput) -> LensResult:
        decision = self.router.route(
            user_selected=payload.user_selected_lens,
            marketplace_category=payload.marketplace_category,
            title=payload.title,
            description=payload.description,
        )
        return self.run_with_decision(payload, decision)

    def run_with_decision(
        self, payload: SwarmInput, decision: RoutingDecision
    ) -> LensResult:
        if decision.unsupported_motor:
            return self._motor_unsupported_result(payload)

        if decision.lens is None:
            return self._uncertain_result(payload, decision)

        agent = self._agents.get(decision.lens)
        if agent is None:
            log.warning("no agent registered for %s", decision.lens)
            return self._uncertain_result(payload, decision)

        if payload.mode == "buyer_guard":
            result = agent.analyse_guard(payload)
            return self._post_process_guard(result)
        if payload.mode == "seller_listing":
            return agent.analyse_studio(payload)

        raise ValueError(f"unknown mode: {payload.mode!r}")

    # ------------------------------------------------------------------
    # Post-processing
    # ------------------------------------------------------------------

    @staticmethod
    def _post_process_guard(report: GuardReport) -> GuardReport:
        """Apply safe wording to every user-visible Guard string."""

        report.risk_summary = safe_wording(report.risk_summary).text
        report.risk_label = safe_wording(report.risk_label).text
        report.seller_questions = [
            safe_wording(q).text for q in report.seller_questions
        ]
        report.seller_claim_warnings = [
            safe_wording(w).text for w in report.seller_claim_warnings
        ]
        # Disclaimer is mandatory.
        report.not_authentication = True
        if not report.disclaimer:
            report.disclaimer = (
                "AI-assisted risk screen only. Not formal authentication."
            )
        return report

    @staticmethod
    def _motor_unsupported_result(payload: SwarmInput) -> GuardReport:
        return GuardReport(
            lens=LensName.GUARD,
            marketplace=payload.marketplace,
            listing_url=payload.listing_url,
            item_title=payload.title,
            risk_label="Motor listings are not supported in this app.",
            risk_summary=(
                "This listing appears to be a motor item. Guard checks are "
                "not available for motors here."
            ),
            notes=["motor_unsupported"],
        )

    @staticmethod
    def _uncertain_result(
        payload: SwarmInput, decision: RoutingDecision
    ) -> GuardReport:
        return GuardReport(
            lens=LensName.GUARD,
            marketplace=payload.marketplace,
            listing_url=payload.listing_url,
            item_title=payload.title,
            risk_label="Category uncertain.",
            risk_summary=(
                "We could not confidently identify this item's category. "
                "Please pick a Lens manually."
            ),
            notes=[f"router:{decision.reason}"],
            raw={"suggestions": [l.value for l in decision.suggestions]},
        )
