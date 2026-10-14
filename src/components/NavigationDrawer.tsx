import React from 'react';
import {
  X,
  Home,
  CheckSquare,
  Sparkles,
  BookOpen,
  Calendar,
  Settings,
  Mic,
  MessageSquare,
  Layers,
  Volume2,
  Flame,
} from 'lucide-react';
import { AppScreen, VoiceCostumeSettings } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: AppScreen;
  onSelectScreen: (screen: AppScreen) => void;
  activeCostume: VoiceCostumeSettings;
  viewMode: 'mobile' | 'board';
  onToggleViewMode: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onSelectScreen,
  activeCostume,
  viewMode,
  onToggleViewMode,
}) => {
  if (!isOpen) return null;

  const links = [
    { id: 'splash' as AppScreen, label: 'Splash Screen', icon: Sparkles },
    { id: 'home' as AppScreen, label: 'Home Dashboard', icon: Home },
    { id: 'habits' as AppScreen, label: 'Habit Tracker & Heatmap', icon: Flame, highlight: true },
    { id: 'workspace' as AppScreen, label: 'Google Workspace (Sheets & Cal)', icon: BookOpen, highlight: true },
    { id: 'assistant' as AppScreen, label: 'Voice Assistant (Listening)', icon: Mic },
    { id: 'conversation' as AppScreen, label: 'Conversation Chat Mode', icon: MessageSquare },
    {
      id: 'voice-costume' as AppScreen,
      label: 'Voice Costume Studio (FX Rack)',
      icon: Volume2,
      highlight: true,
    },
    { id: 'reminders' as AppScreen, label: 'Reminders & Tasks', icon: CheckSquare },
    { id: 'gita-overview' as AppScreen, label: 'Bhagavad Gita Mode', icon: BookOpen },
    { id: 'gita-session' as AppScreen, label: "Today's Gita Session (Sloka)", icon: BookOpen },
    { id: 'call-schedule' as AppScreen, label: 'Call Schedule (Morning / Eve)', icon: Calendar },
    { id: 'settings' as AppScreen, label: 'Settings & Voice Profiles', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-start">
      <div className="w-80 max-w-[85vw] h-full bg-zinc-950 border-r border-zinc-800 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-orange-500 bg-black flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white uppercase">
                HELIOZ AI
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Costume Badge */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-zinc-900 to-amber-950/40 border border-amber-500/30">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Current Costume:</span>
              <span className="font-bold text-amber-300">{activeCostume.name}</span>
            </div>
          </div>

          {/* View Mode Switcher: Mobile Device Frame vs Design Board */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Layout Display Mode
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  if (viewMode !== 'mobile') onToggleViewMode();
                  onClose();
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <span>Mobile View</span>
              </button>
              <button
                onClick={() => {
                  if (viewMode !== 'board') onToggleViewMode();
                  onClose();
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  viewMode === 'board'
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>All 10 Screens</span>
              </button>
            </div>
          </div>

          {/* Screen Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block px-1 mb-1">
              App Screens
            </span>
            {links.map((link) => {
              const isActive = currentScreen === link.id;
              const Icon = link.icon;

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectScreen(link.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-amber-300'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.highlight && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-black">
                      FX
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-900 text-[11px] text-zinc-500">
          <p className="font-semibold text-zinc-400">HELIOZ AI Engine</p>
          <p className="text-[10px] text-zinc-600">Discipline today, freedom tomorrow.</p>
        </div>
      </div>
    </div>
  );
};
