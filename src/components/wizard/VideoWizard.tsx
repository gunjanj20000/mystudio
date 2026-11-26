import React, { useState } from 'react';
import type {
  Project, Scene, LanguagePreference, VisualStyle,
  TransitionType, SoundEffectType
} from '../../types';
import { aiService } from '../../services/ai';
import { db } from '../../db';
import {
  Sparkles, Check, ArrowRight, ArrowLeft, Volume2,
  Clock, Shield, BookOpen, Layers, RefreshCw, X
} from 'lucide-react';

interface VideoWizardProps {
  onComplete: (project: Project) => void;
  onCancel: () => void;
}

const PRESET_TOPICS = [
  'Brushing teeth',
  'Washing hands',
  'Learning animals',
  'Fruits and vegetables',
  'Body parts',
  'Understanding emotions',
  'Waiting for my turn',
  'Traffic safety',
  'How plants grow',
  'How machines work',
  'Science experiments',
  'Social stories',
  'Daily routines'
];

export const VideoWizard: React.FC<VideoWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Step 1: Topic
  const [topic, setTopic] = useState<string>('Brushing teeth');
  const [customTopic, setCustomTopic] = useState<string>('');

  // Step 2: Educational settings
  const [language, setLanguage] = useState<LanguagePreference>('bilingual');
  const [durationMinutes, setDurationMinutes] = useState<number>(3);
  const [ageLevel, setAgeLevel] = useState<string>('12 years (Special Education)');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [numberOfScenes, setNumberOfScenes] = useState<number>(4);
  const [narrationSpeed, setNarrationSpeed] = useState<number>(0.85);
  const [backgroundMusic, setBackgroundMusic] = useState<'off' | 'low' | 'normal'>('low');
  const [subtitlePreference, setSubtitlePreference] = useState<'hindi' | 'english' | 'dual' | 'none'>('dual');

  // Step 3: Visual style
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('3d_cartoon');

  // Step 4: Generated Scenes
  const [generatedScenes, setGeneratedScenes] = useState<Scene[]>([]);

  const effectiveTopic = customTopic.trim() || topic;

  // Generate Script
  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const scenes = await aiService.generateOfflineStory({
        topic: effectiveTopic,
        language,
        targetDurationMinutes: durationMinutes,
        visualStyle,
        ageLevel,
        difficultyLevel
      });
      // Adjust to requested number of scenes if needed
      setGeneratedScenes(scenes.slice(0, numberOfScenes));
      setStep(4);
    } catch (e) {
      console.error('Error generating script:', e);
    } finally {
      setLoading(false);
    }
  };

  // Update a scene in review step
  const handleUpdateScene = (index: number, updates: Partial<Scene>) => {
    setGeneratedScenes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // Finalize and save project to Dexie
  const handleCreateProject = async () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: `${effectiveTopic} (${language === 'hindi' ? 'हिंदी' : language === 'english' ? 'English' : 'द्विभाषी'})`,
      topic: effectiveTopic,
      description: `Educational video created for visual learning on ${effectiveTopic}.`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      targetDurationMinutes: durationMinutes,
      ageLevel,
      difficultyLevel,
      language,
      narrationSpeed,
      defaultVisualStyle: visualStyle,
      backgroundMusic,
      subtitles: {
        language: subtitlePreference,
        fontSize: 'large',
        position: 'bottom',
        contrast: 'high',
        highlightCurrentSpokenWord: true
      },
      calmSettings: {
        enabled: true,
        sensoryIntensity: 'low',
        oneConceptPerScene: true,
        largeHighContrastVisuals: true,
        slowPacingMultiplier: 1.25,
        pauseBetweenScenes: true,
        pauseDurationSeconds: 3,
        noFlashingEffects: true,
        noSuddenSounds: true,
        showVisualCountdown: true,
        enableRepeatButtons: true
      },
      scenes: generatedScenes
    };

    await db.projects.add(newProject);
    onComplete(newProject);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Wizard Header & Progress Bar */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sky-600" />
              <span>Create New Educational Video</span>
            </h2>
            <p className="text-sm text-slate-500">
              Step {step} of 4: {step === 1 ? 'Choose Topic' : step === 2 ? 'Educational Settings' : step === 3 ? 'Visual Style' : 'Review & Approve Script'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-sky-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Step Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* STEP 1: Topic */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-base font-bold text-slate-800 mb-2">
                  Select an Educational Topic or Routine
                </label>
                <p className="text-sm text-slate-500 mb-4">
                  Choose from core daily living skills, social stories, science, or enter any custom topic.
                </p>

                {/* Preset Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                  {PRESET_TOPICS.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setTopic(item);
                        setCustomTopic('');
                      }}
                      className={`px-4 py-3 rounded-2xl text-sm font-semibold text-left transition border ${
                        topic === item && !customTopic
                          ? 'bg-sky-50 border-sky-600 text-sky-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* Custom Topic Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Or type a custom topic:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tying shoes, Making a bed, Going to the dentist, Solar system..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Educational Settings */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Language Selection */}
              <div>
                <label className="block text-base font-bold text-slate-800 mb-2">
                  Narration & Subtitle Language
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'bilingual', title: 'Hindi + English (द्विभाषी)', desc: 'Dual narration & subtitles' },
                    { id: 'hindi', title: 'Hindi Only (हिंदी)', desc: 'Clear Devanagari voice' },
                    { id: 'english', title: 'English Only', desc: 'Simple English voice' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLanguage(item.id as LanguagePreference)}
                      className={`p-4 rounded-2xl border text-left transition ${
                        language === item.id
                          ? 'bg-sky-50 border-sky-600 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-800 text-sm">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Duration & Scene Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Target Video Duration
                  </label>
                  <div className="flex gap-2">
                    {[1, 3, 5, 10, 15].map((m) => (
                      <button
                        key={m}
                        onClick={() => setDurationMinutes(m)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition ${
                          durationMinutes === m
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Number of Scenes
                  </label>
                  <div className="flex gap-2">
                    {[3, 4, 5, 6, 8].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNumberOfScenes(n)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition ${
                          numberOfScenes === n
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Narration Speed & Background Music */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Voice Narration Speed (Autism Friendly)
                  </label>
                  <div className="flex gap-2">
                    {[
                      { speed: 0.7, label: '0.7x (Very Slow)' },
                      { speed: 0.85, label: '0.85x (Calm & Clear)' },
                      { speed: 1.0, label: '1.0x (Normal)' }
                    ].map((s) => (
                      <button
                        key={s.speed}
                        onClick={() => setNarrationSpeed(s.speed)}
                        className={`flex-1 py-2.5 px-2 rounded-xl border text-xs font-bold transition ${
                          narrationSpeed === s.speed
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Background Music (BGM)
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'off', label: 'Off (Quiet)' },
                      { id: 'low', label: 'Low (Gentle Ambient)' },
                      { id: 'normal', label: 'Normal' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBackgroundMusic(b.id as any)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                          backgroundMusic === b.id
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Visual Style */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-base font-bold text-slate-800 mb-2">
                  Choose Preferred Visual Style
                </label>
                <p className="text-sm text-slate-500 mb-4">
                  Visual style can also be customized for individual scenes later in the Scene Editor.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: '3d_cartoon',
                      title: '3D Cartoon Animation',
                      desc: 'Friendly, warm 3D characters with smooth, gentle movements.'
                    },
                    {
                      id: 'real_photo',
                      title: 'Real Photographs',
                      desc: 'Authentic photos of objects and daily environments for concrete recognition.'
                    },
                    {
                      id: 'illustrated_diagram',
                      title: 'Illustrated Diagrams',
                      desc: 'Clean vector drawings with clear focus and high contrast.'
                    },
                    {
                      id: 'mixed_photo_cartoon',
                      title: 'Real Photos + Cartoon Overlays',
                      desc: 'Real environment background with animated friendly guide.'
                    },
                    {
                      id: 'infographic',
                      title: 'Simple Educational Infographics',
                      desc: 'Direct visual cues, traffic signals, and sequencing cards.'
                    }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setVisualStyle(style.id as VisualStyle)}
                      className={`p-4 rounded-2xl border text-left transition ${
                        visualStyle === style.id
                          ? 'bg-sky-50 border-sky-600 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-800 text-base mb-1">{style.title}</div>
                      <div className="text-xs text-slate-500">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review Script */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Review & Approve Educational Script ({generatedScenes.length} Scenes)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Parent approval step: check Hindi and English sentences. Concrete language without idioms.
                  </p>
                </div>
                <button
                  onClick={handleGenerateScript}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>

              {/* Editable Scene List */}
              <div className="space-y-4">
                {generatedScenes.map((scene, idx) => (
                  <div
                    key={scene.id || idx}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                        Scene {idx + 1} ({scene.duration || 8}s)
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Objective: {scene.educationalObjective}
                      </span>
                    </div>

                    {/* Scene Title */}
                    <div>
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) => handleUpdateScene(idx, { title: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                      />
                    </div>

                    {/* Hindi Narration */}
                    <div>
                      <label className="block text-xs font-bold text-amber-700 mb-1">
                        Hindi Narration (हिंदी आवाज):
                      </label>
                      <textarea
                        rows={2}
                        value={scene.hindiNarration}
                        onChange={(e) => handleUpdateScene(idx, { hindiNarration: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium font-devanagari text-slate-800"
                      />
                    </div>

                    {/* English Narration */}
                    <div>
                      <label className="block text-xs font-bold text-sky-700 mb-1">
                        English Narration:
                      </label>
                      <textarea
                        rows={2}
                        value={scene.englishNarration}
                        onChange={(e) => handleUpdateScene(idx, { englishNarration: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition font-bold text-sm shadow-md"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              onClick={handleGenerateScript}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition font-bold text-sm shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Script...
                </>
              ) : (
                <>
                  Generate Educational Script
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition font-bold text-sm shadow-lg"
            >
              <Check className="w-4 h-4" />
              Open in Scene Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
