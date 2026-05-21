"""AntiquesLens — antique furniture, ceramics, period objects.

PROTOTYPE. Antiques rarely have hard authentication; emphasise provenance
and missing evidence.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("makers_mark", "Maker's mark or stamp",
                    "Maker's marks help date and attribute the piece."),
    MissingEvidence("underside", "Underside / base photo",
                    "Underside often shows wear patterns and maker info."),
    MissingEvidence("provenance", "Provenance documentation if claimed",
                    "Provenance materially affects value."),
]


class AntiquesLensAgent(BaseLens):
    name = LensName.ANTIQUES

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        return []

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "makers_mark": "Could you send a clear close-up of any maker's mark or stamp?",
            "underside": "Could you send a photo of the underside?",
            "provenance": "Could you share any provenance documentation you have?",
        }
        return [q[m.key] for m in missing if m.key in q]
