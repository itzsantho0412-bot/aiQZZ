// Helioz AI Ringtone Service
// Supports synthesized celestial tones and persistent local user audio files (MP3/WAV/M4A/OGG) via IndexedDB

import { RingtonePresetId, RingtoneConfig } from '../types';

export interface RingtonePreset {
  id: RingtonePresetId;
  name: string;
  category: 'synthesized' | 'custom';
  description: string;
  tag: string;
  iconName: string;
}

export const RINGTONE_PRESETS: RingtonePreset[] = [
  {
    id: 'celestial-chime',
    name: 'Celestial Chime',
    category: 'synthesized',
    description: 'Resonant harmonic bells and ethereal ascending chimes',
    tag: 'Default',
    iconName: 'Sparkles',
  },
  {
    id: 'sacred-om-flute',
    name: 'Sacred Om & Flute',
    category: 'synthesized',
    description: '136.1Hz Om meditation tone with peaceful Bansuri flute notes',
    tag: 'Spiritual',
    iconName: 'Sun',
  },
  {
    id: 'sunrise-marimba',
    name: 'Sunrise Marimba',
    category: 'synthesized',
    description: 'Brisk, upbeat wooden marimba sunrise melody to awaken discipline',
    tag: 'Upbeat',
    iconName: 'Flame',
  },
  {
    id: 'radar-pulse',
    name: 'Radar Executive',
    category: 'synthesized',
    description: 'Sharp, modern sonar alert tones for high-focus action',
    tag: 'Modern',
    iconName: 'Radio',
  },
  {
    id: 'custom-local',
    name: 'Custom Local File',
    category: 'custom',
    description: 'Your own uploaded audio track (MP3, WAV, M4A, OGG)',
    tag: 'Personal',
    iconName: 'FileAudio',
  },
];

// IndexedDB Helper for persistent local audio files
const DB_NAME = 'HeliozRingtoneDB';
const DB_VERSION = 1;
const STORE_NAME = 'ringtones';
const RECORD_KEY = 'custom_local_ringtone';

interface StoredAudioRecord {
  blob: Blob;
  name: string;
  size: number;
  duration: number;
  type: string;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveCustomAudioToDB(record: StoredAudioRecord): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record, RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save ringtone to IndexedDB:', err);
  }
}

async function loadCustomAudioFromDB(): Promise<StoredAudioRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(RECORD_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load ringtone from IndexedDB:', err);
    return null;
  }
}

async function removeCustomAudioFromDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to remove ringtone from IndexedDB:', err);
  }
}

export type RingtoneSubscriber = (config: RingtoneConfig, isPlaying: boolean, previewingId: RingtonePresetId | null) => void;

class RingtoneService {
  private ctx: AudioContext | null = null;
  private isRinging: boolean = false;
  private isPreviewing: boolean = false;
  private previewingPresetId: RingtonePresetId | null = null;
  private ringInterval: any = null;

  // Custom audio playback
  private customBlob: Blob | null = null;
  private customBlobUrl: string | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private customAudioInfo: { name: string; size: number; duration: number } | null = null;

  // Active configuration
  private config: RingtoneConfig = {
    activeId: 'celestial-chime',
    volume: 0.85,
  };

  private subscribers: Set<RingtoneSubscriber> = new Set();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;

    // Load saved configuration from localStorage
    try {
      const savedConfig = localStorage.getItem('helioz_ringtone_cfg');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to read ringtone config from localStorage:', e);
    }

    // Load custom audio from IndexedDB if available
    try {
      const record = await loadCustomAudioFromDB();
      if (record && record.blob) {
        this.customBlob = record.blob;
        this.customBlobUrl = URL.createObjectURL(record.blob);
        this.customAudioInfo = {
          name: record.name,
          size: record.size,
          duration: record.duration,
        };
        this.config.customFileName = record.name;
        this.config.customFileSize = record.size;
        this.config.customDuration = record.duration;

        this.prepareCustomAudioElement();
      } else if (this.config.activeId === 'custom-local') {
        // Fallback if record was missing
        this.config.activeId = 'celestial-chime';
      }
    } catch (e) {
      console.warn('Failed initializing stored custom ringtone:', e);
    }

