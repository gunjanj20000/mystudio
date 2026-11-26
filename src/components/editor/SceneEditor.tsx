import React, { useState, useEffect, useRef } from 'react';
import type {
  Project, Scene, VisualObject, AnimationTemplateType,
  SoundEffectType, TransitionType, VisualStyle, AnimationEffect
} from '../../types';
import { db } from '../../db';
import { audioService } from '../../services/audio';
import { AnimationTemplateView } from '../animation/AnimationTemplateView';
import { ImageLibrary } from '../images/ImageLibrary';
import { CharacterLibrary } from '../characters/CharacterLibrary';
import { ExportModal } from '../export/ExportModal';
import { VoiceStudio } from '../voice/VoiceStudio';
import { CalmPlayer } from '../presentation/CalmPlayer';
import {
  Play, Pause, Plus, Trash2, Copy, MoveUp, MoveDown,
  Volume2, Sliders, Image as ImageIcon, Film, Download,
  ArrowLeft, Check, Sparkles, Layers, Clock, Settings,
  Eye, Monitor, ChevronRight, CheckCircle2, RotateCcw
} from 'lucide-react';

interface SceneEditorProps {
  project: Project;
  onBack: () => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({ project: initialProject, onBack }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'narration' | 'visuals' | 'timing'>('narration');

  // Preview Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [previewTimeSec, setPreviewTimeSec] = useState<number>(0);
  const [isNarrationSpeaking, setIsNarrationSpeaking] = useState<boolean>(false);

  // Modal states
  const [showImageLibrary, setShowImageLibrary] = useState<boolean>(false);
  const [showCharacterLibrary, setShowCharacterLibrary] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showVoiceStudio, setShowVoiceStudio] = useState<boolean>(false);
  const [showCalmPresentation, setShowCalmPresentation] = useState<boolean>(false);

  const scenes = project.scenes || [];
  const currentScene: Scene | undefined = scenes[selectedSceneIndex];

