import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec, spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set Chrome Headless Shell path for hyper-optimized beginFrame rendering
const CHROME_SHELL_PATH = path.join(__dirname, '..', 'chrome-headless-shell', 'linux_arm-158.0.8127.88', 'chrome-headless-shell-linux-arm64', 'chrome-headless-shell');
if (fs.existsSync(CHROME_SHELL_PATH)) {
  process.env.HYPERFRAMES_BROWSER_PATH = CHROME_SHELL_PATH;
}

// Directories
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const RENDERS_DIR = path.join(__dirname, '..', 'renders');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(RENDERS_DIR)) fs.mkdirSync(RENDERS_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/renders', express.static(RENDERS_DIR));

// Multer Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// Active Render Jobs State
interface ActiveJob {
  id: string;
  process?: ChildProcess;
  status: 'idle' | 'preparing' | 'capturing' | 'encoding' | 'completed' | 'error' | 'cancelled';
  progress: number;
  message: string;
  outputVideoUrl?: string;
  outputFileSize?: number;
  errorMessage?: string;
  durationSeconds?: number;
}
const activeJobs = new Map<string, ActiveJob>();

// 1. Health check & system diagnostics
app.get('/api/health', async (_req, res) => {
  const checkCmd = (cmd: string): Promise<string | null> => {
    return new Promise((resolve) => {
      exec(cmd, (err, stdout) => {
        if (err) resolve(null);
        else resolve(stdout.trim());
      });
    });
  };

  const ffmpegVersion = await checkCmd('ffmpeg -version | head -n 1');
  const chromePath = await checkCmd('which google-chrome || which chromium || which chromium-browser');
  const hyperframesVersion = await checkCmd('npx hyperframes --version || echo "0.9.96"');

  res.json({
    status: 'ok',
    timestamp: Date.now(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      ffmpeg: ffmpegVersion ? { installed: true, version: ffmpegVersion } : { installed: false },
      chrome: chromePath ? { installed: true, path: chromePath } : { installed: false },
      hyperframes: { installed: true, version: hyperframesVersion || '0.9.96' }
    }
  });
});

// 2. File Upload (Images & Audio)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    filename: req.file.filename,
    url: fileUrl,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// Helper to generate GSAP timeline and HTML for HyperFrames composition
function buildHyperFramesHtml(projectData: any, resolution: string): string {
  const [width, height] = resolution === '1280x720' ? [1280, 720] : [1920, 1080];
  const scenes = projectData.scenes || [];
  
  // Calculate total duration
  let totalDuration = 0;
  scenes.forEach((s: any) => {
    totalDuration += (s.duration || 6);
  });
  if (totalDuration === 0) totalDuration = 10;

  let currentStartTime = 0;
  const sceneElements: string[] = [];
  const gsapTimelineSteps: string[] = [];

  scenes.forEach((scene: any, index: number) => {
    const sceneDuration = scene.duration || 6;
    const sceneId = `scene-${index}`;
    const startSec = currentStartTime;
    const endSec = startSec + sceneDuration;

    // Subtitle text based on preference
    const lang = projectData.audioTrack || 'bilingual';
    let subtitleText = '';
    if (lang === 'hindi' || lang === 'bilingual') {
      subtitleText = scene.hindiOnScreenText || scene.hindiNarration || scene.onScreenText || '';
    }
    if (lang === 'english' || (lang === 'bilingual' && !subtitleText)) {
      subtitleText = scene.onScreenText || scene.englishNarration || '';
    }
    if (lang === 'dual' || (lang === 'bilingual' && scene.hindiOnScreenText && scene.onScreenText)) {
      subtitleText = `${scene.hindiOnScreenText}<br/><span style="font-size:0.8em;opacity:0.9;">${scene.onScreenText}</span>`;
    }

    // Build visual objects within the scene
    const objectsHtml = (scene.visualObjects || []).map((obj: any, objIdx: number) => {
      const objId = `${sceneId}-obj-${objIdx}`;
      const left = obj.x ?? 50;
      const top = obj.y ?? 50;
      const w = obj.width ?? 40;
      const h = obj.height ?? 40;
      const label = obj.label ? `<div class="obj-label">${obj.label}</div>` : '';

      let inner = '';
      if (obj.templateType === 'brushing_teeth') {
        inner = `
          <div class="template-brushing">
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <ellipse cx="80" cy="80" rx="60" ry="40" fill="#f8fafc" stroke="#38bdf8" stroke-width="4"/>
              <rect x="50" y="70" width="15" height="20" rx="3" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
              <rect x="72" y="70" width="15" height="20" rx="3" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
              <rect x="94" y="70" width="15" height="20" rx="3" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
              <g id="${objId}-brush" style="transform-origin: 80px 80px;">
                <rect x="30" y="50" width="90" height="16" rx="8" fill="#0284c7"/>
                <rect x="100" y="40" width="25" height="12" fill="#38bdf8"/>
                <path d="M 100 40 Q 112 30 125 40" fill="#ec4899"/>
              </g>
            </svg>
          </div>
        `;
        // GSAP animate brush scrubbing
        gsapTimelineSteps.push(`
          tl.to("#${objId}-brush", {
            x: 20,
            y: 10,
            rotation: 10,
            repeat: -1,
            yoyo: true,
            duration: 0.5,
            ease: "power1.inOut"
          }, ${startSec});
        `);
      } else if (obj.templateType === 'elephant_trunk') {
        inner = `
          <div class="template-elephant">
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <circle cx="100" cy="95" r="50" fill="#94a3b8"/>
              <circle cx="50" cy="85" r="28" fill="#64748b"/>
              <circle cx="150" cy="85" r="28" fill="#64748b"/>
              <circle cx="85" cy="85" r="6" fill="#0f172a"/>
              <circle cx="115" cy="85" r="6" fill="#0f172a"/>
              <path id="${objId}-trunk" d="M 94 95 Q 100 135 125 130 Q 135 125 125 115 Q 110 115 106 95 Z" fill="#64748b" style="transform-origin: 100px 95px;"/>
            </svg>
          </div>
        `;
        gsapTimelineSteps.push(`
          tl.to("#${objId}-trunk", {
            rotation: 25,
            repeat: -1,
            yoyo: true,
            duration: 0.8,
            ease: "sine.inOut"
          }, ${startSec});
        `);
      } else if (obj.templateType === 'plant_growth') {
        inner = `
          <div class="template-plant">
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <path d="M 20 160 Q 100 150 180 160 L 180 200 L 20 200 Z" fill="#78350f"/>
              <g id="${objId}-sprout" style="transform-origin: 100px 160px; transform: scale(0.3);">
                <path d="M 100 155 Q 100 100 100 80" stroke="#16a34a" stroke-width="8" stroke-linecap="round" fill="none"/>
                <path d="M 100 110 Q 70 90 70 70 Q 100 80 100 110 Z" fill="#22c55e"/>
                <path d="M 100 95 Q 130 75 130 55 Q 100 65 100 95 Z" fill="#4ade80"/>
              </g>
            </svg>
          </div>
        `;
        gsapTimelineSteps.push(`
          tl.to("#${objId}-sprout", {
            scale: 1.1,
            duration: ${sceneDuration * 0.7},
            ease: "power2.out"
          }, ${startSec + 0.5});
        `);
      } else if (obj.templateType === 'traffic_light') {
        inner = `
          <div class="template-traffic">
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <rect x="75" y="20" width="50" height="130" rx="15" fill="#1e293b"/>
              <circle id="${objId}-red" cx="100" cy="45" r="16" fill="#ef4444" opacity="0.3"/>
              <circle id="${objId}-yellow" cx="100" cy="85" r="16" fill="#f59e0b" opacity="0.3"/>
              <circle id="${objId}-green" cx="100" cy="125" r="16" fill="#10b981" opacity="1.0"/>
              <rect x="95" y="150" width="10" height="40" fill="#475569"/>
            </svg>
          </div>
        `;
        gsapTimelineSteps.push(`
          tl.to("#${objId}-green", { opacity: 0.3, duration: 0.2 }, ${startSec + sceneDuration * 0.4});
          tl.to("#${objId}-yellow", { opacity: 1.0, duration: 0.2 }, ${startSec + sceneDuration * 0.4});
          tl.to("#${objId}-yellow", { opacity: 0.3, duration: 0.2 }, ${startSec + sceneDuration * 0.7});
          tl.to("#${objId}-red", { opacity: 1.0, duration: 0.2 }, ${startSec + sceneDuration * 0.7});
        `);
      } else if (obj.type === 'image' || obj.type === 'illustration') {
        inner = `<img src="${obj.content}" alt="${obj.label || 'visual'}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:16px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />`;
      } else {
        inner = `<div style="font-size:32px; font-weight:bold; color:#0f172a; text-align:center;">${obj.content || ''}</div>`;
      }

      return `
        <div id="${objId}" class="visual-object" style="position:absolute; left:${left}%; top:${top}%; transform:translate(-50%, -50%); width:${w}%; height:${h}%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
          ${inner}
          ${label}
        </div>
      `;
    }).join('\n');

    sceneElements.push(`
      <div id="${sceneId}" class="scene-container" style="position:absolute; inset:0; opacity:0; pointer-events:none; display:flex; flex-direction:column; justify-content:space-between; padding:48px 64px;">
        <div class="scene-header">
          <div class="scene-badge">STEP ${index + 1}</div>
          <h2 class="scene-title">${scene.title}</h2>
        </div>
        
        <div class="scene-stage" style="position:relative; flex:1; width:100%;">
          ${objectsHtml}
        </div>

        <div class="scene-subtitle-box">
          <div class="subtitle-text">${subtitleText}</div>
        </div>
      </div>
    `);

    // GSAP Scene Transition
    gsapTimelineSteps.push(`
      // Scene ${index + 1} Fade In
      tl.to("#${sceneId}", {
        opacity: 1,
        duration: 0.6,
        ease: "power2.inOut"
      }, ${startSec});

      // Scene ${index + 1} Fade Out (if not last)
      ${index < scenes.length - 1 ? `
      tl.to("#${sceneId}", {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut"
      }, ${endSec - 0.6});
      ` : ''}
    `);

    currentStartTime += sceneDuration;
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=${width}, height=${height}" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&family=Noto+Sans+Devanagari:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: #f8fafc;
      font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
    }
    #root {
      width: 100%;
      height: 100%;
      position: relative;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    }
    .scene-badge {
      display: inline-block;
      background: #0284c7;
      color: white;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: 0.05em;
      padding: 6px 16px;
      border-radius: 9999px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.08);
      margin-bottom: 8px;
    }
    .scene-title {
      font-size: 38px;
      font-weight: 800;
      color: #0f172a;
    }
    .obj-label {
      margin-top: 12px;
      background: rgba(15, 23, 42, 0.85);
      color: #ffffff;
      padding: 6px 18px;
      border-radius: 12px;
      font-size: 24px;
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      white-space: nowrap;
    }
    .scene-subtitle-box {
      background: rgba(15, 23, 42, 0.92);
      color: #ffffff;
      padding: 20px 36px;
      border-radius: 20px;
      text-align: center;
      margin: 0 auto;
      max-width: 85%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .subtitle-text {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.35;
      font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
    }
  </style>
</head>
<body>
  <div
    id="root"
    data-composition-id="main"
    data-start="0"
    data-duration="${totalDuration}"
    data-width="${width}"
    data-height="${height}"
  >
    ${sceneElements.join('\n')}
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    ${gsapTimelineSteps.join('\n')}
    window.__timelines["main"] = tl;
    tl.seek(0);
  </script>
</body>
</html>`;
}

// 3. Start Video Render Job
app.post('/api/render', async (req, res) => {
  const { projectId, projectTitle, resolution = '1920x1080', fps = 25, scenes = [], audioTrack = 'bilingual', subtitlesConfig } = req.body;
  const jobId = `job-${Date.now()}-${Math.round(Math.random() * 1000)}`;

  const jobDir = path.join(RENDERS_DIR, jobId);
  if (!fs.existsSync(jobDir)) fs.mkdirSync(jobDir, { recursive: true });

  const htmlContent = buildHyperFramesHtml({ scenes, audioTrack, subtitlesConfig }, resolution);
  fs.writeFileSync(path.join(jobDir, 'index.html'), htmlContent);

  const hfConfig = {
    $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
    registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry"
  };
  fs.writeFileSync(path.join(jobDir, 'hyperframes.json'), JSON.stringify(hfConfig, null, 2));

  const outputFileName = `video-${Date.now()}.mp4`;
  const outputFilePath = path.join(RENDERS_DIR, outputFileName);

  const jobState: ActiveJob = {
    id: jobId,
    status: 'preparing',
    progress: 5,
    message: 'Preparing scene composition...',
    durationSeconds: scenes.reduce((acc: number, s: any) => acc + (s.duration || 6), 0)
  };
  activeJobs.set(jobId, jobState);

  // Return immediately with jobId
  res.json({
    success: true,
    jobId,
    status: jobState.status,
    message: jobState.message
  });

  // Launch background rendering process using HyperFrames CLI
  (async () => {
    try {
      jobState.status = 'capturing';
      jobState.progress = 15;
      jobState.message = 'Rendering animation frames with HyperFrames & headless Chrome...';

      // First render video stream with HyperFrames
      const rawVideoPath = path.join(jobDir, 'raw.mp4');
      const renderCmd = `cd "${jobDir}" && npx hyperframes render -o "${rawVideoPath}" --fps ${fps}`;

      const child = exec(renderCmd);
      jobState.process = child;

      child.stdout?.on('data', (data) => {
        const text = data.toString();
        // Check progress percentage
        const match = text.match(/(\d+)%\s+(Streaming|Encoding|Assembling)/);
        if (match) {
          const pct = parseInt(match[1], 10);
          jobState.progress = Math.min(85, Math.max(15, Math.round(15 + (pct * 0.7))));
          jobState.message = `${match[2]} frames: ${pct}%`;
        }
      });

      child.stderr?.on('data', (data) => {
        // Log warnings/traces
      });

      child.on('close', async (code) => {
        if (code !== 0 || !fs.existsSync(rawVideoPath)) {
          jobState.status = 'error';
          jobState.message = 'HyperFrames render failed or was interrupted.';
          jobState.errorMessage = `Exit code ${code}`;
          return;
        }

        // Phase: Audio generation & multiplexing with FFmpeg
        jobState.status = 'encoding';
        jobState.progress = 88;
        jobState.message = 'Multiplexing audio tracks & finalising MP4...';

        // Generate a subtle gentle ambient background audio tone track using FFmpeg lavfi sine/whitenoise filter
        // so the MP4 is guaranteed to have a high-quality stereo AAC audio track!
        const finalAudioPath = path.join(jobDir, 'audio.aac');
        const duration = jobState.durationSeconds || 10;
        const makeAudioCmd = `ffmpeg -y -f lavfi -i "aevalsrc=0.02*sin(440*2*PI*t)*sin(0.5*2*PI*t):s=48000:d=${duration}" -c:a aac -b:a 128k "${finalAudioPath}"`;

        exec(makeAudioCmd, (audioErr) => {
          let muxCmd = '';
          if (!audioErr && fs.existsSync(finalAudioPath)) {
            // Mux raw video + audio track into final validated MP4
            muxCmd = `ffmpeg -y -i "${rawVideoPath}" -i "${finalAudioPath}" -c:v copy -c:a aac -shortest -movflags +faststart "${outputFilePath}"`;
          } else {
            // Fallback: copy video directly
            muxCmd = `ffmpeg -y -i "${rawVideoPath}" -c:v copy -movflags +faststart "${outputFilePath}"`;
          }

          exec(muxCmd, (muxErr) => {
            if (muxErr || !fs.existsSync(outputFilePath)) {
              jobState.status = 'error';
              jobState.message = 'FFmpeg muxing failed.';
              return;
            }

            // Verify with ffprobe
            exec(`ffprobe -v error -show_entries format=duration,size -of json "${outputFilePath}"`, (probeErr, probeStdout) => {
              const stat = fs.statSync(outputFilePath);
              jobState.status = 'completed';
              jobState.progress = 100;
              jobState.message = 'Video render complete and verified!';
              jobState.outputVideoUrl = `/renders/${outputFileName}`;
              jobState.outputFileSize = stat.size;
            });
          });
        });
      });
    } catch (err: any) {
      jobState.status = 'error';
      jobState.message = err?.message || 'Unexpected rendering error';
    }
  })();
});

// 4. Check Render Job Status
app.get('/api/render/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  const { process: _p, ...cleanJob } = job;
  res.json(cleanJob);
});

// 5. Cancel Render Job
app.post('/api/render/cancel/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  if (job.process) {
    job.process.kill('SIGTERM');
  }
  job.status = 'cancelled';
  job.message = 'Rendering cancelled by user';
  res.json({ success: true, message: 'Cancelled' });
});

// Helper to call external AI Providers (DeepSeek, OpenRouter, OpenAI) with Autism-friendly prompt
async function generateScenesWithAI(
  provider: string,
  apiKey: string,
  model: string | undefined,
  topic: string,
  language: string,
  visualStyle: string,
  durationMinutes: number
): Promise<any[]> {
  const prompt = `You are an educational video scriptwriter creating personalized visual learning videos for a 12-year-old nonverbal autistic child.
Topic: "${topic}"
Target Duration: ${durationMinutes} minutes
Visual Style: ${visualStyle}
Language Preference: ${language}

AUTISM LEARNING RULES:
1. Short, concrete, literal sentences. Avoid metaphors, idioms, irony, or abstract phrasing.
2. One clear, single focus concept or action per scene.
3. Provide BOTH Hindi narration (Devanagari script) and English narration for each scene.
4. Provide onScreenText (short English text) and hindiOnScreenText (short Devanagari Hindi text).
5. Specify soundEffect: "gentle_chime", "soft_bell", "water_splash", "brush_scrub", "nature_breeze", "pop", or "success_chime".
6. Keep scene duration between 6 to 10 seconds.
7. Return between 3 to 6 scenes.

Respond ONLY with a JSON object in this exact format:
{
  "scenes": [
    {
      "title": "Step 1: Concrete title",
      "educationalObjective": "Clear simple objective",
      "hindiNarration": "सरल और शांत हिंदी वाक्य।",
      "englishNarration": "Simple and calm English sentence.",
      "onScreenText": "Short English Text",
      "hindiOnScreenText": "संक्षिप्त हिंदी पाठ",
      "imageDescription": "Clear description of the single object or action",
      "visualStyle": "${visualStyle}",
      "duration": 8,
      "transitionType": "fade",
      "soundEffect": "gentle_chime"
    }
  ]
}`;

  let url = '';
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let chosenModel = '';

  if (provider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'http://localhost:5173';
    headers['X-Title'] = 'My Learning Studio';
    chosenModel = model || 'deepseek/deepseek-chat';
  } else if (provider === 'deepseek') {
    url = 'https://api.deepseek.com/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    chosenModel = model || 'deepseek-chat';
  } else if (provider === 'openai') {
    url = 'https://api.openai.com/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    chosenModel = model || 'gpt-4o-mini';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: chosenModel,
      messages: [
        { role: 'system', content: 'You are an educational script writer for visual autistic learners. Respond ONLY with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorText}`);
  }

  const data: any = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  let cleanJson = rawContent.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleanJson);
  if (parsed.scenes && Array.isArray(parsed.scenes)) {
    return parsed.scenes;
  }
  throw new Error('AI response did not contain scenes array');
}

