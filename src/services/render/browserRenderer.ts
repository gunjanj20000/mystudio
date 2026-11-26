import type { RenderJobRequest, RenderJobProgress } from '../../types';

export class BrowserRenderer {
  private isCancelled: boolean = false;

  public async renderInBrowser(
    request: RenderJobRequest,
    onProgress: (progress: RenderJobProgress) => void
  ): Promise<string> {
    this.isCancelled = false;
    const [width, height] = request.resolution === '1280x720' ? [1280, 720] : [1920, 1080];
    const fps = request.fps || 25;
    const scenes = request.scenes || [];

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create 2D canvas context');

    // Create Web Audio destination for synced audio
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const dest = audioCtx.createMediaStreamDestination();

    // Subtle gentle hum audio oscillator so stream has audio track
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    // Combine canvas video stream + audio stream
    const videoStream = canvas.captureStream(fps);
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);

    // Choose supported mimeType
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    let selectedMime = 'video/webm';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime;
        break;
      }
    }

    const recorder = new MediaRecorder(combinedStream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 4000000
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.start(100);

    let totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 6), 0);
    if (totalDuration === 0) totalDuration = 10;
    const totalFrames = Math.round(totalDuration * fps);

    let currentFrame = 0;

    return new Promise((resolve, reject) => {
      const renderNextFrame = () => {
        if (this.isCancelled) {
          try {
            recorder.stop();
            osc.stop();
            audioCtx.close();
          } catch (_) {}
          reject(new Error('Render cancelled by user'));
          return;
        }

        const currentTimeSec = currentFrame / fps;

        // Find which scene is active at currentTimeSec
        let accumulatedSec = 0;
        let activeScene = scenes[0];
        let sceneIndex = 0;
        let sceneLocalTime = 0;

        for (let i = 0; i < scenes.length; i++) {
          const s = scenes[i];
          const dur = s.duration || 6;
          if (currentTimeSec >= accumulatedSec && currentTimeSec < accumulatedSec + dur) {
            activeScene = s;
            sceneIndex = i;
            sceneLocalTime = currentTimeSec - accumulatedSec;
            break;
          }
          accumulatedSec += dur;
        }

        // Draw Scene to Canvas
        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#f0f9ff');
        grad.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Header: Step Badge & Title
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(64, 48, 160, 48, 24);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText(`STEP ${sceneIndex + 1}`, 96, 80);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px Inter, "Noto Sans Devanagari", sans-serif';
        ctx.fillText(activeScene.title, 250, 82);

        // Center Visual: Draw Visual Object / Animation Template
        const cx = width / 2;
        const cy = height / 2 - 20;

        const templateType = activeScene.visualObjects?.[0]?.templateType;

        if (templateType === 'brushing_teeth') {
          // Teeth background
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 180, 110, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Teeth
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          [-70, -25, 25, 70].forEach(tx => {
            ctx.beginPath();
            ctx.roundRect(cx + tx - 18, cy - 20, 36, 45, 8);
            ctx.fill();
            ctx.stroke();
          });

          // Moving Toothbrush
          const brushOffset = Math.sin(sceneLocalTime * 8) * 35;
          ctx.save();
          ctx.translate(cx + brushOffset, cy);
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.roundRect(-120, -15, 240, 30, 15);
          ctx.fill();
          // Bristles
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.roundRect(60, -35, 50, 20, 4);
          ctx.fill();
          ctx.restore();
        } else if (templateType === 'plant_growth') {
          // Soil
          ctx.fillStyle = '#78350f';
          ctx.fillRect(cx - 200, cy + 100, 400, 120);

          // Plant height grows over scene local time
          const progress = Math.min(1, sceneLocalTime / (activeScene.duration || 6));
          const stemHeight = 60 + progress * 140;

          // Stem
          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx, cy + 100);
          ctx.lineTo(cx, cy + 100 - stemHeight);
          ctx.stroke();

          // Leaves
          if (progress > 0.2) {
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.ellipse(cx - 35, cy + 100 - stemHeight * 0.6, 35, 18, -Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 35, cy + 100 - stemHeight * 0.8, 35, 18, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (templateType === 'traffic_light') {
          // Housing
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(cx - 70, cy - 160, 140, 320, 30);
          ctx.fill();

          // Lights
          const cycle = (sceneLocalTime % 6);
          const isRed = cycle >= 4;
          const isYellow = cycle >= 2 && cycle < 4;
          const isGreen = cycle < 2;

          // Red
          ctx.fillStyle = isRed ? '#ef4444' : '#450a0a';
          ctx.beginPath();
          ctx.arc(cx, cy - 90, 38, 0, Math.PI * 2);
          ctx.fill();

          // Yellow
          ctx.fillStyle = isYellow ? '#f59e0b' : '#451a03';
          ctx.beginPath();
          ctx.arc(cx, cy, 38, 0, Math.PI * 2);
          ctx.fill();

          // Green
          ctx.fillStyle = isGreen ? '#10b981' : '#064e3b';
          ctx.beginPath();
          ctx.arc(cx, cy + 90, 38, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Default gentle illustration box
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.08)';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.roundRect(cx - 200, cy - 140, 400, 280, 24);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 80px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌟', cx, cy + 10);

          ctx.fillStyle = '#334155';
          ctx.font = 'bold 26px Inter, "Noto Sans Devanagari", sans-serif';
          ctx.fillText(activeScene.imageDescription || activeScene.title, cx, cy + 70);
          ctx.textAlign = 'start';
        }

        // Subtitle Card at Bottom
        const subBoxW = width * 0.82;
        const subBoxH = 110;
        const subBoxX = (width - subBoxW) / 2;
        const subBoxY = height - subBoxH - 40;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.beginPath();
        ctx.roundRect(subBoxX, subBoxY, subBoxW, subBoxH, 20);
        ctx.fill();

        ctx.textAlign = 'center';
        // Bilingual Subtitles
        const hindiText = activeScene.hindiOnScreenText || activeScene.hindiNarration || '';
        const englishText = activeScene.onScreenText || activeScene.englishNarration || '';

        if (hindiText) {
          ctx.fillStyle = '#fef08a'; // gentle highlight yellow
          ctx.font = 'bold 30px "Noto Sans Devanagari", sans-serif';
          ctx.fillText(hindiText, width / 2, subBoxY + 45);
        }
        if (englishText) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '600 24px Inter, sans-serif';
          ctx.fillText(englishText, width / 2, subBoxY + (hindiText ? 85 : 62));
        }
        ctx.textAlign = 'start';

        currentFrame++;
        const pct = Math.min(99, Math.round((currentFrame / totalFrames) * 100));
        onProgress({
          jobId: 'browser-render',
          status: 'capturing',
          progress: pct,
          currentFrame,
          totalFrames,
          message: `Encoding frame ${currentFrame} of ${totalFrames} (${pct}%)`
        });

        if (currentFrame < totalFrames) {
          requestAnimationFrame(renderNextFrame);
        } else {
          // Finished!
          onProgress({
            jobId: 'browser-render',
            status: 'encoding',
            progress: 99,
            message: 'Finalizing video stream...'
          });

          recorder.onstop = () => {
            try {
              osc.stop();
              audioCtx.close();
            } catch (_) {}

            const blob = new Blob(chunks, { type: selectedMime });
            const url = URL.createObjectURL(blob);

            onProgress({
              jobId: 'browser-render',
              status: 'completed',
              progress: 100,
              message: 'Video rendering complete!',
              outputVideoUrl: url,
              outputFileSize: blob.size,
              durationSeconds: totalDuration
            });
            resolve(url);
          };
          recorder.stop();
        }
      };

      // Start rendering loop
      renderNextFrame();
    });
  }

  public cancel() {
    this.isCancelled = true;
  }
}

export const browserRenderer = new BrowserRenderer();
