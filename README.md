<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Zgr8o8D08AALbafiKZtFOn3nb45MMTcQ

## Run Locally

Prerequisites: Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
`

# ShotSmith AI  
Deterministic Cinematography with FIBO JSON-Native Generation

ShotSmith AI is a professional-grade visual generation tool built for the **Bria FIBO Hackathon. 
It demonstrates a fundamental shift from prompt-based image generation to deterministic, JSON-controlled cinematography using the **Bria FIBO foundation model.

Instead of relying on fragile prompt engineering, ShotSmith AI treats image generation like a real production pipeline: cameras, lenses, lighting, color, and composition are explicit, reproducible, and versionable.

ShotSmith AI — When image generation becomes cinematography, not guesswork.


---

## 🚀 Why ShotSmith AI

Traditional text-to-image systems:
- Produce inconsistent results
- Hide camera and lighting decisions
- Break continuity across shots
- Are impossible to version or diff

ShotSmith AI solves this by making JSON the single source of truth.

With the same JSON input, FIBO will always generate the same framing, lighting behavior, and color intent.

---

## 🧠 Core Concepts

### JSON-Native Generation
All visual intent is expressed as structured JSON:
- Camera angle, lens, and FOV
- Lighting configuration
- Color palette and HDR settings
- Composition rules

No hidden parameters. No prompt drift.

---

### Agentic Workflow
ShotSmith AI uses multiple specialized agents that communicate **only via JSON:

1. Narrative Agent**  
   Interprets emotional beats and scene intent

2. Cinematography Agent**  
   Determines shot type, lens choice, FOV, and camera angle

4. Lighting Agent**  
   Builds physically plausible lighting setups

5. Color Agent**  
   Selects HDR palettes and ACES-based color workflows

6. FIBO Render Agent**  
   Validates JSON and triggers deterministic generation

This architecture is scalable, debuggable, and production-ready.

---

## 🎬 Features

### Script-to-Shot Generation
- Input a screenplay scene or storyboard text
- Automatically generate a shot list with structured JSON
- Maintain visual continuity across shots

### Professional Camera Controls
- Shot type (CU / MS / WS)
- Lens focal length (mm)
- Field of view (FOV)
- Camera height and angle

### Physically Plausible Lighting
- Key / Fill / Rim lights
- Direction, angle, and intensity
- Predictable lighting behavior across renders

### HDR & 16-bit Color Pipeline
- ACEScg color space
- 16-bit output support
- Designed for compositing and grading workflows

### Reproducible Renders
- Same JSON = same image
- Optional seed locking
- Ideal for studio and enterprise workflows

---

## 🧩 Example FIBO JSON

```json
{
  "camera": {
    "shot_type": "close_up",
    "lens_mm": 85,
    "fov_deg": 24,
    "angle": "eye_level",
    "camera_height_m": 1.6
  },
  "lighting": {
    "key": {
      "type": "area",
      "angle_deg": 70,
      "intensity": 0.85
    },
    "fill": {
      "intensity": 0.15
    },
    "rim": {
      "intensity": 0.4
    }
  },
  "color": {
    "space": "ACEScg",
    "bit_depth": 16,
    "palette": ["cool_blue", "desaturated_skin"]
  },
  "composition": {
    "rule_of_thirds": true,
    "subject_position": "left_third",
    "negative_space": "right"
  }
}

User Interface
The UI is designed like a professional creative tool:
Left Panel: Creative input (scene, shot description)
Center Panel: Live preview with comparison modes
Right Panel: Editable JSON with schema validation
Timeline View: Shot list with continuity locks
Diff View: Compare JSON changes between versions

🔧 Tech Stack
Bria FIBO – JSON-native text-to-image generation
LLM Translator – Natural language → structured JSON
Python / FastAPI – Agent orchestration
ComfyUI (optional) – Node-based workflows
Web UI – React or Svelte-based editor

📦 Repository Structure
shotsmith-ai/
├─ agents/
│  ├─ narrative_agent.py
│  ├─ cinematography_agent.py
│  ├─ lighting_agent.py
│  ├─ color_agent.py
│  └─ fibo_render_agent.py
├─ schemas/
│  └─ fibo_shot_schema.json
├─ examples/
│  ├─ scene_to_shots.json
│  └─ hdr_output.exr
├─ ui/
├─ README.md

🛠️ Setup & Running
1. Install Dependencies
pip install -r requirements.txt
2. Download FIBO Models
FIBO models are available on Hugging Face:
https://huggingface.co/briaai
Follow Bria’s instructions to place models locally or configure API access.
3. Run the App
python main.py

🙌 Acknowledgements
Bria AI for FIBO and JSON-native generation
User Interface
The UI is designed like a professional creative tool:
Left Panel: Creative input (scene, shot description)
Center Panel: Live preview with comparison modes
Right Panel: Editable JSON with schema validation
Timeline View: Shot list with continuity locks
Diff View: Compare JSON changes between versions


🏆 Hackathon Categories
This project is submitted for:
Best JSON-Native or Agentic Workflow
Best Controllability
ShotSmith AI showcases how FIBO enables a new generation of professional, reliable, and controllable visual AI tools.

📜 License & Usage
This project uses the Bria FIBO foundation model, trained exclusively on fully licensed data and suitable for commercial use.
ShotSmith AI is intended as a reference implementation and hackathon submission.
