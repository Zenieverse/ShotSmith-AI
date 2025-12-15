export interface CameraParams {
  shot_type: string;
  lens_mm: number;
  fov_deg: number;
  angle: string;
  camera_height_m: number;
}

export interface LightSource {
  type: string;
  angle_deg: number;
  intensity: number;
  color_temp?: number;
}

export interface LightingParams {
  key: LightSource;
  fill: LightSource;
  rim: LightSource;
}

export interface ColorParams {
  space: string;
  bit_depth: number;
  palette: string[];
}

export interface CompositionParams {
  rule_of_thirds: boolean;
  subject_position: string;
  negative_space: string;
}

export interface FormatParams {
  aspect_ratio: string; // "1:1", "16:9", "9:16", "4:3", "3:4"
  resolution: string; // "1K", "2K", "4K"
}

export interface ShotParameters {
  camera: CameraParams;
  lighting: LightingParams;
  color: ColorParams;
  composition: CompositionParams;
  format: FormatParams;
  description: string;
}

export interface Shot {
  id: string;
  name: string;
  intent: string;
  params: ShotParameters;
  imageUrl?: string;
  videoUrl?: string; // For Veo generations
  timestamp: number;
  type: 'image' | 'video';
}

export enum AgentStatus {
  IDLE = "IDLE",
  ANALYZING = "ANALYZING_INTENT",
  CALCULATING = "CALCULATING_PHYSICS",
  GENERATING = "GENERATING_PIXELS",
  ANIMATING = "ANIMATING_VEO",
  EDITING = "EDITING_IMAGE",
  COMPLETE = "COMPLETE",
  ERROR = "ERROR"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingMetadata?: any; // For Search/Maps citations
}
