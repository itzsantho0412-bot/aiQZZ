import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AppScreen } from '../types';

interface SplashScreenProps {
  onEnter: () => void;
  onOpenCostume: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, onOpenCostume }) => {
  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Background eclipse & mountain landscape */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/helioz_eclipse_mountains_1791894138495.jpg"
          alt="Helioz Solar Eclipse over Mountains"
          className="w-full h-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </div>

      {/* Top Header info */}
      <div className="relative z-10 pt-10 px-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-orange-500/30 text-amber-300 text-xs font-medium backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-Time Voice Costume AI Engine</span>
        </div>
      </div>

      {/* Center Branding */}
      <div className="relative z-10 px-6 text-center flex flex-col items-center">
        {/* Glowing Eclipse Disc */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-2xl animate-pulse-halo" />
          <div className="w-24 h-24 rounded-full border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center bg-black/80">
            <div className="w-16 h-16 rounded-full bg-zinc-950 border border-orange-500/40 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-widest text-white uppercase mb-2">
          HELIOZ AI
        </h1>
        <p className="text-xs font-semibold tracking-[0.25em] text-amber-400/90 uppercase mb-8">
          YOUR PERSONAL GROWTH PARTNER
        </p>

        {/* 3 Pillars */}
        <div className="space-y-1.5 text-zinc-300 font-medium text-sm tracking-wide">
          <p className="text-zinc-200">Better Mind</p>
          <p className="text-amber-300 font-semibold">Bigger Goals</p>
          <p className="text-zinc-200">Greater You</p>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="relative z-10 p-6 pb-12 flex flex-col gap-3">
        <button
          onClick={onEnter}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenCostume}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Explore Costume Voice Changer Effects</span>
        </button>
      </div>
    </div>
  );
};
