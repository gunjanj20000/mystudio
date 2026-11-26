// Web Audio API Synthesizer & Speech Manager for Bilingual Autism-Friendly Studio
import type { SoundEffectType } from '../../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play gentle, non-startling sound effects synthesized mathematically
  public playSoundEffect(type: SoundEffectType, volumeMultiplier: number = 0.5) {
    if (type === 'none') return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      if (type === 'gentle_chime') {
        // Pentatonic warm chime: 523.25Hz (C5) and 659.25Hz (E5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.15 * volumeMultiplier, now + idx * 0.08 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.85);
        });
      } else if (type === 'soft_bell') {
        // Soft tubular bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2 * volumeMultiplier, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
      } else if (type === 'water_splash') {
        // Filtered white noise with frequency sweep to simulate gentle water trickle
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1400, now + 0.4);
        filter.Q.setValueAtTime(3, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12 * volumeMultiplier, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'brush_scrub') {
        // Soft rhythmic scrubbing whoosh
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI * 4);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'success_chime') {
        // Major chord (C - E - G - C) ascending celebration chime
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.18 * volumeMultiplier, now + idx * 0.1 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.95);
        });
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.08);

        gain.gain.setValueAtTime(0.15 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'nature_breeze') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.5);
        osc.frequency.linearRampToValueAtTime(220, now + 1.0);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 * volumeMultiplier, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.15);
      }
    } catch (e) {
      console.warn('Audio effect playback error:', e);
    }
  }

  // Gentle Background Music Synthesizer (Zero sudden sounds, soothing drone)
  public startCalmBGM(level: 'low' | 'normal' = 'low') {
    if (this.isBgmPlaying) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(174, ctx.currentTime); // 174 Hz Solfeggio soothing frequency

      const volume = level === 'low' ? 0.02 : 0.04;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2.0);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      this.bgmOscillator = osc;
      this.bgmGain = gain;
      this.isBgmPlaying = true;
    } catch (e) {
      console.warn('BGM error:', e);
    }
  }

  public stopCalmBGM() {
    if (!this.isBgmPlaying || !this.bgmGain || !this.bgmOscillator) return;
    try {
      const ctx = this.getContext();
      this.bgmGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
      setTimeout(() => {
        try {
          this.bgmOscillator?.stop();
          this.bgmOscillator?.disconnect();
          this.bgmOscillator = null;
          this.bgmGain = null;
          this.isBgmPlaying = false;
        } catch (_) {}
      }, 1050);
    } catch (_) {
      this.isBgmPlaying = false;
    }
  }

  // Speech Synthesis for Hindi and English Narration
  public speakNarration(
    text: string,
    lang: 'hi-IN' | 'en-US' | 'en-IN' | 'hi',
    rate: number = 0.85,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ): SpeechSynthesisUtterance | null {
    if (!window.speechSynthesis || !text) return null;

    window.speechSynthesis.cancel(); // Stop any pending utterances

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.6, Math.min(1.5, rate));
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const targetLang = lang.startsWith('hi') ? 'hi' : 'en';

    const matchedVoice = voices.find(v => {
      if (targetLang === 'hi') {
        return v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi');
      } else {
        return v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().includes('en');
      }
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = lang.startsWith('hi') ? 'hi-IN' : 'en-US';
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  public stopSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public getAvailableVoices() {
    if (!window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }
}

export const audioService = new AudioService();
