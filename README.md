<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Zgr8o8D08AALbafiKZtFOn3nb45MMTcQ or https://poe.com/ShotSmithAI https://youtu.be/5dZIA86hPm4?si=GQmYn_vNCIKLT0gY 

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Zgr8o8D08AALbafiKZtFOn3nb45MMTcQ or https://poe.com/ShotSmithAI https://youtu.be/5dZIA86hPm4?si=GQmYn_vNCIKLT0gY 

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

ShotSmith AI — Deterministic Cinematography from Script to Final Frames
Category Selection
Primary: Best JSON-Native or Agentic Workflow
Secondary: Best Controllability (strong contender for Best Overall)

Why:
ShotSmith AI uses FIBO’s structured JSON control as the source of truth for cinematography, lighting, and color — orchestrated by agents that transform scripts and shot lists into repeatable, studio-grade visuals.
One-Line Pitch
A script-to-shot pipeline where every frame is generated with deterministic camera, lighting, HDR color, and composition — no prompt drift, no re-rolling, fully production-ready.

Problem
In film, advertising, and game production:
Prompt-based image generation is non-deterministic
Camera language (lens, FOV, angle) is implicit and fragile
Visual continuity across shots is nearly impossible
Teams can’t version or diff creative intent

Solution
ShotSmith AI converts creative intent into explicit JSON cinematography graphs, rendered by FIBO with pixel-consistent control.
Instead of:
“A cinematic close-up at sunset”
You get:
{
  "camera": {
    "shot_type": "close_up",
    "lens_mm": 85,
    "fov_deg": 24,
    "angle": "eye_level"
  },
  "lighting": {
    "key": { "type": "directional", "angle_deg": 12, "intensity": 0.9 },
    "fill": { "intensity": 0.2 },
    "color_temperature": 4200
  },
  "color": {
    "space": "ACEScg",
    "bit_depth": 16,
    "palette": ["warm_amber", "cool_shadow"]
  },
  "composition": {
    "rule_of_thirds": true,
    "subject_position": "right_third"
  }
}
This JSON always renders the same way.
Core Features

🎬 1. Script-to-Shot Agent
Input: screenplay, storyboard, or beat outline
Output: structured shot list (JSON)
Automatically assigns:
Shot type (CU / MS / WS)
Lens & FOV
Camera angle & height
Lighting setup
Color intent (HDR / 16-bit)

🧠 2. Agentic JSON Orchestration
Multi-agent flow:
Narrative Agent → detects emotional beats
Cinematography Agent → camera & lens JSON
Lighting Agent → physically plausible lighting JSON
Color Agent → ACES / HDR palette JSON
FIBO Render Agent → generates frames deterministically
Agents communicate only via JSON, making the system debuggable and scalable.

🎛️ 3. Professional Control UI (New UX)
Timeline view of shots
Slider-driven controls mapped directly to JSON fields:
Lens mm
FOV
Key-to-fill ratio
Color temperature
JSON diff view between shot revisions
This feels closer to Nuke / Unreal / DaVinci, not prompt chat.

🌈 4. HDR & 16-Bit Color Pipeline
ACEScg color space
16-bit EXR output
Designed for:
Compositing
Color grading
VFX handoff
Zero prompt variance between renders

🔁 5. Versionable & Reproducible
Every frame is defined by JSON
Git-friendly
Ideal for:
Studios
Agencies
Long-running productions

Why This Pushes FIBO Forward
Treats FIBO as a render engine, not a prompt toy
Shows how JSON control replaces prompt engineering
Demonstrates real production workflows
Proves deterministic AI imagery can fit professional pipelines

Demo Video (≤ 3 minutes)

Tech Stack
FIBO (core image generation)
FIBO JSON schemas
LLM → JSON translator
ComfyUI (optional node integration)
Python + FastAPI (agent orchestration)
Web UI (React / Svelte)
Public Repo Structure
shotsmith-ai/
├─ agents/
│  ├─ narrative_agent.py
│  ├─ cinematography_agent.py
│  ├─ lighting_agent.py
├─ schemas/
│  └─ fibo_shot_schema.json
├─ examples/
│  ├─ scene_to_shots.json
│  └─ hdr_output.exr
├─ ui/
├─ README.md
README clearly documents:
FIBO model usage
JSON parameters
Reproducible outputs
