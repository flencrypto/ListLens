"""Tests for the mandatory safe-wording post-processor.

These tests pin down the non-negotiables from agent instructions §14 and §24:

    - never say "fake" or "genuine" with certainty
    - never accuse sellers
    - never claim definitive first pressings, completeness, fitment, or
      roadworthiness
"""

from __future__ import annotations

import unittest

from tests import _path  # noqa: F401
from core.base_swarm import BaseSwarm, SwarmInput
from core.evidence_types import LensName
from core.lens_router import LensRouter
from core.safe_wording import assert_safe, safe_wording
from lenses.recordlens_agent import RecordLensAgent


class SafeWordingPureTests(unittest.TestCase):
    def test_rewrites_fake_claim(self) -> None:
        out = safe_wording("This trainer is definitely fake.")
        self.assertEqual(out.rewrites_applied, 1)
        self.assertNotIn("fake", out.text.lower())
        self.assertIn("authenticity cannot be confirmed", out.text.lower())

    def test_rewrites_genuine_claim(self) -> None:
        self.assertNotIn(
            "genuine",
            assert_safe("This watch is genuine.").lower(),
        )

    def test_rewrites_seller_accusation(self) -> None:
        text = assert_safe("This seller is scamming buyers.")
        self.assertNotIn("scamming", text.lower())
        self.assertNotIn("scammer", text.lower())

    def test_rewrites_first_pressing_certainty(self) -> None:
        text = assert_safe("Definitely an original first pressing.")
        self.assertNotIn("definitely", text.lower())
        self.assertIn("matrix/runout", text.lower())

    def test_rewrites_completeness_claim(self) -> None:
        text = assert_safe("This set is definitely complete.")
        self.assertNotIn("definitely complete", text.lower())

    def test_rewrites_fitment_claim(self) -> None:
        text = assert_safe("This part definitely fits your vehicle.")
        self.assertNotIn("definitely fits", text.lower())

    def test_rewrites_roadworthiness_claim(self) -> None:
        text = assert_safe("This car is safe to drive.")
        self.assertNotIn("safe to drive", text.lower())

    def test_leaves_safe_text_alone(self) -> None:
        original = (
            "Authenticity cannot be confirmed from this listing. "
            "Ask the seller for more photos before buying."
        )
        result = safe_wording(original)
        self.assertEqual(result.text, original)
        self.assertEqual(result.rewrites_applied, 0)

    def test_empty_input_is_safe(self) -> None:
        self.assertEqual(assert_safe(""), "")


class SafeWordingIntegrationTests(unittest.TestCase):
    """Ensure BaseSwarm applies safe wording before Guard output leaves."""

    def test_disclaimer_is_present_on_guard_report(self) -> None:
        swarm = BaseSwarm(
            agents=[RecordLensAgent()],
            router=LensRouter(),
        )
        report = swarm.run(
            SwarmInput(
                mode="buyer_guard",
                title="A record",
                user_selected_lens=LensName.RECORD,
            )
        )
        self.assertTrue(report.not_authentication)
        self.assertIn("Not formal authentication", report.disclaimer)

    def test_motor_listing_returns_unsupported_state(self) -> None:
        swarm = BaseSwarm(
            agents=[RecordLensAgent()],
            router=LensRouter(),   # motor excluded
        )
        report = swarm.run(
            SwarmInput(
                mode="buyer_guard",
                title="Ford Fiesta bumper",
                marketplace_category="Vehicle Parts & Accessories",
            )
        )
        self.assertIn("motor", " ".join(report.notes).lower())
        # No unsafe wording leaked.
        self.assertNotIn("fake", report.risk_summary.lower())
        self.assertNotIn("genuine", report.risk_summary.lower())


if __name__ == "__main__":
    unittest.main()
