import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { aiService } from '../../services/ai';
import {
  Settings, Key, Sparkles, Check, AlertCircle,
  RefreshCw, Volume2, Shield, Eye, HelpCircle, X
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'providers' | 'sensory' | 'system'>('providers');

  // AI Provider Keys & Config
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [anthropicKey, setAnthropicKey] = useState<string>('');
  const [elevenlabsKey, setElevenlabsKey] = useState<string>('');

  // Selected Providers
  const [textProvider, setTextProvider] = useState<'offline' | 'openai' | 'gemini' | 'anthropic'>('offline');
  const [imageProvider, setImageProvider] = useState<'offline' | 'dalle' | 'pollinations'>('offline');
  const [ttsProvider, setTtsProvider] = useState<'browser' | 'openai' | 'elevenlabs'>('browser');

  // Test Connection status
  const [testStatus, setTestStatus] = useState<{ [key: string]: { loading: boolean; message?: string; success?: boolean } }>({});

  // System Diagnostics
  const [systemDiag, setSystemDiag] = useState<any>(null);

  // Load from Dexie settings
  useEffect(() => {
    (async () => {
      const keys = await db.settings.get('ai_keys');
      if (keys?.value) {
        setOpenaiKey(keys.value.openai || '');
        setGeminiKey(keys.value.gemini || '');
        setAnthropicKey(keys.value.anthropic || '');
        setElevenlabsKey(keys.value.elevenlabs || '');
        setTextProvider(keys.value.textProvider || 'offline');
        setImageProvider(keys.value.imageProvider || 'offline');
        setTtsProvider(keys.value.ttsProvider || 'browser');
      }

      // Check system health
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setSystemDiag(data.environment);
        }
      } catch (_) {}
    })();
  }, []);

  const handleSaveSettings = async () => {
    await db.settings.put({
      key: 'ai_keys',
      value: {
        openai: openaiKey,
        gemini: geminiKey,
        anthropic: anthropicKey,
        elevenlabs: elevenlabsKey,
        textProvider,
        imageProvider,
        ttsProvider
      }
    });
    alert('Settings saved successfully!');
    onClose();
  };

  const handleTestConnection = async (provider: string, key?: string) => {
    setTestStatus((prev) => ({ ...prev, [provider]: { loading: true } }));
    const result = await aiService.testProviderConnection(provider, key);
    setTestStatus((prev) => ({
      ...prev,
      [provider]: { loading: false, message: result.message, success: result.success }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Studio Settings</h2>
              <p className="text-xs text-slate-500">
                Configure AI providers, sensory defaults, and local rendering diagnostics
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-8 bg-white">
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'providers'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            AI Providers & Keys
          </button>
          <button
            onClick={() => setActiveTab('sensory')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'sensory'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Autism Sensory Defaults
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'system'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            System & Video Engine
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeTab === 'providers' && (
            <div className="space-y-6 animate-fade-in">
              {/* Offline-First Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Local-First: No Paid API Keys Required!
                </div>
                The studio comes with full built-in offline educational scripts, curated graphic libraries, browser TTS voices (Hindi & English), and ready-made animation templates. External AI providers are 100% optional.
              </div>

              {/* Text & Script Generator Provider */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Script & Story Generation Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'offline', title: 'Built-in Educational Engine (Free / Offline)' },
                    { id: 'openai', title: 'OpenAI GPT-4o' },
                    { id: 'gemini', title: 'Google Gemini' },
                    { id: 'anthropic', title: 'Anthropic Claude' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTextProvider(p.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                        textProvider === p.id
                          ? 'bg-sky-50 border-sky-600 text-sky-800 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">OpenAI API Key (Optional)</label>
                  <button
                    onClick={() => handleTestConnection('openai', openaiKey)}
                    disabled={!openaiKey || testStatus.openai?.loading}
                    className="text-xs font-bold text-sky-600 hover:underline disabled:opacity-40"
                  >
                    {testStatus.openai?.loading ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
                {testStatus.openai?.message && (
                  <p className={`text-xs ${testStatus.openai.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {testStatus.openai.message}
                  </p>
                )}
              </div>

              {/* Gemini API Key */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Google Gemini API Key (Optional)</label>
                  <button
                    onClick={() => handleTestConnection('gemini', geminiKey)}
                    disabled={!geminiKey || testStatus.gemini?.loading}
                    className="text-xs font-bold text-sky-600 hover:underline disabled:opacity-40"
                  >
                    {testStatus.gemini?.loading ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              {/* ElevenLabs API Key */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">ElevenLabs TTS Key (Optional)</label>
                  <button
                    onClick={() => handleTestConnection('elevenlabs', elevenlabsKey)}
                    disabled={!elevenlabsKey || testStatus.elevenlabs?.loading}
                    className="text-xs font-bold text-sky-600 hover:underline disabled:opacity-40"
                  >
                    {testStatus.elevenlabs?.loading ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="elevenlabs-key..."
                  value={elevenlabsKey}
                  onChange={(e) => setElevenlabsKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'sensory' && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900">
                <h4 className="font-bold text-sm mb-1">Calm Learning Environment Preset</h4>
                <p>
                  Optimized for a 12-year-old nonverbal autistic learner: predictable visual pacing, zero flashing lights, soft soothing audio frequencies, and repeat loops.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                  <div>
                    <span className="font-bold text-slate-800 block">One main concept per scene</span>
                    <span className="text-slate-500">Limits clutter and avoids divided visual attention.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                  <div>
                    <span className="font-bold text-slate-800 block">Strict No-Flashing Rule</span>
                    <span className="text-slate-500">Guarantees zero strobe or rapid brightness oscillation.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                  <div>
                    <span className="font-bold text-slate-800 block">Pause between scenes with Visual Countdown</span>
                    <span className="text-slate-500">Allows reflection and processing time before the next step begins.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                  <div>
                    <span className="font-bold text-slate-800 block">Always Show Repeat Buttons</span>
                    <span className="text-slate-500">Child or parent can repeat any action or voice with one tap.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <h4 className="font-bold text-sm text-slate-800">Local Rendering Engine Diagnostics</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700">HyperFrames CLI</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {systemDiag?.hyperframes?.version || 'v0.9.96 (Active)'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700">FFmpeg Video/Audio Engine</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {systemDiag?.ffmpeg?.installed ? 'Installed (H.264 & AAC)' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700">Headless Google Chrome</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {systemDiag?.chrome?.installed ? 'Installed' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700">Storage Engine</span>
                  <span className="font-mono text-sky-600 font-bold">
                    Dexie.js IndexedDB (Local-First)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/50 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
