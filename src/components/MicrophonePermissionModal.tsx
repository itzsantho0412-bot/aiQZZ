import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Sliders,
  Volume2,
} from 'lucide-react';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'requesting'
  >('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);

  // Check initial permission state if supported
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((res) => {
          if (res.state === 'granted') {
            setPermissionStatus('granted');
          } else if (res.state === 'denied') {
            setPermissionStatus('denied');
          } else {
            setPermissionStatus('prompt');
          }

          res.onchange = () => {
            if (res.state === 'granted') setPermissionStatus('granted');
            else if (res.state === 'denied') setPermissionStatus('denied');
          };
        })
        .catch(() => {
          // Permissions API query not fully supported for mic on some browsers
        });
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    setPermissionStatus('requesting');
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');

      // Set up a brief volume test to show live feedback
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let frames = 0;
      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        frames++;
        if (frames > 25) {
          clearInterval(interval);
          stream.getTracks().forEach((t) => t.stop());
          ctx.close();
        }
      }, 80);

      setTimeout(() => {
        onPermissionGranted();
        onClose();
      }, 1600);
    } catch (err: any) {
      console.warn('Microphone permission request failed:', err);
      setPermissionStatus('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Microphone access was denied. Please click the site settings/lock icon in your browser address bar to allow microphone access.'
        );
      } else {
        setErrorMessage(err.message || 'Unable to access microphone.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-950 border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.25)] relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center Mic Orb */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)] mb-3">
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center border border-amber-300/40">
              {permissionStatus === 'granted' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-pulse" />
              ) : permissionStatus === 'denied' ? (
                <MicOff className="w-7 h-7 text-red-400" />
              ) : (
                <Mic className="w-7 h-7 text-amber-300" />
              )}
            </div>
          </div>

          <h2 className="text-base font-bold text-white tracking-wide">
            {permissionStatus === 'granted'
              ? 'Microphone Connected!'
              : 'Enable Microphone Access'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-[260px]">
            {permissionStatus === 'granted'
              ? 'Testing audio level input...'
              : 'HELIOZ AI needs microphone access to listen to your voice and apply real-time costume audio effects.'}
          </p>
        </div>

        {/* Features enabled by mic */}
        <div className="space-y-2 py-1 border-y border-zinc-900 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Voice Assistant speech recognition</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <span>Real-time Costume Voice DSP modifications</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <span>Two-way Morning & Evening discipline calls</span>
          </div>
        </div>

        {/* Live Audio Meter if granted */}
        {permissionStatus === 'granted' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/40">
            <div className="flex justify-between text-[11px] text-zinc-300 font-semibold">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Microphone Level</span>
              </span>
              <span className="font-mono text-zinc-400">{micLevel}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                style={{ width: `${Math.max(10, micLevel)}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-75"
              />
            </div>
          </div>
        )}

        {/* Error message / unblock instructions if denied */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug text-[11px]">{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {permissionStatus !== 'granted' ? (
            <>
              <button
                onClick={handleRequestPermission}
                disabled={permissionStatus === 'requesting'}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>
                  {permissionStatus === 'requesting'
                    ? 'Requesting Browser Permission...'
                    : 'Allow Microphone Access'}
                </span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Maybe Later
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Continue to HELIOZ Voice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
