"""ToyLens — LEGO, figures, Funko, vintage toys.

PROTOTYPE. Completeness claims are the highest-risk vector; safe wording
explicitly forbids "this set is definitely complete".
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("main_photo", "Main item photo",
                    "Needed to identify the set or figure."),
    MissingEvidence("box", "Box photo if claimed",
                    "Box originality and condition affect value."),
    MissingEvidence("accessories", "Accessories laid out",
                    "Accessories need to be visible to assess completeness."),
    MissingEvidence("instructions", "Instructions / manual",
                    "Instructions are often missing from bundles."),
    MissingEvidence("minifigures", "All minifigures present",
                    "If the listing claims complete, every minifigure should be shown."),
]


class ToyLensAgent(BaseLens):
    name = LensName.TOY

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        text = f"{payload.title or ''} {payload.description or ''}".lower()
        if "complete" in text:
            flags.append("completeness_claim_needs_evidence")
        if "reproduction" in text or "repro" in text:
            flags.append("reproduction_parts_mentioned")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "main_photo": "Could you send a clear photo of the item itself?",
            "box": "Could you send photos of all sides of the box?",
            "accessories": "Could you lay out all accessories and photograph them?",
            "instructions": "Could you confirm if the original instructions are included and photograph them?",
            "minifigures": "Could you photograph all minifigures together?",
        }
        return [q[m.key] for m in missing if m.key in q]
