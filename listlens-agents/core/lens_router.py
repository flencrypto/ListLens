"""Lens routing.

Deterministic-first router as required by agent instructions §9:

    1. explicit user selection
    2. marketplace category
    3. strong title/description keywords
    4. image classification    (AI fallback — STUB here)
    5. uncertain -> suggest, do not guess

MotorLens is excluded by default. Set ``include_motor=True`` to opt in for
projects that explicitly support motor categories. Even when opted in, the
router still returns an unsupported-motor decision for ext/Guard projects
that pass ``allow_motor_guard=False``.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence

from .evidence_types import LensName


# Keyword sets — PLACEHOLDER seeds. Expand with marketplace taxonomy mining.
_KEYWORDS: Dict[LensName, tuple[str, ...]] = {
    LensName.RECORD: ("vinyl", "lp", "7\"", "12\"", "cassette", "cd ", "album"),
    LensName.SOLE: ("trainers", "sneakers", "jordan", "yeezy", "air max",
                    "dunk", "nike", "adidas"),
    LensName.WATCH: ("watch", "rolex", "omega", "seiko", "tag heuer",
                     "automatic", "chronograph"),
    LensName.CARD: ("pokemon", "tcg", "mtg", "yu-gi-oh", "yugioh", "psa",
                    "bgs", "graded card", "holo"),
    LensName.TOY: ("lego", "funko", "figure", "playset", "minifigure",
                   "boxed toy"),
    LensName.TECH: ("iphone", "macbook", "playstation", "xbox", "graphics card",
                    "gpu", "laptop", "console"),
    LensName.BOOK: ("first edition", "hardback", "paperback", "isbn",
                    "signed copy", "book"),
    LensName.THREAD: ("jacket", "dress", "trousers", "shirt", "hoodie",
                      "vintage clothing", "designer"),
    LensName.ANTIQUES: ("antique", "victorian", "edwardian", "georgian",
                        "art deco"),
    LensName.AUTOGRAPH: ("signed", "autograph", "coa", "psa/dna", "beckett"),
    LensName.MOTOR: ("car", "motorbike", "scooter", "engine", "gearbox",
                     "alloy wheel", "tyre", "bumper", "headlight assembly"),
}

# Marketplace category hints — PLACEHOLDER. Wire up to adapter taxonomy.
_CATEGORY_MAP: Dict[str, LensName] = {
    "music > vinyl records": LensName.RECORD,
    "music > cds": LensName.RECORD,
    "fashion > trainers": LensName.SOLE,
    "jewellery & watches > watches": LensName.WATCH,
    "collectables > trading cards": LensName.CARD,
    "toys & games > lego": LensName.TOY,
    "books, comics & magazines": LensName.BOOK,
    "antiques": LensName.ANTIQUES,
    "vehicle parts & accessories": LensName.MOTOR,
}


@dataclass(frozen=True)
class RoutingDecision:
    lens: Optional[LensName]
    reason: str
    suggestions: tuple[LensName, ...] = field(default_factory=tuple)
    unsupported_motor: bool = False
    uncertain: bool = False


class LensRouter:
    """Deterministic Lens router with explicit uncertainty output."""

    def __init__(
        self,
        *,
        include_motor: bool = False,
        allow_motor_guard: bool = False,
    ) -> None:
        self.include_motor = include_motor
        self.allow_motor_guard = allow_motor_guard

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def route(
        self,
        *,
        user_selected: Optional[LensName] = None,
        marketplace_category: Optional[str] = None,
        title: Optional[str] = None,
        description: Optional[str] = None,
        image_classification: Optional[LensName] = None,
    ) -> RoutingDecision:
        # 1. explicit user selection (still honour motor exclusion)
        if user_selected is not None:
            return self._respect_motor_policy(
                user_selected, reason="user_selected"
            )

        # 2. marketplace category
        if marketplace_category:
            key = marketplace_category.strip().lower()
            for prefix, lens in _CATEGORY_MAP.items():
                if key.startswith(prefix):
                    return self._respect_motor_policy(
                        lens, reason=f"marketplace_category:{prefix}"
                    )

        # 3. keyword scan on title + description
        haystack = " ".join(filter(None, [title, description])).lower()
        if haystack:
            hits: Dict[LensName, int] = {}
            for lens, words in _KEYWORDS.items():
                for w in words:
                    if w in haystack:
                        hits[lens] = hits.get(lens, 0) + 1
            if hits:
                top = max(hits.items(), key=lambda kv: kv[1])
                # tie-breaker: if 2+ lenses tie, surface as uncertain
                tied = [l for l, c in hits.items() if c == top[1]]
                if len(tied) == 1:
                    return self._respect_motor_policy(
                        top[0], reason="keyword_match"
                    )
                return RoutingDecision(
                    lens=None,
                    reason="keyword_tie",
                    suggestions=tuple(tied),
                    uncertain=True,
                )

        # 4. image classification (AI fallback)
        if image_classification is not None:
            return self._respect_motor_policy(
                image_classification, reason="image_classification"
            )

        # 5. uncertain
        return RoutingDecision(
            lens=None,
            reason="no_signal",
            suggestions=self.available_lenses(),
            uncertain=True,
        )

    def available_lenses(self) -> tuple[LensName, ...]:
        lenses = [
            l for l in LensName
            if l not in (LensName.GUARD, LensName.STUDIO, LensName.HOARD)
        ]
        if not self.include_motor:
            lenses = [l for l in lenses if l is not LensName.MOTOR]
        return tuple(lenses)

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _respect_motor_policy(
        self, lens: LensName, *, reason: str
    ) -> RoutingDecision:
        if lens is LensName.MOTOR:
            if not self.include_motor:
                return RoutingDecision(
                    lens=None,
                    reason=f"{reason}:motor_excluded",
                    unsupported_motor=True,
                )
            if not self.allow_motor_guard:
                # Motor allowed for Studio but not for Guard reports.
                return RoutingDecision(
                    lens=None,
                    reason=f"{reason}:motor_guard_disabled",
                    unsupported_motor=True,
                )
        return RoutingDecision(lens=lens, reason=reason)
