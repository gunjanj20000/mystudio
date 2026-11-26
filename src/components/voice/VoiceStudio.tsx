import React, { useState, useEffect, useRef } from 'react';
import type { Project, Scene } from '../../types';
import { audioService } from '../../services/audio';
import { db } from '../../db';
import {
  Mic, Play, Pause, Volume2, Upload, RotateCcw, CheckCircle,
  Sliders, Music, Check, Sparkles, FileAudio, AlertCircle
} from 'lucide-react';

interface VoiceStudioProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onClose: () => void;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({ project, onUpdateProject, onClose }) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(project.narrationSpeed || 0.85);
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);
  const [activeVoiceLanguage, setActiveVoiceLanguage] = useState<'hindi' | 'english' | 'both'>('both');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scenes = project.scenes || [];
  const currentScene: Scene | undefined = scenes[selectedSceneIndex];

  // Test Speak Current Scene
  const handleTestNarration = (langToSpeak: 'hindi' | 'english' | 'both') => {
    if (!currentScene) return;
    audioService.stopSpeech();

    if (langToSpeak === 'hindi') {
      const text = currentScene.hindiNarration || currentScene.hindiOnScreenText || '';
      audioService.speakNarration(
        text,
        'hi-IN',
        speechRate,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    } else if (langToSpeak === 'english') {
      const text = currentScene.englishNarration || currentScene.onScreenText || '';
      audioService.speakNarration(
        text,
        'en-US',
        speechRate,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    } else {
      // Speak Hindi first, then English
      const hindiText = currentScene.hindiNarration || '';
      const englishText = currentScene.englishNarration || '';
      setIsPlaying(true);
      audioService.speakNarration(
        hindiText,
        'hi-IN',
        speechRate,
        undefined,
        () => {
          setTimeout(() => {
            audioService.speakNarration(
              englishText,
              'en-US',
              speechRate,
              undefined,
              () => setIsPlaying(false),
              () => setIsPlaying(false)
            );
          }, 400);
        },
        () => setIsPlaying(false)
      );
    }
  };

  const handleStopSpeech = () => {
    audioService.stopSpeech();
    setIsPlaying(false);
  };

  // Start Mic Recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Update current scene with audio url
        updateCurrentSceneAudio(url);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access is required to record narration.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload MP3/WAV narration
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        updateCurrentSceneAudio(data.url);
      }
    } catch (_) {
      // Fallback to local Object URL
      const localUrl = URL.createObjectURL(file);
      updateCurrentSceneAudio(localUrl);
    }
  };

  // Update current scene in project
  const updateCurrentSceneAudio = async (url: string) => {
    if (!currentScene) return;
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = {
      ...currentScene,
      audioSync: {
        ...currentScene.audioSync,
        hindiAudioUrl: url,
        approvedByParent: true
      }
    };
    const updatedProject = { ...project, scenes: updatedScenes, updatedAt: Date.now() };
    await db.projects.put(updatedProject);
    onUpdateProject(updatedProject);
  };

  // Toggle Parent Approval
  const toggleParentApproval = async () => {
    if (!currentScene) return;
    const isApproved = !currentScene.audioSync?.approvedByParent;
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = {
      ...currentScene,
      audioSync: {
        ...currentScene.audioSync,
        approvedByParent: isApproved
      }
    };
    const updatedProject = { ...project, scenes: updatedScenes, updatedAt: Date.now() };
    await db.projects.put(updatedProject);
    onUpdateProject(updatedProject);
  };

  // Update Text in Scene
  const handleTextChange = async (field: 'hindiNarration' | 'englishNarration', value: string) => {
    if (!currentScene) return;
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = {
      ...currentScene,
      [field]: value
    };
    const updatedProject = { ...project, scenes: updatedScenes, updatedAt: Date.now() };
    await db.projects.put(updatedProject);
    onUpdateProject(updatedProject);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-700">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Bilingual Voice Studio (आवाज संपादक)
              </h2>
              <p className="text-xs text-slate-500">
                Fine-tune Hindi & English voice narration, speech pacing, recordings and subtitles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/50 font-bold text-sm transition"
          >
            Done
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Scene Selector List */}
          <div className="w-72 border-r border-slate-200 bg-slate-50/50 p-4 overflow-y-auto space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-2">
              Select Scene
            </h3>
            {scenes.map((scene, idx) => {
              const isApproved = scene.audioSync?.approvedByParent;
              return (
                <button
                  key={scene.id || idx}
                  onClick={() => {
                    handleStopSpeech();
                    setSelectedSceneIndex(idx);
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left border transition flex items-start justify-between ${
                    selectedSceneIndex === idx
                      ? 'bg-white border-teal-600 shadow-sm'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[11px] font-bold text-teal-700 block">
                      Scene {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {scene.title}
                    </span>
                  </div>
                  {isApproved ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Audio Editor for Selected Scene */}
          {currentScene ? (
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              {/* Scene Title & Parent Approval Status */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                    Editing Scene {selectedSceneIndex + 1}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">
                    {currentScene.title}
                  </h3>
                </div>

                <button
                  onClick={toggleParentApproval}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    currentScene.audioSync?.approvedByParent
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {currentScene.audioSync?.approvedByParent
                    ? 'Parent Approved ✓'
                    : 'Approve Narration'}
                </button>
              </div>

              {/* Hindi Narration Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <span>Hindi Narration (हिंदी आवाज)</span>
                  </label>
                  <button
                    onClick={() => handleTestNarration('hindi')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Preview Hindi
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={currentScene.hindiNarration}
                  onChange={(e) => handleTextChange('hindiNarration', e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-devanagari font-medium text-slate-800 text-base"
                />
              </div>

              {/* English Narration Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <span>English Narration</span>
                  </label>
                  <button
                    onClick={() => handleTestNarration('english')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-bold transition"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Preview English
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={currentScene.englishNarration}
                  onChange={(e) => handleTextChange('englishNarration', e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800 text-base"
                />
              </div>

              {/* Speech Playback Controls */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Voice Pacing & Tone
                    </span>
                  </div>

                  {/* Speech Rate Slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Speed:</span>
                    {[0.7, 0.85, 1.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setSpeechRate(rate)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          speechRate === rate
                            ? 'bg-teal-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTestNarration('both')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>Preview Bilingual Narration (दोनों भाषाएँ)</span>
                  </button>
                  {isPlaying && (
                    <button
                      onClick={handleStopSpeech}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>

              {/* Upload or Record Custom Audio */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-teal-600" />
                  Custom Audio Narration (MP3 / WAV / Mic)
                </h4>
                <div className="flex items-center gap-3">
                  {/* Record with Mic */}
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Mic className="w-4 h-4 text-red-500" />
                    <span>{isRecording ? 'Recording (Click to stop)' : 'Record from Mic'}</span>
                  </button>

                  {/* Upload Audio File */}
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition">
                    <Upload className="w-4 h-4 text-teal-600" />
                    <span>Upload Audio File</span>
                    <input
                      type="file"
                      accept="audio/mp3,audio/wav,audio/webm"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>

                  {currentScene.audioSync?.hindiAudioUrl && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Audio Attached
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
              Select a scene from the left to edit its narration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
