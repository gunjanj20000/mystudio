import type { AIProviderConfig, Scene, VisualStyle } from '../../types';

export interface GenerateStoryParams {
  topic: string;
  language: 'hindi' | 'english' | 'bilingual';
  targetDurationMinutes: number;
  visualStyle: VisualStyle;
  ageLevel: string;
  difficultyLevel: string;
}

class AIService {
  // Offline Educational Story Generator - 100% functional without any API keys!
  public async generateOfflineStory(params: GenerateStoryParams): Promise<Scene[]> {
    const { topic, language, visualStyle } = params;
    const cleanTopic = topic.trim().toLowerCase();

    // Check backend endpoint first for rich structured templates
    try {
      const res = await fetch('/api/ai/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scenes && data.scenes.length > 0) {
          return data.scenes.map((s: any, idx: number) => ({
            ...s,
            id: `scene-${Date.now()}-${idx}`,
            order: idx,
            visualObjects: s.visualObjects || [
              {
                id: `obj-${idx}-main`,
                type: 'illustration',
                content: s.imageDescription || topic,
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
          }));
        }
      }
    } catch (_) {
      // Fallback to client-side logic below
    }

    // Client-side fallback script generation for any topic
    const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    return [
      {
        id: `scene-${Date.now()}-0`,
        title: `Introduction: ${capitalizedTopic}`,
        order: 0,
        educationalObjective: `Introduce the topic ${capitalizedTopic} with clear visual focus`,
        hindiNarration: `नमस्ते! आज हम ${capitalizedTopic} के बारे में सीखेंगे।`,
        englishNarration: `Hello! Today we are learning about ${capitalizedTopic}.`,
        onScreenText: `Learning: ${capitalizedTopic}`,
        hindiOnScreenText: `आज का विषय: ${capitalizedTopic}`,
        imageDescription: `Clear visual introduction to ${capitalizedTopic}`,
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'gentle_chime',
        visualObjects: [
          {
            id: `obj-0-main`,
            type: 'text',
            content: `🌟 ${capitalizedTopic} 🌟`,
            label: capitalizedTopic,
            x: 50,
            y: 50,
            width: 70,
            height: 40,
            scale: 1,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            animation: {
              effect: 'zoom_in',
              duration: 1.5,
              delay: 0.2,
              repeat: false,
              easing: 'ease-out'
            }
          }
        ]
      },
      {
        id: `scene-${Date.now()}-1`,
        title: `Step 1: First Action in ${capitalizedTopic}`,
        order: 1,
        educationalObjective: `Perform the first simple concrete step`,
        hindiNarration: `पहला कदम: इसे ध्यान से देखें और समझें।`,
        englishNarration: `Step one: Look carefully and see what happens first.`,
        onScreenText: `Step 1: Look and understand`,
        hindiOnScreenText: `कदम १: ध्यान से देखें`,
        imageDescription: `First step illustration for ${capitalizedTopic}`,
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'soft_bell',
        visualObjects: [
          {
            id: `obj-1-main`,
            type: 'illustration',
            content: `Step 1: ${capitalizedTopic}`,
            label: 'Step 1 (कदम १)',
            x: 50,
            y: 50,
            width: 60,
            height: 50,
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
      },
      {
        id: `scene-${Date.now()}-2`,
        title: `Step 2: Doing It Gently`,
        order: 2,
        educationalObjective: `Practice the action smoothly and patiently`,
        hindiNarration: `दूसरा कदम: अब हम इसे धीरे-धीरे और आराम से करेंगे।`,
        englishNarration: `Step two: Now we do this gently and calmly.`,
        onScreenText: `Step 2: Gently and calmly`,
        hindiOnScreenText: `कदम २: धीरे-धीरे और आराम से`,
        imageDescription: `Second step practice for ${capitalizedTopic}`,
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'gentle_chime',
        visualObjects: [
          {
            id: `obj-2-main`,
            type: 'illustration',
            content: `Step 2: Doing It`,
            label: 'Step 2 (कदम २)',
            x: 50,
            y: 50,
            width: 60,
            height: 50,
            scale: 1,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            animation: {
              effect: 'pulse',
              duration: 2.0,
              delay: 0.2,
              repeat: true,
              easing: 'ease-in-out'
            }
          }
        ]
      },
      {
        id: `scene-${Date.now()}-3`,
        title: `Completion & Great Job!`,
        order: 3,
        educationalObjective: `Positive visual praise and completion`,
        hindiNarration: `बहुत बढ़िया! आपने आज बहुत अच्छा सीखा। शाबाश!`,
        englishNarration: `Fantastic! You learned this so well today. Great job!`,
        onScreenText: `Great Job! (शाबाश!)`,
        hindiOnScreenText: `बहुत बढ़िया! शाबाश!`,
        imageDescription: `Celebration reward smile for ${capitalizedTopic}`,
        visualStyle: visualStyle,
        duration: 8,
        transitionType: 'fade',
        soundEffect: 'success_chime',
        visualObjects: [
          {
            id: `obj-3-main`,
            type: 'image',
            content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ecfdf5"/><circle cx="100" cy="100" r="70" fill="%23fef08a"/><circle cx="75" cy="90" r="10" fill="%230f172a"/><circle cx="125" cy="90" r="10" fill="%230f172a"/><path d="M 70 120 Q 100 155 130 120" stroke="%23b45309" stroke-width="8" stroke-linecap="round" fill="none"/><text x="100" y="185" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="16" fill="%23047857">✨ GREAT JOB! ✨</text></svg>',
            label: 'Clean & Happy (शाबाश!)',
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
          }
        ]
      }
    ];
  }

  // Test Provider Connection
  public async testProviderConnection(provider: string, apiKey?: string): Promise<{ success: boolean; message: string }> {
    if (provider === 'offline' || provider === 'browser') {
      return { success: true, message: 'Local/Browser provider is ready and functional.' };
    }
    if (!apiKey) {
      return { success: false, message: 'API key is required to test this provider.' };
    }

    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey })
      });
      const data = await res.json();
      return {
        success: data.success,
        message: data.message || (data.success ? 'Connected successfully!' : 'Connection failed')
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error reaching backend proxy' };
    }
  }
}

export const aiService = new AIService();
