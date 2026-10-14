import React from 'react';
import {
  Mic,
  Bell,
  CheckSquare,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
} from 'lucide-react';
import { AppScreen, VoiceCostumeSettings, HabitItem } from '../types';
import { formatDateKey } from '../data/habitData';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  activeCostume: VoiceCostumeSettings;
  morningCallEnabled: boolean;
  setMorningCallEnabled: (val: boolean) => void;
  eveningCallEnabled: boolean;
  setEveningCallEnabled: (val: boolean) => void;
  onTestCostumeVoice: () => void;
  habits?: HabitItem[];
  onRequestMicPermission?: () => void;
  onRequestCallPermission?: () => void;
  onSimulateIncomingCall?: (type: 'Morning' | 'Evening') => void;
  micPermissionState?: 'prompt' | 'granted' | 'denied';
  callPermissionState?: 'prompt' | 'granted' | 'denied';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  activeCostume,
  morningCallEnabled,
  setMorningCallEnabled,
  eveningCallEnabled,
  setEveningCallEnabled,
  onTestCostumeVoice,
  habits = [],
  onRequestMicPermission,
  onRequestCallPermission,
  onSimulateIncomingCall,
  micPermissionState = 'prompt',
  callPermissionState = 'prompt',
}) => {
  return (
    <div className="pb-24 px-4 pt-4 space-y-5 text-white">
      {/* Greeting Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Good Evening,</p>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Santosh <span className="text-xl">🌅</span>
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full border border-amber-500/30 bg-zinc-900 overflow-hidden flex items-center justify-center">
            <span className="text-sm font-bold text-amber-400">S</span>
          </div>
        </div>
        <p className="text-xs font-medium text-amber-400/90 tracking-wide">
          Discipline today, freedom tomorrow.
        </p>
      </div>

      {/* Next Call Scheduled Cards */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
            Next Call
          </span>
          <button
            onClick={() => onNavigate('call-schedule')}
            className="text-[11px] font-medium text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
          >
            <span>View Schedule</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Morning Call */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100">Morning Call</p>
              <p className="text-[11px] text-zinc-400">7:30 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSimulateIncomingCall ? onSimulateIncomingCall('Morning') : onNavigate('call-schedule')}
              title="Test Morning Incoming Call with Ringtone"
              className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1 transition-all active:scale-95"
            >
              <span>🔔 Ring</span>
            </button>
            <button
              onClick={() => setMorningCallEnabled(!morningCallEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                morningCallEnabled ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
              aria-label="Toggle Morning Call"
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Evening Call */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100">Evening Call</p>
              <p className="text-[11px] text-zinc-400">8:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSimulateIncomingCall ? onSimulateIncomingCall('Evening') : onNavigate('call-schedule')}
              title="Test Evening Incoming Call with Ringtone"
              className="px-2 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 flex items-center gap-1 transition-all active:scale-95"
            >
              <span>🔔 Ring</span>
            </button>
            <button
              onClick={() => setEveningCallEnabled(!eveningCallEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                eveningCallEnabled ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
              aria-label="Toggle Evening Call"
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>


      {/* Voice Costume Quick Bar (Real-Time Audio Modifications) */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">Voice Costume Active</p>
              <p className="text-[11px] text-zinc-300 font-medium">{activeCostume.name}</p>
            </div>
          </div>
          <button
            onClick={onTestCostumeVoice}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-semibold text-amber-300 transition-colors"
          >
            <Volume2 className="w-3 h-3" />
            <span>Test Voice</span>
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 line-clamp-1">{activeCostume.tagline}</p>
        <button
          onClick={() => onNavigate('voice-costume')}
          className="mt-2 w-full py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-[11px] font-semibold text-zinc-200 flex items-center justify-center gap-1 border border-zinc-700/50"
        >
          <span>Open Real-Time FX Costume Studio</span>
          <ChevronRight className="w-3 h-3 text-amber-400" />
        </button>
      </div>

      {/* Habit Streaks & Weekly Heatmap Highlight Widget */}
      {(() => {
        const todayKey = formatDateKey(new Date());
        let completedToday = 0;
        let streakSum = 0;
        habits.forEach((h) => {
          if (h.history[todayKey]) completedToday++;
          streakSum += h.currentStreak;
        });
        const avgStreak = habits.length > 0 ? Math.round(streakSum / habits.length) : 0;
        return (
          <div
            onClick={() => onNavigate('habits')}
            className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all space-y-2.5 shadow-[0_0_15px_rgba(245,158,11,0.12)] group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-black font-bold">
                  <span className="text-xs">🔥</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    Growth Habits (All Days Without Limit)
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {avgStreak}-Day Avg Streak • {completedToday}/{habits.length || 6} Today
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Mini 7-day indicator dots */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-900/80">
              <span className="text-[10px] text-zinc-500">Track All Days Without Limit</span>
              <div className="flex items-center gap-1.5">
                {[4, 4, 3, 4, 4, 3, 4].map((level, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-sm ${
                      level === 4 ? 'bg-amber-400' : 'bg-orange-500'
                    }`}
                  />
                ))}
                <span className="text-[10px] text-amber-400 font-bold ml-1">Open Tracker →</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quick Actions Grid (2x2) from screenshot */}
      <div>
        <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* Talk to HELIOZ */}
          <button
            onClick={() => onNavigate('assistant')}
            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/60 flex items-center gap-3 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100 group-hover:text-amber-300">
                Talk to
              </p>
              <p className="text-[11px] text-zinc-400 font-medium">HELIOZ</p>
            </div>
          </button>

          {/* Gita Mode */}
          <button
            onClick={() => onNavigate('gita-overview')}
            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900/60 flex items-center gap-3 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-lg font-serif">ॐ</span>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100 group-hover:text-amber-300">
                Gita Mode
              </p>
              <p className="text-[11px] text-zinc-400 font-medium">Daily Wisdom</p>
            </div>
          </button>

          {/* Reminders */}
          <button
            onClick={() => onNavigate('reminders')}
            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/60 flex items-center gap-3 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/60 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100 group-hover:text-amber-300">
                Reminders
              </p>
              <p className="text-[11px] text-zinc-400 font-medium">Never Miss</p>
            </div>
          </button>

          {/* To-Do List */}
          <button
            onClick={() => onNavigate('reminders')}
            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/60 flex items-center gap-3 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/60 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100 group-hover:text-amber-300">
                To-Do List
              </p>
              <p className="text-[11px] text-zinc-400 font-medium">Plan Your Day</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quote Banner with Mountain Thumbnail */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 p-4 bg-zinc-950 flex items-center justify-between gap-4">
        <div className="space-y-1 z-10 max-w-[200px]">
          <p className="text-xs font-bold text-zinc-100 leading-snug">
            Small steps every day lead to big changes.
          </p>
          <p className="text-[10px] text-amber-400/90 font-medium">— HELIOZ Insight</p>
        </div>
        <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-700/50">
          <img
            src="/src/assets/images/morning_sunrise_mountains_1791894140131.jpg"
            alt="Sunrise Mountain Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>
    </div>
  );
};
