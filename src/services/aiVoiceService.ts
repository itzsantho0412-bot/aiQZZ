// HELIOZ AI Natural Voice & Listening Service
// Full Gemini neural speech synthesis (bilingual Tamil & English) + continuous active listening

import { AIVoicePersona, AIVoicePersonaId, AIVoiceSettings, AILanguageMode } from '../types';

export const AI_VOICE_PERSONAS: AIVoicePersona[] = [
  {
    id: 'ponniyin-regal',
    name: 'Ponniyin Tamil Regal (User Audio Voice)',
    tamilName: 'தமிழ் கம்பீரம் (பொன்னியின் குரல்)',
    description: 'Majestic, dramatic, confident Tamil delivery inspired by your uploaded audio clip.',
    geminiVoiceName: 'Aoede',
    style: 'Majestic, confident, poetic, passionate Tamil and English cadence with royal warmth and courage',
    sampleTamilText: 'நான் பார்க்காத போர்க்களமா? கடமையை செய்யுங்கள், வெற்றி நிச்சயம் உங்கள் வசம்!',
    sampleEnglishText: 'Is there a battlefield we have not seen? Rise up with courage and conquer your day!',
    color: '#f59e0b',
    badge: 'Uploaded Voice Reference',
  },
  {
    id: 'gemini-aoede',
    name: 'Gemini Aoede (Warm & Empathetic)',
    tamilName: 'ஜெமினி இயல்பான குரல் (கனிவான தோழமை)',
    description: 'Warm, conversational, human-like voice identical to Google Gemini AI Assistant.',
    geminiVoiceName: 'Aoede',
    style: 'Warm, natural, expressive, friendly companion tone fluent in Tamil and English',
    sampleTamilText: 'வணக்கம்! நான் உங்கள் வளர்ச்சிக் கூட்டாளி. இன்று நாம் ஒன்றாக இணைந்து சாதிக்கலாம்!',
    sampleEnglishText: 'Hello! I am right here with you. Let’s make today deeply meaningful and productive.',
    color: '#38bdf8',
    badge: 'Gemini Natural',
  },
  {
    id: 'gemini-kore',
    name: 'Gemini Kore (Gentle & Inspiring)',
    tamilName: 'மென்மையான வழிகாட்டி',
    description: 'Calm, thoughtful, soothing voice ideal for mindfulness and reflective habit tracking.',
    geminiVoiceName: 'Kore',
    style: 'Gentle, thoughtful, compassionate, encouraging voice with soft cadence',
    sampleTamilText: 'அமைதியுடன் உங்கள் இலக்குகளை நோக்கி முன்னேறுங்கள். நான் உங்களுக்கு துணை நிற்கிறேன்.',
    sampleEnglishText: 'Take a deep breath and take one steady step forward. You have immense potential.',
    color: '#ec4899',
    badge: 'Gentle Guide',
  },
  {
    id: 'gemini-puck',
    name: 'Gemini Puck (Energetic Coach)',
    tamilName: 'ஆற்றல் மிக்க உடற்பயிற்சி பயிற்சியாளர்',
    description: 'High energy, vibrant, upbeat voice to push you through workouts and tough tasks.',
    geminiVoiceName: 'Puck',
    style: 'Upbeat, enthusiastic, high energy personal coach with crisp punchy delivery',
    sampleTamilText: 'அட்டகாசமான நாள் இது! உடனே செயலில் இறங்குங்கள், நேரத்தை விரயமாக்காதீர்கள்!',
    sampleEnglishText: 'Let’s bring maximum energy today! Time to execute your goals without excuses.',
    color: '#10b981',
    badge: 'High Energy',
  },
  {
    id: 'gemini-fenrir',
    name: 'Gemini Fenrir (Deep Authority)',
    tamilName: 'கம்பீர குரு',
    description: 'Authoritative, resonant, disciplined voice for deep focus and executive accountability.',
    geminiVoiceName: 'Fenrir',
    style: 'Deep, resonant, stoic, authoritative mentor voice with strong presence',
    sampleTamilText: 'ஒழுக்கம் மட்டுமே உண்மையான சுதந்திரத்தை தரும். சோம்பலை உதறிவிட்டு எழுங்கள்.',
    sampleEnglishText: 'Discipline equals freedom. Focus only on what is within your control.',
    color: '#ea580c',
    badge: 'Deep Authority',
  },
  {
    id: 'gemini-zephyr',
    name: 'Gemini Zephyr (Sacred Gita Sage)',
    tamilName: 'வேத ஞானி (பகவத் கீதை)',
    description: 'Meditative, serene, spiritual voice with tranquil presence for Gita shloka contemplation.',
    geminiVoiceName: 'Zephyr',
    style: 'Meditative, tranquil, spiritual, resonant temple sage with profound peace',
    sampleTamilText: 'கர்மண்யேவாதிகாரஸ்தே மா பலேஷு கதாசன. செயலில் முழு கவனம் வையுங்கள்.',
    sampleEnglishText: 'Perform your work with serene devotion and detachment from anxious fruits.',
    color: '#8b5cf6',
    badge: 'Gita Sage',
  },
  {
    id: 'custom-voice',
    name: 'Custom Audio Voice (Your File)',
    tamilName: 'உங்கள் சொந்த ஆடியோ குரல்',
    description: 'Use your own uploaded MP3 / WAV audio file as the customized voice persona.',
    geminiVoiceName: 'Aoede',
    style: 'Personalized human style matching user uploaded audio persona',
    sampleTamilText: 'வணக்கம், இது உங்கள் தனிப்பயனாக்கப்பட்ட குரல் வடிவம்!',
    sampleEnglishText: 'Welcome! This is your customized audio voice experience.',
    color: '#06b6d4',
    badge: 'Custom Audio',
  },
];

