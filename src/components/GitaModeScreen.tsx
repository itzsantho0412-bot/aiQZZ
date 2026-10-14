import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Languages,
  CheckCircle,
} from 'lucide-react';
import { AppScreen } from '../types';

interface GitaModeScreenProps {
  onStartSession: () => void;
  onNavigateHome: () => void;
}

export const GitaModeScreen: React.FC<GitaModeScreenProps> = ({
  onStartSession,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features'>('overview');

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 text-white">
      {/* Header Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-950/80 border border-orange-500/50 flex items-center justify-center text-orange-400 font-serif text-lg">
            ॐ
          </div>
          <div>
            <h1 className="text-base font-bold text-white">HELIOZ AI</h1>
            <p className="text-[11px] text-amber-400 font-semibold tracking-wide">
              Bhagavad Gita - Mode
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateHome}
          className="text-xs font-medium text-zinc-400 hover:text-white"
        >
          Normal Mode →
        </button>
      </div>

      {/* Hero Card with Divine Lord Krishna & Arjuna Painting */}
      <div className="relative rounded-3xl overflow-hidden border border-orange-500/30 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
        <div className="relative h-72 w-full">
          <img
            src="/src/assets/images/gita_krishna_chariot_1791894139080.jpg"
            alt="Lord Krishna and Arjuna on Chariot"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

          {/* Inspirational Verse Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-sm font-bold text-amber-200 tracking-wide font-serif leading-snug drop-shadow-md">
              "Do your duty, without attachment to the fruits."
            </p>
            <p className="text-[11px] text-amber-400/90 font-medium mt-1">
              — Bhagavad Gita (2.47)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Session Pillars (4 tags matching the image) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
            १
          </div>
          <span className="font-semibold text-zinc-200">Today's Sloka</span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            २
          </div>
          <span className="font-semibold text-zinc-200">Deep Meaning</span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
            ३
          </div>
          <span className="font-semibold text-zinc-200">Life Application</span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
            ४
          </div>
          <span className="font-semibold text-zinc-200">Real Life Example</span>
        </div>
      </div>

      {/* Mode Capabilities comparison card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
        <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
          Spiritual & Mental Conditioning
        </h3>
        <ul className="space-y-2 text-xs text-zinc-300">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Chant with authentic Sanskrit intonation & temple reverberation</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Tamil & English phonetic transliteration & modern clarity</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Daily stress dissipation and unbreakable focus for your career</span>
          </li>
        </ul>
      </div>

      {/* Start Gita Session CTA matching screenshot */}
      <button
        onClick={onStartSession}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <span>Start Gita Session</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
