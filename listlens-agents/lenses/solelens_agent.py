"""SoleLens — trainers, sneakers, shoes.

PROTOTYPE. Evidence taxonomy follows agent instructions §10 "SoleLens".
TODO(production): real OCR for size label / style code, sole tread classifier,
replica-risk indicators from reference set.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import (
    Evidence,
    LensName,
    MissingEvidence,
)
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence(
        key="size_label",
        label="Tongue size label",
        why_it_matters=(
            "Size label photos show the style code and factory details "
            "needed to compare against a reference."
        ),
    ),
    MissingEvidence(
        key="style_code",
        label="Style / model code",
        why_it_matters="Confirms the exact colourway and release.",
    ),
    MissingEvidence(
        key="box_label",
        label="Box label",
        why_it_matters="Box label should match the size label.",
    ),
    MissingEvidence(
        key="sole_tread",
        label="Outsole / tread pattern",
        why_it_matters="Tread pattern and condition are key to authenticity checks.",
    ),
    MissingEvidence(
        key="inside_tags",
        label="Inside tags and stitching",
        why_it_matters="Inside detail often reveals replica giveaways.",
    ),
]


class SoleLensAgent(BaseLens):
    name = LensName.SOLE

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        text = f"{payload.title or ''} {payload.description or ''}".lower()
        if "1:1" in text or "rep " in text or "replica" in text:
            flags.append("replica_language_in_listing")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "size_label": "Could you send a clear photo of the tongue size label on both shoes?",
            "style_code": "Could you confirm the style / model code from the size label?",
            "box_label": "Could you send a photo of the box label?",
            "sole_tread": "Could you send a clear photo of the outsole tread?",
            "inside_tags": "Could you send photos of the inside tags and stitching?",
        }
        return [q[m.key] for m in missing if m.key in q]
