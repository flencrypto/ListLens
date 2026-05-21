"""ThreadLens — clothing, designer fashion, vintage garments.

PROTOTYPE. Designer authentication is a regulated grey area; never claim
authenticity. Defer high-value items to professional authentication services.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("brand_label", "Brand / neck label",
                    "Brand label font and stitching are common replica giveaways."),
    MissingEvidence("care_label", "Care / composition label",
                    "Care label format and country of origin help dating."),
    MissingEvidence("stitching", "Inside stitching close-up",
                    "Inside stitching reveals construction quality."),
    MissingEvidence("hardware", "Zip / button hardware close-up",
                    "Hardware engraving and finish are key on designer items."),
]


class ThreadLensAgent(BaseLens):
    name = LensName.THREAD

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        text = f"{payload.title or ''} {payload.description or ''}".lower()
        if "inspired" in text or "dupe" in text:
            flags.append("inspired_or_dupe_language")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "brand_label": "Could you send a clear photo of the brand / neck label?",
            "care_label": "Could you send a clear photo of the care label?",
            "stitching": "Could you send close-ups of the inside stitching?",
            "hardware": "Could you send close-ups of any zips or buttons?",
        }
        return [q[m.key] for m in missing if m.key in q]