const SETTINGS_KEY = 'helioz_ai_voice_settings_v2';
const DB_NAME = 'HeliozAIVoiceDB';
const STORE_NAME = 'custom_voice_files';

class AIVoiceService {
  private settings: AIVoiceSettings = {
    personaId: 'ponniyin-regal', // Default to Ponniyin voice as requested by user
    languageMode: 'bilingual',
    speechRate: 1.0,
    isNaturalAiVoiceEnabled: true,
  };

  private currentAudioElement: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private customVoiceBlobUrl: string | null = null;
  private isSpeaking = false;
  private isListening = false;
  private transcript = '';
  private interimTranscript = '';
  private listeners: Array<() => void> = [];

  // Web Speech recognition instance
  private speechRecognition: any = null;
  private recognitionActive = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private frequencyData = new Uint8Array(32);

  constructor() {
    this.loadSettings();
    this.initCustomVoiceStorage();
  }

  // --- IndexedDB for custom audio voice files ---
  private async getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
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

  private async initCustomVoiceStorage() {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get('user_custom_voice');
      req.onsuccess = () => {
        const record = req.result;
        if (record && record.blob) {
          if (this.customVoiceBlobUrl) URL.revokeObjectURL(this.customVoiceBlobUrl);
          this.customVoiceBlobUrl = URL.createObjectURL(record.blob);
          this.settings.hasCustomVoiceFile = true;
          this.settings.customVoiceFileName = record.name;
          this.notify();
        }
      };
    } catch (e) {
      console.warn('Could not load custom voice from IndexedDB:', e);
    }
  }

  public async saveCustomVoiceFile(file: File): Promise<string> {
    const db = await this.getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(
        {
          blob: file,
          name: file.name,
          size: file.size,
          type: file.type,
          updatedAt: Date.now(),
        },
        'user_custom_voice'
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    if (this.customVoiceBlobUrl) {
      try {
        URL.revokeObjectURL(this.customVoiceBlobUrl);
      } catch {
        // ignore
      }
    }

    this.customVoiceBlobUrl = URL.createObjectURL(file);
    this.settings.hasCustomVoiceFile = true;
    this.settings.customVoiceFileName = file.name;
    this.settings.personaId = 'custom-voice';
    this.saveSettings();
    this.notify();
    return this.customVoiceBlobUrl;
  }

  public async clearCustomVoiceFile() {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete('user_custom_voice');
    } catch {
      // ignore
    }
    if (this.customVoiceBlobUrl) {
      try {
        URL.revokeObjectURL(this.customVoiceBlobUrl);
      } catch {
        // ignore
      }
    }
    this.customVoiceBlobUrl = null;
    this.settings.hasCustomVoiceFile = false;
    this.settings.customVoiceFileName = undefined;
    if (this.settings.personaId === 'custom-voice') {
      this.settings.personaId = 'ponniyin-regal';
    }
    this.saveSettings();
    this.notify();
  }

  // --- Settings Persistence ---
  private loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch {
      // ignore
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
    this.notify();
  }

  public getSettings(): AIVoiceSettings {
    return { ...this.settings };
  }

  public setPersona(personaId: AIVoicePersonaId) {
    this.settings.personaId = personaId;
    this.saveSettings();
  }

  public setLanguageMode(mode: AILanguageMode) {
    this.settings.languageMode = mode;
    this.saveSettings();
    // Refresh speech recognition language if currently listening
    if (this.isListening) {
      this.restartListening();
    }
  }

  public setSpeechRate(rate: number) {
    this.settings.speechRate = Math.max(0.7, Math.min(1.5, rate));
    this.saveSettings();
  }

  public setNaturalAiVoiceEnabled(enabled: boolean) {
    this.settings.isNaturalAiVoiceEnabled = enabled;
    this.saveSettings();
  }

  public getActivePersona(): AIVoicePersona {
    const found = AI_VOICE_PERSONAS.find((p) => p.id === this.settings.personaId);
    return found || AI_VOICE_PERSONAS[0];
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Natural Speech Synthesis (Gemini AI TTS with Tamil & English) ---
  public async speakText(text: string, onEnd?: () => void): Promise<boolean> {
    this.stopSpeaking();

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return false;
    }

    const persona = this.getActivePersona();
    const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();

    // If custom audio file persona is selected and a custom file exists, play that audio clip
    if (this.settings.personaId === 'custom-voice' && this.customVoiceBlobUrl) {
      return this.playCustomAudioUrl(this.customVoiceBlobUrl, onEnd);
    }

    // Attempt Gemini 24kHz Natural Audio TTS via server
    if (this.settings.isNaturalAiVoiceEnabled) {
      try {
        const response = await fetch('/api/gemini/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voiceName: persona.geminiVoiceName,
            voiceStyle: persona.style,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.audioBase64) {
            const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
            return this.playAudioSource(audioSrc, onEnd);
          }
        }
      } catch (err) {
        console.warn('Gemini natural TTS server error, trying graceful native neural voice:', err);
      }
    }

    // Fallback: Web Speech API with clean human prosody (NO robotic distortion)
    return this.speakNativeSpeech(cleanText, onEnd);
  }

  private playAudioSource(src: string, onEnd?: () => void): boolean {
    try {
      this.stopSpeaking();
      const audio = new Audio(src);
      audio.playbackRate = this.settings.speechRate || 1.0;
      this.currentAudioElement = audio;
      this.isSpeaking = true;
      this.notify();

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        this.notify();
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.isSpeaking = false;
        this.currentAudioElement = null;
        this.notify();
        if (onEnd) onEnd();
      };

      audio.play().catch((err) => {
        console.warn('Playback error or blocked by autoplay:', err);
        this.isSpeaking = false;
        this.currentAudioElement = null;
        this.notify();
        if (onEnd) onEnd();
      });

      return true;
    } catch {
      this.isSpeaking = false;
      this.notify();
      if (onEnd) onEnd();
      return false;
    }
  }

  private playCustomAudioUrl(url: string, onEnd?: () => void): boolean {
    return this.playAudioSource(url, onEnd);
  }

  // Graceful native speech fallback (Clean, warm, non-robotic)
  private speakNativeSpeech(text: string, onEnd?: () => void): boolean {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return false;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Natural rates without robotic pitch distortion
    utterance.pitch = 1.0;
    utterance.rate = this.settings.speechRate || 1.0;

    // Detect if text contains Tamil characters
    const hasTamil = /[\u0B80-\u0BFF]/.test(text);
    const voices = window.speechSynthesis.getVoices();

    if (hasTamil) {
      utterance.lang = 'ta-IN';
      const tamilVoice = voices.find(
        (v) => v.lang.startsWith('ta') || v.name.includes('Tamil') || v.name.includes('India')
      );
      if (tamilVoice) utterance.voice = tamilVoice;
    } else {
      utterance.lang = 'en-US';
      const naturalVoice = voices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('Daniel')
      );
      if (naturalVoice) utterance.voice = naturalVoice;
    }

    this.isSpeaking = true;
    this.notify();

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notify();
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.notify();
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stopSpeaking() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeaking = false;
    this.notify();
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // --- Audition / Preview Voice ---
  public auditionVoice(personaId?: AIVoicePersonaId, language?: 'TA' | 'EN'): void {
    const targetPersona = personaId
      ? AI_VOICE_PERSONAS.find((p) => p.id === personaId) || this.getActivePersona()
      : this.getActivePersona();

    const isTamil = language === 'TA' || this.settings.languageMode === 'tamil';
    const sampleText = isTamil ? targetPersona.sampleTamilText : targetPersona.sampleEnglishText;

    this.speakText(sampleText);
  }

  // --- Active Voice Listening (Microphone + Speech Recognition) ---
  public startListening(
    onResult?: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void
  ): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported on this browser');
      return false;
    }

    try {
      this.stopListening();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Select speech recognition language based on settings
      if (this.settings.languageMode === 'tamil') {
        recognition.lang = 'ta-IN';
      } else if (this.settings.languageMode === 'english') {
        recognition.lang = 'en-US';
      } else {
        // Bilingual: Default to Indian English / Tamil context
        recognition.lang = 'ta-IN';
      }

      recognition.onstart = () => {
        this.isListening = true;
        this.recognitionActive = true;
        this.notify();
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += trans;
          } else {
            interimStr += trans;
          }
        }

        if (finalStr) {
          this.transcript = (this.transcript + ' ' + finalStr).trim();
          this.interimTranscript = '';
          this.notify();
          if (onResult) onResult(this.transcript, true);
        } else if (interimStr) {
          this.interimTranscript = interimStr;
          this.notify();
          if (onResult) onResult(interimStr, false);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition status:', e.error);
        if (e.error !== 'no-speech' && onError) {
          onError(e.error);
        }
      };

      recognition.onend = () => {
        if (this.recognitionActive) {
          try {
            // Keep listening seamlessly if user hasn't explicitly stopped
            recognition.start();
          } catch {
            this.isListening = false;
            this.recognitionActive = false;
            this.notify();
          }
        } else {
          this.isListening = false;
          this.notify();
        }
      };

      recognition.start();
      this.speechRecognition = recognition;
      this.recognitionActive = true;
      this.isListening = true;
      this.notify();
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      this.recognitionActive = false;
      this.notify();
      return false;
    }
  }

  public stopListening() {
    this.recognitionActive = false;
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch {
        // ignore
      }
      this.speechRecognition = null;
    }
    this.isListening = false;
    this.interimTranscript = '';
    this.notify();
  }

  public restartListening() {
    if (this.isListening) {
      this.stopListening();
      this.startListening();
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getTranscript(): string {
    return this.transcript;
  }

  public getInterimTranscript(): string {
    return this.interimTranscript;
  }

  public clearTranscript() {
    this.transcript = '';
    this.interimTranscript = '';
    this.notify();
  }

  // --- Real-time Conversational Gemini Chat Query ---
  public async askGemini(
    userQuery: string,
    history?: Array<{ sender: string; text: string }>
  ): Promise<string> {
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          history,
          languageMode: this.settings.languageMode,
          voicePersona: this.settings.personaId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) return data.reply;
      }
    } catch (err) {
      console.warn('Gemini chat request failed, generating fallback:', err);
    }

    // Graceful offline bilingual growth response
    if (this.settings.languageMode === 'tamil') {
      return 'வணக்கம்! நான் உங்கள் பேச்சை கேட்டேன். இன்றைய இலக்குகளை நோக்கி உறுதியுடன் முன்னேறுங்கள்.';
    }
    return "I hear you clearly! Let's stay focused on your growth and execute your goals today.";
  }
}

export const aiVoiceService = new AIVoiceService();
