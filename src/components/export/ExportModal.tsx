import React, { useState } from 'react';
import type { Project, RenderJobProgress } from '../../types';
import { serverRenderer } from '../../services/render/serverRenderer';
import { browserRenderer } from '../../services/render/browserRenderer';
import {
  Download, Video, Play, Pause, X, AlertCircle,
  CheckCircle2, Loader2, Sparkles, Sliders, ExternalLink
} from 'lucide-react';

interface ExportModalProps {
  project: Project;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [resolution, setResolution] = useState<'1920x1080' | '1280x720'>('1920x1080');
  const [fps, setFps] = useState<25 | 30>(25);
  const [audioTrack, setAudioTrack] = useState<'hindi' | 'english' | 'dual' | 'none'>(
    project.language === 'hindi' ? 'hindi' : project.language === 'english' ? 'english' : 'dual'
  );
  const [renderEngine, setRenderEngine] = useState<'hyperframes' | 'browser'>('hyperframes');

  // Render State
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [progress, setProgress] = useState<RenderJobProgress>({
    jobId: '',
    status: 'idle',
    progress: 0,
    message: 'Ready to export'
  });
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  // Start Render Handler
  const handleStartRender = async () => {
    setIsRendering(true);
    setExportedVideoUrl(null);
    setProgress({
      jobId: 'init',
      status: 'preparing',
      progress: 5,
      message: 'Initializing render pipeline...'
    });

    const request = {
      projectId: project.id,
      projectTitle: project.title,
      resolution,
      fps,
      audioTrack,
      includeSubtitles: true,
      includeSoundEffects: true,
      includeBGM: project.backgroundMusic !== 'off',
      scenes: project.scenes,
      subtitlesConfig: project.subtitles
    };

    try {
      let outputUrl = '';
      if (renderEngine === 'hyperframes') {
        outputUrl = await serverRenderer.startRender(request, (p) => setProgress(p));
      } else {
        outputUrl = await browserRenderer.renderInBrowser(request, (p) => setProgress(p));
      }
      setExportedVideoUrl(outputUrl);
    } catch (err: any) {
      setProgress((prev) => ({
        ...prev,
        status: 'error',
        message: err?.message || 'Rendering error occurred'
      }));
    } finally {
      setIsRendering(false);
    }
  };

  const handleCancel = async () => {
    if (renderEngine === 'hyperframes') {
      await serverRenderer.cancelRender();
    } else {
      browserRenderer.cancel();
    }
    setIsRendering(false);
    setProgress({
      jobId: '',
      status: 'cancelled',
      progress: 0,
      message: 'Render cancelled'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Export MP4 Video
              </h2>
              <p className="text-xs text-slate-500">
                High-quality deterministic rendering with HyperFrames & FFmpeg
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRendering}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isRendering && !exportedVideoUrl && (
            <>
              {/* Engine Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Rendering Engine
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRenderEngine('hyperframes')}
                    className={`p-4 rounded-2xl border text-left transition ${
                      renderEngine === 'hyperframes'
                        ? 'bg-sky-50 border-sky-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span>HyperFrames + FFmpeg</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-200/70 text-sky-800 text-[10px] font-bold">
                        Recommended
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Frame-accurate headless Chrome + H.264 MP4 with AAC audio track.
                    </div>
                  </button>

                  <button
                    onClick={() => setRenderEngine('browser')}
                    className={`p-4 rounded-2xl border text-left transition ${
                      renderEngine === 'browser'
                        ? 'bg-sky-50 border-sky-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-800 text-sm">
                      In-Browser Canvas Capture
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Client-side MediaRecorder fallback without backend calls.
                    </div>
                  </button>
                </div>
              </div>

              {/* Resolution & FPS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Resolution
                  </label>
                  <div className="flex gap-2">
                    {[
                      { res: '1920x1080', label: '1080p (Full HD)' },
                      { res: '1280x720', label: '720p (HD)' }
                    ].map((item) => (
                      <button
                        key={item.res}
                        onClick={() => setResolution(item.res as any)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                          resolution === item.res
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Frame Rate
                  </label>
                  <div className="flex gap-2">
                    {[25, 30].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFps(f as any)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                          fps === f
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audio Tracks */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Audio & Narration Track
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'dual', label: 'Hindi + English' },
                    { id: 'hindi', label: 'Hindi Only' },
                    { id: 'english', label: 'English Only' }
                  ].map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setAudioTrack(track.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
                        audioTrack === track.id
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {track.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scene Breakdown Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                <span>
                  <strong>{project.scenes.length} Scenes</strong> • Approx{' '}
                  {project.scenes.reduce((acc, s) => acc + (s.duration || 6), 0)} seconds total video
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Autism-Calm Paced
                </span>
              </div>
            </>
          )}

          {/* Active Rendering Progress Screen */}
          {isRendering && (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-5 animate-fade-in">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-sky-600 animate-spin" />
                <span className="absolute text-sm font-extrabold text-slate-800">
                  {progress.progress}%
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {progress.status === 'capturing'
                    ? 'Rendering Animation Frames...'
                    : progress.status === 'encoding'
                    ? 'Multiplexing Audio & Compiling MP4...'
                    : 'Preparing Video Composition...'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {progress.message}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              <button
                onClick={handleCancel}
                className="px-5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
              >
                Cancel Export
              </button>
            </div>
          )}

          {/* Export Complete & Validated Screen */}
          {exportedVideoUrl && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">MP4 Video Exported Successfully!</h4>
                  <p className="text-xs text-emerald-700">
                    Video and audio streams verified. You can preview below and download to your device.
                  </p>
                </div>
              </div>

              {/* Embedded Playable Video Player */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-lg border border-slate-200">
                <video
                  src={exportedVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Download Button */}
              <div className="flex gap-3">
                <a
                  href={exportedVideoUrl}
                  download={`${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Download Finished MP4
                </a>
                <button
                  onClick={() => setExportedVideoUrl(null)}
                  className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition"
                >
                  Export Another Format
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {progress.status === 'error' && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Export Failed</h4>
                <p className="text-xs text-red-700 mt-1">{progress.message}</p>
                <button
                  onClick={() => setProgress({ jobId: '', status: 'idle', progress: 0, message: '' })}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isRendering && !exportedVideoUrl && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/50 font-bold text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={handleStartRender}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition shadow-md"
            >
              <Download className="w-4 h-4" />
              Start MP4 Export
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
