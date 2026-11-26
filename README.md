# My Learning Studio (मेरा लर्निंग स्टूडियो)
### Complete Bilingual AI-Assisted Educational Video Maker for Visual Learners

**My Learning Studio** is a complete, local-first educational video creation studio built for parents and educators to design personalized, autism-friendly educational videos for visual and nonverbal learners (specifically tailored for a 12-year-old nonverbal autistic child).

The studio supports all educational topics, Hindi and English narration, 3D cartoon illustrations, realistic photographs, interactive animations, dual-language subtitles, and deterministic MP4 export with audio multiplexing.

---

## 🐧 Complete Linux Installation Guide

This guide covers installing and running My Learning Studio on **Ubuntu, Debian, Fedora, Arch Linux, and other Linux distributions**.

### 1. System Requirements
- **OS:** Linux (Ubuntu 20.04+, 22.04+, 24.04+ LTS, Debian 11+, Fedora 38+, Arch Linux)
- **Architecture:** x86_64 (amd64) or ARM64 (aarch64)
- **RAM:** 4 GB minimum (8 GB+ recommended for fast video rendering)
- **Disk:** 5 GB free disk space

---

### 2. Install System Dependencies

#### A. Ubuntu & Debian (Debian-based distros)
Open a terminal and run:
```bash
# 1. Update package lists
sudo apt-get update

# 2. Install FFmpeg, Git, curl, and build tools
sudo apt-get install -y ffmpeg git curl build-essential

# 3. Install Devanagari & Indian Fonts for Hindi Subtitles & UI
sudo apt-get install -y fonts-noto-core fonts-noto-extra fonts-deva

# 4. Install Google Chrome (or Chromium)
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg
echo "deb [arch=amd64,arm64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt-get update && sudo apt-get install -y google-chrome-stable
```

*(Note: If Google Chrome deb is unavailable on your specific ARM64 distro, install Chromium via `sudo apt-get install -y chromium-browser` or let the Puppeteer headless shell step below handle the browser engine automatically.)*

#### B. Fedora / RHEL (RPM-based distros)
```bash
sudo dnf update -y
sudo dnf install -y git ffmpeg ffmpeg-devel google-chrome-stable google-noto-sans-devanagari-fonts
```

#### C. Arch Linux / Manjaro
```bash
sudo pacman -Syu --noconfirm git ffmpeg noto-fonts noto-fonts-extra chromium
```

---

### 3. Install Node.js (v20+ or v24+)

Check your current Node.js version:
```bash
node -v
```

If Node.js is not installed or older than v20, install Node.js v24 LTS via NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Or using **nvm** (Node Version Manager):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 24
nvm use 24
```

---

### 4. Clone and Setup the Project

```bash
# Clone the repository
git clone https://github.com/gunjanj20000/mystudio.git
cd mystudio

# Install all npm dependencies
npm install

# Install Chrome Headless Shell for optimized beginFrame rendering (Deterministic 60/30fps capture)
npx -y @puppeteer/browsers install chrome-headless-shell@158.0.8127.88
```

---

### 5. Verify Installation & Dependencies

Run the HyperFrames environment doctor to verify that Node.js, FFmpeg, and Chrome are configured properly:
```bash
npx hyperframes doctor
```
Expected output:
```
✓ Node.js          v24.x
✓ FFmpeg           ffmpeg installed
✓ FFprobe          ffprobe installed
✓ Chrome           Headless Chrome detected
```

---

### 6. Run the Studio

#### Development Mode (Frontend + Backend concurrently):
```bash
npm run dev
```
This automatically launches:
- **Vite Web Client:** `http://localhost:5173`
- **Node.js Local Rendering & AI Proxy Service:** `http://localhost:3001`

Open `http://localhost:5173` in your browser.

#### Building for Production:
```bash
npm run build
```

#### Running Backend as a Persistent Service (PM2):
To keep the local studio rendering server running in the background:
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the studio backend
pm2 start "npx tsx server/index.ts" --name "learning-studio"

