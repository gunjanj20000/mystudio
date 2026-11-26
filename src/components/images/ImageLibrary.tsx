import React, { useState } from 'react';
import type { ImageAsset } from '../../types';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Image as ImageIcon, Upload, Search, Tag, Trash2,
  X, Check, Folder, Sparkles, Filter
} from 'lucide-react';

interface ImageLibraryProps {
  onSelectImage?: (asset: ImageAsset) => void;
  onClose: () => void;
}

export const ImageLibrary: React.FC<ImageLibraryProps> = ({ onSelectImage, onClose }) => {
  const assets = useLiveQuery(() => db.assets.toArray(), []) || [];
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      let url = '';
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        url = data.url;
      } catch (_) {
        // Fallback to local DataURL / ObjectURL
        url = URL.createObjectURL(file);
      }

      const newAsset: ImageAsset = {
        id: `asset-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: url,
        type: file.type.includes('svg') ? 'illustration' : 'photo',
        category: 'custom',
        tags: ['uploaded', 'custom'],
        isBuiltin: false,
        createdAt: Date.now()
      };

      await db.assets.add(newAsset);
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this asset?')) {
      await db.assets.delete(id);
    }
  };

  const categories = [
    { id: 'all', label: 'All Visuals' },
    { id: 'routines', label: 'Daily Routines' },
    { id: 'safety', label: 'Safety & Traffic' },
    { id: 'science', label: 'Science & Plants' },
    { id: 'emotions', label: 'Emotions' },
    { id: 'fruits', label: 'Fruits & Food' },
    { id: 'custom', label: 'My Uploads' }
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = activeCategory === 'all' || asset.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Visual & Image Studio (चित्र संग्रह)
              </h2>
              <p className="text-xs text-slate-500">
                High-contrast photographs, 3D cartoon illustrations, and educational diagrams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer transition shadow-sm">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === c.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search images or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group rounded-2xl border border-slate-200 bg-white hover:border-sky-500 hover:shadow-md transition flex flex-col overflow-hidden"
              >
                {/* Visual */}
                <div className="h-36 bg-slate-50 flex items-center justify-center p-3 relative">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain drop-shadow-sm"
                  />
                  {asset.isBuiltin && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                      Built-in
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs truncate">
                      {asset.name}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {asset.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {onSelectImage ? (
                      <button
                        onClick={() => onSelectImage(asset)}
                        className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
                      >
                        Use in Scene
                      </button>
                    ) : (
                      !asset.isBuiltin && (
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-bold text-sm">No images found in this category.</p>
              <p className="text-xs mt-1">Click "Upload Image" above to add your own.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
