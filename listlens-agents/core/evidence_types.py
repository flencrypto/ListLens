"""Typed primitives for evidence, risk, confidence, and Lens output.

PRODUCTION-READY. Pure dataclasses + enums. No I/O, no AI calls, no globals.
The TypeScript backend has equivalent Zod schemas under
``artifacts/api-server/src/schemas``; keep field names aligned with those.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Literal, Optional


# ---------------------------------------------------------------------------
# Enums — stable strings, must match the web app's union types.
# ---------------------------------------------------------------------------


class LensName(str, Enum):
    RECORD = "RecordLens"
    SOLE = "SoleLens"
    WATCH = "WatchLens"
    CARD = "CardLens"
    TOY = "ToyLens"
    TECH = "TechLens"
    BOOK = "BookLens"
    THREAD = "ThreadLens"
    MEASURE = "MeasureLens"
    ANTIQUES = "AntiquesLens"
    AUTOGRAPH = "AutographLens"
    MARKET = "MarketLens"
    STUDIO = "StudioLens"
    GUARD = "GuardLens"
    HOARD = "HoardLens"
    # MotorLens is intentionally omitted from the default registry.
    # Opt-in via ``LENS_REGISTRY_INCLUDE_MOTOR`` in lens_router.
    MOTOR = "MotorLens"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    INCONCLUSIVE = "inconclusive"


class EvidenceKind(str, Enum):
    """Where a fact came from. Used by the confidence model to weight it."""

    OBSERVED_FACT = "observed_fact"          # visible in supplied photos
    USER_CLAIM = "user_claim"                # buyer/seller hint typed by user
    SELLER_CLAIM = "seller_claim"            # marketplace listing text
    AI_INFERENCE = "ai_inference"            # model-derived guess
    REFERENCE_MATCH = "reference_match"      # vector / catalogue match


class EvidenceWeight(float, Enum):
    """Coarse weights used by ``confidence_model.score_confidence``."""

    VERY_HIGH = 1.0    # matrix/runout, cert number, hologram serial
    HIGH = 0.75        # catalogue/style code, barcode, label text
    MEDIUM_HIGH = 0.6  # pressing plant, country text, rights society
    MEDIUM = 0.45
    LOW_MEDIUM = 0.3   # user hint
    LOW = 0.15         # seller title alone, visual similarity alone


# ---------------------------------------------------------------------------
# Evidence + result containers
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Evidence:
    """A single observed/claimed/inferred piece of evidence."""

    key: str                           # short stable id, e.g. "matrix_runout"
    label: str                         # human label, e.g. "Matrix/runout"
    kind: EvidenceKind
    weight: EvidenceWeight
    value: Optional[str] = None        # extracted text/value if any
    source_image_index: Optional[int] = None
    notes: Optional[str] = None


@dataclass(frozen=True)
class MissingEvidence:
    """Evidence the Lens expected but did not find. First-class output."""

    key: str
    label: str
    why_it_matters: str                # one short sentence, user-visible


@dataclass
class LensResult:
    """Shared base for Studio + Guard Lens outputs."""

    lens: LensName
    evidence: List[Evidence] = field(default_factory=list)
    missing_evidence: List[MissingEvidence] = field(default_factory=list)
    confidence: float = 0.0            # 0.0 .. 1.0
    notes: List[str] = field(default_factory=list)
    raw: Dict[str, Any] = field(default_factory=dict)  # debug only


@dataclass
class GuardReport(LensResult):
    """Buyer-side risk screen output.

    Mirrors the schema in section 12 of the agent instructions.
    """

    report_id: str = ""
    mode: Literal["buyer_guard"] = "buyer_guard"
    marketplace: Optional[str] = None
    listing_url: Optional[str] = None
    item_title: Optional[str] = None
    price_amount: Optional[float] = None
    price_currency: Optional[str] = None
    risk_level: RiskLevel = RiskLevel.INCONCLUSIVE
    risk_label: str = ""
    risk_summary: str = ""              # one sentence, safe-wording enforced
    price_check_status: Literal["normal", "low", "high", "unknown"] = "unknown"
    price_check_note: Optional[str] = None
    seller_claim_warnings: List[str] = field(default_factory=list)
    platform_protection_notes: List[str] = field(default_factory=list)
    seller_questions: List[str] = field(default_factory=list)
    not_authentication: bool = True
    disclaimer: str = (
        "AI-assisted risk screen only. Not formal authentication."
    )
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


@dataclass
class StudioDraft(LensResult):
    """Seller-side listing draft. Mirrors section 13 of the instructions."""

    draft_id: str = ""
    mode: Literal["seller_listing"] = "seller_listing"
    marketplace_target: Literal["eBay", "Vinted", "Both"] = "Both"
    detected_title: Optional[str] = None
    detected_category: Optional[str] = None
    detected_brand: Optional[str] = None
    detected_model: Optional[str] = None
    visible_attributes: List[str] = field(default_factory=list)
    listing_title: Optional[str] = None
    listing_description: Optional[str] = None
    bullet_points: List[str] = field(default_factory=list)
    condition_notes: Optional[str] = None
    item_specifics: Dict[str, str] = field(default_factory=dict)
    price_quick_sale: Optional[float] = None
    price_recommended: Optional[float] = None
    price_high: Optional[float] = None
    price_confidence: float = 0.0
    price_basis: Optional[str] = None
    confidence_warnings: List[str] = field(default_factory=list)
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