# Optional: save to system startup
pm2 save
pm2 startup
```

---

## 🌟 Key Capabilities & Architectural Pillars

### 1. Autism-Friendly "Calm Learning" Mode (शांत शिक्षण विधा)
Autistic visual learners thrive on structure, predictability, and sensory calmness:
- **One Main Concept Per Scene:** No visual clutter, busy sidebars, or competing animations.
- **Large High-Contrast Imagery & Devanagari Typography:** Noto Sans Devanagari and clean sans-serif typefaces.
- **Strict Seizure-Safe Standards:** Zero flashing effects, strobing lights, or sudden rapid camera movements.
- **Sensory Intensity Selector:** Toggle between **Extra Calm (Low)**, **Gentle**, and **Standard** modes.
- **Prominent Repeat Controls:** Dedicated **Repeat Scene (दृश्य दोबारा देखें)** and **Repeat Narration (आवाज दोबारा सुनें)** buttons.
- **Pacing & Reflection:** Optional visual countdown circle between scenes allowing processing time before the next step begins.
- **Praise & Positive Reinforcement:** Soft, harmonious pentatonic chimes with celebration cards.

### 2. Complete Bilingual Voice Studio (द्विभाषी आवाज स्टूडियो)
- **Hindi Narration:** Natural speech synthesis in Hindi (`hi-IN`) and support for prerecorded Hindi voice tracks.
- **English Narration:** Clear, calm narration in English (`en-US` / `en-IN`).
- **Dual Bilingual Narration:** Automatically presents Hindi narration followed by English explanations.
- **Pacing Control:** Fine-tune speech rate (0.7x, 0.85x, 1.0x).
- **Custom Narration:** Upload MP3/WAV files or record live with a single click using your microphone.
- **Parent Approval:** Lock and verify audio tracks prior to final video export.

### 3. Reusable Character Library & Visual Consistency
- Store consistent character profiles across scenes:
  - **Aarav (आरव)** – 12-year-old calm learner wearing a comfortable sky-blue shirt.
  - **Priya (प्रिया)** – Gentle supportive sister with warm, reassuring guidance.
  - **Milo the Elephant (हाथी नीलू)** – Friendly cartoon animal guide demonstrating activities slowly.
- Maintain consistent clothing, hair, colors, and personality cues.

### 4. Interactive Animation Engine & Ready-Made Templates
- **Brushing Teeth:** Animated brush moving gently across sparkling clean teeth.
- **Elephant Moving Trunk:** Playful, friendly elephant waving its trunk.
- **Plant Growth:** Seed sprouting from earth and growing tall with green leaves.
- **Traffic Light:** Sequenced calm transition between Red (Stop), Yellow (Wait), and Green (Go).
- **Bouncing Ball:** Rhythmic gentle squash-and-stretch bounce.
- **Water Flowing:** Water stream pouring smoothly from tap into sink with ripples.
- **Hand Washing:** Soap bubbles gently lathering on palms.

### 5. Deterministic Video Export (HyperFrames & FFmpeg)
- **Primary Engine:** Local Node.js service using **HyperFrames** and **headless Chrome** for frame-by-frame capture, multiplexed with **FFmpeg** into H.264 video with stereo AAC audio.
- **Fallback Engine:** In-browser Canvas `captureStream()` + Web Audio `MediaRecorder` fallback for instant offline rendering without external dependencies.
- **Format:** 1920x1080 (Full HD) and 1280x720 (HD) at 25 or 30 FPS.
- **Verification:** Every render is verified with `ffprobe` to ensure valid playable streams before marking complete.

### 6. Local-First & Zero Paid API Dependency
- **100% Functional Offline:** Built-in educational story generator, curated image catalog, local SVG animations, browser TTS voices, and Dexie.js IndexedDB storage.
- **AI Integration (Optional):** Provider-independent adapter architecture supporting:
  - **DeepSeek:** Native integration with DeepSeek Chat (`deepseek-chat`) and DeepSeek Reasoner (`deepseek-reasoner`) via `https://api.deepseek.com`.
  - **OpenRouter:** Flexible access to hundreds of open and frontier models (DeepSeek, Llama 3, Claude, Mistral) via `https://openrouter.ai`.
  - **OpenAI:** GPT-4o, DALL-E 3, and OpenAI Text-to-Speech.
  - **Google Gemini & Anthropic Claude:** Optional story generation.
  - **ElevenLabs:** Ultra-expressive voice narration.
