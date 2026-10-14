import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Languages,
  Sun,
  Moon,
  Bell,
  Sparkles,
  ChevronRight,
  Play,
  Square,
  Check,
  Mic,
  PhoneCall,
  Music,
  Upload,
  FileAudio,
  Trash2,
  RotateCcw,
  Sliders,
  AlertCircle,
  CheckCircle2,
  Radio,
  Flame,
} from 'lucide-react';
import {
  AppScreen,
  VoiceCostumeId,
  VoiceCostumeSettings,
  RingtonePresetId,
  RingtoneConfig,
  AIVoicePersonaId,
  AILanguageMode,
} from '../types';
import { AudioEngine } from '../services/audioEngine';
import { ringtoneService, RINGTONE_PRESETS } from '../services/ringtoneService';
import { aiVoiceService, AI_VOICE_PERSONAS } from '../services/aiVoiceService';

interface SettingsScreenProps {
  onNavigate: (screen: AppScreen) => void;
  activeCostume: VoiceCostumeSettings;
  onSelectCostume: (id: VoiceCostumeId) => void;
  engine: AudioEngine;
  onRequestMicPermission?: () => void;
  onRequestCallPermission?: () => void;
  onSimulateIncomingCall?: (type: 'Morning' | 'Evening') => void;
  micPermissionState?: 'prompt' | 'granted' | 'denied';
  callPermissionState?: 'prompt' | 'granted' | 'denied';
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  activeCostume,
  onSelectCostume,
  engine,
  onRequestMicPermission,
  onRequestCallPermission,
  onSimulateIncomingCall,
  micPermissionState = 'prompt',
  callPermissionState = 'prompt',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('Tamil + English');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isAuditioning, setIsAuditioning] = useState<string | null>(null);

  // Ringtone state subscribed to ringtoneService
  const [ringtoneConfig, setRingtoneConfig] = useState<RingtoneConfig>(() => ringtoneService.getConfig());
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [previewingPresetId, setPreviewingPresetId] = useState<RingtonePresetId | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = ringtoneService.subscribe((config, isPlaying, previewId) => {
      setRingtoneConfig(config);
      setIsAudioPlaying(isPlaying);
      setPreviewingPresetId(previewId);
    });

    return () => {
      unsubscribe();
      ringtoneService.stopPreview();
    };
  // AI Voice State
  const [aiVoiceSettings, setAiVoiceSettings] = useState(aiVoiceService.getSettings());
  const [aiActivePersona, setAiActivePersona] = useState(aiVoiceService.getActivePersona());
  const [isAiVoiceAuditioning, setIsAiVoiceAuditioning] = useState<string | null>(null);
  const [voiceUploadFeedback, setVoiceUploadFeedback] = useState<string | null>(null);
  const customVoiceFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubVoice = aiVoiceService.subscribe(() => {
      setAiVoiceSettings(aiVoiceService.getSettings());
      setAiActivePersona(aiVoiceService.getActivePersona());
    });

    return () => {
      unsubVoice();
      aiVoiceService.stopSpeaking();
    };
  }, []);

  const handleAuditionAiVoice = (personaId: AIVoicePersonaId, lang: 'TA' | 'EN') => {
    setIsAiVoiceAuditioning(`${personaId}-${lang}`);
    aiVoiceService.auditionVoice(personaId, lang);
    setTimeout(() => {
      setIsAiVoiceAuditioning(null);
    }, 4500);
  };

  const handleCustomVoiceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      await aiVoiceService.saveCustomVoiceFile(file);
      setVoiceUploadFeedback(`Voice sample "${file.name}" saved as AI Persona!`);
      setTimeout(() => setVoiceUploadFeedback(null), 4000);
    } catch (err: any) {
      setVoiceUploadFeedback('Failed to save audio file: ' + (err.message || 'Error'));
      setTimeout(() => setVoiceUploadFeedback(null), 4000);
    }
  };

  const handleClearCustomVoice = async () => {
    await aiVoiceService.clearCustomVoiceFile();
    setVoiceUploadFeedback('Custom voice sample removed.');
    setTimeout(() => setVoiceUploadFeedback(null), 3000);
  };

  const handleAuditionProfile = (profileName: string, costumeId: VoiceCostumeId) => {
    setIsAuditioning(profileName);
    onSelectCostume(costumeId);
    engine.speakTextWithCostume(
      `Hello Santosh, this is your ${profileName} voice sample. Ready for daily discipline.`,
      () => {
        setIsAuditioning(null);
      }
    );
  };

  // Ringtone actions
  const handleSelectPreset = (id: RingtonePresetId) => {
    ringtoneService.setActiveRingtone(id);
  };

  const handleTogglePreview = (id: RingtonePresetId) => {
    ringtoneService.playPreview(id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if desired
    e.target.value = '';

    // Validate mime type or extension
    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.weba', '.webm'];
    const isAudioType = file.type.startsWith('audio/') || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isAudioType) {
      setUploadFeedback({
        type: 'error',
        message: 'Please choose a valid audio file (.mp3, .wav, .m4a, .ogg)',
      });
      setTimeout(() => setUploadFeedback(null), 4000);
      return;
    }

    try {
      setIsUploading(true);
      setUploadFeedback(null);
      const info = await ringtoneService.setCustomAudioFile(file);
      setUploadFeedback({
        type: 'success',
        message: `Set "${info.name}" as your active incoming call ringtone!`,
      });
      setTimeout(() => setUploadFeedback(null), 4500);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: 'Failed to process audio file: ' + (err.message || 'unknown error'),
      });
      setTimeout(() => setUploadFeedback(null), 4500);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearCustomAudio = async () => {
    await ringtoneService.clearCustomAudio();
    setUploadFeedback({
      type: 'success',
      message: 'Custom audio removed. Reset to Celestial Chime default.',
    });
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  const handleVolumeChange = (newVol: number) => {
    ringtoneService.setVolume(newVol);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (secs?: number) => {
    if (!secs || secs === 0) return '';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-5 text-white">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-xs text-zinc-400">Make it yours.</p>
      </div>

      {/* AI NATURAL VOICE & BILINGUAL SPEECH (User Request: Speak naturally like Gemini in Tamil & English, no robot) */}
      <div className="space-y-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Natural Voice & Speech
                </p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Zero Robot • Gemini 24kHz
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                இயற்கையான குரல் (தமிழ் மற்றும் English)
              </p>
            </div>
          </div>
        </div>

        {/* Feedback message for custom voice upload */}
        {voiceUploadFeedback && (
          <div className="p-2.5 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{voiceUploadFeedback}</span>
          </div>
        )}

        {/* Language Selection Bar */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 mb-1.5 block">
            Conversation Language (உரையாடல் மொழி)
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => {
                aiVoiceService.setLanguageMode('bilingual');
                setAiVoiceSettings(aiVoiceService.getSettings());
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                aiVoiceSettings.languageMode === 'bilingual'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🌐 தமிழ் + English
            </button>
            <button
              onClick={() => {
                aiVoiceService.setLanguageMode('tamil');
                setAiVoiceSettings(aiVoiceService.getSettings());
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                aiVoiceSettings.languageMode === 'tamil'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🇮🇳 தமிழ் (Tamil)
            </button>
            <button
              onClick={() => {
                aiVoiceService.setLanguageMode('english');
                setAiVoiceSettings(aiVoiceService.getSettings());
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                aiVoiceSettings.languageMode === 'english'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Active AI Persona Showcase Card */}
        <div
          className="p-3.5 rounded-xl border transition-all"
          style={{
            backgroundColor: 'rgba(24, 24, 27, 0.7)',
            borderColor: `${aiActivePersona.color}50`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {aiActivePersona.id === 'ponniyin-regal' ? '👑' : aiActivePersona.id === 'custom-voice' ? '📁' : '✨'}
              </span>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{aiActivePersona.name}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded font-bold"
                    style={{
                      backgroundColor: `${aiActivePersona.color}20`,
                      color: aiActivePersona.color,
                      border: `1px solid ${aiActivePersona.color}40`,
                    }}
                  >
                    {aiActivePersona.badge}
                  </span>
                </p>
                <p className="text-[11px] text-zinc-400">{aiActivePersona.description}</p>
              </div>
            </div>
          </div>

          {/* Sample Spoken Dialogues */}
          <div className="space-y-1.5 my-2.5 p-2 rounded-lg bg-black/40 border border-zinc-800/60 text-[11px]">
            <p className="text-amber-200/90 font-medium italic">
              " {aiActivePersona.sampleTamilText} "
            </p>
            <p className="text-zinc-400">
              " {aiActivePersona.sampleEnglishText} "
            </p>
          </div>

          {/* Audition Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleAuditionAiVoice(aiActivePersona.id, 'TA')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audition தமிழ்</span>
            </button>
            <button
              onClick={() => handleAuditionAiVoice(aiActivePersona.id, 'EN')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-sky-500/20 active:scale-95 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audition English</span>
            </button>
          </div>
        </div>

        {/* AI Voice Persona Selection Grid */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 mb-1.5 block">
            Select Voice Persona (குரல் தேர்வு)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {AI_VOICE_PERSONAS.map((persona) => {
              const isSelected = aiActivePersona.id === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => {
                    aiVoiceService.setPersona(persona.id);
                    setAiVoiceSettings(aiVoiceService.getSettings());
                    setAiActivePersona(aiVoiceService.getActivePersona());
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: `${persona.color}20`,
                        border: `1px solid ${persona.color}40`,
                        color: persona.color,
                      }}
                    >
                      {persona.id === 'ponniyin-regal' ? '👑' : persona.id === 'custom-voice' ? '📁' : '✨'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white">{persona.name}</p>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400">{persona.tamilName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAuditionAiVoice(persona.id, 'TA');
                      }}
                      title="Audition voice"
                      className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-amber-300"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Custom Audio File for AI Voice */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-zinc-200">
                Upload Custom Audio Voice (உங்கள் சொந்த ஆடியோ)
              </span>
            </div>
            {aiVoiceSettings.hasCustomVoiceFile && (
              <button
                onClick={handleClearCustomVoice}
                className="text-[10px] text-red-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-zinc-400">
            Select any local audio file (.mp3, .wav, .m4a) from your device to use as the AI voice persona.
          </p>

          {aiVoiceSettings.hasCustomVoiceFile ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/60 border border-cyan-500/30">
              <span className="text-xs text-cyan-300 font-semibold truncate max-w-[200px]">
                🎵 {aiVoiceSettings.customVoiceFileName}
              </span>
              <button
                onClick={() => customVoiceFileInputRef.current?.click()}
                className="text-[10px] font-semibold text-zinc-300 bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700"
              >
                Change File
              </button>
            </div>
          ) : (
            <button
              onClick={() => customVoiceFileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 border border-dashed border-zinc-700 text-xs font-semibold text-zinc-300 hover:border-amber-500/50 hover:text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Choose Audio File from Device (.mp3, .wav, .m4a)</span>
            </button>
          )}

          <input
            ref={customVoiceFileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleCustomVoiceFileUpload}
          />
        </div>
      </div>


      {/* Voice Costume Studio Shortcut */}
      <div
        onClick={() => onNavigate('voice-costume')}
        className="p-4 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border border-amber-500/40 cursor-pointer flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-white">Costume Voice Changer</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold">
                NEW
              </span>
            </div>
            <p className="text-[11px] text-amber-300">
              Active: {activeCostume.name}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-amber-400" />
      </div>

      {/* RINGTONE SETTINGS WITH LOCAL FILE UPLOAD (User Request) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Music className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Incoming Call Ringtone
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium truncate max-w-[140px]">
            {ringtoneConfig.activeId === 'custom-local' && ringtoneConfig.customFileName
              ? ringtoneConfig.customFileName
              : ringtoneService.getActiveRingtoneName()}
          </span>
        </div>

        {/* Feedback Message */}
        {uploadFeedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border transition-all ${
              uploadFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {uploadFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <p className="leading-tight">{uploadFeedback.message}</p>
          </div>
        )}

        {/* Local File Ringtone Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            ringtoneConfig.activeId === 'custom-local'
              ? 'bg-gradient-to-br from-amber-950/40 via-zinc-950 to-zinc-950 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  ringtoneConfig.activeId === 'custom-local'
                    ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-zinc-900 border border-zinc-800 text-amber-400'
                }`}
              >
                <FileAudio className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-zinc-100">Local Custom Ringtone</p>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                    LOCAL FILE
                  </span>
                </div>

                {ringtoneConfig.customFileName ? (
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-amber-300 font-mono font-medium truncate">
                      {ringtoneConfig.customFileName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      {ringtoneConfig.customFileSize && (
                        <span>{formatFileSize(ringtoneConfig.customFileSize)}</span>
                      )}
                      {ringtoneConfig.customDuration && ringtoneConfig.customDuration > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(ringtoneConfig.customDuration)} duration</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Saved locally in browser</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Upload your favorite song or alarm audio (.mp3, .wav, .m4a, .ogg)
                  </p>
                )}
              </div>
            </div>

            {/* Checkmark indicator for selection */}
            {ringtoneConfig.customFileName && (
              <button
                onClick={() => handleSelectPreset('custom-local')}
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                  ringtoneConfig.activeId === 'custom-local'
                    ? 'bg-amber-500 border-amber-400 text-black shadow-md'
                    : 'border-zinc-700 bg-zinc-900 text-transparent hover:border-zinc-500'
                }`}
                title="Set as active ringtone"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Action buttons for custom file */}
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
            {ringtoneConfig.customFileName ? (
              <>
                <div className="flex items-center gap-2">
                  {/* Play / Stop Preview button */}
                  <button
                    onClick={() => handleTogglePreview('custom-local')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                      isAudioPlaying && previewingPresetId === 'custom-local'
                        ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800'
                    }`}
                  >
                    {isAudioPlaying && previewingPresetId === 'custom-local' ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>

                  {/* Set active button if not active */}
                  {ringtoneConfig.activeId !== 'custom-local' && (
                    <button
                      onClick={() => handleSelectPreset('custom-local')}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                    >
                      Use Ringtone
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Replace button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Change</span>
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={handleClearCustomAudio}
                    className="p-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 transition-colors"
                    title="Remove local file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
              >
                <Upload className="w-4 h-4 text-black" />
                <span>{isUploading ? 'Loading Audio File...' : 'Choose Audio File from Device'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Preset Ringtones Selection */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Built-in Melodies & Chimes
          </p>

          <div className="space-y-1.5">
            {RINGTONE_PRESETS.filter((p) => p.category === 'synthesized').map((preset) => {
              const isSelected = ringtoneConfig.activeId === preset.id;
              const isThisPreviewing = isAudioPlaying && previewingPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900/90 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                      : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {preset.id === 'celestial-chime' && <Sparkles className="w-4 h-4" />}
                      {preset.id === 'sacred-om-flute' && <Sun className="w-4 h-4" />}
                      {preset.id === 'sunrise-marimba' && <Flame className="w-4 h-4" />}
                      {preset.id === 'radar-pulse' && <Radio className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-semibold ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                          {preset.name}
                        </p>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Audition button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePreview(preset.id);
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        isThisPreviewing
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                      title={isThisPreviewing ? 'Stop preview' : 'Audition melody'}
                    >
                      {isThisPreviewing ? (
                        <Square className="w-2.5 h-2.5 fill-current" />
                      ) : (
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Radio/Check selector */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-amber-500 border-amber-400 text-black'
                          : 'border-zinc-700 bg-zinc-900 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringtone Volume Control */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              {ringtoneConfig.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
              <span>Ringtone Volume</span>
            </div>
            <span className="font-mono text-amber-400 font-bold">
              {Math.round(ringtoneConfig.volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={ringtoneConfig.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Full Test Ringtone Simulation Button */}
        <button
          onClick={() => {
            if (onSimulateIncomingCall) {
              onSimulateIncomingCall('Morning');
            } else {
              ringtoneService.startRingtone();
              setTimeout(() => ringtoneService.stopRingtone(), 6000);
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-900 border border-amber-500/40 text-amber-300 hover:bg-zinc-850 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.08)]"
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulate Incoming Call with This Ringtone 🔔</span>
        </button>
      </div>

      {/* Language Section matching screenshot */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Language
        </p>
        <div
          onClick={() => {
            setSelectedLanguage(
              selectedLanguage === 'Tamil + English'
                ? 'Hindi + English'
                : selectedLanguage === 'Hindi + English'
                ? 'English Only'
                : 'Tamil + English'
            );
          }}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center">
              <Languages className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100">{selectedLanguage}</p>
              <p className="text-[10px] text-zinc-400">Bilingual speech & chant mode</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </div>
      </div>

      {/* Call Settings matching screenshot */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Call Settings
        </p>
        <div className="space-y-2">
          <div
            onClick={() => onNavigate('call-schedule')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-zinc-200">Morning Call</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              <span>7:30 AM</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('call-schedule')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-zinc-200">Evening Call</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              <span>8:00 PM</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>
      </div>

      {/* App Preferences matching screenshot */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          App Preferences
        </p>
        <div className="space-y-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-200">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                darkMode ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-200">Notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                notifications ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* Device Permissions & Live Audio / Incoming Call Access */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          System Permissions & Live Access
        </p>
        <div className="space-y-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
          {/* Microphone Permission */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  micPermissionState === 'granted'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-100">Microphone Access</p>
                <p className="text-[10px] text-zinc-400">
                  {micPermissionState === 'granted' ? 'Allowed for speech & DSP' : 'Required for audio effects'}
                </p>
              </div>
            </div>
            <button
              onClick={onRequestMicPermission}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                micPermissionState === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500 text-black hover:bg-amber-400'
              }`}
            >
              {micPermissionState === 'granted' ? 'Allowed ✓' : 'Ask Permission'}
            </button>
          </div>

          {/* Incoming Call Alerts */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  callPermissionState === 'granted'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-100">Incoming Growth Calls</p>
                <p className="text-[10px] text-zinc-400">Ringtone & celestial accountability</p>
              </div>
            </div>
                       <button
              onClick={() => {
                if (callPermissionState !== 'granted' && onRequestCallPermission) {
                  onRequestCallPermission();
                } else if (onSimulateIncomingCall) {
                  onSimulateIncomingCall('Morning');
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:from-orange-400 hover:to-amber-400 active:scale-95 transition-all"
            >
              Test Call 🔔
            </button>
          </div>
        </div>
      </div>
    </div>
  }
            }