  // Calculate total project duration
  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 6), 0);

  // Auto-save helper
  const saveProject = async (updated: Project) => {
    setProject(updated);
    await db.projects.put({ ...updated, updatedAt: Date.now() });
  };

  // Playhead loop for center preview
  useEffect(() => {
    let animId: number;
    let lastTs = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTs) / 1000;
      lastTs = now;

      if (isPlaying) {
        setPreviewTimeSec((prev) => {
          const next = prev + dt;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }

          // Check if we need to switch scene index based on next
          let acc = 0;
          for (let i = 0; i < scenes.length; i++) {
            const dur = scenes[i].duration || 6;
            if (next >= acc && next < acc + dur) {
              if (selectedSceneIndex !== i) {
                setSelectedSceneIndex(i);
              }
              break;
            }
            acc += dur;
          }

          return next;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, totalDuration, scenes, selectedSceneIndex]);

  // Preview Voice Narration for current scene
  const handlePreviewVoice = (lang: 'hindi' | 'english' | 'both' = 'both') => {
    if (!currentScene) return;
    audioService.stopSpeech();

    // Play scene sound effect
    if (currentScene.soundEffect && currentScene.soundEffect !== 'none') {
      audioService.playSoundEffect(currentScene.soundEffect, 0.4);
    }

    setIsNarrationSpeaking(true);
    if (lang === 'hindi') {
      audioService.speakNarration(
        currentScene.hindiNarration,
        'hi-IN',
        project.narrationSpeed || 0.85,
        undefined,
        () => setIsNarrationSpeaking(false),
        () => setIsNarrationSpeaking(false)
      );
    } else if (lang === 'english') {
      audioService.speakNarration(
        currentScene.englishNarration,
        'en-US',
        project.narrationSpeed || 0.85,
        undefined,
        () => setIsNarrationSpeaking(false),
        () => setIsNarrationSpeaking(false)
      );
    } else {
      audioService.speakNarration(
        currentScene.hindiNarration,
        'hi-IN',
        project.narrationSpeed || 0.85,
        undefined,
        () => {
          setTimeout(() => {
            audioService.speakNarration(
              currentScene.englishNarration,
              'en-US',
              project.narrationSpeed || 0.85,
              undefined,
              () => setIsNarrationSpeaking(false),
              () => setIsNarrationSpeaking(false)
            );
          }, 300);
        },
        () => setIsNarrationSpeaking(false)
      );
    }
  };

  // Add Scene
  const handleAddScene = async () => {
    const newScene: Scene = {
      id: `sc-${Date.now()}`,
      title: `Step ${scenes.length + 1}: Next Action`,
      order: scenes.length,
      educationalObjective: 'Practice the next simple step',
      hindiNarration: 'अब हम अगला कदम करेंगे।',
      englishNarration: 'Now we do the next step calmly.',
      onScreenText: 'Next Step (अगला कदम)',
      hindiOnScreenText: 'अगला कदम',
      imageDescription: 'Next action illustration',
      visualStyle: project.defaultVisualStyle,
      duration: 8,
      transitionType: 'fade',
      soundEffect: 'gentle_chime',
      visualObjects: [
        {
          id: `obj-${Date.now()}`,
          type: 'text',
          content: '🌟 Next Step',
          label: 'Next Step',
          x: 50,
          y: 50,
          width: 50,
          height: 40,
          scale: 1,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          animation: {
            effect: 'fade',
            duration: 1.0,
            delay: 0.2,
            repeat: false,
            easing: 'ease-in-out'
          }
        }
      ]
    };

    const updated = { ...project, scenes: [...scenes, newScene] };
    await saveProject(updated);
    setSelectedSceneIndex(scenes.length);
  };

  // Duplicate Scene
  const handleDuplicateScene = async (idx: number) => {
    const target = scenes[idx];
    if (!target) return;
    const duplicated: Scene = {
      ...target,
      id: `sc-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: idx + 1
    };
    const updatedScenes = [...scenes];
    updatedScenes.splice(idx + 1, 0, duplicated);
    const updated = { ...project, scenes: updatedScenes };
    await saveProject(updated);
    setSelectedSceneIndex(idx + 1);
  };

  // Delete Scene
  const handleDeleteScene = async (idx: number) => {
    if (scenes.length <= 1) {
      alert('A video must have at least one scene.');
      return;
    }
    const updatedScenes = scenes.filter((_, i) => i !== idx);
    const updated = { ...project, scenes: updatedScenes };
    await saveProject(updated);
    setSelectedSceneIndex(Math.max(0, idx - 1));
  };

  // Reorder Scenes
  const handleMoveScene = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= scenes.length) return;

    const updatedScenes = [...scenes];
    const [moved] = updatedScenes.splice(idx, 1);
    updatedScenes.splice(targetIdx, 0, moved);

    const updated = { ...project, scenes: updatedScenes };
    await saveProject(updated);
    setSelectedSceneIndex(targetIdx);
  };

  // Update current scene field
  const updateCurrentScene = async (updates: Partial<Scene>) => {
    if (!currentScene) return;
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = { ...currentScene, ...updates };
    const updated = { ...project, scenes: updatedScenes };
    await saveProject(updated);
  };

  // Set Animation Template on current scene
  const handleSetAnimationTemplate = async (templateType: AnimationTemplateType) => {
    if (!currentScene) return;
    const updatedObjects: VisualObject[] = [
      {
        id: `obj-tpl-${Date.now()}`,
        type: 'template',
        templateType,
        content: templateType,
        label: currentScene.onScreenText || currentScene.title,
        x: 50,
        y: 50,
        width: 60,
        height: 60,
        scale: 1,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        animation: {
          effect: 'bounce',
          duration: 1.5,
          delay: 0,
          repeat: true,
          easing: 'ease-in-out'
        }
      }
    ];
    await updateCurrentScene({ visualObjects: updatedObjects });
  };

  if (!currentScene) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden text-slate-800 font-sans select-none">
      {/* Top Application Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 text-sm">{project.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
              {project.language.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Calm Mode Fullscreen Presentation */}
          <button
            onClick={() => setShowCalmPresentation(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 font-bold text-xs transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Calm Learning Presentation</span>
          </button>

          {/* Bilingual Voice Studio */}
          <button
            onClick={() => setShowVoiceStudio(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 font-bold text-xs transition"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Voice Studio</span>
          </button>

          {/* Export MP4 Video */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export MP4</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Working Area (Left: Scenes, Center: Preview, Right: Properties) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Scene List */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Scenes ({scenes.length})
            </span>
            <button
              onClick={handleAddScene}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Scene
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id || idx}
                onClick={() => {
                  setSelectedSceneIndex(idx);
                  audioService.stopSpeech();
                }}
                className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col gap-2 ${
                  selectedSceneIndex === idx
                    ? 'bg-sky-50/70 border-sky-600 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold">
                    STEP {idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {scene.duration || 8}s
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 line-clamp-1">
                  {scene.title}
                </div>

                <div className="text-[11px] text-slate-500 line-clamp-1 font-devanagari">
                  {scene.hindiNarration || scene.englishNarration}
                </div>

                {/* Scene Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-400">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveScene(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:text-slate-700 disabled:opacity-20"
                      title="Move up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveScene(idx, 'down');
                      }}
                      disabled={idx === scenes.length - 1}
                      className="p-1 hover:text-slate-700 disabled:opacity-20"
                      title="Move down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateScene(idx);
                      }}
                      className="p-1 hover:text-sky-600"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScene(idx);
                      }}
                      disabled={scenes.length <= 1}
                      className="p-1 hover:text-red-600 disabled:opacity-20"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTRE PANEL: Video Preview Player */}
        <main className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
          {/* Center Stage Preview Canvas */}
          <div className="flex-1 flex items-center justify-center p-6 relative">
            <div className="relative w-full max-w-3xl aspect-video bg-gradient-to-br from-sky-50 to-blue-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 flex flex-col justify-between p-6">
              {/* Scene Step Badge */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-sky-600 text-white font-extrabold text-xs shadow">
                    STEP {selectedSceneIndex + 1}
                  </span>
                  <span className="font-extrabold text-slate-900 text-lg">
                    {currentScene.title}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white/70 px-2.5 py-1 rounded-full">
                  {currentScene.duration || 8}s
                </span>
              </div>

              {/* Main Visual Display */}
              <div className="flex-1 flex items-center justify-center p-4">
                {currentScene.visualObjects?.[0]?.templateType &&
                currentScene.visualObjects[0].templateType !== 'none' ? (
                  <AnimationTemplateView
                    type={currentScene.visualObjects[0].templateType}
                    label={currentScene.visualObjects[0].label}
                  />
                ) : currentScene.visualObjects?.[0]?.content?.startsWith('data:image') ||
                  currentScene.visualObjects?.[0]?.content?.startsWith('http') ||
                  currentScene.visualObjects?.[0]?.content?.startsWith('/') ? (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={currentScene.visualObjects[0].content}
                      alt={currentScene.title}
                      className="max-h-[220px] max-w-full object-contain rounded-2xl drop-shadow-md"
                    />
                    {currentScene.visualObjects[0].label && (
                      <div className="mt-2 px-3 py-1 bg-slate-900/80 text-white font-bold text-sm rounded-lg">
                        {currentScene.visualObjects[0].label}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 bg-white/90 rounded-2xl shadow-sm text-center max-w-md">
                    <Sparkles className="w-12 h-12 text-sky-600 mx-auto mb-2 animate-bounce" />
                    <p className="font-bold text-base text-slate-800">
                      {currentScene.imageDescription || currentScene.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentScene.educationalObjective}
                    </p>
                  </div>
                )}
              </div>

              {/* High-Contrast Subtitle Box */}
              <div className="bg-slate-950/90 text-white p-3.5 rounded-2xl text-center shadow-lg mx-auto max-w-xl w-full z-10">
                {(project.language === 'hindi' || project.language === 'bilingual') && (
                  <div className="text-lg md:text-xl font-bold font-devanagari text-amber-300">
                    {currentScene.hindiOnScreenText || currentScene.hindiNarration}
                  </div>
                )}
                {(project.language === 'english' || project.language === 'bilingual') && (
                  <div className="text-sm md:text-base font-semibold text-slate-100">
                    {currentScene.onScreenText || currentScene.englishNarration}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Player Transport Bar */}
          <div className="h-16 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition shadow"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => handlePreviewVoice('both')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isNarrationSpeaking
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Play Voice</span>
              </button>
            </div>

            {/* Timecode */}
            <div className="font-mono text-xs text-slate-400 font-bold">
              <span>{Math.floor(previewTimeSec / 60)}:{(Math.floor(previewTimeSec % 60)).toString().padStart(2, '0')}</span>
              <span className="mx-1 text-slate-600">/</span>
              <span>{Math.floor(totalDuration / 60)}:{(Math.floor(totalDuration % 60)).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Scene Properties */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('narration')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'narration'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Narration
            </button>
            <button
              onClick={() => setActiveTab('visuals')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'visuals'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Visuals
            </button>
            <button
              onClick={() => setActiveTab('timing')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'timing'
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Timing & FX
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'narration' && (
              <div className="space-y-4 animate-fade-in">
                {/* Scene Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scene Title
                  </label>
                  <input
                    type="text"
                    value={currentScene.title}
                    onChange={(e) => updateCurrentScene({ title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Educational Objective */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Educational Objective
                  </label>
                  <input
                    type="text"
                    value={currentScene.educationalObjective}
                    onChange={(e) => updateCurrentScene({ educationalObjective: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-600"
                  />
                </div>

                {/* Hindi Narration */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-amber-800">
                      Hindi Narration (हिंदी आवाज)
                    </label>
                    <button
                      onClick={() => handlePreviewVoice('hindi')}
                      className="text-[11px] font-bold text-amber-600 hover:underline"
                    >
                      Preview
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={currentScene.hindiNarration}
                    onChange={(e) => updateCurrentScene({ hindiNarration: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-devanagari font-medium text-slate-800"
                  />
                </div>

                {/* English Narration */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-sky-800">
                      English Narration
                    </label>
                    <button
                      onClick={() => handlePreviewVoice('english')}
                      className="text-[11px] font-bold text-sky-600 hover:underline"
                    >
                      Preview
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={currentScene.englishNarration}
                    onChange={(e) => updateCurrentScene({ englishNarration: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>

                {/* On-screen Subtitle Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    On-Screen Highlight Text
                  </label>
                  <input
                    type="text"
                    value={currentScene.onScreenText}
                    onChange={(e) => updateCurrentScene({ onScreenText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            )}

            {activeTab === 'visuals' && (
              <div className="space-y-4 animate-fade-in">
                {/* Pick Animation Template */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Ready-Made Animation Templates
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'brushing_teeth', label: 'Brushing Teeth' },
                      { id: 'plant_growth', label: 'Plant Growing' },
                      { id: 'traffic_light', label: 'Traffic Light' },
                      { id: 'elephant_trunk', label: 'Elephant Trunk' },
                      { id: 'bouncing_ball', label: 'Bouncing Ball' },
                      { id: 'water_flow', label: 'Water Flowing' },
                      { id: 'hand_washing', label: 'Hand Washing' }
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleSetAnimationTemplate(tpl.id as AnimationTemplateType)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                          currentScene.visualObjects?.[0]?.templateType === tpl.id
                            ? 'bg-sky-50 border-sky-600 text-sky-800'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Libraries */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => setShowImageLibrary(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    Browse Image Library
                  </button>

                  <button
                    onClick={() => setShowCharacterLibrary(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Insert Character
                  </button>
                </div>

                {/* Label on Visual Object */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Visual Object Caption / Label
                  </label>
                  <input
                    type="text"
                    value={currentScene.visualObjects?.[0]?.label || ''}
                    onChange={(e) => {
                      const updatedObj = { ...currentScene.visualObjects[0], label: e.target.value };
                      updateCurrentScene({ visualObjects: [updatedObj] });
                    }}
                    placeholder="e.g. Toothbrush (टूथब्रश)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {activeTab === 'timing' && (
              <div className="space-y-4 animate-fade-in">
                {/* Scene Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scene Duration (Seconds)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={4}
                      max={20}
                      step={1}
                      value={currentScene.duration || 8}
                      onChange={(e) => updateCurrentScene({ duration: parseInt(e.target.value, 10) })}
                      className="flex-1 accent-sky-600"
                    />
                    <span className="font-mono text-xs font-bold w-10 text-right">
                      {currentScene.duration || 8}s
                    </span>
                  </div>
                </div>

                {/* Transition Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transition Type
                  </label>
                  <select
                    value={currentScene.transitionType || 'fade'}
                    onChange={(e) => updateCurrentScene({ transitionType: e.target.value as TransitionType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="fade">Gentle Fade (Recommended for Autism)</option>
                    <option value="slide">Smooth Slide</option>
                    <option value="dissolve">Dissolve</option>
                    <option value="cut">Direct Cut</option>
                  </select>
                </div>

                {/* Sound Effect */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scene Sound Effect (Gentle & Calming)
                  </label>
                  <select
                    value={currentScene.soundEffect || 'gentle_chime'}
                    onChange={(e) => {
                      const effect = e.target.value as SoundEffectType;
                      updateCurrentScene({ soundEffect: effect });
                      audioService.playSoundEffect(effect, 0.5);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="none">No Sound Effect</option>
                    <option value="gentle_chime">Gentle Chime</option>
                    <option value="soft_bell">Soft Bell</option>
                    <option value="water_splash">Water Splash</option>
                    <option value="brush_scrub">Brush Scrub</option>
                    <option value="nature_breeze">Nature Breeze</option>
                    <option value="pop">Gentle Pop</option>
                    <option value="success_chime">Success Praise Chime</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* BOTTOM PANEL: Multi-Track Visual Timeline */}
      <div className="h-32 bg-white border-t border-slate-200 flex flex-col shrink-0 select-none">
        {/* Timeline Header & Time Ruler */}
        <div className="h-7 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Timeline</span>
          </div>
          <span>Total: {totalDuration}s</span>
        </div>

        {/* Tracks */}
        <div className="flex-1 overflow-x-auto p-2 flex flex-col gap-1.5 bg-slate-100/60">
          {/* Visual Track */}
          <div className="flex items-center gap-1 h-9">
            <span className="w-16 text-[10px] font-bold uppercase text-slate-400 px-1 truncate">
              Visuals
            </span>
            <div className="flex-1 flex gap-1 h-full">
              {scenes.map((s, idx) => {
                const widthPct = Math.max(10, ((s.duration || 8) / totalDuration) * 100);
                return (
                  <button
                    key={s.id || idx}
                    onClick={() => setSelectedSceneIndex(idx)}
                    style={{ width: `${widthPct}%` }}
                    className={`h-full rounded-lg px-2 flex items-center justify-between text-[10px] font-bold truncate transition border ${
                      selectedSceneIndex === idx
                        ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <span className="truncate">S{idx + 1}: {s.title}</span>
                    <span className="opacity-70 text-[9px] shrink-0 ml-1">{s.duration || 8}s</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Narration Track */}
          <div className="flex items-center gap-1 h-8">
            <span className="w-16 text-[10px] font-bold uppercase text-slate-400 px-1 truncate">
              Voice
            </span>
            <div className="flex-1 flex gap-1 h-full">
              {scenes.map((s, idx) => {
                const widthPct = Math.max(10, ((s.duration || 8) / totalDuration) * 100);
                return (
                  <div
                    key={`voice-${idx}`}
                    style={{ width: `${widthPct}%` }}
                    className="h-full rounded-lg bg-amber-100 border border-amber-200 px-2 flex items-center text-[10px] font-medium text-amber-900 truncate"
                  >
                    <Volume2 className="w-3 h-3 text-amber-700 mr-1 shrink-0" />
                    <span className="truncate">{s.hindiNarration || s.englishNarration}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showImageLibrary && (
        <ImageLibrary
          onSelectImage={(asset) => {
            const updatedObj: VisualObject = {
              id: `obj-img-${Date.now()}`,
              type: 'image',
              content: asset.url,
              label: asset.name,
              x: 50,
              y: 50,
              width: 55,
              height: 55,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              animation: {
                effect: 'fade',
                duration: 1.0,
                delay: 0.2,
                repeat: false,
                easing: 'ease-in-out'
              }
            };
            updateCurrentScene({ visualObjects: [updatedObj] });
            setShowImageLibrary(false);
          }}
          onClose={() => setShowImageLibrary(false)}
        />
      )}

      {showCharacterLibrary && (
        <CharacterLibrary
          onSelectCharacter={(char) => {
            const updatedObj: VisualObject = {
              id: `obj-char-${Date.now()}`,
              type: 'character',
              characterId: char.id,
              content: char.referenceImage,
              label: char.name,
              x: 50,
              y: 50,
              width: 55,
              height: 55,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              animation: {
                effect: 'float',
                duration: 2.0,
                delay: 0,
                repeat: true,
                easing: 'ease-in-out'
              }
            };
            updateCurrentScene({ visualObjects: [updatedObj] });
            setShowCharacterLibrary(false);
          }}
          onClose={() => setShowCharacterLibrary(false)}
        />
      )}

      {showVoiceStudio && (
        <VoiceStudio
          project={project}
          onUpdateProject={(up) => setProject(up)}
          onClose={() => setShowVoiceStudio(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          project={project}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showCalmPresentation && (
        <CalmPlayer
          project={project}
          onClose={() => setShowCalmPresentation(false)}
        />
      )}
    </div>
  );
};