- **Privacy & Security:** API keys are stored only locally in the browser's IndexedDB and proxied securely via the local Node.js backend. Zero API keys are hardcoded.

---

## 🛠 Project Structure

```
studio/
├── index.html                   # HTML entrypoint with Devanagari fonts
├── package.json                 # Project scripts and dependencies
├── tailwind.config.js           # Tailwind theme with Autism-Calm palette
├── vite.config.ts               # Vite configuration with /api backend proxy
├── server/
│   └── index.ts                 # Express rendering service (HyperFrames + FFmpeg)
├── src/
│   ├── main.tsx                 # React DOM root
│   ├── App.tsx                  # App initialisation & Dexie seed data
│   ├── db/
│   │   └── index.ts             # Dexie.js database schema & offline seed data
│   ├── types/
│   │   └── index.ts             # Complete TypeScript interfaces
│   ├── services/
│   │   ├── audio/index.ts       # Web Audio API synthesizers & SpeechSynthesis
│   │   ├── ai/index.ts          # AI adapter & offline educational generator
│   │   └── render/
│   │       ├── serverRenderer.ts # HyperFrames server client
│   │       └── browserRenderer.ts# Canvas captureStream fallback
│   └── components/
│       ├── dashboard/           # Main studio hub & project manager
│       ├── wizard/              # 4-step guided creation wizard
│       ├── editor/              # 4-panel visual scene editor & timeline
│       ├── presentation/        # Autism Calm Learning presentation player
│       ├── animation/           # Animation templates (teeth, plants, elephant, etc.)
│       ├── voice/               # Bilingual voice studio & microphone recorder
│       ├── characters/          # Reusable character consistency library
│       ├── images/              # Visual assets & uploads catalog
│       ├── templates/           # Video templates (hygiene, social, science)
│       ├── export/              # MP4 export modal & progress tracker
│       └── settings/            # AI provider keys & sensory defaults
└── renders/                     # Output directory for exported MP4 videos
```

---

## 📋 Recommended Educational Workflows

1. **Create via Wizard:**
   - Tap **"Create New Video"**.
   - Select a topic (e.g. *Brushing teeth*, *Washing hands*, *Traffic safety*, *Understanding emotions*).
   - Configure Language (Hindi + English), Duration (3 min), and Visual Style.
   - Click **Generate Script** to receive a concrete step-by-step breakdown.
   - Review and approve the narration sentences.

2. **Fine-tune in Scene Editor:**
   - Select any scene from the left panel.
   - Use the **Voice** tab to preview pronunciation.
   - Switch between ready-made animation templates (e.g. *Brushing Teeth* animation with moving bristles).
   - Insert characters like *Aarav* or *Milo* from the library.

3. **Present to the Child in Calm Mode:**
   - Click **"Calm Learning Presentation"**.
   - Enjoy fullscreen distraction-free playback with large text, visual countdowns between steps, and instant repeat buttons.

4. **Export Finished MP4:**
   - Click **"Export MP4"**.
   - Choose resolution (1080p or 720p) and engine (**HyperFrames + FFmpeg**).
   - Track progress and preview the finished playable video with embedded audio.
   - Download the file to any phone, tablet, or TV for offline viewing.

---

## 🔒 Privacy & Safety
All projects, scenes, images, audio, and character data remain entirely local to your device in IndexedDB. No audio or project data is sent to external servers unless you explicitly configure an external AI provider API key.
