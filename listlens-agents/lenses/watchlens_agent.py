"""WatchLens — watches and timepieces.

PROTOTYPE. Safe wording rules are strict: never assert genuine or fake.
TODO(production): reference-image matching for dial / case-back / movement.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("dial_photo", "Straight dial photo",
                    "Needed to compare against reference dials."),
    MissingEvidence("case_back", "Case back photo",
                    "Case back text and engraving carry the reference number."),
    MissingEvidence("reference_serial", "Reference and serial numbers",
                    "Confirms model family and approximate year."),
    MissingEvidence("crown_clasp", "Crown and clasp close-ups",
                    "Crown and clasp detail are common replica giveaways."),
    MissingEvidence("box_papers", "Box and papers if claimed",
                    "If the listing claims full set, evidence should be shown."),
]


class WatchLensAgent(BaseLens):
    name = LensName.WATCH

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        text = f"{payload.title or ''} {payload.description or ''}".lower()
        if "no box" in text and "no papers" in text:
            flags.append("no_box_no_papers")
        if "homage" in text or "tribute" in text:
            flags.append("homage_language")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "dial_photo": "Could you send a straight, well-lit photo of the dial?",
            "case_back": "Could you send a clear photo of the case back including any engravings?",
            "reference_serial": "Could you share the reference and serial numbers?",
            "crown_clasp": "Could you send close-ups of the crown and the clasp?",
            "box_papers": "Could you photograph the box and original papers?",
        }
        return [q[m.key] for m in missing if m.key in q]
