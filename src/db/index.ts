import Dexie, { type Table } from 'dexie';
import type { Project, Character, ImageAsset, VideoTemplate, AIProviderConfig } from '../types';

export class StudioDatabase extends Dexie {
  projects!: Table<Project, string>;
  characters!: Table<Character, string>;
  assets!: Table<ImageAsset, string>;
  templates!: Table<VideoTemplate, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('MyLearningStudioDB');
    this.version(1).stores({
      projects: 'id, title, topic, createdAt, updatedAt',
      characters: 'id, name, style, createdAt',
      assets: 'id, name, type, category, isBuiltin, createdAt',
      templates: 'id, title, category',
      settings: 'key'
    });
  }
}

export const db = new StudioDatabase();

// Initial Seed Data for offline-first readiness
export async function seedInitialData() {
  const charactersCount = await db.characters.count();
  if (charactersCount === 0) {
    const initialCharacters: Character[] = [
      {
        id: 'char-aarav',
        name: 'Aarav (आरव)',
        role: 'Protagonist',
        description: 'A 12-year-old kind, calm boy who loves visual learning, comfortable clothes, and routines.',
        appearance: 'Neat short dark hair, warm brown eyes, gentle and cheerful expression.',
        clothing: 'Comfortable sky-blue cotton t-shirt and navy trousers.',
        style: '3d_cartoon',
        referenceImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23e0f2fe"/><circle cx="100" cy="80" r="45" fill="%23fed7aa"/><circle cx="85" cy="75" r="5" fill="%230f172a"/><circle cx="115" cy="75" r="5" fill="%230f172a"/><path d="M 88 100 Q 100 112 112 100" stroke="%23ea580c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 55 55 Q 100 20 145 55 Q 150 70 145 80 Q 100 45 55 80 Z" fill="%231e293b"/><path d="M 50 190 L 50 140 Q 100 120 150 140 L 150 190 Z" fill="%230284c7"/><circle cx="100" cy="130" r="12" fill="%23fed7aa"/></svg>',
        tags: ['boy', 'student', 'calm', '3d_cartoon'],
        createdAt: Date.now()
      },
      {
        id: 'char-priya',
        name: 'Priya (प्रिया)',
        role: 'Supportive Guide / Sister',
        description: 'Friendly, patient, and speaks in simple, encouraging words.',
        appearance: 'Long braided dark hair, warm smile, reassuring posture.',
        clothing: 'Soft yellow kurta / top with green accents.',
        style: '3d_cartoon',
        referenceImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23fef3c7"/><circle cx="100" cy="80" r="45" fill="%23fed7aa"/><circle cx="85" cy="75" r="5" fill="%230f172a"/><circle cx="115" cy="75" r="5" fill="%230f172a"/><path d="M 88 98 Q 100 110 112 98" stroke="%23ea580c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 50 65 Q 100 15 150 65 Q 155 120 145 130 Q 100 40 55 130 Z" fill="%23334155"/><path d="M 50 190 L 50 140 Q 100 120 150 140 L 150 190 Z" fill="%23eab308"/></svg>',
        tags: ['girl', 'guide', 'sister', 'patient'],
        createdAt: Date.now()
      },
      {
        id: 'char-milo',
        name: 'Milo the Elephant (हाथी नीलू)',
        role: 'Calm Animal Friend',
        description: 'A gentle, friendly cartoon elephant who demonstrates actions slowly and clearly.',
        appearance: 'Soft slate-blue elephant with big round ears and expressive playful trunk.',
        clothing: 'Red bowtie.',
        style: '3d_cartoon',
        referenceImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f1f5f9"/><circle cx="100" cy="95" r="50" fill="%2394a3b8"/><circle cx="50" cy="85" r="28" fill="%2364748b"/><circle cx="150" cy="85" r="28" fill="%2364748b"/><circle cx="85" cy="85" r="6" fill="%230f172a"/><circle cx="115" cy="85" r="6" fill="%230f172a"/><path d="M 94 95 Q 100 135 125 130 Q 135 125 125 115 Q 110 115 106 95 Z" fill="%2364748b"/><polygon points="90,150 110,150 100,160" fill="%23ef4444"/><polygon points="90,170 110,170 100,160" fill="%23ef4444"/></svg>',
        tags: ['animal', 'elephant', 'gentle', 'animation'],
        createdAt: Date.now()
      }
    ];
    await db.characters.bulkAdd(initialCharacters);
  }

  const assetsCount = await db.assets.count();
  if (assetsCount === 0) {
    const builtinAssets: ImageAsset[] = [
      {
        id: 'asset-toothbrush',
        name: 'Toothbrush & Paste (टूथब्रश)',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f8fafc"/><rect x="40" y="85" width="120" height="25" rx="12" fill="%230284c7"/><rect x="130" y="70" width="30" height="15" fill="%2338bdf8"/><path d="M 130 70 Q 145 55 160 70" fill="%23ec4899"/><circle cx="145" cy="62" r="5" fill="%23fbcfe8"/></svg>',
        type: 'illustration',
        category: 'routines',
        tags: ['brush', 'teeth', 'hygiene'],
        isBuiltin: true,
        createdAt: Date.now()
      },
      {
        id: 'asset-water-sink',
        name: 'Washbasin & Water (हाथ धोना)',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0fdf4"/><path d="M 70 30 L 100 30 L 100 60 L 90 60 L 90 45 L 70 45 Z" fill="%2364748b"/><path d="M 90 60 Q 95 85 95 120" stroke="%2338bdf8" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M 40 120 Q 100 160 160 120 L 150 170 Q 100 190 50 170 Z" fill="%23e2e8f0"/></svg>',
        type: 'illustration',
        category: 'routines',
        tags: ['water', 'sink', 'hands', 'wash'],
        isBuiltin: true,
        createdAt: Date.now()
      },
      {
        id: 'asset-traffic-light',
        name: 'Traffic Signal (ट्रैफिक सिग्नल)',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f8fafc"/><rect x="75" y="20" width="50" height="130" rx="15" fill="%231e293b"/><circle cx="100" cy="45" r="16" fill="%23ef4444"/><circle cx="100" cy="85" r="16" fill="%23f59e0b"/><circle cx="100" cy="125" r="16" fill="%2310b981"/><rect x="95" y="150" width="10" height="40" fill="%23475569"/></svg>',
        type: 'diagram',
        category: 'safety',
        tags: ['traffic', 'light', 'stop', 'go', 'safe'],
        isBuiltin: true,
        createdAt: Date.now()
      },
      {
        id: 'asset-plant-sprout',
        name: 'Sprouting Seed & Plant (पौधा)',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ecfdf5"/><path d="M 20 160 Q 100 150 180 160 L 180 200 L 20 200 Z" fill="%2378350f"/><path d="M 100 155 Q 100 100 100 80" stroke="%2316a34a" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M 100 110 Q 70 90 70 70 Q 100 80 100 110 Z" fill="%2322c55e"/><path d="M 100 95 Q 130 75 130 55 Q 100 65 100 95 Z" fill="%234ade80"/><circle cx="160" cy="40" r="25" fill="%23facc15"/></svg>',
        type: 'illustration',
        category: 'science',
        tags: ['plant', 'sprout', 'grow', 'nature'],
        isBuiltin: true,
        createdAt: Date.now()
      },
      {
        id: 'asset-calm-smile',
        name: 'Feeling Calm & Happy (शांत और खुश)',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23fdf4ff"/><circle cx="100" cy="100" r="65" fill="%23fef08a"/><circle cx="80" cy="90" r="8" fill="%230f172a"/><circle cx="120" cy="90" r="8" fill="%230f172a"/><path d="M 75 115 Q 100 145 125 115" stroke="%23b45309" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="65" cy="110" r="10" fill="%23fbcfe8"/><circle cx="135" cy="110" r="10" fill="%23fbcfe8"/></svg>',
        type: 'illustration',
        category: 'emotions',
        tags: ['calm', 'happy', 'safe', 'smile'],
        isBuiltin: true,
        createdAt: Date.now()
      },
      {
        id: 'asset-apple-fruit',
        name: 'Red Sweet Apple (सेब)',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f8fafc"/><path d="M 100 50 C 70 10, 40 50, 40 90 C 40 140, 70 170, 100 170 C 130 170, 160 140, 160 90 C 160 50, 130 10, 100 50 Z" fill="%23dc2626"/><path d="M 100 50 Q 110 25 125 20" stroke="%2378350f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M 105 35 Q 130 30 135 45 Q 115 50 105 35 Z" fill="%2316a34a"/></svg>',
        type: 'illustration',
        category: 'fruits',
        tags: ['apple', 'fruit', 'red', 'healthy'],
        isBuiltin: true,
        createdAt: Date.now()
      }
    ];
    await db.assets.bulkAdd(builtinAssets);
  }

  const templatesCount = await db.templates.count();
  if (templatesCount === 0) {
    const builtinTemplates: VideoTemplate[] = [
      {
        id: 'tpl-brushing-teeth',
        title: 'Brushing Teeth Morning & Night',
        category: 'daily_routines',
        description: 'Step-by-step visual sequence to learn brushing teeth gently, holding the brush, and rinsing cleanly.',
        targetAge: '8-14 years',
        estimatedDuration: 3,
        scenesCount: 4,
        thumbnail: 'asset-toothbrush',
        sampleScenes: [
          {
            title: 'Step 1: Pick Up the Brush (ब्रश उठाएं)',
            educationalObjective: 'Identify toothbrush and hold gently',
            hindiNarration: 'यह आपका टूथब्रश है। इसे हाथ में आराम से पकड़ें।',
            englishNarration: 'This is your toothbrush. Hold it gently in your hand.',
            onScreenText: 'Hold the brush gently',
            hindiOnScreenText: 'ब्रश को आराम से पकड़ें',
            imageDescription: 'A clean blue toothbrush on a soft background',
            visualStyle: '3d_cartoon',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'gentle_chime'
          },
          {
            title: 'Step 2: Add a Little Toothpaste (पेस्ट लगाएं)',
            educationalObjective: 'Put pea-sized toothpaste on the bristles',
            hindiNarration: 'अब ब्रश पर थोड़ा सा पेस्ट लगाएं। बिल्कुल मटर के दाने जितना।',
            englishNarration: 'Now put a small pea-sized drop of toothpaste on the brush.',
            onScreenText: 'A small drop of paste',
            hindiOnScreenText: 'थोड़ा सा टूथपेस्ट',
            imageDescription: 'Pea-sized toothpaste drop appearing on the toothbrush',
            visualStyle: '3d_cartoon',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'soft_bell'
          },
          {
            title: 'Step 3: Brush Up and Down (ऊपर और नीचे ब्रश करें)',
            educationalObjective: 'Brush teeth in gentle circular and up-down motions',
            hindiNarration: 'दांतों को धीरे-धीरे ऊपर और नीचे साफ करें। गोल-गोल घुमाएं।',
            englishNarration: 'Gently brush your teeth up and down, and round and round.',
            onScreenText: 'Brush gently up and down',
            hindiOnScreenText: 'धीरे-धीरे ऊपर नीचे ब्रश करें',
            imageDescription: 'Gentle animated toothbrush cleaning teeth with sparkle',
            visualStyle: '3d_cartoon',
            duration: 10,
            transitionType: 'fade',
            soundEffect: 'brush_scrub'
          },
          {
            title: 'Step 4: Clean Rinse & Bright Smile (कुल्ला करें और मुस्कुराएं)',
            educationalObjective: 'Rinse mouth with water and feel fresh',
            hindiNarration: 'पानी से साफ कुल्ला करें। आपके दांत चमक रहे हैं! बहुत बढ़िया!',
            englishNarration: 'Rinse with clean water. Your smile is sparkling and clean. Great job!',
            onScreenText: 'Clean rinse! Great job!',
            hindiOnScreenText: 'साफ कुल्ला! बहुत बढ़िया!',
            imageDescription: 'Bright cheerful clean smile with happy stars',
            visualStyle: '3d_cartoon',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'success_chime'
          }
        ]
      },
      {
        id: 'tpl-washing-hands',
        title: 'Washing Hands with Soap & Water',
        category: 'daily_routines',
        description: 'Clear, sensory-friendly visual routine for washing hands clean before eating and after playing.',
        targetAge: '6-14 years',
        estimatedDuration: 2,
        scenesCount: 3,
        thumbnail: 'asset-water-sink',
        sampleScenes: [
          {
            title: 'Step 1: Turn On Water & Wet Hands (हाथ गीले करें)',
            educationalObjective: 'Turn tap gently and feel lukewarm water',
            hindiNarration: 'नल खोलें और हाथों को पानी से गीला करें। पानी बहुत सुखद है।',
            englishNarration: 'Turn on the tap and wet your hands with clean water.',
            onScreenText: 'Wet your hands with water',
            hindiOnScreenText: 'हाथों को पानी से गीला करें',
            imageDescription: 'Gentle water stream from faucet onto hands',
            visualStyle: '3d_cartoon',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'water_splash'
          },
          {
            title: 'Step 2: Rub Soap Bubbles (साबुन के बुलबुले)',
            educationalObjective: 'Rub hands with soap creating soft bubbles for 20 seconds',
            hindiNarration: 'थोड़ा साबुन लें और दोनों हाथों को आपस में मलें। देखिए कितने सुंदर बुलबुले हैं।',
            englishNarration: 'Take a little soap and rub your palms together to make gentle bubbles.',
            onScreenText: 'Rub hands with soap bubbles',
            hindiOnScreenText: 'साबुन के साथ हाथ मलें',
            imageDescription: 'Soft white soap bubbles covering clean hands',
            visualStyle: '3d_cartoon',
            duration: 10,
            transitionType: 'fade',
            soundEffect: 'gentle_chime'
          },
          {
            title: 'Step 3: Wash Away & Dry with Towel (हाथ धोएं और सुखाएं)',
            educationalObjective: 'Rinse bubbles and dry with a soft towel',
            hindiNarration: 'पानी से सारे बुलबुले धो दें और तौलिये से हाथ सुखाएं। हाथ एकदम साफ हैं!',
            englishNarration: 'Wash away all the bubbles and pat dry with a soft towel. Clean hands!',
            onScreenText: 'Clean and dry hands!',
            hindiOnScreenText: 'साफ और सूखे हाथ!',
            imageDescription: 'Clean dry hands holding a soft fluffy towel',
            visualStyle: '3d_cartoon',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'success_chime'
          }
        ]
      },
      {
        id: 'tpl-traffic-safety',
        title: 'Traffic Signals: Red, Yellow and Green',
        category: 'safety',
        description: 'Learn what traffic signal colors mean clearly with zero sensory overload.',
        targetAge: '8-14 years',
        estimatedDuration: 3,
        scenesCount: 3,
        thumbnail: 'asset-traffic-light',
        sampleScenes: [
          {
            title: 'Red Means Stop (लाल का मतलब रुकना)',
            educationalObjective: 'Associate Red light with stopping safely',
            hindiNarration: 'लाल बत्ती जलने पर हमेशा रुकें। सड़क पार न करें।',
            englishNarration: 'Red light means STOP. We stand quietly and wait safely.',
            onScreenText: 'RED = STOP (रुकें)',
            hindiOnScreenText: 'लाल बत्ती = रुकिए',
            imageDescription: 'Traffic signal showing bright gentle red light',
            visualStyle: 'infographic',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'soft_bell'
          },
          {
            title: 'Yellow Means Wait & Look (पीली बत्ती का मतलब ध्यान से देखना)',
            educationalObjective: 'Associate Yellow light with waiting attentively',
            hindiNarration: 'पीली बत्ती का मतलब है थोड़ा इंतजार करें और ध्यान से देखें।',
            englishNarration: 'Yellow light means get ready and look both sides carefully.',
            onScreenText: 'YELLOW = WAIT (तैयार रहें)',
            hindiOnScreenText: 'पीली बत्ती = ध्यान दें',
            imageDescription: 'Traffic signal showing yellow light illuminated',
            visualStyle: 'infographic',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'gentle_chime'
          },
          {
            title: 'Green Means Safe to Cross (हरी बत्ती = सुरक्षित चलना)',
            educationalObjective: 'Associate Green light with crossing calmly on the zebra crossing',
            hindiNarration: 'हरी बत्ती हो गई! अब हम सुरक्षित रूप से सड़क पार कर सकते हैं।',
            englishNarration: 'Green light is ON! Now it is safe to cross calmly with an adult.',
            onScreenText: 'GREEN = GO SAFELY (आगे बढ़ें)',
            hindiOnScreenText: 'हरी बत्ती = सुरक्षित आगे बढ़ें',
            imageDescription: 'Traffic signal showing green light with calm crosswalk',
            visualStyle: 'infographic',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'success_chime'
          }
        ]
      },
      {
        id: 'tpl-plant-growth',
        title: 'How a Little Plant Grows',
        category: 'science',
        description: 'Visual science story: seed, soil, sunlight, water, and green leaves.',
        targetAge: '6-14 years',
        estimatedDuration: 3,
        scenesCount: 4,
        thumbnail: 'asset-plant-sprout',
        sampleScenes: [
          {
            title: 'The Little Seed in Soil (मिट्टी में छोटा बीज)',
            educationalObjective: 'Observe a tiny seed resting inside warm brown soil',
            hindiNarration: 'यह एक छोटा सा बीज है। यह मिट्टी के अंदर आराम कर रहा है।',
            englishNarration: 'This is a tiny seed. It rests warmly inside the soft soil.',
            onScreenText: 'A tiny seed in the soil',
            hindiOnScreenText: 'मिट्टी में छोटा बीज',
            imageDescription: 'Cross-section of earth with a small seed resting in soil',
            visualStyle: 'illustrated_diagram',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'nature_breeze'
          },
          {
            title: 'Sunlight and Water (धूप और पानी)',
            educationalObjective: 'Understand plants need sunshine and raindrops',
            hindiNarration: 'सूरज से धूप मिलती है और बादलों से ठंडा पानी।',
            englishNarration: 'The bright sun gives warmth, and gentle rain brings water.',
            onScreenText: 'Sunlight and gentle rain',
            hindiOnScreenText: 'धूप और थोड़ा सा पानी',
            imageDescription: 'Sun shining gently with light drops of water falling',
            visualStyle: 'illustrated_diagram',
            duration: 8,
            transitionType: 'fade',
            soundEffect: 'water_splash'
          },
          {
            title: 'The Green Sprout Appears (हरा अंकुर निकला)',
            educationalObjective: 'Watch the sprout emerge above the earth',
            hindiNarration: 'देखिए! बीज से एक नन्हा हरा अंकुर बाहर निकल आया।',
            englishNarration: 'Look! A tiny green sprout pops out of the earth into the open air.',
            onScreenText: 'A little green sprout emerges',
            hindiOnScreenText: 'नन्हा हरा अंकुर निकला',
            imageDescription: 'Small two-leaf green sprout breaking through soil',
            visualStyle: 'illustrated_diagram',
            duration: 9,
            transitionType: 'fade',
            soundEffect: 'gentle_chime'
          },
          {
            title: 'Growing Tall and Strong (बड़ा और मजबूत पौधा)',
            educationalObjective: 'Celebrate the fully grown healthy green plant',
            hindiNarration: 'अब पौधा बड़ा और मजबूत हो गया है। इसमें हरी पत्तियां आ गई हैं।',
            englishNarration: 'Now the plant is growing taller and stronger with beautiful green leaves.',
            onScreenText: 'Growing tall and strong!',
            hindiOnScreenText: 'पौधा बड़ा और सुंदर बन गया!',
            imageDescription: 'Healthy thriving green plant with flowers',
            visualStyle: 'illustrated_diagram',
            duration: 9,
            transitionType: 'fade',
            soundEffect: 'success_chime'
          }
        ]
      }
    ];
    await db.templates.bulkAdd(builtinTemplates);
  }

  // Create an initial sample project so the parent immediately sees a working example
  const projectsCount = await db.projects.count();
  if (projectsCount === 0) {
    const defaultProject: Project = {
      id: 'proj-brushing-teeth-demo',
      title: 'Brushing Teeth Morning & Night (ब्रश करना सीखें)',
      topic: 'Brushing teeth',
      description: 'Personalized step-by-step hygiene video made for visual and calm learning.',
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now(),
      targetDurationMinutes: 3,
      ageLevel: '12 years (Visual Learner)',
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
      scenes: [
        {
          id: 'sc-1',
          title: 'Step 1: Pick Up the Brush',
          order: 0,
          educationalObjective: 'Identify toothbrush and hold gently',
          hindiNarration: 'यह आपका टूथब्रश है। इसे हाथ में आराम से पकड़ें।',
          englishNarration: 'This is your toothbrush. Hold it gently in your hand.',
          onScreenText: 'Hold the brush gently',
          hindiOnScreenText: 'ब्रश को आराम से पकड़ें',
          imageDescription: 'Clean blue toothbrush',
          visualStyle: '3d_cartoon',
          duration: 7,
          transitionType: 'fade',
          soundEffect: 'gentle_chime',
          visualObjects: [
            {
              id: 'obj-brush-1',
              type: 'template',
              templateType: 'brushing_teeth',
              content: 'brushing_teeth',
              label: 'Toothbrush (टूथब्रश)',
              x: 50,
              y: 50,
              width: 60,
              height: 60,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              animation: {
                effect: 'pulse',
                duration: 2,
                delay: 0.5,
                repeat: true,
                easing: 'ease-in-out'
              }
            }
          ]
        },
        {
          id: 'sc-2',
          title: 'Step 2: Add Toothpaste',
          order: 1,
          educationalObjective: 'Put pea-sized toothpaste on the bristles',
          hindiNarration: 'अब ब्रश पर थोड़ा सा पेस्ट लगाएं। बिल्कुल मटर के दाने जितना।',
          englishNarration: 'Now put a small pea-sized drop of toothpaste on the brush.',
          onScreenText: 'A small drop of paste',
          hindiOnScreenText: 'थोड़ा सा टूथपेस्ट',
          imageDescription: 'Pea-sized toothpaste drop on toothbrush',
          visualStyle: '3d_cartoon',
          duration: 7,
          transitionType: 'fade',
          soundEffect: 'soft_bell',
          visualObjects: [
            {
              id: 'obj-paste-1',
              type: 'image',
              content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0fdfa"/><rect x="30" y="90" width="140" height="25" rx="12" fill="%230284c7"/><rect x="130" y="70" width="30" height="20" fill="%2338bdf8"/><circle cx="145" cy="65" r="12" fill="%2306b6d4"/><path d="M 145 53 Q 155 45 152 40" stroke="%23ec4899" stroke-width="4" fill="none"/></svg>',
              label: 'Paste on brush (पेस्ट)',
              x: 50,
              y: 50,
              width: 55,
              height: 55,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 1,
              animation: {
                effect: 'zoom_in',
                duration: 1.2,
                delay: 0.2,
                repeat: false,
                easing: 'ease-out'
              }
            }
          ]
        },
        {
          id: 'sc-3',
          title: 'Step 3: Brush Up and Down',
          order: 2,
          educationalObjective: 'Gently brush teeth in circular motion',
          hindiNarration: 'दांतों को धीरे-धीरे ऊपर और नीचे साफ करें। गोल-गोल घुमाएं।',
          englishNarration: 'Gently brush your teeth up and down, and round and round.',
          onScreenText: 'Brush gently up and down',
          hindiOnScreenText: 'धीरे-धीरे ऊपर नीचे ब्रश करें',
          imageDescription: 'Brushing teeth animation',
          visualStyle: '3d_cartoon',
          duration: 9,
          transitionType: 'fade',
          soundEffect: 'brush_scrub',
          visualObjects: [
            {
              id: 'obj-brushing-action',
              type: 'template',
              templateType: 'brushing_teeth',
              content: 'brushing_teeth',
              label: 'Brushing (ब्रश करना)',
              x: 50,
              y: 50,
              width: 65,
              height: 65,
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
          ]
        },
        {
          id: 'sc-4',
          title: 'Step 4: Clean Rinse & Great Job!',
          order: 3,
          educationalObjective: 'Rinse with clean water and feel accomplished',
          hindiNarration: 'पानी से साफ कुल्ला करें। बहुत बढ़िया! आपके दांत चमक रहे हैं!',
          englishNarration: 'Rinse with clean water. Sparkling clean smile! Fantastic job!',
          onScreenText: 'Clean rinse! Great job! (बहुत बढ़िया!)',
          hindiOnScreenText: 'साफ कुल्ला! बहुत बढ़िया!',
          imageDescription: 'Happy clean smile with gentle stars',
          visualStyle: '3d_cartoon',
          duration: 8,
          transitionType: 'fade',
          soundEffect: 'success_chime',
          visualObjects: [
            {
              id: 'obj-smile-reward',
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
                duration: 2,
                delay: 0,
                repeat: true,
                easing: 'ease-in-out'
              }
            }
          ]
        }
      ]
    };
    await db.projects.add(defaultProject);
  }
}
