"""Tests for the deterministic Lens router."""

from __future__ import annotations

import unittest

from tests import _path  # noqa: F401  -- sys.path setup
from core.evidence_types import LensName
from core.lens_router import LensRouter


class LensRouterTests(unittest.TestCase):
    def test_user_selection_wins(self) -> None:
        router = LensRouter()
        decision = router.route(
            user_selected=LensName.RECORD,
            marketplace_category="Fashion > Trainers",
            title="Air Max 1",
        )
        self.assertEqual(decision.lens, LensName.RECORD)
        self.assertEqual(decision.reason, "user_selected")

    def test_marketplace_category_routes(self) -> None:
        router = LensRouter()
        decision = router.route(
            marketplace_category="Music > Vinyl Records",
        )
        self.assertEqual(decision.lens, LensName.RECORD)
        self.assertTrue(decision.reason.startswith("marketplace_category"))

    def test_keyword_routes_when_no_category(self) -> None:
        router = LensRouter()
        decision = router.route(
            title="Nike Air Jordan 1 trainers UK 10",
            description="Worn twice, sneakers in great condition",
        )
        self.assertEqual(decision.lens, LensName.SOLE)
        self.assertEqual(decision.reason, "keyword_match")

    def test_returns_uncertain_with_suggestions(self) -> None:
        router = LensRouter()
        decision = router.route(title="A thing")
        self.assertIsNone(decision.lens)
        self.assertTrue(decision.uncertain)
        self.assertGreater(len(decision.suggestions), 0)

    def test_motor_excluded_by_default(self) -> None:
        router = LensRouter()
        decision = router.route(
            marketplace_category="Vehicle Parts & Accessories",
            title="Ford Fiesta Mk7 bumper",
        )
        self.assertIsNone(decision.lens)
        self.assertTrue(decision.unsupported_motor)

    def test_motor_excluded_even_if_user_selects_it(self) -> None:
        router = LensRouter()
        decision = router.route(user_selected=LensName.MOTOR)
        self.assertIsNone(decision.lens)
        self.assertTrue(decision.unsupported_motor)

    def test_motor_allowed_when_opted_in(self) -> None:
        router = LensRouter(include_motor=True, allow_motor_guard=True)
        decision = router.route(user_selected=LensName.MOTOR)
        self.assertEqual(decision.lens, LensName.MOTOR)
        self.assertFalse(decision.unsupported_motor)

    def test_keyword_tie_returns_uncertain(self) -> None:
        router = LensRouter()
        # Both "vinyl" (RecordLens) and "nike" (SoleLens) appear once each.
        decision = router.route(
            title="Vinyl Nike collaboration",
            description="One mention each, ambiguous",
        )
        self.assertIsNone(decision.lens)
        self.assertTrue(decision.uncertain)
        self.assertEqual(decision.reason, "keyword_tie")
        self.assertIn(LensName.RECORD, decision.suggestions)
        self.assertIn(LensName.SOLE, decision.suggestions)


if __name__ == "__main__":
    unittest.main()
