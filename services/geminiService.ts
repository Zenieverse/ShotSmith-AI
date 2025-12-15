import { GoogleGenAI, Type, Schema, Modality, LiveServerMessage, Content } from "@google/genai";
import { ShotParameters } from "../types";

// --- Initialization ---
// We create a fresh instance when needed for Veo to ensure key selection is respected
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const ensureApiKey = async (force: boolean = false) => {
  const win = window as any;
  if (win.aistudio) {
    if (force) {
      if (win.aistudio.openSelectKey) {
        await win.aistudio.openSelectKey();
      }
      return;
    }
    
    if (win.aistudio.hasSelectedApiKey) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await win.aistudio.openSelectKey();
      }
    }
  }
};

// --- 1. Agentic Parameter Generation ---
const shotSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    camera: {
      type: Type.OBJECT,
      properties: {
        shot_type: { type: Type.STRING },
        lens_mm: { type: Type.NUMBER },
        fov_deg: { type: Type.NUMBER },
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
           properties: { type: {type:Type.STRING}, angle_deg: {type:Type.NUMBER}, intensity: {type:Type.NUMBER} }
        },
        fill: {
           type: Type.OBJECT,
           properties: { type: {type:Type.STRING}, angle_deg: {type:Type.NUMBER}, intensity: {type:Type.NUMBER} }
        },
        rim: {
           type: Type.OBJECT,
           properties: { type: {type:Type.STRING}, angle_deg: {type:Type.NUMBER}, intensity: {type:Type.NUMBER} }
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
    format: {
      type: Type.OBJECT,
      properties: {
        aspect_ratio: { type: Type.STRING, enum: ["1:1", "16:9", "9:16", "4:3", "3:4"] },
        resolution: { type: Type.STRING, enum: ["1K", "2K", "4K"] }
      }
    },
    description: { type: Type.STRING }
  }
};

export const generateShotParams = async (userIntent: string): Promise<ShotParameters> => {
  await ensureApiKey(); // Ensure key is selected before generating params
  const ai = getAi();
  const model = "gemini-2.5-flash"; 

  const prompt = `
    ACT AS A TEAM OF CINEMATOGRAPHY AGENTS.
    Intent: "${userIntent}"
    
    1. Narrative: Analyze mood/pacing.
    2. Camera: Select lens/angle.
    3. Lighting: 3-point setup.
    4. Color: ACEScg palette.
    5. Format: Default to 16:9 2K unless specified.
    
    Output strictly in the requested JSON.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: shotSchema,
      temperature: 0.2,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No JSON generated");
  return JSON.parse(text) as ShotParameters;
};

// --- 2. Image Generation (Gemini 3 Pro) ---
export const generateFiboImage = async (params: ShotParameters): Promise<string> => {
  await ensureApiKey(); // Required for Gemini 3 Pro Image Preview
  const ai = getAi();
  // gemini-3-pro-image-preview for high quality + size control
  const model = "gemini-3-pro-image-preview"; 

  const technicalPrompt = `
    Photorealistic cinematic shot.
    ${params.description}
    Technical: ${params.camera.lens_mm}mm lens, ${params.camera.angle}, ${params.lighting.key.type} lighting.
    Colors: ${params.color.palette.join(", ")}.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [{ text: technicalPrompt }] },
    config: {
      imageConfig: {
        aspectRatio: params.format.aspect_ratio,
        imageSize: params.format.resolution
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
         return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image data returned");
};

// --- 3. Image Editing (Gemini 2.5 Flash) ---
export const editImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  await ensureApiKey();
  const ai = getAi();
  // gemini-2.5-flash-image for editing
  const model = "gemini-2.5-flash-image";

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/png", data: base64Image.split(',')[1] } },
        { text: prompt }
      ]
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
         return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("Edit failed");
};

// --- 4. Video Generation (Veo) ---
export const generateVeoVideo = async (prompt: string, imageBase64?: string): Promise<string> => {
  await ensureApiKey(); // Required for Veo
  const ai = getAi();
  const model = "veo-3.1-fast-generate-preview";

  let operation;
  
  if (imageBase64) {
    // Animate image
    operation = await ai.models.generateVideos({
      model,
      prompt: prompt || "Animate this cinematographically",
      image: {
        imageBytes: imageBase64.split(',')[1],
        mimeType: 'image/png'
      },
      config: {
        numberOfVideos: 1,
        // Veo only supports 16:9 or 9:16. Defaulting to 16:9 for this tool
        aspectRatio: '16:9',
        resolution: '720p'
      }
    });
  } else {
    // Prompt to video
    operation = await ai.models.generateVideos({
      model,
      prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio: '16:9',
        resolution: '720p' 
      }
    });
  }

  // Polling
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");
  
  // Append Key for fetch
  return `${videoUri}&key=${process.env.API_KEY}`;
};

