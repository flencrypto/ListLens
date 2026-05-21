"""Map detected objects in a frame to the right Lens.

PROTOTYPE: trivial label → Lens lookup. PRODUCTION: real detector
(e.g. Grounding DINO / YOLO-World) with confidence thresholding.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Sequence

from core.evidence_types import LensName


@dataclass(frozen=True)
class DetectedObject:
    label: str
    confidence: float
    frame_index: int
    bbox: tuple[float, float, float, float] = (0.0, 0.0, 0.0, 0.0)


_LABEL_TO_LENS: Dict[str, LensName] = {
    "vinyl record": LensName.RECORD,
    "cd": LensName.RECORD,
    "sneaker": LensName.SOLE,
    "shoe": LensName.SOLE,
    "watch": LensName.WATCH,
    "trading card": LensName.CARD,
    "lego set": LensName.TOY,
    "action figure": LensName.TOY,
    "laptop": LensName.TECH,
    "phone": LensName.TECH,
    "book": LensName.BOOK,
    "jacket": LensName.THREAD,
    "dress": LensName.THREAD,
}


class ObjectDetectionRouter:
    def __init__(self, *, min_confidence: float = 0.4) -> None:
        self.min_confidence = min_confidence

    def route(
        self, detections: Sequence[DetectedObject]
    ) -> Dict[LensName, List[DetectedObject]]:
        buckets: Dict[LensName, List[DetectedObject]] = {}
        for det in detections:
            if det.confidence < self.min_confidence:
                continue
            lens = _LABEL_TO_LENS.get(det.label.lower())
            if lens is None:
                continue
            buckets.setdefault(lens, []).append(det)
        return buckets
