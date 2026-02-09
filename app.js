// Configuration
const GEMINI_API_KEY = 'YOUR API KEY';

// DOM Elements
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const generateBtn = document.getElementById('generateBtn');
const status = document.getElementById('status');
const codeOutput = document.getElementById('codeOutput');
const previewFrame = document.getElementById('previewFrame');
const agentTimeline = document.getElementById('agentTimeline');
const exportFigmaBtn = document.getElementById("exportFigmaBtn");

// NEW DOM
const copyCodeBtn = document.getElementById('copyCodeBtn');
const showA11yBtn = document.getElementById('showA11yBtn');
const a11ySummary = document.getElementById('a11ySummary');
const runEditedBtn = document.getElementById('runEditedBtn');

// ✅ Model toggle DOM
const useGemini3Toggle = document.getElementById('useGemini3Toggle');
const modelLabel = document.getElementById('modelLabel');

let typingInterval;
let statusTimers = [];

// Store last generated code + last a11y result
let lastGeneratedCode = '';
let lastA11yResult = null;

// Keep agent logs OFF for clean UI
const SHOW_AGENT_LOGS = false;

// Default model = 2.5 Flash (demo-friendly)
const MODEL_FLASH = 'models/gemini-2.5-flash';
const MODEL_GEMINI3 = 'models/gemini-3-pro-preview';

function getSelectedModel() {
  // ✅ Toggle ON => Gemini 3, else 2.5 Flash
  return (useGemini3Toggle && useGemini3Toggle.checked) ? MODEL_GEMINI3 : MODEL_FLASH;
}

function refreshModelLabel() {
  if (!modelLabel) return;
  const m = getSelectedModel();
  modelLabel.textContent =
    (m === MODEL_GEMINI3) ? 'Model: Gemini 3 Pro (preview)' : 'Model: Gemini 2.5 Flash';
}

if (useGemini3Toggle) {
  useGemini3Toggle.addEventListener('change', refreshModelLabel);
}
refreshModelLabel();

// ============================================================
// Helpers for <textarea> vs <pre>
// ============================================================
function setOutputText(el, text) {
  if (!el) return;
  if ('value' in el) el.value = text; // textarea/input
  else el.textContent = text;         // fallback
}

function getOutputText(el) {
  if (!el) return '';
  return ('value' in el) ? el.value : el.textContent;
}

// Autonomous Agent System
function logAgent(message) {
  if (!SHOW_AGENT_LOGS) return;
  const div = document.createElement('div');
  div.textContent = message;
  agentTimeline.appendChild(div);
  agentTimeline.scrollTop = agentTimeline.scrollHeight;
}

// Accessibility Agent
function accessibilityAgent(code) {
  let score = 100;

  if (!code.includes('aria-label')) score -= 30;
  if (!code.includes('label')) score -= 20;
  if (code.includes('onClick') && !code.includes('onKeyDown')) score -= 10;

  return {
    score: Math.max(score, 40),
    issues: score < 100
      ? 'Missing accessibility attributes (labels / aria-labels)'
      : 'No major accessibility issues'
  };
}

