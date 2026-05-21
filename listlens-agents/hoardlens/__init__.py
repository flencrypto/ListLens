"""HoardLens — bulk listings, hoards, video walkthroughs.

Public API:
    HoardLensAgent           triage a video / multi-item upload
    VideoFrameExtractor      sample frames from a video file
    ObjectDetectionRouter    map detected objects to Lenses
"""

from .hoardlens_agent import HoardLensAgent
from .video_frame_extractor import VideoFrameExtractor, ExtractedFrame
from .object_detection_router import ObjectDetectionRouter, DetectedObject

__all__ = [
    "DetectedObject",
    "ExtractedFrame",
    "HoardLensAgent",
    "ObjectDetectionRouter",
    "VideoFrameExtractor",
]
