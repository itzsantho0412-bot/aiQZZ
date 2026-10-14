import React, { useState } from 'react';
import {
  ArrowLeft,
  Sun,
  Moon,
  PhoneCall,
  PhoneOff,
  Check,
  Sparkles,
  Volume2,
  Music,
} from 'lucide-react';
import { CallScheduleItem, VoiceCostumeSettings } from '../types';
import { AudioEngine } from '../services/audioEngine';
import { ringtoneService } from '../services/ringtoneService';

interface CallScheduleScreenProps {
  onBack: () => void;
  onOpenSettings?: () => void;
  morningCallEnabled: boolean;
  setMorningCallEnabled: (val: boolean) => void;
  eveningCallEnabled: boolean;
  setEveningCallEnabled: (val: boolean) => void;
  engine: AudioEngine;
  activeCostume: VoiceCostumeSettings;
  onOpenWorkspace?: () => void;
  onSimulateIncomingCall?: (type: 'Morning' | 'Evening') => void;
  onRequestCallPermission?: () => void;
  callPermissionState?: 'prompt' | 'granted' | 'denied';
}

export const CallScheduleScreen: React.FC<CallScheduleScreenProps> = ({
  onBack,
  onOpenSettings,
  morningCallEnabled,
  setMorningCallEnabled,
  eveningCallEnabled,
  setEveningCallEnabled,
  engine,
  activeCostume,
  onOpenWorkspace,
  onSimulateIncomingCall,
  onRequestCallPermission,
  callPermissionState = 'prompt',
}) => {
  const [activeCallSimulation, setActiveCallSimulation] = useState<string | null>(null);

  const handleSimulateCall = (callType: 'Morning' | 'Evening') => {
    if (onSimulateIncomingCall) {
      if (callPermissionState !== 'granted' && onRequestCallPermission) {
        onRequestCallPermission();
      } else {
        onSimulateIncomingCall(callType);
      }
      return;
    }

    if (activeCallSimulation === callType) {
      engine.stopSpeaking();
      setActiveCallSimulation(null);
    } else {
      setActiveCallSimulation(callType);
      const script =
        callType === 'Morning'
          ? "Good morning Santosh! Rise with purpose today. Remember: focus completely on your 3D printing and college milestones without worrying about immediate fruits. Let's make today count!"
          : "Good evening Santosh. Excellent work today. Let's review your learnings, organize tomorrow's priorities, and end the day with serene gratitude.";

      engine.speakTextWithCostume(script, () => {
        setActiveCallSimulation(null);
      });
    }
  };

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h1 className="text-sm font-bold text-white tracking-wide uppercase">
          Call Schedule
        </h1>

        {onOpenWorkspace ? (
          <button
            onClick={onOpenWorkspace}
            className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-blue-500/20 active:scale-95 transition-all"
          >
            <span>Calendar</span>
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Active Ringtone Notification Bar */}
      <div
        onClick={onOpenSettings}
        className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all shadow-[0_0_12px_rgba(245,158,11,0.06)]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
            <Music className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              Incoming Call Ringtone
            </p>
            <p className="text-xs font-bold text-amber-300 truncate">
              {ringtoneService.getActiveRingtoneName()}
            </p>
          </div>
        </div>
        {onOpenSettings && (
          <span className="text-[10px] px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white shrink-0 font-medium">
            Change in Settings →
          </span>
        )}
      </div>

      {/* Morning Call Card matching screenshot */}
      <div className="rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-lg">
        {/* Banner with Sunrise photo */}
        <div className="relative h-44 w-full">
          <img
            src="/src/assets/images/morning_sunrise_mountains_1791894140131.jpg"
            alt="Morning Call Mountain Sunrise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Time & Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                <Sun className="w-3.5 h-3.5" />
                <span>Morning Call</span>
              </div>
              <p className="text-2xl font-extrabold text-white">7:30 AM</p>
            </div>

            <button
              onClick={() => setMorningCallEnabled(!morningCallEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                morningCallEnabled ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Content Bullets */}
        <div className="p-4 space-y-2.5">
          <ul className="space-y-1.5 text-xs text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Motivation & Positive Mindset</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Daily Goals Planning</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Personal Development Lesson</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Gita Sloka + Meaning</span>
            </li>
          </ul>

          <button
            onClick={() => handleSimulateCall('Morning')}
            className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              activeCallSimulation === 'Morning'
                ? 'bg-orange-500 text-black border-orange-400'
                : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-zinc-700'
            }`}
          >
            {activeCallSimulation === 'Morning' ? (
              <>
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Morning Call Simulation</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Simulate Morning Call ({activeCostume.name})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evening Call Card matching screenshot */}
      <div className="rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-lg">
        {/* Banner with Crescent Moon Starry night photo */}
        <div className="relative h-44 w-full">
          <img
            src="/src/assets/images/starry_evening_moon_1791894139806.jpg"
            alt="Evening Call Crescent Moon"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Time & Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-semibold">
                <Moon className="w-3.5 h-3.5" />
                <span>Evening Call</span>
              </div>
              <p className="text-2xl font-extrabold text-white">8:00 PM</p>
            </div>

            <button
              onClick={() => setEveningCallEnabled(!eveningCallEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                eveningCallEnabled ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Content Bullets */}
        <div className="p-4 space-y-2.5">
          <ul className="space-y-1.5 text-xs text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Daily Review</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Tomorrow's Plan</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Mistakes & Learnings</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Gita Sloka + Meaning</span>
            </li>
          </ul>

          <button
            onClick={() => handleSimulateCall('Evening')}
            className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              activeCallSimulation === 'Evening'
                ? 'bg-indigo-500 text-white border-indigo-400'
                : 'bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border-zinc-700'
            }`}
          >
            {activeCallSimulation === 'Evening' ? (
              <>
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Evening Call Simulation</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Simulate Evening Call ({activeCostume.name})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quote card at bottom matching screenshot */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
        <p className="text-xs text-zinc-300 italic">
          "A little progress each day leads to big results."
        </p>
        <p className="text-[10px] text-amber-400 font-semibold mt-1">— HELIOZ AI</p>
      </div>
    </div>
  );
};
