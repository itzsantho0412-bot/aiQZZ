import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Headphones,
  Volume2,
  Play,
  Square,
  Sliders,
  RotateCcw,
  Download,
  AlertCircle,
  AudioWaveform,
  Check,
  Upload,
  FileAudio,
  Clock,
  Trash2,
} from 'lucide-react';
import { VoiceCostumeId, VoiceCostumeSettings } from '../types';
import { AudioEngine, VOICE_COSTUMES } from '../services/audioEngine';

interface VoiceCostumeStudioProps {
  engine: AudioEngine;
  activeCostume: VoiceCostumeSettings;
  onSelectCostume: (id: VoiceCostumeId) => void;
  onUpdateCostumeSettings: (settings: VoiceCostumeSettings) => void;
  onRequestMicPermission?: () => void;
  micPermissionState?: 'prompt' | 'granted' | 'denied';
}

export const VoiceCostumeStudio: React.FC<VoiceCostumeStudioProps> = ({
  engine,
  activeCostume,
  onSelectCostume,
  onUpdateCostumeSettings,
  onRequestMicPermission,
  micPermissionState = 'prompt',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isMicOn, setIsMicOn] = useState<boolean>(engine.isMicActive);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(engine.isMonitoringHeadphones);
  const [isRecording, setIsRecording] = useState<boolean>(engine.isRecording);
  const [hasRecording, setHasRecording] = useState<boolean>(!!engine.getLastRecordedUrl());
  const [isPlayingRecording, setIsPlayingRecording] = useState<boolean>(false);
  const [isTestingTTS, setIsTestingTTS] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'dsp-rack'>('presets');
  const [recordDuration, setRecordDuration] = useState<5 | 10>(5);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(engine.getLastUploadedFileName());
  const [testPhrase, setTestPhrase] = useState<string>(
    'Greetings Santosh. I am HELIOZ, your personal growth partner.'
  );

  // Sync state with audio engine
  useEffect(() => {
    engine.setOnStateChange(() => {
      setIsMicOn(engine.isMicActive);
      setIsMonitoring(engine.isMonitoringHeadphones);
      setIsRecording(engine.isRecording);
      setHasRecording(!!engine.getLastRecordedUrl());
      setUploadedFileName(engine.getLastUploadedFileName());
      setIsTestingTTS(engine.isSpeakingTTS);
    });
  }, [engine]);

  // Countdown timer when recording
  useEffect(() => {
    let timer: number;
    if (isRecording) {
      setCountdownRemaining(recordDuration);
      timer = window.setInterval(() => {
        setCountdownRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    } else {
      setCountdownRemaining(0);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isRecording, recordDuration]);

  // Real-time Visualizer Animation Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const analyser = engine.getAnalyser();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background subtle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a0a0f');
      bgGrad.addColorStop(1, '#050508');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const timeData = new Uint8Array(bufferLength);
        const freqData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        // 1. Draw Frequency Spectrum Bars in the background
        const barWidth = (width / 40) * 0.8;
        let barX = 2;
        for (let i = 0; i < 40; i++) {
          const freqVal = freqData[i * 4] || 0;
          const barHeight = (freqVal / 255) * (height * 0.7);

          const barGrad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          barGrad.addColorStop(0, 'rgba(234, 88, 12, 0.15)');
          barGrad.addColorStop(1, 'rgba(245, 158, 11, 0.45)');
          ctx.fillStyle = barGrad;
          ctx.fillRect(barX, height - barHeight, barWidth, barHeight);
          barX += barWidth + 2;
        }

        // 2. Draw Glowing Oscilloscope Waveform in foreground
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 12;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Idle gentle waveform when analyser isn't populated yet
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.beginPath();
        const t = Date.now() * 0.003;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.04 + t) * 10 * Math.sin(t * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine]);

  // Handle toggles
  const handleToggleMic = async () => {
    if (isMicOn) {
      engine.stopMicrophone();
    } else {
      if (micPermissionState !== 'granted' && onRequestMicPermission) {
        onRequestMicPermission();
        return;
      }
      await engine.startMicrophone();
    }
  };

  const handleToggleMonitor = () => {
    engine.setMonitoring(!isMonitoring);
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      engine.stopRecording();
    } else {
      if (micPermissionState !== 'granted' && onRequestMicPermission) {
        onRequestMicPermission();
        return;
      }
      await engine.startRecording(recordDuration);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await engine.loadAudioFile(file);
      setUploadedFileName(file.name);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleClearAudio = () => {
    engine.clearRecordedAudio();
    setUploadedFileName(null);
  };

  const handlePlayRecording = async () => {
    if (!hasRecording) return;
    try {
      setIsPlayingRecording(true);
      await engine.playMorphedRecording();
    } catch (e) {
      console.warn('Playback error:', e);
    } finally {
      setIsPlayingRecording(false);
    }
  };

  const handleTestCostumeTTS = () => {
    if (isTestingTTS) {
      engine.stopSpeaking();
    } else {
      engine.speakTextWithCostume(testPhrase, () => {
        setIsTestingTTS(false);
      });
    }
  };

  // DSP Parameter update helpers
  const updateParam = (key: keyof VoiceCostumeSettings, value: any) => {
    const updated = {
      ...activeCostume,
      [key]: value,
    };
    onUpdateCostumeSettings(updated);
    engine.applyCostumeSettings(updated);
  };

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 text-white">
      {/* Hidden File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Studio Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Voice Costume Studio
              </h1>
              <p className="text-[11px] text-amber-400 font-medium">
                Real-Time DSP Audio Modification & Effects
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
            Web Audio FX
          </span>
        </div>
      </div>

      {/* Real-time Oscilloscope & Frequency Visualizer */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-zinc-950 p-2 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        <div className="flex items-center justify-between px-2 py-1 mb-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
            <AudioWaveform className="w-3.5 h-3.5 text-amber-400" />
            <span>Real-Time Audio Waveform & FFT</span>
          </div>
          <div className="flex items-center gap-2">
            {isMicOn && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mic Live
              </span>
            )}
            <span className="text-[10px] text-zinc-500 font-mono">44.1 kHz</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="w-full h-24 rounded-xl bg-zinc-950 border border-zinc-900"
        />

        {/* Headphone Safety Tip */}
        <div className="mt-2 flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-400">
          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Use headphones when enabling Live Monitor to avoid audio feedback loops.</span>
        </div>
      </div>

      {/* Live Mic & Audio Testing Controls */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Toggle Live Mic */}
        <button
          onClick={handleToggleMic}
          className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
            isMicOn
              ? 'bg-orange-950/60 border-orange-500 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isMicOn ? 'bg-orange-500 text-black' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight">Live Mic</p>
            <p className="text-[10px] text-zinc-400">{isMicOn ? 'DSP Routing On' : 'Tap to Start'}</p>
          </div>
        </button>

        {/* Toggle Headphone Monitor */}
        <button
          onClick={handleToggleMonitor}
          disabled={!isMicOn}
          className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
            !isMicOn
              ? 'opacity-50 cursor-not-allowed bg-zinc-950 border-zinc-800 text-zinc-500'
              : isMonitoring
              ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isMonitoring ? 'bg-amber-400 text-black' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <Headphones className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight">Hear Yourself</p>
            <p className="text-[10px] text-zinc-400">
              {isMonitoring ? 'Monitor Live' : 'Muted (Safe)'}
            </p>
          </div>
        </button>
      </div>

      {/* Record, File Upload & Morphed Playback Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-3.5 space-y-3.5 shadow-[0_0_20px_rgba(245,158,11,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-100">
              Quick Audition & Voice Transformer
            </span>
          </div>

          {/* Duration Selector: 5s to 10s */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <Clock className="w-3 h-3 text-zinc-400 ml-1.5" />
            <button
              type="button"
              onClick={() => setRecordDuration(5)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                recordDuration === 5
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              5s
            </button>
            <button
              type="button"
              onClick={() => setRecordDuration(10)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                recordDuration === 10
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              10s
            </button>
          </div>
        </div>

        {/* Audio Clip Info Bar if clip ready */}
        {hasRecording && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px]">
            <div className="flex items-center gap-2 truncate text-amber-200">
              {uploadedFileName ? (
                <FileAudio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="truncate font-medium">
                {uploadedFileName ? `File: ${uploadedFileName}` : `Recorded Mic Clip (${recordDuration}s)`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearAudio}
              className="text-zinc-400 hover:text-red-400 p-1 transition-colors"
              title="Clear audio clip"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Buttons: Record & Upload File */}
        <div className="grid grid-cols-2 gap-2">
          {/* Record Button */}
          <button
            onClick={handleToggleRecord}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-700/60'
            }`}
          >
            {isRecording ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="truncate">
              {isRecording
                ? `Recording (${countdownRemaining}s)`
                : `Record Voice (${recordDuration}s)`}
            </span>
          </button>

          {/* File Upload Option */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-amber-300 border border-amber-500/40 hover:border-amber-500/70 transition-all active:scale-95"
            title="Upload audio file (MP3, WAV, M4A, etc.) to transform"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Upload File</span>
          </button>
        </div>

        {/* Play Morphed Recording */}
        <button
          onClick={handlePlayRecording}
          disabled={!hasRecording || isPlayingRecording}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            !hasRecording
              ? 'opacity-40 cursor-not-allowed bg-zinc-900 text-zinc-500 border border-zinc-800'
              : isPlayingRecording
              ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-98'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="truncate">
            {isPlayingRecording
              ? `Playing with ${activeCostume.name}...`
              : hasRecording
              ? `Play Transformed Audio (${activeCostume.name})`
              : 'Record or Upload Audio to Transform'}
          </span>
        </button>

        {/* Test with Synthetic Speech */}
        <div className="pt-2 border-t border-zinc-900 flex items-center gap-2">
          <input
            type="text"
            value={testPhrase}
            onChange={(e) => setTestPhrase(e.target.value)}
            placeholder="Type phrase to test costume voice..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/40"
          />
          <button
            onClick={handleTestCostumeTTS}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors ${
              isTestingTTS
                ? 'bg-orange-500 text-black'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isTestingTTS ? 'Speaking...' : 'Test Voice'}</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs: Presets vs DSP Rack */}
      <div className="flex items-center gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'presets'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Costume Voice Presets
        </button>
        <button
          onClick={() => setActiveTab('dsp-rack')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'dsp-rack'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>DSP Equalizer & FX Rack</span>
        </button>
      </div>

      {/* Tab 1: Costume Voice Presets Grid */}
      {activeTab === 'presets' && (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Choose Voice Persona
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {Object.values(VOICE_COSTUMES).map((costume) => {
              const isSelected = activeCostume.id === costume.id;

              return (
                <div
                  key={costume.id}
                  onClick={() => onSelectCostume(costume.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-zinc-950/90 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: `${costume.color}25`, borderColor: costume.color }}
                        className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                      >
                        <Sparkles className="w-5 h-5" style={{ color: costume.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white">{costume.name}</h3>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500 text-black">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-amber-300/90 font-medium">
                          {costume.tagline}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCostume(costume.id);
                        engine.speakTextWithCostume(
                          `Sample preview of ${costume.name}. ${costume.tagline}`
                        );
                      }}
                      title="Audition preset"
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-amber-400"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] text-zinc-400 leading-relaxed">
                    {costume.description}
                  </p>

                  {/* Audio DSP specs badges */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] text-zinc-400 font-mono">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      Pitch: {costume.pitchSemitones > 0 ? `+${costume.pitchSemitones}` : costume.pitchSemitones} st
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      Filter: {costume.filterType} @ {costume.filterFrequency}Hz
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      Reverb: {Math.round(costume.reverbWet * 100)}%
                    </span>
                    {costume.delayTime > 0 && (
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        Echo: {Math.round(costume.delayTime * 1000)}ms
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Real-Time DSP Audio FX Rack */}
      {activeTab === 'dsp-rack' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-xs font-bold text-white">Live Audio DSP Rack</h3>
              <p className="text-[10px] text-zinc-400">Modifies active sound pipeline in real time</p>
            </div>
            <button
              onClick={() => {
                const defaults = VOICE_COSTUMES[activeCostume.id] || VOICE_COSTUMES['natural'];
                onUpdateCostumeSettings(defaults);
                engine.applyCostumeSettings(defaults);
              }}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. Pitch Shift / Semitones */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Pitch Transposition</span>
              <span className="font-mono text-amber-400 font-bold">
                {activeCostume.pitchSemitones > 0
                  ? `+${activeCostume.pitchSemitones}`
                  : activeCostume.pitchSemitones}{' '}
                semitones
              </span>
            </div>
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={activeCostume.pitchSemitones}
              onChange={(e) => updateParam('pitchSemitones', parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>Deep Titan (-12)</span>
              <span>Natural (0)</span>
              <span>High Helium (+12)</span>
            </div>
          </div>

          {/* 2. Playback Rate / Pace */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Pacing & Formant Speed</span>
              <span className="font-mono text-amber-400 font-bold">
                {activeCostume.playbackRate.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.05}
              value={activeCostume.playbackRate}
              onChange={(e) => updateParam('playbackRate', parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* 3. Tone Filter Cutoff Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Filter Cutoff ({activeCostume.filterType})</span>
              <span className="font-mono text-amber-400 font-bold">
                {activeCostume.filterFrequency} Hz
              </span>
            </div>
            <input
              type="range"
              min={200}
              max={8000}
              step={100}
              value={activeCostume.filterFrequency}
              onChange={(e) => updateParam('filterFrequency', parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* 4. Filter Resonance Q */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Filter Resonance (Q)</span>
              <span className="font-mono text-amber-400 font-bold">
                {activeCostume.filterQ.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={8.0}
              step={0.5}
              value={activeCostume.filterQ}
              onChange={(e) => updateParam('filterQ', parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* 5. Analog Tube Saturation / Distortion */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Harmonic Warm Drive / Crunch</span>
              <span className="font-mono text-amber-400 font-bold">
                {activeCostume.distortionDrive}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={45}
              step={1}
              value={activeCostume.distortionDrive}
              onChange={(e) => updateParam('distortionDrive', parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>Clean (0)</span>
              <span>Warm Tube (15)</span>
              <span>Overdrive (45)</span>
            </div>
          </div>

          {/* 6. Spatial Reverb Depth */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Spatial Reverb Wetness</span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round(activeCostume.reverbWet * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.0}
              step={0.05}
              value={activeCostume.reverbWet}
              onChange={(e) => updateParam('reverbWet', parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* 7. Echo / Stereo Delay */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-zinc-300">Stereo Echo Delay</span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round(activeCostume.delayTime * 1000)} ms
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={0.6}
              step={0.02}
              value={activeCostume.delayTime}
              onChange={(e) => updateParam('delayTime', parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