    this.isInitialized = true;
    this.notify();
  }

  private persistConfig() {
    try {
      localStorage.setItem('helioz_ringtone_cfg', JSON.stringify({
        activeId: this.config.activeId,
        volume: this.config.volume,
        customFileName: this.config.customFileName,
        customFileSize: this.config.customFileSize,
        customDuration: this.config.customDuration,
      }));
    } catch (e) {
      console.warn('Could not persist ringtone config:', e);
    }
  }

  public subscribe(cb: RingtoneSubscriber): () => void {
    this.subscribers.add(cb);
    // Initial call
    cb(this.config, this.isRinging || this.isPreviewing, this.previewingPresetId);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notify() {
    const isPlaying = this.isRinging || this.isPreviewing;
    this.subscribers.forEach((cb) => cb(this.config, isPlaying, this.previewingPresetId));
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private prepareCustomAudioElement() {
    if (!this.customBlobUrl) return;
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.src = '';
    }
    const audio = new Audio(this.customBlobUrl);
    audio.loop = true;
    audio.volume = Math.max(0, Math.min(1, this.config.volume));
    this.customAudioElement = audio;
  }

  // --- Synthesizers for built-in presets ---

  private playPresetBurst(presetId: RingtonePresetId) {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.config.volume;

      if (presetId === 'celestial-chime') {
        // E5, G#5, B5, E6
        const frequencies = [659.25, 830.61, 987.77, 1318.51];
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.14);

          gain.gain.setValueAtTime(0, now + idx * 0.14);
          gain.gain.linearRampToValueAtTime(0.14 * vol, now + idx * 0.14 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 1.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.14);
          osc.stop(now + idx * 0.14 + 1.35);
        });
      } else if (presetId === 'sacred-om-flute') {
        // Om drone (136.1Hz) + Flute melody notes (432Hz, 486Hz, 576Hz, 648Hz)
        const droneOsc = ctx.createOscillator();
        const droneGain = ctx.createGain();
        droneOsc.type = 'triangle';
        droneOsc.frequency.setValueAtTime(136.1, now);
        droneGain.gain.setValueAtTime(0.1 * vol, now);
        droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
        droneOsc.connect(droneGain);
        droneGain.connect(ctx.destination);
        droneOsc.start(now);
        droneOsc.stop(now + 2.3);

        const fluteNotes = [432, 486, 576, 648];
        fluteNotes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.22);
          // subtle vibrato
          osc.frequency.linearRampToValueAtTime(f * 1.015, now + idx * 0.22 + 0.1);

          gain.gain.setValueAtTime(0, now + idx * 0.22);
          gain.gain.linearRampToValueAtTime(0.15 * vol, now + idx * 0.22 + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.22);
          osc.stop(now + idx * 0.22 + 0.95);
        });
      } else if (presetId === 'sunrise-marimba') {
        // Energetic marimba chord: C5, E5, G5, B5, C6
        const marimbaNotes = [523.25, 659.25, 783.99, 987.77, 1046.5];
        marimbaNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          // Percussive marimba pluck
          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18 * vol, now + idx * 0.12 + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.5);
        });
      } else if (presetId === 'radar-pulse') {
        // High-tech clean double beep (880Hz then 1760Hz)
        [0, 0.18].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? 880 : 1320, now + offset);

          gain.gain.setValueAtTime(0, now + offset);
          gain.gain.linearRampToValueAtTime(0.2 * vol, now + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.22);
        });
      }
    } catch (e) {
      console.warn('Preset chime burst error:', e);
    }
  }

  // --- Public API ---

  public getConfig(): RingtoneConfig {
    return { ...this.config };
  }

  public getCustomAudioInfo() {
    return this.customAudioInfo;
  }

  public setActiveRingtone(id: RingtonePresetId) {
    if (id === 'custom-local' && !this.customBlobUrl) {
      console.warn('Cannot activate custom ringtone without an uploaded audio file');
      return;
    }
    this.config.activeId = id;
    this.persistConfig();
    this.notify();
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.config.volume = clamped;
    if (this.customAudioElement) {
      this.customAudioElement.volume = clamped;
    }
    this.persistConfig();
    this.notify();
  }

  // Set custom local audio file uploaded by user
  public async setCustomAudioFile(file: File | Blob, customName?: string): Promise<{ name: string; size: number; duration: number }> {
    const fileName = customName || (file instanceof File ? file.name : 'custom_ringtone.mp3');
    const fileSize = file.size;

    // Release old blob url
    if (this.customBlobUrl) {
      URL.revokeObjectURL(this.customBlobUrl);
    }

    const blobUrl = URL.createObjectURL(file);
    this.customBlob = file;
    this.customBlobUrl = blobUrl;

    // Determine audio duration
    const duration = await new Promise<number>((resolve) => {
      const tempAudio = new Audio(blobUrl);
      tempAudio.onloadedmetadata = () => {
        resolve(tempAudio.duration || 0);
      };
      tempAudio.onerror = () => {
        resolve(0);
      };
      setTimeout(() => resolve(0), 3000);
    });

    const record: StoredAudioRecord = {
      blob: file,
      name: fileName,
      size: fileSize,
      duration,
      type: file.type || 'audio/mpeg',
      updatedAt: Date.now(),
    };

    // Save to IndexedDB
    await saveCustomAudioToDB(record);

    this.customAudioInfo = {
      name: fileName,
      size: fileSize,
      duration,
    };

    this.config.customFileName = fileName;
    this.config.customFileSize = fileSize;
    this.config.customDuration = duration;
    this.config.activeId = 'custom-local';

    this.prepareCustomAudioElement();
    this.persistConfig();
    this.notify();

    return this.customAudioInfo;
  }

  public async clearCustomAudio(): Promise<void> {
    this.stopPreview();
    this.stopRingtone();

    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement = null;
    }

    if (this.customBlobUrl) {
      URL.revokeObjectURL(this.customBlobUrl);
      this.customBlobUrl = null;
    }

    this.customBlob = null;
    this.customAudioInfo = null;
    this.config.customFileName = undefined;
    this.config.customFileSize = undefined;
    this.config.customDuration = undefined;

    if (this.config.activeId === 'custom-local') {
      this.config.activeId = 'celestial-chime';
    }

    await removeCustomAudioFromDB();
    this.persistConfig();
    this.notify();
  }

  // Audition / Preview a specific preset or the custom file in Settings
  public async playPreview(presetId?: RingtonePresetId) {
    const targetId = presetId || this.config.activeId;

    // If already previewing this tone, stop it
    if (this.isPreviewing && this.previewingPresetId === targetId) {
      this.stopPreview();
      return;
    }

    this.stopPreview();
    this.stopRingtone();

    this.isPreviewing = true;
    this.previewingPresetId = targetId;
    this.notify();

    if (targetId === 'custom-local') {
      if (this.customBlobUrl) {
        if (!this.customAudioElement) {
          this.prepareCustomAudioElement();
        }
        if (this.customAudioElement) {
          this.customAudioElement.currentTime = 0;
          this.customAudioElement.volume = this.config.volume;
          this.customAudioElement.loop = false; // play once for preview
          this.customAudioElement.onended = () => {
            this.stopPreview();
          };
          try {
            await this.customAudioElement.play();
          } catch (e) {
            console.warn('Playback error on custom audio:', e);
            this.stopPreview();
          }
        }
      } else {
        this.stopPreview();
      }
    } else {
      // Play burst twice as an audition preview
      this.ensureContext();
      this.playPresetBurst(targetId);

      this.ringInterval = setTimeout(() => {
        if (this.isPreviewing) {
          this.playPresetBurst(targetId);
        }
        setTimeout(() => {
          if (this.isPreviewing) {
            this.stopPreview();
          }
        }, 1500);
      }, 1200);
    }
  }

  public stopPreview() {
    this.isPreviewing = false;
    this.previewingPresetId = null;

    if (this.ringInterval) {
      clearTimeout(this.ringInterval);
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }

    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.currentTime = 0;
    }

    this.notify();
  }

  // --- Real Incoming Call Ringtone Loop ---

  public startRingtone() {
    if (this.isRinging) return;
    this.stopPreview();

    this.isRinging = true;
    this.notify();

    if (this.config.activeId === 'custom-local' && this.customBlobUrl) {
      if (!this.customAudioElement) {
        this.prepareCustomAudioElement();
      }
      if (this.customAudioElement) {
        this.customAudioElement.currentTime = 0;
        this.customAudioElement.volume = this.config.volume;
        this.customAudioElement.loop = true;
        this.customAudioElement.play().catch((err) => {
          console.warn('Custom ringtone play failed, falling back to celestial chime:', err);
          this.playPresetBurst('celestial-chime');
        });
      }
    } else {
      // Synthesized tone loop
      this.ensureContext();
      this.playPresetBurst(this.config.activeId);

      this.ringInterval = setInterval(() => {
        if (this.isRinging) {
          this.playPresetBurst(this.config.activeId);
        }
      }, 2400);
    }
  }

  public stopRingtone() {
    this.isRinging = false;

    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      clearTimeout(this.ringInterval);
      this.ringInterval = null;
    }

    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.currentTime = 0;
    }

    this.notify();
  }

  public getActiveRingtoneName(): string {
    if (this.config.activeId === 'custom-local') {
      return this.customAudioInfo?.name || 'Custom Local File';
    }
    const preset = RINGTONE_PRESETS.find((p) => p.id === this.config.activeId);
    return preset?.name || 'Celestial Chime';
  }

  public getIsPlaying(): boolean {
    return this.isRinging || this.isPreviewing;
  }
}

export const ringtoneService = new RingtoneService();
