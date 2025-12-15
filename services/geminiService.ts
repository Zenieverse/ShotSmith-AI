import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ShotParameters } from "../types";

// This simulates the Multi-Agent Architecture
// 1. Narrative Agent -> Understands the text
// 2. Cinematography Agent -> Sets lens/camera
// 3. Lighting/Color Agent -> Sets physics
// We achieve this via a structured Chain-of-Thought schema in Gemini.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const shotSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    camera: {
      type: Type.OBJECT,
      properties: {
        shot_type: { type: Type.STRING },
        lens_mm: { type: Type.NUMBER, description: "Focal length in mm" },
        fov_deg: { type: Type.NUMBER, description: "Field of view in degrees" },
        angle: { type: Type.STRING },
        camera_height_m: { type: Type.NUMBER },
      },
      required: ["shot_type", "lens_mm", "fov_deg", "angle", "camera_height_m"]
    },
    lighting: {
      type: Type.OBJECT,
      properties: {
        key: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            angle_deg: { type: Type.NUMBER },
            intensity: { type: Type.NUMBER }
          }
        },
        fill: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            angle_deg: { type: Type.NUMBER },
            intensity: { type: Type.NUMBER }
          }
        },
        rim: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            angle_deg: { type: Type.NUMBER },
            intensity: { type: Type.NUMBER }
          }
        }
      }
    },
    color: {
      type: Type.OBJECT,
      properties: {
        space: { type: Type.STRING },
        bit_depth: { type: Type.NUMBER },
        palette: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    composition: {
      type: Type.OBJECT,
      properties: {
        rule_of_thirds: { type: Type.BOOLEAN },
        subject_position: { type: Type.STRING },
        negative_space: { type: Type.STRING }
      }
    },
    description: {
      type: Type.STRING,
      description: "A highly detailed visual description prompt derived from these technical parameters to guide the image generator."
    }
  }
};

export const generateShotParams = async (userIntent: string): Promise<ShotParameters> => {
  const model = "gemini-2.5-flash"; // Fast inference for the "Agent" phase

  const prompt = `
    ACT AS A TEAM OF CINEMATOGRAPHY AGENTS.
    
    1. Narrative Agent: Analyze the User Intent: "${userIntent}". Determine mood, pacing, and subject.
    2. Cinematography Agent: Select the best lens (mm), camera angle, and shot type for this narrative.
    3. Lighting Agent: Design a 3-point lighting setup (Key, Fill, Rim) with realistic intensities (0.0 - 1.0) and angles.
    4. Color Agent: Select an ACEScg workflow and color palette.
    
    Output strictly in the requested JSON format. Ensure lens_mm and fov_deg are physically consistent.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: shotSchema,
        temperature: 0.2, // Low temperature for deterministic/technical output
      }
    });

    const text = response.text;
    if (!text) throw new Error("No JSON generated");
    
    return JSON.parse(text) as ShotParameters;
  } catch (error) {
    console.error("Agent Error:", error);
    throw error;
  }
};

export const generateFiboImage = async (params: ShotParameters): Promise<string> => {
  // In a real production, this would call Bria FIBO API.
  // Here we use Gemini 2.5 Flash Image or Pro Image to SIMULATE the FIBO generation
  // by strictly adhering to the JSON parameters provided.
  
  const model = "gemini-3-pro-image-preview"; // High quality for "Pro" output

  // Construct a prompt that enforces the JSON constraints
  const technicalPrompt = `
    Create a photorealistic cinematic shot based EXACTLY on these technical specifications.
    
    VISUAL DESCRIPTION: ${params.description}
    
    TECHNICAL CONSTRAINTS:
    - Shot Type: ${params.camera.shot_type}
    - Focal Length: ${params.camera.lens_mm}mm (Field of View: ${params.camera.fov_deg} deg)
    - Camera Angle: ${params.camera.angle} at ${params.camera.camera_height_m}m height.
    - Lighting: Key light at ${params.lighting.key.intensity} intensity, Fill at ${params.lighting.fill.intensity}, Rim at ${params.lighting.rim.intensity}.
    - Color Palette: ${params.color.palette.join(", ")}.
    - Composition: Subject at ${params.composition.subject_position}.
    
    Render Style: High fidelity, ACEScg color science simulation, 16-bit depth look.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: technicalPrompt }]
      },
      config: {
         // Using the new image generation config if available or standard generateContent for this model
         // Note: gemini-3-pro-image-preview uses generateContent but returns image in parts
      }
    });

    // Extract image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data returned");

  } catch (error) {
    console.error("Render Error:", error);
    throw error;
  }
};