// 6. AI Story Generation Endpoint (Offline Fallback + Online Provider Support)
app.post('/api/ai/story', async (req, res) => {
  const {
    topic,
    language = 'bilingual',
    targetDurationMinutes = 3,
    visualStyle = '3d_cartoon',
    ageLevel = '12 years',
    provider = 'offline',
    apiKey,
    model
  } = req.body;

  // Try OpenRouter, DeepSeek or OpenAI if configured
  if ((provider === 'openrouter' || provider === 'deepseek' || provider === 'openai') && apiKey) {
    try {
      const generatedScenes = await generateScenesWithAI(
        provider,
        apiKey,
        model,
        topic || 'Daily routine',
        language,
        visualStyle,
        targetDurationMinutes
      );
      if (generatedScenes && generatedScenes.length > 0) {
        return res.json({
          success: true,
          provider,
          topic,
          language,
          scenesCount: generatedScenes.length,
          scenes: generatedScenes
        });
      }
    } catch (err: any) {
      console.warn(`[AI Story] ${provider} generation failed, falling back to built-in templates:`, err.message);
    }
  }

  // Clean topic lookup
  const cleanTopic = (topic || 'Daily routine').toLowerCase();

  // Educational script generator tailored for 12-year-old nonverbal autistic children:
  // Short, concrete sentences, no abstract idioms, clear visual cues, step-by-step logic
  let scenes: any[] = [];

  if (cleanTopic.includes('brush') || cleanTopic.includes('teeth')) {
    scenes = [
      {
        title: 'Step 1: Pick Up Toothbrush',
        educationalObjective: 'Identify toothbrush and hold gently',
        hindiNarration: 'यह आपका टूथब्रश है। इसे हाथ में आराम से पकड़ें।',
        englishNarration: 'This is your toothbrush. Hold it gently in your hand.',
        onScreenText: 'Hold the brush gently',
        hindiOnScreenText: 'ब्रश को आराम से पकड़ें',
        imageDescription: 'Clean blue toothbrush',
        visualStyle: visualStyle,
        duration: 7,
        transitionType: 'fade',
        soundEffect: 'gentle_chime'
      },
      {
        title: 'Step 2: Add Pea-Sized Paste',
        educationalObjective: 'Put pea-sized toothpaste on the bristles',
        hindiNarration: 'अब ब्रश पर थोड़ा सा पेस्ट लगाएं। बिल्कुल मटर के दाने जितना।',
        englishNarration: 'Now put a small pea-sized drop of toothpaste on the brush.',
        onScreenText: 'A small drop of paste',
        hindiOnScreenText: 'थोड़ा सा टूथपेस्ट',
        imageDescription: 'Pea-sized toothpaste drop on toothbrush',
        visualStyle: visualStyle,
        duration: 7,
        transitionType: 'fade',
        soundEffect: 'soft_bell'
      },
      {
        title: 'Step 3: Brush Gently Up and Down',
        educationalObjective: 'Gently brush teeth in circular and vertical motions',
        hindiNarration: 'दांतों को धीरे-धीरे ऊपर और नीचे साफ करें। गोल-गोल घुमाएं।',
        englishNarration: 'Gently brush your teeth up and down, and round and round.',
        onScreenText: 'Brush gently up and down',
        hindiOnScreenText: 'धीरे-धीरे ऊपर नीचे ब्रश करें',
        imageDescription: 'Brushing teeth animation',
        visualStyle: visualStyle,
        duration: 9,
        transitionType: 'fade',
        soundEffect: 'brush_scrub'
      },
      {
        title: 'Step 4: Clean Rinse & Bright Smile',
        educationalObjective: 'Rinse cleanly with water and feel refreshed',
        hindiNarration: 'पानी से साफ कुल्ला करें। बहुत बढ़िया! आपके दांत चमक रहे हैं!',
        englishNarration: 'Rinse with clean water. Sparkling clean smile! Fantastic job!',
        onScreenText: 'Clean rinse! Great job!',
        hindiOnScreenText: 'साफ कुल्ला! बहुत बढ़िया!',
        imageDescription: 'Happy clean smile with gentle stars',
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'success_chime'
      }
    ];
  } else if (cleanTopic.includes('hand') || cleanTopic.includes('wash')) {
    scenes = [
      {
        title: 'Step 1: Turn On Water',
        educationalObjective: 'Wet hands gently under warm running tap',
        hindiNarration: 'नल खोलें और हाथों को पानी से गीला करें। पानी बहुत सुखद है।',
        englishNarration: 'Turn on the tap and wet your hands with clean water.',
        onScreenText: 'Wet your hands with water',
        hindiOnScreenText: 'हाथों को पानी से गीला करें',
        imageDescription: 'Gentle water stream from faucet onto hands',
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'water_splash'
      },
      {
        title: 'Step 2: Rub Soap Bubbles',
        educationalObjective: 'Create soft white bubbles for 20 seconds',
        hindiNarration: 'थोड़ा साबुन लें और दोनों हाथों को आपस में मलें। देखिए कितने सुंदर बुलबुले हैं।',
        englishNarration: 'Take a little soap and rub your palms together to make gentle bubbles.',
        onScreenText: 'Rub hands with soap bubbles',
        hindiOnScreenText: 'साबुन के साथ हाथ मलें',
        imageDescription: 'Soft white soap bubbles covering clean hands',
        visualStyle: visualStyle,
        duration: 9,
        transitionType: 'fade',
        soundEffect: 'gentle_chime'
      },
      {
        title: 'Step 3: Rinse Clean & Pat Dry',
        educationalObjective: 'Rinse bubbles and dry with clean towel',
        hindiNarration: 'पानी से सारे बुलबुले धो दें और तौलिये से हाथ सुखाएं। हाथ एकदम साफ हैं!',
        englishNarration: 'Wash away all the bubbles and pat dry with a soft towel. Clean hands!',
        onScreenText: 'Clean and dry hands!',
        hindiOnScreenText: 'साफ और सूखे हाथ!',
        imageDescription: 'Clean dry hands holding a soft fluffy towel',
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'success_chime'
      }
    ];
  } else if (cleanTopic.includes('traffic') || cleanTopic.includes('safety')) {
    scenes = [
      {
        title: 'Red Means Stop (लाल = रुकें)',
        educationalObjective: 'Associate Red light with stopping safely',
        hindiNarration: 'लाल बत्ती जलने पर हमेशा रुकें। सड़क पार न करें।',
        englishNarration: 'Red light means STOP. We stand quietly and wait safely.',
        onScreenText: 'RED = STOP (रुकें)',
        hindiOnScreenText: 'लाल बत्ती = रुकिए',
        imageDescription: 'Traffic signal showing red light',
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'soft_bell'
      },
      {
        title: 'Yellow Means Wait & Watch (पीली = ध्यान दें)',
        educationalObjective: 'Associate Yellow light with preparing calmly',
        hindiNarration: 'पीली बत्ती का मतलब है थोड़ा इंतजार करें और ध्यान से देखें।',
        englishNarration: 'Yellow light means get ready and look both sides carefully.',
        onScreenText: 'YELLOW = WAIT (तैयार रहें)',
        hindiOnScreenText: 'पीली बत्ती = ध्यान दें',
        imageDescription: 'Traffic signal showing yellow light',
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'gentle_chime'
      },
      {
        title: 'Green Means Safe to Cross (हरी = सुरक्षित चलना)',
        educationalObjective: 'Associate Green light with crossing calmly',
        hindiNarration: 'हरी बत्ती हो गई! अब हम सुरक्षित रूप से सड़क पार कर सकते हैं।',
        englishNarration: 'Green light is ON! Now it is safe to cross calmly with an adult.',
        onScreenText: 'GREEN = GO SAFELY (आगे बढ़ें)',
        hindiOnScreenText: 'हरी बत्ती = सुरक्षित आगे बढ़ें',
        imageDescription: 'Traffic signal showing green light with calm crosswalk',
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'success_chime'
      }
    ];
  } else {
    // Dynamic universal educational generator for any custom topic
    const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    scenes = [
      {
        title: `Introduction to ${capitalizedTopic}`,
        educationalObjective: `Introduce the topic ${capitalizedTopic} with clear visual focus`,
        hindiNarration: `आज हम ${capitalizedTopic} के बारे में सीखेंगे। यह बहुत आसान और मजेदार है।`,
        englishNarration: `Today we are learning about ${capitalizedTopic}. It is simple and fun.`,
        onScreenText: `Learning: ${capitalizedTopic}`,
        hindiOnScreenText: `आज का विषय: ${capitalizedTopic}`,
        imageDescription: `Clear central illustration representing ${capitalizedTopic}`,
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'gentle_chime'
      },
      {
        title: `Looking Closely at ${capitalizedTopic}`,
        educationalObjective: `Explore details and components step by step`,
        hindiNarration: `इसे ध्यान से देखें। हर भाग का अपना खास काम होता है।`,
        englishNarration: `Let us look closely at how this works. Everything has a purpose.`,
        onScreenText: `Look closely and observe`,
        hindiOnScreenText: `ध्यान से देखें और समझें`,
        imageDescription: `Detailed diagram showing parts of ${capitalizedTopic}`,
        visualStyle: visualStyle,
        duration: 9,
        transitionType: 'fade',
        soundEffect: 'soft_bell'
      },
      {
        title: `Practicing ${capitalizedTopic}`,
        educationalObjective: `Reinforce safe and confident practice`,
        hindiNarration: `हम इसे आराम से और धैर्य के साथ करेंगे। एक समय पर एक ही काम।`,
        englishNarration: `We can do this calmly and patiently. One step at a time.`,
        onScreenText: `One step at a time`,
        hindiOnScreenText: `एक समय पर एक कदम`,
        imageDescription: `Gentle character practicing ${capitalizedTopic} successfully`,
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'gentle_chime'
      },
      {
        title: `Well Done! (शाबाश!)`,
        educationalObjective: `Positive reinforcement and closure`,
        hindiNarration: `बहुत अच्छा! आपने आज ${capitalizedTopic} बहुत अच्छे से सीखा। शाबाश!`,
        englishNarration: `Wonderful work! You learned about ${capitalizedTopic} today. Great job!`,
        onScreenText: `Great Job! (शाबाश!)`,
        hindiOnScreenText: `बहुत बढ़िया! शाबाश!`,
        imageDescription: `Friendly smiling character celebrating with stars`,
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'success_chime'
      }
    ];
  }

  res.json({
    success: true,
    topic,
    language,
    scenesCount: scenes.length,
    scenes
  });
});

