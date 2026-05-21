"""AutographLens — signed memorabilia, autographs, COAs.

PROTOTYPE. Signature comparison is high-risk; never assert authenticity.
TODO(production): reference signature index, COA issuer trust score.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("signature_close_up", "Close-up of the signature",
                    "Needed to compare against reference signatures."),
    MissingEvidence("coa", "Certificate of authenticity if claimed",
                    "COA issuer affects how much weight to give the claim."),
    MissingEvidence("signing_provenance", "Where / when the item was signed",
                    "In-person provenance is the strongest evidence."),
]


class AutographLensAgent(BaseLens):
    name = LensName.AUTOGRAPH

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        text = f"{payload.title or ''} {payload.description or ''}".lower()
        if "coa" in text and "no coa" not in text:
            flags.append("coa_claim_needs_issuer_check")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "signature_close_up": "Could you send a clear close-up of the signature?",
            "coa": "Could you send a clear photo of the COA front and back?",
            "signing_provenance": "Could you share where and when the item was signed?",
        }
        return [q[m.key] for m in missing if m.key in q]
