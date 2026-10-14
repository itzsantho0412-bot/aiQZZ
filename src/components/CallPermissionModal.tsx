import React from 'react';
import {
  PhoneCall,
  Bell,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';

interface CallPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
  onSimulateIncomingCall: () => void;
}

export const CallPermissionModal: React.FC<CallPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  onSimulateIncomingCall,
}) => {
  if (!isOpen) return null;

  const handleEnableCalls = async () => {
    // Request notification permission if supported
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch {
        // ignore
      }
    }
    onPermissionGranted();
    onClose();
    // Trigger simulation so user sees the incoming call right away
    setTimeout(() => {
      onSimulateIncomingCall();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-950 border border-orange-500/40 rounded-3xl p-5 space-y-4 shadow-[0_0_40px_rgba(234,88,12,0.25)] relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)] mb-3">
            <PhoneCall className="w-7 h-7 text-black animate-pulse" />
          </div>

          <h2 className="text-base font-bold text-white tracking-wide">
            Enable Incoming Growth Calls
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-[260px]">
            Allow HELIOZ AI to deliver scheduled accountability calls and chime alerts directly to your device.
          </p>
        </div>

        {/* Call Schedule Perks */}
        <div className="space-y-2 py-1 border-y border-zinc-900 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-zinc-200">Morning Call (7:30 AM)</p>
              <p className="text-[10px] text-zinc-400">Mindset awakening, goals & Gita reflection</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-zinc-200">Evening Call (8:00 PM)</p>
              <p className="text-[10px] text-zinc-400">Execution audit & tomorrow's top 3 milestones</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-zinc-200">Celestial Audio Ringtone</p>
              <p className="text-[10px] text-zinc-400">Soothing chime tone that sounds like a real call</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleEnableCalls}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Enable & Test Incoming Call</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
