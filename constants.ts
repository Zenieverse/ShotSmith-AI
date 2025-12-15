import { ShotParameters } from './types';

export const DEFAULT_SHOT_PARAMS: ShotParameters = {
  camera: {
    shot_type: "medium_shot",
    lens_mm: 50,
    fov_deg: 40,
    angle: "eye_level",
    camera_height_m: 1.6
  },
  lighting: {
    key: { type: "soft_box", angle_deg: 45, intensity: 0.8 },
    fill: { type: "bounce", angle_deg: -45, intensity: 0.3 },
    rim: { type: "spot", angle_deg: 180, intensity: 0.2 }
  },
  color: {
    space: "ACEScg",
    bit_depth: 16,
    palette: ["neutral", "balanced"]
  },
  composition: {
    rule_of_thirds: true,
    subject_position: "center",
    negative_space: "none"
  },
  format: {
    aspect_ratio: "16:9",
    resolution: "1K"
  },
  description: "A neutral test shot."
};

export const PRESETS = [
  {
    label: "Cinematic Drama",
    prompt: "A tense interrogation scene in a dark room, dramatic side lighting, cinematic close-ups, high contrast."
  },
  {
    label: "Product Commercial",
    prompt: "Luxury perfume bottle on a reflective surface, soft high-key lighting, macro lens, elegant bokeh."
  },
  {
    label: "Sci-Fi Environment",
    prompt: "Cyberpunk street at night, neon lights, wet pavement, wide angle lens, volumetric fog."
  },
  {
    label: "Golden Hour Portrait",
    prompt: "Portrait of a traveler against a sunset, warm rim light, 85mm lens, shallow depth of field."
  }
];
