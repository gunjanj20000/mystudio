import React from 'react';
import type { VideoTemplate, Project } from '../../types';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Layers, Clock, ArrowRight, X, Sparkles, BookOpen,
  Heart, Shield, Sun, Check
} from 'lucide-react';

interface TemplatesLibraryProps {
  onSelectTemplate: (project: Project) => void;
  onClose: () => void;
}

export const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({ onSelectTemplate, onClose }) => {
  const templates = useLiveQuery(() => db.templates.toArray(), []) || [];

  const handleUseTemplate = async (template: VideoTemplate) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: `${template.title} (From Template)`,
      topic: template.title,
      description: template.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      targetDurationMinutes: template.estimatedDuration || 3,
      ageLevel: template.targetAge || '12 years (Visual Learner)',
      difficultyLevel: 'beginner',
      language: 'bilingual',
      narrationSpeed: 0.85,
      defaultVisualStyle: '3d_cartoon',
      backgroundMusic: 'low',
      subtitles: {
        language: 'dual',
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
      scenes: (template.sampleScenes || []).map((s, idx) => ({
        id: `sc-${Date.now()}-${idx}`,
        title: s.title || `Scene ${idx + 1}`,
        order: idx,
        educationalObjective: s.educationalObjective || '',
        hindiNarration: s.hindiNarration || '',
        englishNarration: s.englishNarration || '',
        onScreenText: s.onScreenText || '',
        hindiOnScreenText: s.hindiOnScreenText || '',
        imageDescription: s.imageDescription || '',
        visualStyle: s.visualStyle || '3d_cartoon',
        duration: s.duration || 8,
        transitionType: s.transitionType || 'fade',
        soundEffect: s.soundEffect || 'gentle_chime',
        visualObjects: [
          {
            id: `obj-${idx}`,
            type: 'template',
            templateType: template.id.includes('brushing')
              ? 'brushing_teeth'
              : template.id.includes('plant')
              ? 'plant_growth'
              : template.id.includes('traffic')
              ? 'traffic_light'
              : 'hand_washing',
            content: 'template',
            label: s.onScreenText || s.title,
            x: 50,
            y: 50,
            width: 60,
            height: 60,
            scale: 1,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            animation: {
              effect: 'fade',
              duration: 1.5,
              delay: 0.2,
              repeat: false,
              easing: 'ease-in-out'
            }
          }
        ]
      }))
    };

    await db.projects.add(newProject);
    onSelectTemplate(newProject);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Educational Video Templates (वीडियो टेम्पलेट)
              </h2>
              <p className="text-xs text-slate-500">
                Ready-to-use structured stories for daily living skills, routines, and science
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-3xl border border-slate-200 p-6 bg-white hover:border-amber-400 hover:shadow-lg transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                      {tpl.category.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {tpl.estimatedDuration} min ({tpl.scenesCount} scenes)
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-lg">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Target: {tpl.targetAge}
                  </span>

                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-sm"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
