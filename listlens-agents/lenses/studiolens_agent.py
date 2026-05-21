"""StudioLens — generic seller-side draft generator.

PROTOTYPE. Used when no specialist Lens applies. Specialist Lenses should
override ``analyse_studio`` to produce richer item-specifics.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("clear_main_photo", "Clear main photo",
                    "Studio needs a clean main photo to build the listing."),
    MissingEvidence("condition_photo", "Condition close-up",
                    "Condition photos make the listing honest and reduce returns."),
]


class StudioLensAgent(BaseLens):
    name = LensName.STUDIO

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
        # Studio-side: these become user prompts ("add another photo of...")
        return [m.why_it_matters for m in missing]
