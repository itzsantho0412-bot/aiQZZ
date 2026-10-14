import { VoiceCostumeId, VoiceCostumeSettings } from '../types';

export const VOICE_COSTUMES: Record<VoiceCostumeId, VoiceCostumeSettings> = {
  natural: {
    id: 'natural',
    name: 'Natural Studio',
    tagline: 'Crystal clear executive voice',
    description: 'Clean acoustic profile with subtle studio presence and warmth.',
    iconName: 'User',
    pitchSemitones: 0,
    playbackRate: 1.0,
    filterType: 'allpass',
    filterFrequency: 2000,
    filterQ: 0.7,
    distortionDrive: 0,
    reverbWet: 0.15,
    delayTime: 0,
    delayFeedback: 0,
    isRobotizer: false,
    color: '#38bdf8',
  },
  'gita-sage': {
    id: 'gita-sage',
    name: 'Gita Divine Sage',
    tagline: 'Temple resonance & sacred serenity',
    description: 'Deep transcendent harmonics, temple spatial reverb, and meditative warmth.',
    iconName: 'Sparkles',
    pitchSemitones: -2,
    playbackRate: 0.92,
    filterType: 'lowpass',
    filterFrequency: 3200,
    filterQ: 2.5,
    distortionDrive: 5,
    reverbWet: 0.65,
    delayTime: 0.28,
    delayFeedback: 0.35,
    isRobotizer: false,
    color: '#f59e0b',
  },
  'titan-mentor': {
    id: 'titan-mentor',
    name: 'Titan Mentor',
    tagline: 'Deep authoritative commanding tone',
    description: 'Sub-bass boost, low-octave weight, and warm analog tube saturation.',
    iconName: 'Shield',
    pitchSemitones: -5,
    playbackRate: 0.88,
    filterType: 'lowshelf' as BiquadFilterType,
    filterFrequency: 600,
    filterQ: 1.8,
    distortionDrive: 18,
    reverbWet: 0.3,
    delayTime: 0.08,
    delayFeedback: 0.15,
    isRobotizer: false,
    color: '#ea580c',
  },
  'cyber-ai': {
    id: 'cyber-ai',
    name: 'Cyber Synth AI',
    tagline: 'Futuristic metallic vocoder timbre',
    description: 'Robotic modulation, sharp bandpass resonant peaks, and digital flanger.',
    iconName: 'Cpu',
    pitchSemitones: 0,
    playbackRate: 1.05,
    filterType: 'bandpass',
    filterFrequency: 2200,
    filterQ: 5.5,
    distortionDrive: 25,
    reverbWet: 0.35,
    delayTime: 0.04,
    delayFeedback: 0.55,
    isRobotizer: true,
    color: '#06b6d4',
  },
  'cosmic-echo': {
    id: 'cosmic-echo',
    name: 'Cosmic Celestial',
    tagline: 'Astral shimmer & infinite space',
    description: 'Spacious stellar echoes, stereo delay diffusion, and celestial trails.',
    iconName: 'Orbit',
    pitchSemitones: 1,
    playbackRate: 1.0,
    filterType: 'highpass',
    filterFrequency: 450,
    filterQ: 1.2,
    distortionDrive: 2,
    reverbWet: 0.8,
    delayTime: 0.38,
    delayFeedback: 0.65,
    isRobotizer: false,
    color: '#a855f7',
  },
  'vintage-radio': {
    id: 'vintage-radio',
    name: 'Lo-Fi Vintage Radio',
    tagline: '1940s broadcast analog tube',
    description: 'Telephone frequency bandpass (300-3000Hz) with vintage analog crunch.',
    iconName: 'Radio',
    pitchSemitones: 1,
    playbackRate: 1.0,
    filterType: 'bandpass',
    filterFrequency: 1400,
    filterQ: 3.2,
    distortionDrive: 35,
    reverbWet: 0.2,
    delayTime: 0.05,
    delayFeedback: 0.1,
    isRobotizer: false,
    color: '#fbbf24',
  },
  'helium-sprite': {
    id: 'helium-sprite',
    name: 'Helium Sprite',
    tagline: 'High-pitch energetic flutter',
    description: 'Upward formant shift, bright resonant highs, and nimble pacing.',
    iconName: 'Zap',
    pitchSemitones: 6,
    playbackRate: 1.35,
    filterType: 'highpass',
    filterFrequency: 900,
    filterQ: 2.0,
    distortionDrive: 4,
    reverbWet: 0.25,
    delayTime: 0.12,
    delayFeedback: 0.2,
    isRobotizer: false,
    color: '#ec4899',
  },
  custom: {
    id: 'custom',
    name: 'Custom DSP Costume',
    tagline: 'User-designed FX parameters',
    description: 'Fully customizable real-time equalizer, drive, filter, and spatial rack.',
    iconName: 'Sliders',
    pitchSemitones: 0,
    playbackRate: 1.0,
    filterType: 'peaking',
    filterFrequency: 1800,
    filterQ: 1.5,
    distortionDrive: 10,
    reverbWet: 0.4,
    delayTime: 0.2,
    delayFeedback: 0.3,
    isRobotizer: false,
    color: '#f97316',
  },
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private inputGain: GainNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private masterOutputGain: GainNode | null = null;
  private robotizerOsc: OscillatorNode | null = null;
  private robotizerGain: GainNode | null = null;

  // Recording
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private lastRecordedBlobUrl: string | null = null;
  private recordTimer: number | null = null;
  public lastUploadedFileName: string | null = null;

  // Active settings
  public currentCostume: VoiceCostumeSettings = { ...VOICE_COSTUMES['gita-sage'] };
  public isMicActive: boolean = false;
  public isMonitoringHeadphones: boolean = false;
  public isRecording: boolean = false;
  public isSpeakingTTS: boolean = false;

  private onStateChangeCallback?: () => void;

  constructor() {
    // Lazy init on first user gesture
  }

  public setOnStateChange(cb: () => void) {
    this.onStateChangeCallback = cb;
  }

  private notify() {
    if (this.onStateChangeCallback) this.onStateChangeCallback();
  }

  public ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const k = Math.max(0, amount);
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }
    return curve;
  }

  private createImpulseResponse(ctx: AudioContext, duration: number = 2.5, decay: number = 2.0): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      const factor = Math.exp(-n / (sampleRate * (decay / 4)));
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  public setupDspNodes() {
    const ctx = this.ensureContext();

    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.85;
    }

    if (!this.inputGain) this.inputGain = ctx.createGain();
    if (!this.distortionNode) {
      this.distortionNode = ctx.createWaveShaper();
      this.distortionNode.oversample = '4x';
    }
    if (!this.filterNode) this.filterNode = ctx.createBiquadFilter();
    if (!this.delayNode) this.delayNode = ctx.createDelay(1.0);
    if (!this.feedbackGain) this.feedbackGain = ctx.createGain();
    if (!this.convolverNode) {
      this.convolverNode = ctx.createConvolver();
      this.convolverNode.buffer = this.createImpulseResponse(ctx, 2.5, 3.0);
    }
    if (!this.reverbGain) this.reverbGain = ctx.createGain();
    if (!this.dryGain) this.dryGain = ctx.createGain();
    if (!this.masterOutputGain) this.masterOutputGain = ctx.createGain();

    this.applyCostumeSettings(this.currentCostume);
  }

  public applyCostumeSettings(settings: VoiceCostumeSettings) {
    this.currentCostume = { ...settings };
    if (!this.ctx) return;

    this.setupDspNodes();

    const t = this.ctx.currentTime;

    // Filter
    if (this.filterNode) {
      this.filterNode.type = settings.filterType || 'peaking';
      this.filterNode.frequency.setTargetAtTime(Math.max(80, Math.min(18000, settings.filterFrequency)), t, 0.05);
      this.filterNode.Q.setTargetAtTime(Math.max(0.1, settings.filterQ), t, 0.05);
    }

    // Distortion
    if (this.distortionNode) {
      this.distortionNode.curve = this.makeDistortionCurve(settings.distortionDrive);
    }

    // Delay
    if (this.delayNode && this.feedbackGain) {
      this.delayNode.delayTime.setTargetAtTime(Math.max(0, Math.min(0.8, settings.delayTime)), t, 0.05);
      this.feedbackGain.gain.setTargetAtTime(Math.max(0, Math.min(0.85, settings.delayFeedback)), t, 0.05);
    }

    // Reverb Wet / Dry
    if (this.reverbGain && this.dryGain) {
      const wet = Math.max(0, Math.min(1, settings.reverbWet));
      this.reverbGain.gain.setTargetAtTime(wet, t, 0.05);
      this.dryGain.gain.setTargetAtTime(1 - wet * 0.4, t, 0.05);
    }

    // Master volume monitoring
    if (this.masterOutputGain) {
      // If monitoring headphones is true, pass audio to destination, otherwise keep low/off to avoid speaker feedback
      this.masterOutputGain.gain.setTargetAtTime(this.isMonitoringHeadphones ? 0.9 : 0.0, t, 0.05);
    }

    this.notify();
  }

  public async startMicrophone(): Promise<boolean> {
    try {
      const ctx = this.ensureContext();
      this.setupDspNodes();

      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      if (this.micSource) {
        try {
          this.micSource.disconnect();
        } catch {
          // ignore
        }
      }

      this.micSource = ctx.createMediaStreamSource(this.micStream);

      // Connect DSP chain:
      // micSource -> inputGain -> distortionNode -> filterNode -> (dryGain & convolverNode & delayNode)
      // delayNode -> feedbackGain -> delayNode
      // (dryGain + convolverNode + delayNode) -> masterOutputGain -> destination & analyser
      this.micSource.connect(this.inputGain!);
      this.inputGain!.connect(this.distortionNode!);
      this.distortionNode!.connect(this.filterNode!);

      // Dry path
      this.filterNode!.connect(this.dryGain!);

      // Delay path
      this.filterNode!.connect(this.delayNode!);
      this.delayNode!.connect(this.feedbackGain!);
      this.feedbackGain!.connect(this.delayNode!);
      this.delayNode!.connect(this.dryGain!);

      // Reverb path
      this.filterNode!.connect(this.convolverNode!);
      this.convolverNode!.connect(this.reverbGain!);

      // Summing
      this.dryGain!.connect(this.analyser!);
      this.reverbGain!.connect(this.analyser!);

      this.analyser!.connect(this.masterOutputGain!);
      this.masterOutputGain!.connect(ctx.destination);

      this.isMicActive = true;
      this.notify();
      return true;
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err);
      this.isMicActive = false;
      this.notify();
      return false;
    }
  }

  public stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {
        // ignore
      }
      this.micSource = null;
    }
    this.isMicActive = false;
    this.notify();
  }

  public setMonitoring(enable: boolean) {
    this.isMonitoringHeadphones = enable;
    if (this.masterOutputGain && this.ctx) {
      this.masterOutputGain.gain.setTargetAtTime(enable ? 0.9 : 0.0, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  // Voice recording & instant morphed playback
  public async startRecording(durationSeconds: number = 5): Promise<boolean> {
    try {
      if (this.recordTimer) {
        window.clearTimeout(this.recordTimer);
        this.recordTimer = null;
      }

      const active = await this.startMicrophone();
      if (!active || !this.micStream) return false;

      this.recordedChunks = [];
      this.lastUploadedFileName = null;
      this.mediaRecorder = new MediaRecorder(this.micStream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        if (this.lastRecordedBlobUrl) {
          try {
            URL.revokeObjectURL(this.lastRecordedBlobUrl);
          } catch {
            // ignore
          }
        }
        this.lastRecordedBlobUrl = URL.createObjectURL(blob);
        this.isRecording = false;
        this.notify();
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.notify();

      // Automatically auto-stop after the selected duration (e.g. 5s or 10s)
      this.recordTimer = window.setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, Math.max(1, durationSeconds) * 1000);

      return true;
    } catch (err) {
      console.error('Error starting recording:', err);
      return false;
    }
  }

  public stopRecording() {
    if (this.recordTimer) {
      window.clearTimeout(this.recordTimer);
      this.recordTimer = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
    this.notify();
  }

  // Load user-uploaded audio file (MP3, WAV, OGG, M4A, etc.) for costume DSP transformation
  public loadAudioFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (this.lastRecordedBlobUrl) {
          try {
            URL.revokeObjectURL(this.lastRecordedBlobUrl);
          } catch {
            // ignore
          }
        }
        const blobUrl = URL.createObjectURL(file);
        this.lastRecordedBlobUrl = blobUrl;
        this.lastUploadedFileName = file.name;
        this.isRecording = false;
        this.notify();
        resolve(blobUrl);
      } catch (err) {
        console.error('Error loading audio file:', err);
        reject(err);
      }
    });
  }

  public clearRecordedAudio() {
    if (this.lastRecordedBlobUrl) {
      try {
        URL.revokeObjectURL(this.lastRecordedBlobUrl);
      } catch {
        // ignore
      }
    }
    this.lastRecordedBlobUrl = null;
    this.lastUploadedFileName = null;
    this.notify();
  }

  public playMorphedRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.lastRecordedBlobUrl) {
        reject(new Error('No audio clip available'));
        return;
      }
      const audio = new Audio(this.lastRecordedBlobUrl);
      audio.playbackRate = Math.max(0.5, Math.min(2.0, this.currentCostume.playbackRate));
      // Connect to audioContext for full DSP filtering
      const ctx = this.ensureContext();
      this.setupDspNodes();

      try {
        const source = ctx.createMediaElementSource(audio);
        source.connect(this.distortionNode!);
        if (this.masterOutputGain) {
          this.masterOutputGain.gain.setValueAtTime(1.0, ctx.currentTime);
        }
      } catch (e) {
        console.warn('Fallback audio output or already connected:', e);
      }

      audio.onended = () => {
        resolve();
      };
      audio.onerror = (e) => {
        reject(e);
      };
      audio.play().catch(reject);
    });
  }

  public getLastRecordedUrl(): string | null {
    return this.lastRecordedBlobUrl;
  }

  public getLastUploadedFileName(): string | null {
    return this.lastUploadedFileName;
  }

  // Natural Gemini AI Assistant Speech Synthesis (No robotic filters)
  public speakTextWithCostume(text: string, onEnd?: () => void): boolean {
    this.isSpeakingTTS = true;
    this.notify();

    import('./aiVoiceService').then(({ aiVoiceService }) => {
      aiVoiceService.speakText(text, () => {
        this.isSpeakingTTS = false;
        this.notify();
        if (onEnd) onEnd();
      });
    }).catch(() => {
      this.isSpeakingTTS = false;
      this.notify();
      if (onEnd) onEnd();
    });
    return true;
  }

  public stopSpeaking() {
    import('./aiVoiceService').then(({ aiVoiceService }) => {
      aiVoiceService.stopSpeaking();
    }).catch(() => {});
    this.isSpeakingTTS = false;
    this.notify();
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingTTS = false;
    this.notify();
  }

  // Play divine Sanskrit chant sound simulation using pure Web Audio synthesized chords & bells
  public playSacredChant(): Promise<void> {
    return new Promise((resolve) => {
      const ctx = this.ensureContext();
      this.setupDspNodes();

      const fundamental = 136.1; // Om cosmic frequency in Hz (C#)
      const notes = [fundamental, fundamental * 1.5, fundamental * 2, fundamental * 2.5]; // Fifth, Octave, Major 10th
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        // Gentle vibrato
        osc.frequency.linearRampToValueAtTime(freq * 1.01, now + 1.5);
        osc.frequency.linearRampToValueAtTime(freq, now + 3.0);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2 / (idx + 1), now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(gain);
        gain.connect(this.convolverNode || ctx.destination);
        if (this.analyser) gain.connect(this.analyser);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 4.6);
      });

      setTimeout(() => {
        resolve();
      }, 4500);
    });
  }
}

// Global singleton instance for application wide audio processing
export const globalAudioEngine = new AudioEngine();
