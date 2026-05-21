"""TechLens — phones, laptops, consoles, GPUs.

PROTOTYPE. Serial / IMEI verification is sensitive (privacy); never log
full serials. TODO(production): IMEI blocklist lookups via approved provider.
"""

from __future__ import annotations

from typing import List, Sequence

from core.base_swarm import SwarmInput
from core.evidence_types import Evidence, LensName, MissingEvidence
from ._base_lens import BaseLens


_EXPECTED = [
    MissingEvidence("model_label", "Model / serial label",
                    "Needed to identify exact model and storage/spec."),
    MissingEvidence("powered_on_photo", "Photo of the device powered on",
                    "Confirms the device boots."),
    MissingEvidence("port_close_up", "Ports and connectors close-up",
                    "Damage to ports is common and hard to spot from far."),
    MissingEvidence("battery_health", "Battery health screen if applicable",
                    "Battery health is a major price driver on used devices."),
]


class TechLensAgent(BaseLens):
    name = LensName.TECH

    def collect_evidence(self, payload: SwarmInput) -> List[Evidence]:
        return []  # TODO(production)

    def expected_evidence(self, payload: SwarmInput) -> List[MissingEvidence]:
        return list(_EXPECTED)

    def red_flags(
        self, payload: SwarmInput, evidence: Sequence[Evidence]
    ) -> List[str]:
        flags: List[str] = []
        text = f"{payload.title or ''} {payload.description or ''}".lower()
        if "icloud locked" in text or "icloud lock" in text:
            flags.append("icloud_locked")
        if "for parts" in text and "not working" in text:
            flags.append("parts_only_unclear")
        return flags

    def seller_questions(
        self, missing: Sequence[MissingEvidence]
    ) -> List[str]:
        q = {
            "model_label": "Could you photograph the model and serial label?",
            "powered_on_photo": "Could you send a photo of the device powered on at the home screen?",
            "port_close_up": "Could you send close-ups of all ports and connectors?",
            "battery_health": "Could you send a screenshot of the battery health screen?",
        }
        return [q[m.key] for m in missing if m.key in q]
