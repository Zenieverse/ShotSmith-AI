export interface CameraParams {
  shot_type: string; // e.g., "close_up", "wide"
  lens_mm: number;
  fov_deg: number;
  angle: string; // e.g., "eye_level", "low_angle"
  camera_height_m: number;
}

export interface LightSource {
  type: string; // "area", "spot", "sun"
  angle_deg: number;
  intensity: number; // 0.0 to 1.0
  color_temp?: number; // Kelvin
}

export interface LightingParams {
  key: LightSource;
  fill: LightSource;
  rim: LightSource;
}

export interface ColorParams {
  space: string; // "ACEScg", "sRGB"
  bit_depth: number; // 8, 16, 32
  palette: string[];
}

export interface CompositionParams {
  rule_of_thirds: boolean;
  subject_position: string; // "center", "left_third"
  negative_space: string;
}

export interface ShotParameters {
  camera: CameraParams;
  lighting: LightingParams;
  color: ColorParams;
  composition: CompositionParams;
  description: string; // The generated visual description for the model
}

export interface Shot {
  id: string;
  name: string;
  intent: string;
  params: ShotParameters;
  imageUrl?: string;
  timestamp: number;
}

export enum AgentStatus {
  IDLE = "IDLE",
  ANALYZING = "ANALYZING_INTENT", // Narrative Agent
  CALCULATING = "CALCULATING_PHYSICS", // Cinematography/Lighting Agent
  GENERATING = "GENERATING_PIXELS", // FIBO Render Agent
  COMPLETE = "COMPLETE",
  ERROR = "ERROR"
}