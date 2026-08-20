/**
 * Web Audio API Sound Synthesizer
 * Provides instant, zero-latency celebratory sound effects without requiring audio asset downloads.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  _initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Crisp, pleasant chime when a habit is marked complete.
   */
  playComplete() {
    if (!this.enabled) return;
    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Major chord arpeggio (C5 -> E5 -> G5)
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5

      osc2.frequency.setValueAtTime(1046.5, now); // C6 sparkle

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('Audio playback not permitted or supported', e);
    }
  }

  /**
   * Celebratory fanfare when reaching a milestone streak (e.g. 7 days, 30 days) or all completed today.
   */
  playFanfare() {
    if (!this.enabled) return;
    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const duration = 0.12;

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + index * duration;

        osc.type = index === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + (index === notes.length - 1 ? 0.6 : 0.2));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + (index === notes.length - 1 ? 0.6 : 0.2));
      });
    } catch (e) {
      console.warn('Fanfare audio failed', e);
    }
  }

  /**
   * Subtle soft click when unchecking or navigating.
   */
  playUndo() {
    if (!this.enabled) return;
    try {
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
