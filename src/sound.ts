class SoundEngine {
  private ctx: AudioContext | null = null;
  private tickGain: GainNode | null = null;
  private padGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private padOscillators: OscillatorNode[] = [];
  private padGains: GainNode[] = [];
  private ambientInterval: any = null;
  private currentChordIndex = 0;
  private isTickingEnabled = false;
  private isAmbientEnabled = false;

  // Chords: A minor, F major, C major, G major (philosophical and calm)
  private chords = [
    [110.00, 220.00, 261.63, 329.63], // Am (A2, A3, C4, E4)
    [87.31, 174.61, 220.00, 261.63],  // Fmaj (F2, F3, A3, C4)
    [130.81, 196.00, 261.63, 329.63], // Cmaj (C3, G3, C4, E4)
    [98.00, 196.00, 246.94, 293.66]   // Gmaj (G2, G3, B3, D4)
  ];

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.tickGain = this.ctx.createGain();
      this.tickGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.tickGain.connect(this.masterGain);

      this.padGain = this.ctx.createGain();
      this.padGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.padGain.connect(this.masterGain);

      this.setupPad();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  playTick() {
    if (!this.ctx || !this.isTickingEnabled) return;
    
    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Create a very subtle clock tick sound using a short sine wave
    const osc = this.ctx.createOscillator();
    const tickVolume = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now); // high pitch tick
    
    tickVolume.gain.setValueAtTime(0.0, now);
    tickVolume.gain.linearRampToValueAtTime(0.08, now + 0.002);
    tickVolume.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    
    osc.connect(tickVolume);
    tickVolume.connect(this.tickGain!);
    
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playHoverTick() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const vol = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, now);
    
    vol.gain.setValueAtTime(0.0, now);
    vol.gain.linearRampToValueAtTime(0.012, now + 0.001);
    vol.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);
    
    osc.connect(vol);
    vol.connect(this.masterGain!);
    
    osc.start(now);
    osc.stop(now + 0.01);
  }


  setTicking(enabled: boolean) {
    this.isTickingEnabled = enabled;
    if (enabled) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.tickGain?.gain.setTargetAtTime(0.4, this.ctx!.currentTime, 0.1);
    } else {
      this.tickGain?.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.1);
      if (!this.isAmbientEnabled) {
        setTimeout(() => {
          if (!this.isTickingEnabled && !this.isAmbientEnabled) {
            this.cleanup();
          }
        }, 200);
      }
    }
  }

  setAmbient(enabled: boolean) {
    this.isAmbientEnabled = enabled;
    if (enabled) {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.padGain?.gain.setTargetAtTime(0.2, this.ctx!.currentTime, 1.5);
      this.startAmbientLoop();
    } else {
      this.padGain?.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 1.0);
      this.stopAmbientLoop();
      setTimeout(() => {
        if (!this.isTickingEnabled && !this.isAmbientEnabled) {
          this.cleanup();
        }
      }, 1200);
    }
  }

  private setupPad() {
    if (!this.ctx || !this.padGain) return;
    const now = this.ctx.currentTime;

    // Create 4 voices for the pad
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft triangle wave
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.chords[0][i], now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + i * 50, now);
      filter.Q.setValueAtTime(1.0, now);

      voiceGain.gain.setValueAtTime(0.0, now);

      osc.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(this.padGain);

      osc.start(now);

      this.padOscillators.push(osc);
      this.padGains.push(voiceGain);
    }
  }

  private startAmbientLoop() {
    if (this.ambientInterval) return;
    
    const playChord = () => {
      if (!this.ctx || !this.isAmbientEnabled) return;
      const now = this.ctx.currentTime;
      const freqs = this.chords[this.currentChordIndex];

      // Smoothly fade out current notes and change to new frequencies
      for (let i = 0; i < 4; i++) {
        const osc = this.padOscillators[i];
        const vGain = this.padGains[i];
        
        if (vGain && osc) {
          // Fade out voice
          vGain.gain.cancelScheduledValues(now);
          vGain.gain.setValueAtTime(vGain.gain.value, now);
          vGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

          // Change frequency while silent, then fade in
          setTimeout(() => {
            if (!this.ctx || !this.isAmbientEnabled) return;
            const nextNow = this.ctx.currentTime;
            osc.frequency.setValueAtTime(freqs[i], nextNow);
            vGain.gain.cancelScheduledValues(nextNow);
            vGain.gain.setValueAtTime(0.001, nextNow);
            // Low volume for ambient pad to keep it subtle
            vGain.gain.exponentialRampToValueAtTime(0.04 + (3-i)*0.015, nextNow + 3.5);
          }, 2600);
        }
      }

      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
    };

    // Play first chord immediately
    playChord();
    
    // Change chord every 8 seconds
    this.ambientInterval = setInterval(playChord, 8000);
  }

  private stopAmbientLoop() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.padGains.forEach(g => {
        g.gain.cancelScheduledValues(now);
        g.gain.setTargetAtTime(0, now, 1.0);
      });
    }
  }

  private cleanup() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    
    // Stop and disconnect all oscillators
    this.padOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.padOscillators = [];
    this.padGains = [];
    
    if (this.tickGain) {
      try { this.tickGain.disconnect(); } catch(e) {}
      this.tickGain = null;
    }
    if (this.padGain) {
      try { this.padGain.disconnect(); } catch(e) {}
      this.padGain = null;
    }
    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch(e) {}
      this.masterGain = null;
    }
    
    if (this.ctx) {
      try { this.ctx.close(); } catch(e) {}
      this.ctx = null;
    }
  }
}

export const soundEngine = new SoundEngine();
