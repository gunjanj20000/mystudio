import React, { useState } from 'react';
import type { Project } from '../../types';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { VideoWizard } from '../wizard/VideoWizard';
import { SceneEditor } from '../editor/SceneEditor';
import { CalmPlayer } from '../presentation/CalmPlayer';
import { ImageLibrary } from '../images/ImageLibrary';
import { CharacterLibrary } from '../characters/CharacterLibrary';
import { VoiceStudio } from '../voice/VoiceStudio';
import { TemplatesLibrary } from '../templates/TemplatesLibrary';
import { SettingsModal } from '../settings/SettingsModal';
import { ExportModal } from '../export/ExportModal';
import {
  Plus, Video, Play, Copy, Trash2, Edit3, Download,
  Upload, Search, Sparkles, Volume2, Users, Image as ImageIcon,
  Layers, Settings, Film, Clock, CheckCircle2, ChevronRight,
  MoreVertical, Shield
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const projects = useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray(), []) || [];

  // Active view states
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [presentingProject, setPresentingProject] = useState<Project | null>(null);
  const [exportingProject, setExportingProject] = useState<Project | null>(null);
  const [voiceStudioProject, setVoiceStudioProject] = useState<Project | null>(null);

  // Modals
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [showImageLibrary, setShowImageLibrary] = useState<boolean>(false);
  const [showCharacterLibrary, setShowCharacterLibrary] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Project Actions
  const handleDuplicate = async (p: Project) => {
    const duplicated: Project = {
      ...p,
      id: `proj-${Date.now()}`,
      title: `${p.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.projects.add(duplicated);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this educational video project?')) {
      await db.projects.delete(id);
    }
  };

  const handleRename = async (p: Project) => {
    const newTitle = prompt('Enter new project title:', p.title);
    if (newTitle && newTitle.trim()) {
      await db.projects.update(p.id, { title: newTitle.trim(), updatedAt: Date.now() });
    }
  };

  // Export Project JSON Backup
  const handleExportBackup = (p: Project) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(p, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${p.title.replace(/[^a-zA-Z0-9]/g, '_')}_backup.json`;
    a.click();
  };

  // Import Project JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported: Project = JSON.parse(event.target?.result as string);
        imported.id = `proj-imported-${Date.now()}`;
        imported.updatedAt = Date.now();
        await db.projects.add(imported);
        alert('Project backup imported successfully!');
      } catch (err) {
        alert('Invalid project backup file.');
      }
    };
    reader.readAsText(file);
  };

  const filteredProjects = projects.filter((p) => {
    return !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // If in Scene Editor view
  if (activeProject) {
    return (
      <SceneEditor
        project={activeProject}
        onBack={() => setActiveProject(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>My Learning Studio</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Local-First
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Bilingual Educational Video Maker for Visual Learning
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm transition shadow-md shadow-sky-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Video</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Studio Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Quick Studio Navigation Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              title: 'Create New',
              desc: 'Step-by-step wizard',
              icon: Plus,
              color: 'from-sky-500 to-sky-600',
              action: () => setShowWizard(true)
            },
            {
              title: 'Video Templates',
              desc: 'Daily living stories',
              icon: Layers,
              color: 'from-amber-500 to-amber-600',
              action: () => setShowTemplates(true)
            },
            {
              title: 'Character Library',
              desc: 'Consistent guides',
              icon: Users,
              color: 'from-indigo-500 to-indigo-600',
              action: () => setShowCharacterLibrary(true)
            },
            {
              title: 'Image Library',
              desc: 'High-contrast visuals',
              icon: ImageIcon,
              color: 'from-teal-500 to-teal-600',
              action: () => setShowImageLibrary(true)
            },
            {
              title: 'Voice Studio',
              desc: 'Hindi & English TTS',
              icon: Volume2,
              color: 'from-rose-500 to-rose-600',
              action: () => {
                if (projects.length > 0) setVoiceStudioProject(projects[0]);
                else setShowWizard(true);
              }
            },
            {
              title: 'Studio Settings',
              desc: 'AI & Sensory config',
              icon: Settings,
              color: 'from-slate-600 to-slate-700',
              action: () => setShowSettings(true)
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={item.action}
                className="p-4 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition text-left flex flex-col justify-between h-28 group"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-800 text-xs group-hover:text-sky-600 transition">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Autism Support Hero Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-sky-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Autism-Friendly "Calm Learning" Mode Active</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Personalized Visual Learning for Your Child
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed specifically for a 12-year-old nonverbal autistic learner: uncluttered single-focus screens, slow predictable animations, zero flashing effects, Hindi and English bilingual audio, and instant repeat buttons.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition border border-white/10 backdrop-blur-sm">
              <Upload className="w-4 h-4" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-teal-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Video</span>
            </button>
          </div>
        </div>

        {/* My Projects Header & Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>My Video Projects</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-xs font-bold">
                  {filteredProjects.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                All projects are stored securely in your browser's local IndexedDB
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
              const sceneCount = p.scenes?.length || 0;
              const totalSec = p.scenes?.reduce((acc, s) => acc + (s.duration || 6), 0) || 0;

              return (
                <div
                  key={p.id}
                  className="rounded-3xl border border-slate-200/90 bg-white hover:border-sky-400 hover:shadow-xl transition flex flex-col justify-between overflow-hidden group"
                >
                  {/* Thumbnail / Header */}
                  <div
                    onClick={() => setActiveProject(p)}
                    className="h-44 bg-gradient-to-br from-slate-100 to-sky-50 flex items-center justify-center p-6 border-b border-slate-100 cursor-pointer relative"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center mx-auto mb-2 text-sky-600 group-hover:scale-105 transition">
                        <Video className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 block">
                        {p.topic}
                      </span>
                    </div>

                    {/* Language Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
                      {p.language.toUpperCase()}
                    </span>

                    {/* Duration Badge */}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-slate-700 text-[10px] font-bold shadow-sm">
                      {Math.round(totalSec)}s • {sceneCount} scenes
                    </span>
                  </div>

                  {/* Project Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4
                        onClick={() => setActiveProject(p)}
                        className="font-extrabold text-slate-900 text-base hover:text-sky-600 transition cursor-pointer line-clamp-1"
                      >
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {/* Top Primary Actions */}
                      <div className="flex items-center gap-2">
                        {/* Calm Mode Presentation */}
                        <button
                          onClick={() => setPresentingProject(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 font-bold text-xs transition"
                          title="Watch in Calm Learning Mode"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-teal-600" />
                          <span>Present</span>
                        </button>

                        {/* Edit Scenes */}
                        <button
                          onClick={() => setActiveProject(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Export MP4 */}
                        <button
                          onClick={() => setExportingProject(p)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                          title="Export MP4 Video"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Secondary Actions (Duplicate, Rename, Backup, Delete) */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="hover:text-slate-700 flex items-center gap-1 font-semibold"
                        >
                          <Copy className="w-3 h-3" /> Duplicate
                        </button>

                        <button
                          onClick={() => handleRename(p)}
                          className="hover:text-slate-700 flex items-center gap-1 font-semibold"
                        >
                          <Edit3 className="w-3 h-3" /> Rename
                        </button>

                        <button
                          onClick={() => handleExportBackup(p)}
                          className="hover:text-slate-700 flex items-center gap-1 font-semibold"
                        >
                          <Download className="w-3 h-3" /> Backup
                        </button>

                        <button
                          onClick={() => handleDelete(p.id)}
                          className="hover:text-red-600 flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <Video className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-extrabold text-base text-slate-800">
                No Video Projects Found
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Get started by creating your first educational video project or choosing a ready-made template.
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create First Video
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Global Modals */}
      {showWizard && (
        <VideoWizard
          onComplete={(newProj) => {
            setShowWizard(false);
            setActiveProject(newProj);
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {presentingProject && (
        <CalmPlayer
          project={presentingProject}
          onClose={() => setPresentingProject(null)}
        />
      )}

      {exportingProject && (
        <ExportModal
          project={exportingProject}
          onClose={() => setExportingProject(null)}
        />
      )}

      {voiceStudioProject && (
        <VoiceStudio
          project={voiceStudioProject}
          onUpdateProject={() => {}}
          onClose={() => setVoiceStudioProject(null)}
        />
      )}

      {showTemplates && (
        <TemplatesLibrary
          onSelectTemplate={(newProj) => {
            setShowTemplates(false);
            setActiveProject(newProj);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showCharacterLibrary && (
        <CharacterLibrary
          onClose={() => setShowCharacterLibrary(false)}
        />
      )}

      {showImageLibrary && (
        <ImageLibrary
          onClose={() => setShowImageLibrary(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
