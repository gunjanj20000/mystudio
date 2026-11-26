import React, { useState } from 'react';
import type { Character, VisualStyle } from '../../types';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Users, Plus, Trash2, Tag, Sparkles, Check,
  X, Image as ImageIcon, Smile, Shirt, Eye
} from 'lucide-react';

interface CharacterLibraryProps {
  onSelectCharacter?: (char: Character) => void;
  onClose: () => void;
}

export const CharacterLibrary: React.FC<CharacterLibraryProps> = ({ onSelectCharacter, onClose }) => {
  const characters = useLiveQuery(() => db.characters.toArray(), []) || [];
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Character Form
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('Learner');
  const [description, setDescription] = useState<string>('');
  const [appearance, setAppearance] = useState<string>('');
  const [clothing, setClothing] = useState<string>('');
  const [style, setStyle] = useState<VisualStyle>('3d_cartoon');
  const [referenceImage, setReferenceImage] = useState<string>('');

  const handleSaveCharacter = async () => {
    if (!name.trim()) return;

    const newChar: Character = {
      id: `char-${Date.now()}`,
      name,
      role,
      description,
      appearance,
      clothing,
      style,
      referenceImage: referenceImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e0f2fe"/><circle cx="100" cy="80" r="45" fill="%23fed7aa"/><circle cx="85" cy="75" r="5" fill="%230f172a"/><circle cx="115" cy="75" r="5" fill="%230f172a"/><path d="M 88 100 Q 100 112 112 100" stroke="%23ea580c" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="100" cy="130" r="12" fill="%23fed7aa"/></svg>',
      tags: [role.toLowerCase(), style],
      createdAt: Date.now()
    };

    await db.characters.add(newChar);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setRole('Learner');
    setDescription('');
    setAppearance('');
    setClothing('');
    setStyle('3d_cartoon');
    setReferenceImage('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this character?')) {
      await db.characters.delete(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Reusable Character Library (पात्र संग्रह)
              </h2>
              <p className="text-xs text-slate-500">
                Maintain visual and behavioral consistency across all video scenes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Character
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Character Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <div
                key={char.id}
                className="rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-lg transition flex flex-col overflow-hidden"
              >
                {/* Character Visual Preview */}
                <div className="h-44 bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 relative">
                  <img
                    src={char.referenceImage}
                    alt={char.name}
                    className="max-h-full max-w-full object-contain drop-shadow"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900/70 text-white text-[10px] font-bold">
                    {char.style === '3d_cartoon' ? '3D Cartoon' : 'Realistic'}
                  </span>
                </div>

                {/* Character Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base flex items-center justify-between">
                      <span>{char.name}</span>
                      <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                        {char.role}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {char.description}
                    </p>
                  </div>

                  {/* Appearance & Clothing Tags */}
                  <div className="space-y-1.5 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{char.appearance || 'Gentle & cheerful'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{char.clothing || 'Comfortable cotton shirt'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    {onSelectCharacter ? (
                      <button
                        onClick={() => onSelectCharacter(char)}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                      >
                        Insert into Scene
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        ID: {char.id}
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(char.id)}
                      className="p-2 ml-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete character"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Character Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">Create Consistent Character</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Character Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav, Teacher Meera, Milo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Student, Sister, Gentle Guide"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description & Personality</label>
                  <textarea
                    rows={2}
                    placeholder="Calm learner who responds well to visual cues..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Appearance</label>
                    <input
                      type="text"
                      placeholder="Short dark hair, gentle eyes"
                      value={appearance}
                      onChange={(e) => setAppearance(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Clothing</label>
                    <input
                      type="text"
                      placeholder="Sky-blue t-shirt"
                      value={clothing}
                      onChange={(e) => setClothing(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Visual Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="3d_cartoon">3D Cartoon Illustration</option>
                    <option value="real_photo">Realistic Photograph</option>
                    <option value="illustrated_diagram">Illustrated Diagram</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCharacter}
                  disabled={!name.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40"
                >
                  Save Character
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
