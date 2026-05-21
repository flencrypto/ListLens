"""BookLens — books, first editions, signed copies.

PROTOTYPE. Signed-copy claims are a major risk vector; defer to AutographLens
for signature analysis when applicable.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("title_page", "Title page",
                    "Title page confirms edition and publisher."),
    MissingEvidence("copyright_page", "Copyright page",
                    "Copyright page shows the printing number and edition."),
    MissingEvidence("dust_jacket", "Dust jacket if claimed",
                    "Original dust jackets significantly affect value."),
    MissingEvidence("signature_page", "Signature page if signed",
                    "Signed claims need a photo of the signed page."),
]


class BookLensAgent(BaseLens):
    name = LensName.BOOK

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        text = f"{payload.title or ''} {payload.description or ''}".lower()
        if "first edition" in text:
            flags.append("first_edition_claim_unverified")
        if "signed" in text:
            flags.append("signed_claim_needs_evidence")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "title_page": "Could you send a clear photo of the title page?",
            "copyright_page": "Could you send a clear photo of the copyright page including the number line?",
            "dust_jacket": "Could you send photos of the dust jacket front, back, and flaps?",
            "signature_page": "Could you send a clear photo of the signed page?",
        }
        return [q[m.key] for m in missing if m.key in q]
