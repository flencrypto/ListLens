"""CardLens — Pokemon, MTG, Yu-Gi-Oh!, sports cards, slabbed/graded cards.

PROTOTYPE. Slab/cert verification is a known hard problem; never claim a
slab is real. TODO(production): cert lookup via grader APIs (PSA/BGS/CGC).
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("front_photo", "Straight front photo",
                    "Needed to read the card name, set, and number."),
    MissingEvidence("back_photo", "Straight back photo",
                    "Back is needed to spot counterfeits and condition."),
    MissingEvidence("corners", "Corner close-ups",
                    "Corners drive condition grade."),
    MissingEvidence("surface", "Surface and holo close-ups",
                    "Surface scratches and holo issues are not visible from far."),
    MissingEvidence("cert_visible", "Slab certification number",
                    "Slab number lets the grader's database be checked."),
]


class CardLensAgent(BaseLens):
    name = LensName.CARD

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        text = f"{payload.title or ''} {payload.description or ''}".lower()
        if "proxy" in text or "custom" in text:
            flags.append("proxy_or_custom_language")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "front_photo": "Could you send a straight, well-lit front photo?",
            "back_photo": "Could you send a straight, well-lit back photo?",
            "corners": "Could you send close-ups of all four corners?",
            "surface": "Could you send close-ups of the surface and any holo areas?",
            "cert_visible": "Could you share the slab certification number?",
        }
        return [q[m.key] for m in missing if m.key in q]
