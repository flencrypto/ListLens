import type {
  MarkerDetectionResult,
  PoseEstimationResult,
  PerspectiveCorrectionResult,
  GarmentLandmarksResult,
  MeasurementResult,
} from "./interfaces";

/**
 * Detects an AR marker in the provided image buffer.
 * Stub: no real OpenCV — returns a mock result.
 */
export async function detectMarker(
  _imageData: Uint8Array,
  _markerDictionary?: string
): Promise<MarkerDetectionResult> {
  return {
    markerId: "stub-marker-0",
    corners: [[10, 10], [60, 10], [60, 60], [10, 60]],
    confidence: 0.0, // 0 confidence indicates stub
  };
}

/**
 * Estimates 3D pose from marker detection result.
 * Stub: no real OpenCV.
 */
export async function estimatePose(
  _detection: MarkerDetectionResult,
  _markerSizeMm: number
): Promise<PoseEstimationResult> {
  return {
    rotationVector: [0, 0, 0],
    translationVector: [0, 0, 0],
    confidence: 0.0,
  };
}

/**
 * Corrects perspective distortion in an image.
 * Stub: returns the original image data unchanged.
 */
export async function correctPerspective(
  imageData: Uint8Array,
  _pose: PoseEstimationResult
): Promise<PerspectiveCorrectionResult> {
  return {
    correctedImageData: imageData,
    homographyMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    confidence: 0.0,
  };
}

/**
 * Detects garment landmark points in a corrected image.
 * Stub: returns empty landmarks.
 */
export async function detectGarmentLandmarks(
  _imageData: Uint8Array
): Promise<GarmentLandmarksResult> {
  return {
    landmarks: {},
    confidence: 0.0,
  };
}

/**
 * Calculates physical measurements from landmarks using the reference marker.
 * Stub: returns null measurements with a warning.
 */
export async function calculateMeasurements(
  _landmarks: GarmentLandmarksResult,
  _pose: PoseEstimationResult,
  _markerSizeMm: number
): Promise<MeasurementResult> {
  return {
    measurements: {
      chest_cm: null,
      waist_cm: null,
      hip_cm: null,
      shoulder_width_cm: null,
      sleeve_length_cm: null,
      body_length_cm: null,
      inseam_cm: null,
    },
    confidence: 0.0,
    warnings: ["CV pipeline not yet implemented — real OpenCV required"],
  };
}