// --- 5. Director's Assistant (Chat + Grounding + Thinking) ---
export const createDirectorChat = (history?: Content[]) => {
  const ai = getAi();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      thinkingConfig: { thinkingBudget: 16000 }, // Thinking mode enabled
      tools: [{googleSearch: {}}, {googleMaps: {}}], // Grounding enabled
      systemInstruction: "You are an expert cinematography assistant. Help the user plan shots, understand lighting, and find locations. Use Search and Maps for location scouting."
    }
  });
};

// --- 6. TTS ---
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  await ensureApiKey();
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("TTS failed");
  
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};


// --- 7. Live API (Voice Mode) ---
export class LiveSession {
  private ai: GoogleGenAI;
  private session: any;
  private audioContext: AudioContext;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;

  constructor(
    private onMessage: (text: string) => void, 
    private onStatusChange: (status: string) => void
  ) {
    this.ai = getAi();
    // Initialize output context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  }

  async connect() {
    this.onStatusChange("INITIALIZING");

    // 1. Ensure API Key (Important for Live API 403 fixes)
    await ensureApiKey();
    this.ai = getAi(); // Refresh AI instance with selected key

    // 2. Resume Audio Context (Must be done after user gesture)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // 3. Request Microphone
    let stream;
    try {
      this.onStatusChange("REQUESTING_MIC");
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e: any) {
      console.error("Mic Error:", e);
      this.onStatusChange("MIC_DENIED");
      throw new Error("Microphone access denied. Please allow microphone permissions in your browser settings.");
    }
    
    // 4. Connect to Live API
    this.onStatusChange("CONNECTING_SOCKET");
    try {
      const sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            this.onStatusChange("LISTENING");
            this.startAudioStream(stream, sessionPromise);
          },
          onmessage: async (msg: LiveServerMessage) => {
            this.handleMessage(msg);
          },
          onclose: () => this.onStatusChange("DISCONNECTED"),
          onerror: (e) => {
             console.error("Live API Error:", e);
             this.onStatusChange("ERROR");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "You are ShotSmith's voice assistant. Help the user with cinematography commands."
        }
      });
      
      this.session = await sessionPromise;
    } catch (e: any) {
       console.error("Connection Failed", e);
       // Handle 403 explicitly in UI if possible, but throwing here is caught by App.tsx
       throw e;
    }
  }

  private startAudioStream(stream: MediaStream, sessionPromise: Promise<any>) {
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    this.inputSource = inputCtx.createMediaStreamSource(stream);
    this.processor = inputCtx.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const data16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        data16[i] = inputData[i] * 32768;
      }
      
      const uint8 = new Uint8Array(data16.buffer);
      let binary = '';
      for (let i = 0; i < uint8.byteLength; i++) {
         binary += String.fromCharCode(uint8[i]);
      }
      const b64 = btoa(binary);

      sessionPromise.then(s => {
        s.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: b64
          }
        });
      });
    };
    
    this.inputSource.connect(this.processor);
    this.processor.connect(inputCtx.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Audio Output
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      const binary = atob(audioData);
      const bytes = new Uint8Array(binary.length);
      for (let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
      
      // Decode PCM 24000Hz 1ch
      const buffer = this.audioContext.createBuffer(1, bytes.length / 2, 24000);
      const channel = buffer.getChannelData(0);
      const int16 = new Int16Array(bytes.buffer);
      for(let i=0; i<int16.length; i++) {
        channel[i] = int16[i] / 32768.0;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      const now = this.audioContext.currentTime;
      const start = Math.max(this.nextStartTime, now);
      source.start(start);
      this.nextStartTime = start + buffer.duration;
    }
  }

  disconnect() {
    if (this.session) {
       // Close logic - session.close() if available in types, otherwise just let garbage collection handle it
       // live.connect returns a promise to a session which usually has close()
       this.session.close?.(); 
    }
    this.inputSource?.disconnect();
    this.processor?.disconnect();
    this.onStatusChange("IDLE");
  }
}