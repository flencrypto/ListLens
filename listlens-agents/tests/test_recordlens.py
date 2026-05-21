"""Tests for RecordLens evidence + Guard report assembly."""

from __future__ import annotations

import unittest

from tests import _path  # noqa: F401
from core.base_swarm import BaseSwarm, SwarmInput
from core.evidence_types import LensName, RiskLevel
from core.lens_router import LensRouter
from lenses.recordlens_agent import RecordLensAgent


class RecordLensTests(unittest.TestCase):
    def setUp(self) -> None:
        self.agent = RecordLensAgent()
        self.swarm = BaseSwarm(
            agents=[self.agent],
            router=LensRouter(),
        )

    def test_expected_evidence_includes_matrix_runout(self) -> None:
        payload = SwarmInput(mode="buyer_guard", title="Joy Division - Closer LP")
        expected_keys = {m.key for m in self.agent.expected_evidence(payload)}
        self.assertIn("matrix_runout", expected_keys)
        self.assertIn("catalogue_number", expected_keys)

    def test_user_hint_is_recorded_as_user_claim(self) -> None:
        payload = SwarmInput(
            mode="buyer_guard",
            title="Joy Division - Closer LP",
            user_hints={"matrix_runout": "FACT 25 A-1"},
        )
        evidence = self.agent.collect_evidence(payload)
        keys = {e.key for e in evidence}
        self.assertIn("matrix_runout", keys)

    def test_first_pressing_claim_is_flagged(self) -> None:
        payload = SwarmInput(
            mode="buyer_guard",
            title="Original first pressing — RARE",
            description="ultra rare holy grail",
        )
        flags = self.agent.red_flags(payload, evidence=[])
        self.assertIn("first_pressing_claim_unverified", flags)
        self.assertIn("hype_language", flags)

    def test_guard_report_is_inconclusive_with_no_evidence(self) -> None:
        payload = SwarmInput(
            mode="buyer_guard",
            title="Some record",
            marketplace="eBay UK",
            user_selected_lens=LensName.RECORD,
        )
        report = self.swarm.run(payload)
        self.assertEqual(report.lens, LensName.RECORD)
        self.assertEqual(report.risk_level, RiskLevel.INCONCLUSIVE)
        self.assertTrue(report.not_authentication)
        self.assertIn("Not formal authentication", report.disclaimer)
        # Seller questions cover the missing evidence keys we expect.
        joined = "\n".join(report.seller_questions)
        self.assertIn("matrix/runout", joined.lower())

    def test_guard_report_includes_platform_protection_for_ebay(self) -> None:
        payload = SwarmInput(
            mode="buyer_guard",
            title="Some record",
            marketplace="eBay UK",
            user_selected_lens=LensName.RECORD,
        )
        report = self.swarm.run(payload)
        self.assertTrue(
            any("eBay Money Back Guarantee" in n
                for n in report.platform_protection_notes)
        )


if __name__ == "__main__":
    unittest.main()
