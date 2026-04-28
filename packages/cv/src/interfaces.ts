export interface MarkerDetectionResult {
  markerId: string;
  corners: [number, number][];
  confidence: number;
}

export interface PoseEstimationResult {
  rotationVector: [number, number, number];
  translationVector: [number, number, number];
  confidence: number;
}

export interface PerspectiveCorrectionResult {
  correctedImageData: Uint8Array;
  homographyMatrix: number[][];
  confidence: number;
}

export interface GarmentLandmarksResult {
  landmarks: Record<string, [number, number]>;
  confidence: number;
}

export interface MeasurementResult {
  measurements: Record<string, number | null>;
  confidence: number;
  warnings: string[];
}
