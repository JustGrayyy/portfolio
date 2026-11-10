/**
 * ============================================================================
 * Web Audio API Procedural Sound Engine (Anime / Manga Comedy Edition)
 * Zero external audio files — 100% synthesized comic sound effects
 * ============================================================================
 */

(function () {
  'use strict';

  window.PortfolioWall = window.PortfolioWall || {};

  class MangaSoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.isMuted = true;
      this.autoUnmuteOnGesture = true;
      this.isInitialized = false;

      // Restore mute preference from localStorage if available
      try {
        const savedMute = localStorage.getItem('portfolio_manga_muted');
        if (savedMute !== null) {
          this.isMuted = savedMute === 'true';
          this.autoUnmuteOnGesture = !this.isMuted;
        }
      } catch (e) {
        this.isMuted = true;
      }
    }

    init() {
      if (this.isInitialized) return;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.35;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    }

    unlockAudio() {
      this.ensureContext();
      if (this.autoUnmuteOnGesture) {
        this.isMuted = false;
        if (this.masterGain && this.ctx) {
          const now = this.ctx.currentTime;
          this.masterGain.gain.setValueAtTime(0.35, now);
        }
        this.updateButtonUI();
      }
    }

    ensureContext() {
      if (!this.isInitialized) {
        this.init();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.ensureContext();
      this.isMuted = !this.isMuted;

      try {
        localStorage.setItem('portfolio_manga_muted', this.isMuted);
      } catch (e) {}

      if (this.masterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.35, now + 0.05);
      }

      this.updateButtonUI();
      return this.isMuted;
    }

    updateButtonUI() {
      const btn = document.getElementById('btn-ink-sound');
      if (!btn) return;
      const label = btn.querySelector('.sound-toggle-label');
      if (this.isMuted) {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        if (label) label.textContent = 'SFX: OFF';
      } else {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        if (label) label.textContent = 'SFX: ON';
      }
    }

    /* -------------------------------------------------------------------------
       Synthesized Comic Sound Effects
       ------------------------------------------------------------------------- */

    /**
     * Comical Anime Bonk / Hollow Thud
     * Scales frequency and punch with hit intensity
     */
    playBonk(intensity = 1.0) {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const clampedIntensity = Math.max(0.4, Math.min(intensity, 2.4));
      const now = this.ctx.currentTime;

      // 1. Resonant Hollow Pop (Triangle wave with rapid pitch drop)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const startFreq1 = 320 * clampedIntensity;
      const endFreq1 = 70 * clampedIntensity;

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(startFreq1, now);
      osc1.frequency.exponentialRampToValueAtTime(endFreq1, now + 0.09);

      gain1.gain.setValueAtTime(0.6 * clampedIntensity, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // 2. High Cartoon Clop overtone (Sine)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(620 * clampedIntensity, now);
      osc2.frequency.exponentialRampToValueAtTime(210, now + 0.07);

      gain2.gain.setValueAtTime(0.35 * clampedIntensity, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now);
      osc2.stop(now + 0.09);

      // 3. Impact Noise Snap (Filtered noise transient)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3 * clampedIntensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
    }

    /**
     * Squishy Cartoon Spring Boing
     * Pitch bend with rapid vibrato wobble
     */
    playBoing() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch sweep upwards
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.22);

      // Vibrato LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(22, now);
      lfoGain.gain.setValueAtTime(45, now);
      lfo.connect(osc.frequency);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(this.masterGain);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.28);
      osc.stop(now + 0.28);
    }

    /**
     * Cute Anime Chibi Squeaks & Murmurs
     */
    playSqueak(type = 'poke') {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (type === 'poke') {
        // High quick cheerful chirp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.08);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'hit') {
        // Surprised dual squeak
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.linearRampToValueAtTime(540, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(1260, now + 0.13);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'pout') {
        // Low puffed cheek grumble
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.21);
      } else if (type === 'happy') {
        // Ascending two-tone chime
        [784, 1046.5].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + idx * 0.09;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.35, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(noteTime);
          osc.stop(noteTime + 0.13);
        });
      }
    }

    /**
     * Floor / Paper Roll Rustle
     * Soft pink-noise puff for floor rolls or landing
     */
    playRollRustle() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.25;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(now);
    }

    /**
     * Dizzy Comic Spiral Warble
     */
    playDizzySwirl() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.13);
      });
    }

    /**
     * Potato Chip Crispy Crunch / Bag Rustle
     */
    playCrunch() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(now);
    }

    /**
     * Carbonated Cola Bottle Fizz / Bubble Pop
     */
    playFizz() {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(now);
    }
  }

  window.PortfolioWall.sound = new MangaSoundEngine();
})();
