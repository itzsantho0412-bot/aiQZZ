import React from 'react';
import { Menu, Mic, Sparkles } from 'lucide-react';
import { AppScreen } from '../types';
import { VoiceCostumeSettings } from '../types';

interface HeaderProps {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  onOpenMenu: () => void;
  activeCostume: VoiceCostumeSettings;
  isMicActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setCurrentScreen,
  onOpenMenu,
  activeCostume,
  isMicActive,
}) => {
  if (currentScreen === 'splash') return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-orange-950/40 px-4 py-3 flex items-center justify-between">
      {/* Left: Menu trigger */}
      <button
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/60 active:scale-95 transition-all"
      >
        <Menu className="w-5 h-5 text-zinc-300" />
      </button>

      {/* Center: Brand Wordmark with glowing solar eclipse ring */}
      <button
        onClick={() => setCurrentScreen('home')}
        className="flex items-center gap-2 group focus:outline-none"
      >
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 opacity-90 blur-[3px] group-hover:blur-[5px] transition-all" />
          <div className="relative w-5 h-5 rounded-full bg-black border border-amber-400 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping opacity-75" />
          </div>
        </div>
        <span className="text-base font-bold tracking-wider text-white uppercase group-hover:text-amber-200 transition-colors">
          HELIOZ AI
        </span>
      </button>

      {/* Right: Active Costume indicator / Voice Studio quick trigger */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setCurrentScreen('voice-costume')}
          title={`Active Voice Costume: ${activeCostume.name}`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-orange-500/30 hover:border-orange-500/60 text-xs font-medium text-amber-300 hover:bg-zinc-800 transition-all active:scale-95"
        >
          {isMicActive ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="max-w-[80px] truncate text-[11px] font-semibold text-zinc-200">
            {activeCostume.name.replace('Gita ', '')}
          </span>
        </button>

        <button
          onClick={() => setCurrentScreen('workspace')}
          aria-label="Google Workspace Hub"
          title="Google Workspace Hub (Sheets & Calendar)"
          className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 transition-all"
        >
          <span className="text-[11px] font-bold">G</span>
        </button>

        <button
          onClick={() => setCurrentScreen('assistant')}
          aria-label="Open Voice Assistant"
          className="w-10 h-10 rounded-full flex items-center justify-center text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/20 transition-all"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
