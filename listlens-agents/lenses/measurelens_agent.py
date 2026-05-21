"""MeasureLens — dimension and measurement checks from photos.

PROTOTYPE. Used as a helper Lens by SoleLens / TechLens / MotorMeasureLens.
TODO(production): real reference-object detection + perspective correction.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("reference_object", "A known reference object in shot",
                    "Measurements from photos require a known reference for scale."),
    MissingEvidence("straight_angle", "A straight-on photo",
                    "Angled photos distort dimensions."),
]


class MeasureLensAgent(BaseLens):
    name = LensName.MEASURE

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
            "reference_object": "Could you re-take the photo with a coin or ruler next to the item?",
            "straight_angle": "Could you take a straight-on photo without any angle?",
        }
        return [q[m.key] for m in missing if m.key in q]