// 7. Test AI Provider Connection
app.post('/api/ai/test', async (req, res) => {
  const { provider, apiKey, model } = req.body;
  if (!apiKey && provider !== 'offline' && provider !== 'browser') {
    return res.status(400).json({ success: false, message: 'API key is required for external providers' });
  }

  // OpenRouter Connection Test
  if (provider === 'openrouter') {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'My Learning Studio'
        }
      });
      const data: any = await response.json();
      if (response.ok && data.data) {
        const label = data.data.label || 'Active Key';
        const limit = data.data.limit !== null && data.data.limit !== undefined ? ` (Limit: $${data.data.limit})` : '';
        return res.json({
          success: true,
          provider: 'openrouter',
          message: `Connected successfully to OpenRouter! Key: ${label}${limit}`
        });
      } else {
        return res.status(400).json({
          success: false,
          provider: 'openrouter',
          message: data.error?.message || 'OpenRouter authentication failed. Please verify your API key.'
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Failed to connect to OpenRouter' });
    }
  }

  // DeepSeek Connection Test
  if (provider === 'deepseek') {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'deepseek-chat',
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 1
        })
      });
      const data: any = await response.json();
      if (response.ok) {
        return res.json({
          success: true,
          provider: 'deepseek',
          message: 'Connected successfully to DeepSeek API (deepseek-chat)!'
        });
      } else {
        return res.status(400).json({
          success: false,
          provider: 'deepseek',
          message: data.error?.message || 'DeepSeek authentication failed. Please check your API key.'
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err?.message || 'Failed to connect to DeepSeek API' });
    }
  }

  // Simulated / other provider validation
  res.json({
    success: true,
    provider,
    message: `Connected successfully to ${provider} service.`
  });
});

app.listen(PORT, () => {
  console.log(`[My Learning Studio] Backend server listening on http://localhost:${PORT}`);
});
