import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  Moon,
  Clock,
  AudioWaveform,
  Music,
} from 'lucide-react';
import { ringtoneService } from '../services/ringtoneService';
import { AudioEngine } from '../services/audioEngine';
import { VoiceCostumeSettings } from '../types';

interface IncomingCallScreenProps {
  callType: 'Morning' | 'Evening';
  activeCostume: VoiceCostumeSettings;
  engine: AudioEngine;
  onDecline: () => void;
  onEndCall: () => void;
}

export const IncomingCallScreen: React.FC<IncomingCallScreenProps> = ({
  callType,
  activeCostume,
  engine,
  onDecline,
  onEndCall,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Ringtone on mount
  useEffect(() => {
    ringtoneService.startRingtone();

    return () => {
      ringtoneService.stopRingtone();
      engine.stopSpeaking();
    };
  }, []);

  // Timer when connected
  useEffect(() => {
    let timer: any = null;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  const handleAccept = () => {
    ringtoneService.stopRingtone();
    setCallState('connected');

    // Deliver AI voice briefing using the active costume!
    const briefingText =
      callType === 'Morning'
        ? "Good morning Santosh! Welcome to your daily discipline session. Today our focus is world-class execution on your 3D printing milestones and college coursework. Remember Chapter 2, Verse 47: do your duty with full devotion, detached from anxiety over outcomes. Let's make today count!"
        : "Good evening Santosh! Excellent work today. Time for our daily review. Let's look back on what we accomplished, celebrate small wins, and lock in tomorrow's top 3 priorities. Discipline today, freedom tomorrow.";

    engine.speakTextWithCostume(briefingText);
  };

  const handleDecline = () => {
    ringtoneService.stopRingtone();
    engine.stopSpeaking();
    onDecline();
  };

  const handleEnd = () => {
    ringtoneService.stopRingtone();
    engine.stopSpeaking();
    onEndCall();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Background celestial mountain dusk aesthetic */}
      <div className="absolute inset-0 z-0">
        <img
          src={
            callType === 'Morning'
              ? '/src/assets/images/morning_sunrise_mountains_1791894140131.jpg'
              : '/src/assets/images/starry_evening_moon_1791894139806.jpg'
          }
          alt="Call Background"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/90" />
      </div>

      {/* Top Status */}
      <div className="relative z-10 pt-8 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
          {callType === 'Morning' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>
            {callState === 'ringing'
              ? `Incoming ${callType} Growth Call`
              : `${callType} Call Connected`}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-wider uppercase mt-2">
          HELIOZ AI
        </h1>

        <p className="text-xs text-zinc-300 font-medium">
          {callState === 'ringing' ? (
            <span>Scheduled Accountability • {callType === 'Morning' ? '7:30 AM' : '8:00 PM'}</span>
          ) : (
            <span className="font-mono text-amber-400 text-sm font-bold">
              {formatTimer(callDuration)}
            </span>
          )}
        </p>

        {callState === 'connected' && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-mono mt-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Voice Costume: {activeCostume.name}</span>
          </div>
        )}
      </div>

      {/* Center Calling Avatar / Visualizer */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          {/* Animated concentric ringing or sound waves */}
          <div
            className={`absolute rounded-full border border-orange-500/30 ${
              callState === 'ringing' ? 'w-56 h-56 animate-ping' : 'w-48 h-48 animate-pulse-halo'
            }`}
          />
          <div className="absolute w-44 h-44 rounded-full bg-orange-600/20 blur-xl" />

          {/* Central Solar Eclipse Ring Disc */}
          <div className="relative w-32 h-32 rounded-full border-2 border-amber-400/90 shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center bg-zinc-950">
            <div className="w-24 h-24 rounded-full bg-black border border-orange-500/50 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] flex items-center justify-center">
                {callType === 'Morning' ? (
                  <Sun className="w-5 h-5 text-black" />
                ) : (
                  <Moon className="w-5 h-5 text-black" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Audio Visualizer Bars if Connected */}
        {callState === 'connected' ? (
          <div className="mt-8 flex items-center gap-1 h-6">
            {[40, 75, 95, 60, 90, 100, 70, 45, 85, 60, 95, 50, 80, 40].map((h, i) => (
              <div
                key={i}
                style={{
                  height: `${h}%`,
                  animationDelay: `${(i % 5) * 0.12}s`,
                }}
                className="w-1 bg-gradient-to-t from-orange-600 to-amber-300 rounded-full animate-wave-bar"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-xs font-semibold text-amber-300 animate-pulse tracking-wide">
              🔔 Ringing...
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 text-[11px] font-mono shadow-md backdrop-blur-sm">
              <Music className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="truncate max-w-[200px]">
                {ringtoneService.getActiveRingtoneName()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 pb-8 px-4">
        {callState === 'ringing' ? (
          // Incoming Call Actions: Decline (Red) vs Accept (Green)
          <div className="flex items-center justify-around max-w-xs mx-auto">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDecline}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-90 transition-transform"
                aria-label="Decline Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs text-zinc-300 font-semibold">Decline</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAccept}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.7)] active:scale-90 animate-bounce transition-transform"
                aria-label="Accept Call"
              >
                <PhoneCall className="w-7 h-7" />
              </button>
              <span className="text-xs text-emerald-400 font-bold">Accept</span>
            </div>
          </div>
        ) : (
          // Connected In-Call Actions
          <div className="space-y-6 max-w-xs mx-auto">
            <div className="flex items-center justify-around">
              {/* Mute Mic */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  isMuted
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Speaker */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  isSpeakerOn
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
                title="Speaker"
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* End Call Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleEnd}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-90 transition-transform"
                aria-label="End Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs text-red-400 font-semibold">End Call</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
