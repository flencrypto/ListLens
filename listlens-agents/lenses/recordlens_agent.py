"""RecordLens — vinyl, CDs, cassettes, music media.

PRODUCTION-READY: evidence taxonomy + weighting, expected evidence, seller
questions, safe wording.

PROTOTYPE / TODO(production):
    - real OCR for matrix/runout, catalogue number, barcode, rights society
    - real Discogs / MusicBrainz reference matching (see retrieval/)
    - bootleg / unofficial pressing flag rules
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import (
    Evidence,
    EvidenceKind,
    EvidenceWeight,
    LensName,
    MissingEvidence,
)
from ._base_lens import BaseLens


# Evidence hierarchy from agent instructions §10 "RecordLens".
_EXPECTED = [
    MissingEvidence(
        key="matrix_runout",
        label="Matrix / runout etching",
        why_it_matters=(
            "Matrix/runout etchings are the strongest evidence for which "
            "pressing this is. Without them the exact version cannot be "
            "confirmed."
        ),
    ),
    MissingEvidence(
        key="catalogue_number",
        label="Catalogue number on label or sleeve",
        why_it_matters=(
            "The catalogue number narrows down the issue family and country."
        ),
    ),
    MissingEvidence(
        key="label_photo",
        label="Clear photo of the record label",
        why_it_matters=(
            "Label text, colour, and layout are needed to identify the "
            "pressing."
        ),
    ),
    MissingEvidence(
        key="sleeve_back",
        label="Back of the sleeve",
        why_it_matters=(
            "Back sleeve shows catalogue number, manufacturer text, and "
            "country of pressing."
        ),
    ),
    MissingEvidence(
        key="barcode",
        label="Barcode on later releases",
        why_it_matters=(
            "For releases after the early 1980s the barcode helps distinguish "
            "issues and reissues."
        ),
    ),
    MissingEvidence(
        key="condition_close_up",
        label="Close-up of vinyl surface and sleeve corners",
        why_it_matters="Condition cannot be assessed from full-cover shots.",
    ),
]


class RecordLensAgent(BaseLens):
    name = LensName.RECORD

    # ------------------------------------------------------------------

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        # TODO(production): wire to OCR + label classifier. The shape below
        # is what downstream code expects so wire results into it 1:1.
        found: List[Evidence] = []

        hint = (payload.user_hints or {}).get("matrix_runout")
        if hint:
            found.append(
                Evidence(
                    key="matrix_runout",
                    label="Matrix / runout etching",
                    kind=EvidenceKind.USER_CLAIM,
                    weight=EvidenceWeight.VERY_HIGH,
                    value=str(hint),
                )
            )
        return found

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        title = (payload.title or "").lower()
        desc = (payload.description or "").lower()
        text = f"{title} {desc}"
        # PLACEHOLDER heuristics — replace with reference-match driven rules.
        if "test pressing" in text and "white label" not in text:
            flags.append("test_pressing_claim_without_evidence")
        if any(w in text for w in ("ultra rare", "holy grail", "mega rare")):
            flags.append("hype_language")
        if "original first pressing" in text:
            flags.append("first_pressing_claim_unverified")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        templates = {
            "matrix_runout": (
                "Could you send a clear close-up photo of the matrix/runout "
                "etching on side A and side B?"
            ),
            "catalogue_number": (
                "Could you confirm the catalogue number shown on the label "
                "and back sleeve?"
            ),
            "label_photo": (
                "Could you send a straight, well-lit photo of each label?"
            ),
            "sleeve_back": (
                "Could you send a full photo of the back of the sleeve?"
            ),
            "barcode": (
                "Is there a barcode on the sleeve? If so, could you photograph "
                "it clearly?"
            ),
            "condition_close_up": (
                "Could you send close-ups of the vinyl surface and the sleeve "
                "corners so I can assess condition?"
            ),
        }
        return [templates[m.key] for m in missing if m.key in templates]