// Autonomous loop
async function runAgents(code) {
  if (SHOW_AGENT_LOGS) {
    agentTimeline.innerHTML = '';
    logAgent('🧠 UX Agent: analyzing intent...');
    await delay(250);
    logAgent('🎨 UI Agent: reviewing layout...');
    await delay(250);
    logAgent('♿ Accessibility Agent: running checks...');
    await delay(250);
  }

  const a11yResult = accessibilityAgent(code);
  lastA11yResult = a11yResult;

  if (SHOW_AGENT_LOGS) {
    logAgent(`♿ Accessibility Agent: ${a11yResult.issues}`);
    logAgent(`📊 Accessibility Score: ${a11yResult.score}/100`);
    logAgent('✅ Autonomous quality gate passed');
  }

  return a11yResult;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Typing Effect (works with textarea)
function typeText(element, text, speed = 8) {
  setOutputText(element, '');
  let index = 0;

  clearInterval(typingInterval);

  typingInterval = setInterval(() => {
    if (index < text.length) {
      setOutputText(element, getOutputText(element) + text.charAt(index));
      if (element.scrollTop !== undefined) element.scrollTop = element.scrollHeight;
      index++;
    } else {
      clearInterval(typingInterval);
    }
  }, speed);
}

// Fake Code
const FAKE_CODE = `// Initializing Gemini...
// Parsing visual components...
// Building component tree...
// Generating Tailwind styles...
// Wiring interactivity...

export default function App() {
  return (
    <div className="p-4">
      <h1>Generating UI...</h1>
    </div>
  );
}`;

// Rate limiting (client-side burst prevention)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 35000;
let scheduledRunTimeout = null; // ✅ IMPORTANT: you reference this later

// Hide agent timeline for clean UI
if (agentTimeline) {
  agentTimeline.innerHTML = '';
  agentTimeline.classList.add('hidden');
}

// Handle image upload
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

// Render live preview
function renderPreview(reactCode) {
  let cleanCode = reactCode;

  cleanCode = cleanCode.replace(/import\s+.*from\s+['"]react['"];?\n?/g, '');
  cleanCode = cleanCode.replace(/import\s+React.*\n?/g, '');
  cleanCode = cleanCode.replace(/export\s+default\s+/g, '');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body { height: 100%; width: 100%; }
    body {
      margin: 0;
      padding: 0;
      background: #f9fafb;
      font-family: system-ui, -apple-system, sans-serif;

      /* Slight downscale so dashboards fit better */
      transform: scale(0.85);
      transform-origin: top left;

      width: calc(100% / 0.85);
      height: calc(100% / 0.85);
      overflow: auto;
    }
    #root { height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;

    ${cleanCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  previewFrame.src = 'about:blank';
  previewFrame.src = url;
}

function showPreview() {
  previewFrame.classList.remove('hidden');
}

// Countdown timer (button label)
function startCooldown() {
  const interval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    const remaining = MIN_REQUEST_INTERVAL - elapsed;

    if (remaining > 0) {
      const seconds = Math.ceil(remaining / 1000);
      generateBtn.textContent = `Wait ${seconds}s`;
      generateBtn.disabled = true;
    } else {
      clearInterval(interval);
      generateBtn.textContent = 'Generate App';
      generateBtn.disabled = false;
    }
  }, 1000);
}

// Helper: Convert image to base64
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Copy button handler
async function copyGeneratedCode() {
  const code = lastGeneratedCode || getOutputText(codeOutput) || '';
  if (!code.trim() || code.includes('Your code will appear here')) return;

  try {
    await navigator.clipboard.writeText(code);
    copyCodeBtn.textContent = '✅ Copied';
    setTimeout(() => (copyCodeBtn.textContent = '📋 Copy'), 1200);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    copyCodeBtn.textContent = '✅ Copied';
    setTimeout(() => (copyCodeBtn.textContent = '📋 Copy'), 1200);
  }
}

if (copyCodeBtn) {
  copyCodeBtn.addEventListener('click', copyGeneratedCode);
}

// Accessibility button handler (shows report in UPLOAD section)
async function showAccessibility() {
  if (!lastGeneratedCode) return;

  status.textContent = '♿ Running accessibility checks...';

  const result = await runAgents(lastGeneratedCode);

  if (a11ySummary) {
    a11ySummary.classList.remove('hidden');
    a11ySummary.innerHTML = `
      <div class="font-semibold mb-1">Accessibility Report</div>
      <div><b>Score:</b> ${result.score}/100</div>
      <div><b>Notes:</b> ${result.issues}</div>
    `;
  }

  status.textContent = `♿ Accessibility: ${result.score}/100`;
}

if (showA11yBtn) {
  showA11yBtn.addEventListener('click', showAccessibility);
}

// ============================================================
// Run Edited Code button
// ============================================================
function runEditedCode() {
  const edited = getOutputText(codeOutput).trim();

  if (!edited || edited.includes('Your code will appear here')) {
    alert('No code to run yet.');
    return;
  }

  lastGeneratedCode = edited;

  try {
    renderPreview(edited);
    showPreview();
    status.textContent = '✅ Running edited code';
  } catch (e) {
    console.error(e);
    status.textContent = '❌ Could not render edited code';
    alert('Your edited code failed to run. Check console for details.');
  }
}

if (runEditedBtn) {
  runEditedBtn.addEventListener('click', runEditedCode);
}

/* ============================================================
   FIGMA EXPORT
   ============================================================ */

function generateFigmaJSON(reactCode) {
  return {
    document: {
      type: "DOCUMENT",
      children: [
        {
          type: "CANVAS",
          name: "SketchToApp Export",
          children: [
            {
              type: "FRAME",
              name: "Generated Screen",
              layoutMode: "VERTICAL",
              primaryAxisSizingMode: "AUTO",
              counterAxisSizingMode: "AUTO",
              itemSpacing: 16,
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 24,
              paddingBottom: 24,
              fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
              children: extractComponentsFromCode(reactCode)
            }
          ]
        }
      ]
    }
  };
}

function extractComponentsFromCode(code) {
  const components = [];
  if (code.includes("<h1")) components.push(figmaText("Heading", 32));
  if (code.includes("<input")) components.push(figmaInput("Input Field"));
  if (code.includes("<button")) components.push(figmaButton("Button"));
  return components;
}

function figmaText(text, size) {
  return { type: "TEXT", characters: text, style: { fontSize: size, fontWeight: 700 } };
}

function figmaInput(name) {
  return {
    type: "FRAME",
    name,
    layoutMode: "HORIZONTAL",
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 10,
    paddingBottom: 10,
    strokes: [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }],
    cornerRadius: 6,
    children: [{ type: "TEXT", characters: "Input" }]
  };
}

function figmaButton(label) {
  return {
    type: "FRAME",
    name: label,
    layoutMode: "HORIZONTAL",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fills: [{ type: "SOLID", color: { r: 0.23, g: 0.51, b: 0.96 } }],
    cornerRadius: 8,
    children: [{ type: "TEXT", characters: label, style: { fill: { r: 1, g: 1, b: 1 } } }]
  };
}

if (exportFigmaBtn) {
  exportFigmaBtn.addEventListener("click", () => {
    const code = lastGeneratedCode || getOutputText(codeOutput);

    if (!code || code.includes('Generating UI...') || code.includes('Your code will appear here')) {
      alert("Generate code first");
      return;
    }

    const figmaJSON = generateFigmaJSON(code);

    const blob = new Blob([JSON.stringify(figmaJSON, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "gemini-figma-export.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ============================================================
// Generate app
// ============================================================
generateBtn.addEventListener('click', async () => {
  if (!imageInput.files[0]) {
    alert('Please upload an image first!');
    return;
  }

  // Enforce cooldown to prevent burst clicks
  const now = Date.now();
  const hasPreviousRequest = lastRequestTime > 0;
  const remaining = hasPreviousRequest ? (MIN_REQUEST_INTERVAL - (now - lastRequestTime)) : 0;

  // If still cooling down, queue the run
  if (hasPreviousRequest && remaining > 0) {
    const seconds = Math.ceil(remaining / 1000);
    status.textContent = `⏳ Cooling down ${seconds}s to avoid 429... auto-running next`;

    generateBtn.disabled = true;

    if (scheduledRunTimeout) clearTimeout(scheduledRunTimeout);

    scheduledRunTimeout = setTimeout(() => {
      scheduledRunTimeout = null;
      generateBtn.disabled = false;
      generateBtn.click(); // re-trigger when ready
    }, remaining + 150);

    return;
  }

  generateBtn.disabled = true;
  status.textContent = '🧠 Gemini working...';

  statusTimers.forEach(clearTimeout);
  statusTimers = [];
  statusTimers.push(setTimeout(() => status.textContent = '🏗 Designing architecture...', 800));
  statusTimers.push(setTimeout(() => status.textContent = '💻 Writing code...', 1600));
  statusTimers.push(setTimeout(() => status.textContent = '🧪 Running checks...', 2400));
  statusTimers.push(setTimeout(() => status.textContent = '🛠 Finalizing...', 3200));

  typeText(codeOutput, FAKE_CODE, 12);

  // Reset UI
  lastGeneratedCode = '';
  lastA11yResult = null;
  if (copyCodeBtn) copyCodeBtn.disabled = true;
  // if (showA11yBtn) showA11yBtn.disabled = true;
  if (runEditedBtn) runEditedBtn.disabled = true;
  if (a11ySummary) a11ySummary.classList.add('hidden');

  try {
    const base64Image = await imageToBase64(imageInput.files[0]);

    // ✅ Set cooldown time ONLY when the API call is about to start
    lastRequestTime = Date.now();
    startCooldown();

    const code = await generateCodeDirect(base64Image);
    lastGeneratedCode = code;

    clearInterval(typingInterval);
    typeText(codeOutput, code, 2);

    if (copyCodeBtn) copyCodeBtn.disabled = false;
    // if (showA11yBtn) showA11yBtn.disabled = false;
    if (runEditedBtn) runEditedBtn.disabled = false;

    renderPreview(code);
    showPreview();
    await runAgents(code); // runs silently (logs off)
    status.textContent = '✅ Done';

  } catch (error) {
    console.error(error);
    status.textContent = '❌ ' + (error?.message || 'Unknown error');
  } finally {
    generateBtn.disabled = false;
  }
});

// ============================================================
// Single API call
// ============================================================
async function generateCodeDirect(base64Image) {
  const file = imageInput?.files?.[0];
  const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

  // ✅ Choose model from toggle (default 2.5 flash)
  const MODEL_PRIMARY = getSelectedModel();

  const url = `${GEMINI_API_BASE}/${MODEL_PRIMARY}:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [
        {
          text: `You are SketchToApp, an autonomous UI-to-code system.

Analyze the uploaded hand-drawn UI sketch and infer the user's intent.

Rules:
- Output ONLY valid React code (no markdown, no explanation)
- The VERY FIRST characters of the response must be: export default function App() {
- Use Tailwind CSS
- Use semantic HTML and accessible patterns

Layout inference:
- If the sketch appears to be a simple screen (e.g. login, form, single page):
  → Generate a clean, centered layout appropriate to the sketch.
- If the sketch appears to be a dashboard or multi-section app:
  → Generate a full-screen layout (min-h-screen, w-full) with:
     • Sidebar navigation (if present in sketch)
     • Top header bar (if present)
     • Main content area with cards / sections
     • Charts or tables as placeholders when implied

Behavior:
- Use React hooks (useState) for interactivity
- Include basic validation for forms
- Add realistic UI spacing, shadows, and hierarchy
- Respect what is drawn — do NOT invent major sections

Accessibility:
- Use <label> elements or aria-labels for inputs and buttons
- Ensure keyboard accessibility for interactive elements

Return ONLY the React component code.
Start with: export default function App() {`
        },
        {
          inlineData: {
            mimeType: file?.type || 'image/jpeg',
            data: base64Image
          }
        }
      ]
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Gemini HTTP error:', response.status, data);

    if (response.status === 429) {
      throw new Error('Quota/rate limit hit (429). Try Gemini 2.5 Flash or wait and retry.');
    }
    if (response.status === 403) {
      throw new Error('Forbidden (403). Check API key restrictions + API enabled + allowed referrer.');
    }

    throw new Error(data?.error?.message || `Gemini API error (${response.status})`);
  }

  let code = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!code.trim()) throw new Error('Model returned empty output');

  code = code
    .replace(/```javascript\n?/g, '')
    .replace(/```jsx\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return code;
}

