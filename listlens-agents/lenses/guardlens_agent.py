"""GuardLens — generic buyer-side fallback when no specialist Lens matches.

PROTOTYPE. Returns a conservative inconclusive report rather than guessing.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


class GuardLensAgent(BaseLens):
    name = LensName.GUARD

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return [
            MissingEvidence(
                key="category_specific_photos",
                label="Category-specific evidence photos",
                why_it_matters=(
                    "No specialist Lens matched this listing, so we don't "
                    "know which evidence photos to ask for."
                ),
            )
        ]

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        return []

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        return [
            "Could you send more close-up photos of the item, including any "
            "labels, marks, or serial numbers?"
        ]
