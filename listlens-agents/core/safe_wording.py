"""Safe-wording post-processor.

Mandatory pass over every user-visible Guard string (see agent
instructions §14, §24). Rewrites absolute authenticity / fraud / fitment /
roadworthiness / completeness claims into evidence-led uncertain language.

PRODUCTION-READY for the listed patterns. Expand the table as new unsafe
phrasings are observed in red-team review.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Tuple


# (pattern, replacement) — case-insensitive, word-boundary safe.
_REWRITES: List[Tuple[str, str]] = [
    (r"\bthis (item|trainer|watch|card|record|set|part) is (definitely )?fake\b",
     "authenticity cannot be confirmed from this listing"),
    (r"\bthis (item|trainer|watch|card|record|set|part) is (definitely )?genuine\b",
     "authenticity cannot be confirmed from this listing"),
    (r"\bthis (item|trainer|watch|card|record|set|part) is authentic\b",
     "authenticity cannot be confirmed from this listing"),
    (r"\bthis seller is (scamming|a scammer|lying)\b",
     "there are risk indicators that warrant more evidence"),
    (r"\bdefinitely an? original( first pressing)?\b",
     "claimed version cannot be confirmed without matrix/runout evidence"),
    (r"\b(this )?set is definitely complete\b",
     "completeness cannot be confirmed from the listing"),
    (r"\bdefinitely fits your vehicle\b",
     "fitment cannot be confirmed without OEM part number and connector check"),
    (r"\bsafe to drive\b",
     "roadworthiness cannot be assessed by this tool"),
]

_COMPILED = [(re.compile(p, re.IGNORECASE), r) for p, r in _REWRITES]


@dataclass(frozen=True)
class SafeWordingResult:
    text: str
    rewrites_applied: int


def safe_wording(text: str) -> SafeWordingResult:
    """Rewrite unsafe phrasings; return new text and how many rewrites fired."""

    if not text:
        return SafeWordingResult(text="", rewrites_applied=0)

    new = text
    count = 0
    for pattern, replacement in _COMPILED:
        new, n = pattern.subn(replacement, new)
        count += n
    return SafeWordingResult(text=new, rewrites_applied=count)


def assert_safe(text: str) -> str:
    """Convenience wrapper that returns just the rewritten text."""

    return safe_wording(text).text
