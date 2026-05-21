"""HoardLens — video / multi-item walkthroughs.

PROTOTYPE. Wires VideoFrameExtractor + ObjectDetectionRouter to produce a
per-Lens triage summary. Real per-item Guard/Studio runs are delegated
upstream to the swarm so that this module stays detection-only.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Sequence

from core.evidence_types import LensName
from .object_detection_router import (
    DetectedObject,
    ObjectDetectionRouter,
)
from .video_frame_extractor import ExtractedFrame, VideoFrameExtractor


@dataclass
class HoardTriage:
    frames: List[ExtractedFrame] = field(default_factory=list)
    per_lens: Dict[LensName, List[DetectedObject]] = field(default_factory=dict)
    notes: List[str] = field(default_factory=list)


class HoardLensAgent:
    """Not a normal LensAgent — runs *before* routing to per-item Lenses."""

    name = LensName.HOARD

    def __init__(
        self,
        *,
        extractor: VideoFrameExtractor | None = None,
        router: ObjectDetectionRouter | None = None,
    ) -> None:
        self.extractor = extractor or VideoFrameExtractor()
        self.router = router or ObjectDetectionRouter()

    def triage(
        self,
        *,
        video_paths: Sequence[str] = (),
        detections: Sequence[DetectedObject] = (),
    ) -> HoardTriage:
        frames = self.extractor.extract(video_paths)
        # TODO(production): run a real detector on `frames` instead of trusting
        # caller-supplied `detections`.
        buckets = self.router.route(detections)
        return HoardTriage(
            frames=frames,
            per_lens=buckets,
            notes=[
                f"triage complete: {len(frames)} frame(s), "
                f"{sum(len(v) for v in buckets.values())} routed detection(s)"
            ],
        )
