# SketchToApp 🖊️➡️⚡ (Gemini 3 Hackathon)

Turn rough hand-drawn UI sketches into a **working React + Tailwind app**, generate a **live preview**, run a quick **accessibility report**, and export a **Figma-ready JSON** — in minutes.

## 🚀 What it does
- 📷 Upload a sketch (login screen, form, dashboard wireframe, etc.)
- 🧠 Gemini interprets layout + intent and generates **complete React code**
- 🖥️ Auto-renders a **live preview** inside the app
- ♿ Generates an **accessibility report** (labels / aria-labels / keyboard)
- 🎨 Exports a **Figma JSON** file to bootstrap design handoff

## 🧩 Why it matters
Designers and students spend hours recreating ideas in Figma — often without prior prototyping experience.
SketchToApp reduces that friction by converting sketches into **interactive prototypes** and **Figma-ready structure** quickly.

## 🛠️ Tech Stack
- **Gemini 3 Pro (Preview)** for best reasoning & layout inference
- **Gemini 2.5 Flash** fallback for fast + quota-friendly demos
- Vanilla HTML/CSS + **Tailwind CDN**
- **React 18 + Babel** in an iframe sandbox for safe preview rendering
- Client-side rate limiting + clean UI mode (agent logs hidden)

## 🖼️ Demo
https://ai.studio/apps/drive/1Gbq5XN8Tv80qsbU5j-p1QEhldDhfScSM
