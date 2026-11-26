import React, { useState, useEffect, useRef } from 'react';
import type { Project, Scene } from '../../types';
import { audioService } from '../../services/audio';
import { AnimationTemplateView } from '../animation/AnimationTemplateView';
import {
  Play, Pause, RotateCcw, Volume2, ArrowLeft,
  ChevronLeft, ChevronRight, Sliders, Maximize2, Minimize2, Sparkles, CheckCircle2
} from 'lucide-react';

interface CalmPlayerProps {
  project: Project;
  onClose: () => void;
}

export const CalmPlayer: React.FC<CalmPlayerProps> = ({ project, onClose }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPausedBetweenScenes, setIsPausedBetweenScenes] = useState<boolean>(false);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  const [narrationPlaying, setNarrationPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Autism Calm settings local controls
  const [sensoryIntensity, setSensoryIntensity] = useState<'low' | 'moderate' | 'full'>(
    project.calmSettings?.sensoryIntensity || 'low'
  );
  const [speechRate, setSpeechRate] = useState<number>(project.narrationSpeed || 0.85);

  const containerRef = useRef<HTMLDivElement>(null);
  const scenes = project.scenes || [];
  const currentScene: Scene | undefined = scenes[currentSceneIndex];

  // Narration playback for current scene
  const playCurrentNarration = () => {
    if (!currentScene) return;
    audioService.stopSpeech();

    const lang = project.language;
    let spokenText = '';
    let speechLang: 'hi-IN' | 'en-US' = 'en-US';

    if (lang === 'hindi') {
      spokenText = currentScene.hindiNarration || currentScene.hindiOnScreenText || currentScene.title;
      speechLang = 'hi-IN';
    } else if (lang === 'english') {
      spokenText = currentScene.englishNarration || currentScene.onScreenText || currentScene.title;
      speechLang = 'en-US';
    } else {
      // Bilingual: Speak Hindi then English, or Hindi primary
      spokenText = `${currentScene.hindiNarration || ''}. ${currentScene.englishNarration || ''}`;
      speechLang = 'hi-IN';
    }

    // Play scene sound effect first if sensory intensity permits
    if (sensoryIntensity !== 'low' && currentScene.soundEffect && currentScene.soundEffect !== 'none') {
      audioService.playSoundEffect(currentScene.soundEffect, sensoryIntensity === 'moderate' ? 0.3 : 0.6);
    }

    setNarrationPlaying(true);
    audioService.speakNarration(
      spokenText,
      speechLang,
      speechRate,
      () => setNarrationPlaying(true),
      () => setNarrationPlaying(false),
      () => setNarrationPlaying(false)
    );
  };

  // Play narration whenever scene changes while playing
  useEffect(() => {
    if (isPlaying && currentScene && !isPausedBetweenScenes) {
      playCurrentNarration();
    }
  }, [currentSceneIndex, isPlaying, isPausedBetweenScenes]);

  // Handle scene timer & pause between scenes
  useEffect(() => {
    if (!isPlaying || isPausedBetweenScenes || !currentScene) return;

    const slowMultiplier = sensoryIntensity === 'low' ? 1.3 : sensoryIntensity === 'moderate' ? 1.15 : 1.0;
    const sceneDuration = (currentScene.duration || 8) * slowMultiplier * 1000;

    const timer = setTimeout(() => {
      // Pause between scenes for autistic processing time
      if (project.calmSettings?.pauseBetweenScenes && currentSceneIndex < scenes.length - 1) {
        setIsPausedBetweenScenes(true);
        const pauseSec = project.calmSettings.pauseDurationSeconds || 3;
        setCountdownRemaining(pauseSec);

        const countdownInterval = setInterval(() => {
          setCountdownRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setIsPausedBetweenScenes(false);
              setCurrentSceneIndex((idx) => Math.min(scenes.length - 1, idx + 1));
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (currentSceneIndex < scenes.length - 1) {
        setCurrentSceneIndex((idx) => idx + 1);
      } else {
        // End of video reached
        setIsPlaying(false);
        audioService.playSoundEffect('success_chime', 0.5);
      }
    }, sceneDuration);

    return () => clearTimeout(timer);
  }, [currentSceneIndex, isPlaying, isPausedBetweenScenes, sensoryIntensity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioService.stopSpeech();
      audioService.stopCalmBGM();
    };
  }, []);

  const handleNext = () => {
    audioService.stopSpeech();
    setIsPausedBetweenScenes(false);
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex((idx) => idx + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    audioService.stopSpeech();
    setIsPausedBetweenScenes(false);
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((idx) => idx - 1);
      setIsPlaying(true);
    }
  };

  const handleRepeatScene = () => {
    audioService.stopSpeech();
    setIsPausedBetweenScenes(false);
    playCurrentNarration();
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!currentScene) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden font-sans select-none"
    >
      {/* Top Sensory-Friendly Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Calm Mode
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{project.title}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider border border-teal-500/30">
                Calm Learning
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Scene {currentSceneIndex + 1} of {scenes.length} • {project.ageLevel || 'Visual Learner'}
            </p>
          </div>
        </div>

        {/* Sensory Controls Quick Toggles */}
        <div className="flex items-center gap-4">
          {/* Sensory Intensity Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Sensory:</span>
            <button
              onClick={() => setSensoryIntensity('low')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                sensoryIntensity === 'low'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Extra Calm (Low)
            </button>
            <button
              onClick={() => setSensoryIntensity('moderate')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                sensoryIntensity === 'moderate'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Gentle
            </button>
          </div>

          {/* Narration Speed */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Voice Speed:</span>
            {[0.75, 0.85, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  speechRate === rate ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Visual Stage (Focused Single Concept, Large Clear High-Contrast Visuals) */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
        {/* Step Indicator Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="px-5 py-1.5 rounded-full bg-sky-600 text-white text-base font-extrabold tracking-wider uppercase shadow-lg shadow-sky-900/30">
            STEP {currentSceneIndex + 1}
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-white text-center drop-shadow-md">
            {currentScene.title}
          </h2>
        </div>

        {/* Central Visual Focus */}
        <div className="relative w-full max-w-4xl h-[400px] md:h-[460px] flex items-center justify-center bg-slate-900/40 rounded-3xl border-2 border-slate-800/80 p-6 shadow-2xl backdrop-blur-sm">
          {/* Pause Between Scenes Visual Countdown */}
          {isPausedBetweenScenes ? (
            <div className="flex flex-col items-center justify-center animate-fade-in text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#0284c7"
                    strokeWidth="8"
                    strokeDasharray="301"
                    strokeDashoffset={301 - (301 * countdownRemaining) / (project.calmSettings?.pauseDurationSeconds || 3)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute text-4xl font-black text-sky-400">
                  {countdownRemaining}
                </span>
              </div>
              <p className="mt-4 text-xl font-bold text-slate-300">
                Pause to reflect... Next step starting soon
              </p>
              <button
                onClick={handleNext}
                className="mt-4 px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition shadow-lg"
              >
                Continue Now (आगे बढ़ें)
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {currentScene.visualObjects?.[0]?.templateType &&
              currentScene.visualObjects[0].templateType !== 'none' ? (
                <AnimationTemplateView
                  type={currentScene.visualObjects[0].templateType}
                  label={currentScene.visualObjects[0].label}
                  slowMotion={sensoryIntensity === 'low'}
                />
              ) : currentScene.visualObjects?.[0]?.content?.startsWith('data:image') ||
                currentScene.visualObjects?.[0]?.content?.startsWith('http') ||
                currentScene.visualObjects?.[0]?.content?.startsWith('/') ? (
                <div className="flex flex-col items-center justify-center">
                  <img
                    src={currentScene.visualObjects[0].content}
                    alt={currentScene.title}
                    className="max-h-[320px] max-w-full object-contain rounded-2xl drop-shadow-xl border border-slate-700/50"
                  />
                  {currentScene.visualObjects[0].label && (
                    <div className="mt-4 px-5 py-2 rounded-xl bg-slate-900/90 text-white font-bold text-xl border border-slate-700">
                      {currentScene.visualObjects[0].label}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-800/80 rounded-2xl border border-slate-700 max-w-lg text-center">
                  <Sparkles className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                  <p className="text-2xl font-bold text-white mb-2">
                    {currentScene.imageDescription || currentScene.title}
                  </p>
                  <p className="text-slate-400 text-base">
                    {currentScene.educationalObjective}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Large, High-Contrast Bilingual Subtitle Banner */}
        <div className="mt-6 w-full max-w-4xl bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl text-center">
          {/* Hindi Narration Subtitle */}
          {(project.language === 'hindi' || project.language === 'bilingual') && (
            <div className="text-2xl md:text-3xl font-extrabold text-amber-300 font-devanagari tracking-wide drop-shadow-sm mb-1">
              {currentScene.hindiOnScreenText || currentScene.hindiNarration}
            </div>
          )}
          {/* English Narration Subtitle */}
          {(project.language === 'english' || project.language === 'bilingual') && (
            <div className="text-xl md:text-2xl font-bold text-slate-100 tracking-normal drop-shadow-sm">
              {currentScene.onScreenText || currentScene.englishNarration}
            </div>
          )}
        </div>
      </div>

      {/* Autism-Friendly Bottom Controller (Prominent Repeat & Pace Buttons) */}
      <div className="px-8 py-5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between">
        {/* Left: Previous Scene */}
        <button
          onClick={handlePrev}
          disabled={currentSceneIndex === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition font-bold text-base border border-slate-700"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Previous (पिछला)</span>
        </button>

        {/* Center: The Core Autism Learning Buttons (Repeat Narration, Play/Pause, Repeat Scene) */}
        <div className="flex items-center gap-4">
          {/* Repeat Narration Button */}
          <button
            onClick={playCurrentNarration}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-base transition shadow-lg ${
              narrationPlaying
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-amber-600/90 hover:bg-amber-500 text-white'
            }`}
          >
            <Volume2 className="w-6 h-6" />
            <span>Repeat Voice (आवाज दोबारा सुनें)</span>
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold transition shadow-xl"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-current" />}
          </button>

          {/* Repeat Entire Scene Button */}
          <button
            onClick={handleRepeatScene}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-base transition shadow-lg"
          >
            <RotateCcw className="w-6 h-6" />
            <span>Repeat Scene (दृश्य दोबारा देखें)</span>
          </button>
        </div>

        {/* Right: Next Scene */}
        <button
          onClick={handleNext}
          disabled={currentSceneIndex === scenes.length - 1}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-30 disabled:pointer-events-none transition font-bold text-base shadow-md"
        >
          <span>Next (अगला)</span>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
