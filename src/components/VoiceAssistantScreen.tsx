import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Settings,
  Mic,
  MicOff,
  Sparkles,
  X,
  Languages,
  MessageSquare,
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Check,
  Send,
  RefreshCw,
  FileAudio,
} from 'lucide-react';
import { AppScreen, VoiceCostumeId, VoiceCostumeSettings, AIVoicePersonaId, AILanguageMode } from '../types';
import { aiVoiceService, AI_VOICE_PERSONAS } from '../services/aiVoiceService';

interface VoiceAssistantScreenProps {
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenConversation: (initialQuery?: string) => void;
  onOpenCostumeStudio: () => void;
  activeCostume: VoiceCostumeSettings;
  onSelectCostume: (id: VoiceCostumeId) => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  onRequestMicPermission?: () => void;
  micPermissionState?: 'prompt' | 'granted' | 'denied';
}

export const VoiceAssistantScreen: React.FC<VoiceAssistantScreenProps> = ({
  onBack,
  onOpenSettings,
  onOpenConversation,
  onOpenCostumeStudio,
  activeCostume,
  onSelectCostume,
  isMicActive,
  onToggleMic,
  onRequestMicPermission,
  micPermissionState = 'prompt',
}) => {
  const [voiceSettings, setVoiceSettings] = useState(aiVoiceService.getSettings());
  const [activePersona, setActivePersona] = useState(aiVoiceService.getActivePersona());
  const [isAiSpeaking, setIsAiSpeaking] = useState(aiVoiceService.getIsSpeaking());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPersonaDrawer, setShowPersonaDrawer] = useState(false);
  const [auditioningId, setAuditioningId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSendTimerRef = useRef<number | null>(null);

  // Subscribe to aiVoiceService updates
  useEffect(() => {
    const unsub = aiVoiceService.subscribe(() => {
      setVoiceSettings(aiVoiceService.getSettings());
      setActivePersona(aiVoiceService.getActivePersona());
      setIsAiSpeaking(aiVoiceService.getIsSpeaking());
    });
    return unsub;
  }, []);

  // Initialize active listening when screen opens
  useEffect(() => {
    startListeningFlow();
    return () => {
      stopListeningFlow();
      aiVoiceService.stopSpeaking();
      if (autoSendTimerRef.current) window.clearTimeout(autoSendTimerRef.current);
    };
  }, [voiceSettings.languageMode]);

  const startListeningFlow = () => {
    aiVoiceService.stopSpeaking();
    setIsListening(true);
    aiVoiceService.startListening(
      (newTranscript, isFinal) => {
        setTranscript(newTranscript);
        // If final sentence detected and length > 3, auto-trigger response after short pause
        if (isFinal && newTranscript.trim().length > 3) {
          if (autoSendTimerRef.current) window.clearTimeout(autoSendTimerRef.current);
          autoSendTimerRef.current = window.setTimeout(() => {
            handleProcessUserSpeech(newTranscript);
          }, 1400);
        }
      },
      (err) => {
        console.warn('Listening note:', err);
      }
    );
  };

  const stopListeningFlow = () => {
    setIsListening(false);
    aiVoiceService.stopListening();
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListeningFlow();
    } else {
      if (isAiSpeaking) {
        aiVoiceService.stopSpeaking();
      }
      startListeningFlow();
    }
  };

  const handleProcessUserSpeech = async (queryText?: string) => {
    const query = (queryText || transcript).trim();
    if (!query) return;

    if (autoSendTimerRef.current) {
      window.clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }

    setIsProcessing(true);
    stopListeningFlow();

    try {
      // Query Gemini API in Tamil and English
      const reply = await aiVoiceService.askGemini(query);
      setAiResponseText(reply);
      setIsProcessing(false);

      // Speak back using the Gemini natural voice persona
      await aiVoiceService.speakText(reply, () => {
        // After speaking finishes, resume listening for conversation continuation
        setTimeout(() => {
          setTranscript('');
          startListeningFlow();
        }, 600);
      });
    } catch (err) {
      console.error('Error in conversation cycle:', err);
      setIsProcessing(false);
      startListeningFlow();
    }
  };

  const handleAudition = (personaId: AIVoicePersonaId, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAuditioningId(personaId);
    stopListeningFlow();

    const isTamil = voiceSettings.languageMode === 'tamil' || voiceSettings.languageMode === 'bilingual';
    aiVoiceService.auditionVoice(personaId, isTamil ? 'TA' : 'EN');

    setTimeout(() => {
      setAuditioningId(null);
    }, 4500);
  };

  const handleSelectPersona = (id: AIVoicePersonaId) => {
    aiVoiceService.setPersona(id);
    setVoiceSettings(aiVoiceService.getSettings());
    setActivePersona(aiVoiceService.getActivePersona());
  };

  const handleLanguageChange = (mode: AILanguageMode) => {
    aiVoiceService.setLanguageMode(mode);
    setVoiceSettings(aiVoiceService.getSettings());
    setTranscript('');
  };

  const handleUploadCustomVoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await aiVoiceService.saveCustomVoiceFile(file);
      aiVoiceService.setPersona('custom-voice');
      setVoiceSettings(aiVoiceService.getSettings());
      setActivePersona(aiVoiceService.getActivePersona());
    } catch (err) {
      console.error('Failed to save custom voice file:', err);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col justify-between p-4 pb-6 select-none overflow-hidden text-white">
      {/* Background ambient radial glow based on active persona */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-88 h-88 rounded-full blur-3xl pointer-events-none transition-colors duration-700 opacity-25"
        style={{ backgroundColor: activePersona.color }}
      />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10 pt-2">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold tracking-widest text-zinc-100 uppercase">
              HELIOZ AI
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Natural Gemini
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            {isAiSpeaking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-cyan-300">Speaking naturally...</span>
              </>
            ) : isProcessing ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
                <span className="text-[11px] font-semibold text-amber-300">Thinking (சிந்திக்கிறது)...</span>
              </>
            ) : isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-semibold text-emerald-400">Listening to you...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-[11px] font-medium text-zinc-400">Tap mic to speak</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition-transform"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Active AI Voice Persona Selector Banner */}
      <div className="z-10 mt-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold tracking-wide text-zinc-300">
              AI Voice Persona (குரல் தேர்வு)
            </span>
          </div>
          <button
            onClick={() => handleAudition(activePersona.id)}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            {isAiSpeaking ? (
              <>
                <Square className="w-3 h-3 text-red-400" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3 text-amber-400" />
                <span>Audition குரலை கேள்</span>
              </>
            )}
          </button>
        </div>

        {/* Scrollable Persona Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {AI_VOICE_PERSONAS.map((persona) => {
            const isSelected = activePersona.id === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => handleSelectPersona(persona.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-zinc-900/90 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span>{persona.id === 'ponniyin-regal' ? '👑' : persona.id === 'custom-voice' ? '📁' : '✨'}</span>
                <span>{persona.name}</span>
                {isSelected && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Hidden File input for Custom Voice File */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleUploadCustomVoice}
        />
      </div>

      {/* Center Interactive Listening & Speaking Orb */}
      <div className="flex flex-col items-center justify-center z-10 py-4 my-auto">
        <div className="relative flex items-center justify-center">
          {/* Animated Halo Rings reacting to listening/speaking */}
          <div
            className={`absolute w-72 h-72 rounded-full border transition-all duration-700 ${
              isAiSpeaking
                ? 'border-cyan-400/40 animate-pulse scale-105'
                : isListening
                ? 'border-amber-500/30 animate-pulse-halo'
                : 'border-zinc-800'
            }`}
          />
          <div
            className={`absolute w-56 h-56 rounded-full border transition-all duration-500 ${
              isAiSpeaking
                ? 'border-cyan-400/30'
                : isListening
                ? 'border-amber-400/40'
                : 'border-zinc-800/60'
            }`}
          />
          <div
            className={`absolute w-44 h-44 rounded-full blur-2xl transition-all duration-700 ${
              isAiSpeaking
                ? 'bg-cyan-500/25'
                : isListening
                ? 'bg-orange-500/25'
                : 'bg-zinc-800/20'
            }`}
          />

          {/* Central Pulsing Mic Orb */}
          <button
            onClick={handleToggleListening}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform duration-300 ${
              isAiSpeaking
                ? 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-400 shadow-[0_0_50px_rgba(56,189,248,0.7)]'
                : isListening
                ? 'bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_50px_rgba(245,158,11,0.7)]'
                : 'bg-zinc-900 border-2 border-zinc-700 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
            }`}
          >
            <div className="w-24 h-24 rounded-full bg-black/85 flex flex-col items-center justify-center border border-white/20">
              {isAiSpeaking ? (
                <Volume2 className="w-9 h-9 text-cyan-300 animate-pulse" />
              ) : isListening ? (
                <Mic className="w-9 h-9 text-amber-300 animate-bounce" />
              ) : (
                <MicOff className="w-8 h-8 text-zinc-500" />
              )}
              <span className="text-[10px] font-bold mt-1 text-zinc-300">
                {isAiSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Tap to Talk'}
              </span>
            </div>
          </button>
        </div>

        {/* Dynamic Voice Status Text */}
        <p className="mt-6 text-sm font-semibold tracking-wide text-zinc-200 text-center">
          {isAiSpeaking
            ? `HELIOZ is speaking in ${activePersona.name}...`
            : isListening
            ? 'Listening to you speak Tamil or English...'
            : 'Tap the center orb to start natural voice conversation'}
        </p>

        {/* Dynamic Sound Wave Bars */}
        <div className="flex items-center justify-center gap-1.5 mt-3 h-8 px-6 w-full max-w-xs">
          {[35, 65, 90, 50, 85, 100, 75, 40, 95, 60, 80, 45, 85, 65, 30].map((height, i) => (
            <div
              key={i}
              style={{
                height: isListening || isAiSpeaking ? `${height}%` : '15%',
                animationDelay: `${(i % 5) * 0.12}s`,
              }}
              className={`w-1 rounded-full transition-all duration-300 ${
                isAiSpeaking
                  ? 'bg-gradient-to-t from-blue-500 via-cyan-400 to-sky-300 animate-wave-bar'
                  : isListening
                  ? 'bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-300 animate-wave-bar'
                  : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Real-time Spoken Transcript or AI Answer Box */}
        <div className="mt-5 w-full max-w-sm px-4">
          {isProcessing ? (
            <div className="bg-zinc-950/90 border border-amber-500/40 rounded-2xl p-3.5 text-center">
              <RefreshCw className="w-5 h-5 text-amber-400 animate-spin mx-auto mb-1.5" />
              <p className="text-xs text-amber-300 font-medium">
                Gemini AI is crafting a natural response in Tamil & English...
              </p>
            </div>
          ) : aiResponseText ? (
            <div className="bg-zinc-950/90 border border-cyan-500/40 rounded-2xl p-3.5 text-left shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>HELIOZ AI</span>
                </span>
                <button
                  onClick={() => aiVoiceService.speakText(aiResponseText)}
                  className="text-[10px] font-semibold text-cyan-300 hover:text-white flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              </div>
              <p className="text-xs leading-relaxed text-zinc-100">{aiResponseText}</p>
            </div>
          ) : transcript ? (
            <div className="bg-zinc-950/90 border border-amber-500/50 rounded-2xl p-3.5 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  You said (நீங்கள் கூறியது):
                </span>
                <button
                  onClick={() => handleProcessUserSpeech()}
                  className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center gap-1"
                >
                  <Send className="w-2.5 h-2.5" />
                  <span>Ask Now</span>
                </button>
              </div>
              <p className="text-xs text-amber-200 italic font-medium">"{transcript}"</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handleProcessUserSpeech('இன்றைய நாளுக்கான உத்வேகக் கருத்து சொல்')}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white hover:border-amber-500/40 transition-colors"
              >
                "இன்றைய உத்வேகம் என்ன?"
              </button>
              <button
                onClick={() => handleProcessUserSpeech('What should I focus on today?')}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white hover:border-amber-500/40 transition-colors"
              >
                "What is my roadmap today?"
              </button>
              <button
                onClick={() => handleProcessUserSpeech('பகவத் கீதை ஸ்லோகம் ஒன்று கூறு')}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white hover:border-amber-500/40 transition-colors"
              >
                "கீதை வழிகாட்டுதல் கூறு"
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar: Language Mode + Upload Voice + Chat View */}
      <div className="flex items-center justify-between z-10 px-2 pt-2 border-t border-zinc-900 gap-2">
        {/* Language selector toggle */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-full p-0.5">
          <button
            onClick={() => handleLanguageChange('bilingual')}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              voiceSettings.languageMode === 'bilingual'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            தமிழ் + EN
          </button>
          <button
            onClick={() => handleLanguageChange('tamil')}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              voiceSettings.languageMode === 'tamil'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => handleLanguageChange('english')}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              voiceSettings.languageMode === 'english'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Upload Custom Voice Sample button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload Voice Sample for AI"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:border-zinc-700 active:scale-95 transition-all"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Upload Voice</span>
          <span className="sm:hidden">Voice</span>
        </button>

        {/* Chat Conversation button */}
        <button
          onClick={() => onOpenConversation(transcript || 'What should I do today?')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-transform"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat View</span>
        </button>
      </div>
    </div>
  );
};
