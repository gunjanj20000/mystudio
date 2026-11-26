export type LanguagePreference = 'hindi' | 'english' | 'bilingual';
export type VisualStyle = '3d_cartoon' | 'real_photo' | 'illustrated_diagram' | 'mixed_photo_cartoon' | 'infographic';
export type AnimationEffect = 'none' | 'fade' | 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'bounce' | 'pulse' | 'float' | 'highlight' | 'grow';
export type TransitionType = 'fade' | 'slide' | 'dissolve' | 'cut';
export type AnimationTemplateType = 
  | 'none'
  | 'elephant_trunk'
  | 'brushing_teeth'
  | 'plant_growth'
  | 'bouncing_ball'
  | 'water_flow'
  | 'traffic_light'
  | 'hand_washing';

export type SoundEffectType = 
  | 'none'
  | 'gentle_chime'
  | 'soft_bell'
  | 'water_splash'
  | 'brush_scrub'
  | 'nature_breeze'
  | 'pop'
  | 'success_chime';

export interface VisualObject {
  id: string;
  type: 'image' | 'illustration' | 'text' | 'shape' | 'arrow' | 'character' | 'template';
  content: string; // URL, SVG, or text content
  label?: string; // High-contrast label for autism accessibility
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
  scale: number; // 0.1 - 3
  rotation: number; // degrees
  opacity: number; // 0 - 1
  zIndex: number;
  animation: {
    effect: AnimationEffect;
    duration: number; // seconds
    delay: number; // seconds
    repeat: boolean;
    easing: 'linear' | 'ease-in-out' | 'ease-out' | 'elastic';
  };
  characterId?: string;
  templateType?: AnimationTemplateType;
  highlighted?: boolean;
}

export interface Scene {
  id: string;
  title: string;
  order: number;
  educationalObjective: string;
  hindiNarration: string;
  englishNarration: string;
  onScreenText: string;
  hindiOnScreenText?: string;
  imageDescription: string;
  visualStyle: VisualStyle;
  visualObjects: VisualObject[];
  soundEffect: SoundEffectType;
  duration: number; // seconds
  transitionType: TransitionType;
  audioSync?: {
    hindiAudioUrl?: string;
    englishAudioUrl?: string;
    duration?: number;
    approvedByParent?: boolean;
  };
  calmModeOverride?: {
    singleFocusItem?: boolean;
    slowAnimation?: boolean;
    pauseAfterSceneSeconds?: number;
  };
}

export interface AutismCalmSettings {
  enabled: boolean;
  sensoryIntensity: 'low' | 'moderate' | 'full'; // low = extra calm, no bgm, very slow
  oneConceptPerScene: boolean;
  largeHighContrastVisuals: boolean;
  slowPacingMultiplier: number; // e.g. 1.25x or 1.5x slower
  pauseBetweenScenes: boolean;
  pauseDurationSeconds: number; // default 3 seconds
  noFlashingEffects: boolean;
  noSuddenSounds: boolean;
  showVisualCountdown: boolean;
  enableRepeatButtons: boolean;
}

export interface SubtitleSettings {
  language: 'hindi' | 'english' | 'dual' | 'none';
  fontSize: 'medium' | 'large' | 'extra-large';
  position: 'bottom' | 'top' | 'center';
  contrast: 'high' | 'normal' | 'soft';
  highlightCurrentSpokenWord: boolean;
}

export interface Project {
  id: string;
  title: string;
  topic: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  targetDurationMinutes: number; // 1, 3, 5, 10, 15
  ageLevel: string; // e.g. "12 years (Special Education)"
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  language: LanguagePreference;
  narrationSpeed: number; // 0.7, 0.85, 1.0, 1.2
  defaultVisualStyle: VisualStyle;
  backgroundMusic: 'off' | 'low' | 'normal';
  bgmTrack?: string;
  subtitles: SubtitleSettings;
  calmSettings: AutismCalmSettings;
  scenes: Scene[];
  characterIds?: string[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  appearance: string;
  clothing: string;
  style: VisualStyle;
  referenceImage: string; // Base64 or Blob URL or SVG
  tags: string[];
  createdAt: number;
}

export interface ImageAsset {
  id: string;
  name: string;
  url: string;
  type: 'photo' | 'illustration' | 'diagram' | 'character' | 'background';
  category: string; // 'animals', 'routines', 'emotions', 'nature', 'tools', etc.
  tags: string[];
  isBuiltin?: boolean;
  createdAt: number;
}

export interface VideoTemplate {
  id: string;
  title: string;
  category: 'daily_routines' | 'social_stories' | 'emotions' | 'science' | 'animals' | 'safety';
  description: string;
  targetAge: string;
  estimatedDuration: number; // minutes
  scenesCount: number;
  thumbnail: string;
  sampleScenes: Partial<Scene>[];
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'text' | 'image' | 'tts';
  provider: 'offline' | 'openai' | 'anthropic' | 'gemini' | 'elevenlabs' | 'stability' | 'pollinations' | 'browser';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  enabled: boolean;
  isAvailable: boolean;
  statusMessage?: string;
  lastTested?: number;
}

export interface RenderJobRequest {
  projectId: string;
  projectTitle: string;
  resolution: '1920x1080' | '1280x720';
  fps: 25 | 30;
  audioTrack: 'hindi' | 'english' | 'dual' | 'none';
  includeSubtitles: boolean;
  includeSoundEffects: boolean;
  includeBGM: boolean;
  scenes: Scene[];
  subtitlesConfig: SubtitleSettings;
}

export interface RenderJobProgress {
  jobId: string;
  status: 'idle' | 'preparing' | 'capturing' | 'encoding' | 'completed' | 'error' | 'cancelled';
  progress: number; // 0 - 100
  currentFrame?: number;
  totalFrames?: number;
  currentScene?: number;
  totalScenes?: number;
  message: string;
  outputVideoUrl?: string;
  outputFileSize?: number;
  errorMessage?: string;
  durationSeconds?: number;
}
