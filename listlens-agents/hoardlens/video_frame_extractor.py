"""Video frame extraction.

PROTOTYPE: returns the input as-is and treats every supplied path as one
frame. PRODUCTION: use ffmpeg or PyAV. The dataclass shape is stable so the
real implementation only needs to replace ``extract``.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Sequence


@dataclass(frozen=True)
class ExtractedFrame:
    source: str            # video path or URL
    frame_index: int
    timestamp_ms: int
    image_path: str        # PROTOTYPE: same as ``source``; PROD: extracted file


class VideoFrameExtractor:
    def __init__(self, *, fps: float = 1.0, max_frames: int = 30) -> None:
        if fps <= 0:
            raise ValueError("fps must be positive")
        if max_frames <= 0:
            raise ValueError("max_frames must be positive")
        self.fps = fps
        self.max_frames = max_frames

    def extract(self, video_paths: Sequence[str]) -> List[ExtractedFrame]:
        # TODO(production): real ffmpeg-based sampling at ``self.fps``.
        out: List[ExtractedFrame] = []
        for path in video_paths:
            out.append(
                ExtractedFrame(
                    source=path,
                    frame_index=0,
                    timestamp_ms=0,
                    image_path=path,
                )
            )
            if len(out) >= self.max_frames:
                break
        return out
