
export class SoundManager {
  private static context: AudioContext | null = null;
  private static enabled: boolean = true;
  private static music: HTMLAudioElement | null = null;
  private static currentTrackId: string | null = null;

  private static getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  static playMusic(trackPath: string = '/music.mp3', trackId: string = 'default') {
    if (this.music) {
      if (this.currentTrackId === trackId) {
        this.music.play().catch(e => console.log("Autoplay prevented", e));
        return;
      }
      this.music.pause();
      this.music = null;
    }

    this.music = new Audio(trackPath);
    this.music.loop = true;
    this.music.volume = 0.4;
    this.currentTrackId = trackId;
    this.music.play().catch(e => console.log("Autoplay prevented or file missing", e));
  }

  static stopMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  static playPlace() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  static playCapture() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  static playWin() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const notes = [440, 554.37, 659.25, 880];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.15;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  static playSelect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  static playPS2Intro() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      // 1. Deep Ocean / Cosmic Wind Swell (Filtered noise for atmospheric ocean breeze)
      const bufferSize = Math.floor(ctx.sampleRate * 3.8);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(140, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(420, now + 1.4);
      noiseFilter.frequency.exponentialRampToValueAtTime(110, now + 3.6);
      noiseFilter.Q.setValueAtTime(2.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.07, now + 1.2);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 3.6);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);

      // 2. Sub-bass resonant ocean drone (PS2 low hum: 55Hz, 82.4Hz, 110Hz)
      const droneFreqs = [55, 82.4, 110];
      droneFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.16 / (idx + 1), now + 0.9);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 4.0);
      });

      // 3. Ethereal Ascending Crystal Chime (PS2 inspired harmony: D, A, D, F#, A, C#, E)
      const crystalNotes = [
        { freq: 293.66, delay: 0.35 },  // D4
        { freq: 440.00, delay: 0.60 },  // A4
        { freq: 587.33, delay: 0.85 },  // D5
        { freq: 739.99, delay: 1.05 },  // F#5
        { freq: 880.00, delay: 1.25 },  // A5
        { freq: 1108.73, delay: 1.45 }, // C#6
        { freq: 1318.51, delay: 1.65 }  // E6
      ];

      crystalNotes.forEach(({ freq, delay }) => {
        const noteStart = now + delay;
        // Two oscillators for lush chorus/detuning
        [-4, 4].forEach((detune) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);
          osc.detune.setValueAtTime(detune, noteStart);

          gain.gain.setValueAtTime(0, noteStart);
          gain.gain.linearRampToValueAtTime(0.055, noteStart + 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0005, noteStart + 2.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 2.6);
        });
      });
    } catch (e) {
      console.warn("PS2 intro sound could not play:", e);
    }
  }
}
