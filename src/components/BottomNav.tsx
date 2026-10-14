import React from 'react';
import { Home, CheckSquare, Sparkles, SlidersHorizontal, BookOpen } from 'lucide-react';
import { AppScreen } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setCurrentScreen }) => {
  if (currentScreen === 'splash' || currentScreen === 'assistant') {
    return null;
  }

  const navItems = [
    {
      id: 'home' as AppScreen,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'reminders' as AppScreen,
      label: 'Tasks',
      icon: CheckSquare,
    },
    {
      id: 'voice-costume' as AppScreen,
      label: 'Voice FX',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'gita-overview' as AppScreen,
      label: 'Gita',
      icon: BookOpen,
    },
    {
      id: 'settings' as AppScreen,
      label: 'More',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1 max-w-lg mx-auto">
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const isActive =
            currentScreen === item.id ||
            (item.id === 'gita-overview' && currentScreen === 'gita-session');
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center relative py-1 transition-colors ${
                isActive ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'scale-100 stroke-[1.75]'
                  } ${item.highlight && !isActive ? 'text-amber-500/80' : ''}`}
                />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium tracking-tight ${
                  isActive ? 'text-amber-400 font-semibold' : 'text-zinc-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
