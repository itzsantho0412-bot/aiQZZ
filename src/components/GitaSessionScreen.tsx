import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Share2,
  Sparkles,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { GitaSloka, VoiceCostumeSettings } from '../types';
import { AudioEngine } from '../services/audioEngine';

interface GitaSessionScreenProps {
  slokas: GitaSloka[];
  currentSlokaIndex: number;
  onSetSlokaIndex: (idx: number) => void;
  onBack: () => void;
  engine: AudioEngine;
  activeCostume: VoiceCostumeSettings;
}

export const GitaSessionScreen: React.FC<GitaSessionScreenProps> = ({
  slokas,
  currentSlokaIndex,
  onSetSlokaIndex,
  onBack,
  engine,
  activeCostume,
}) => {
  const [isPlayingChant, setIsPlayingChant] = useState(false);
  const currentSloka = slokas[currentSlokaIndex] || slokas[0];

  const handlePlayChant = async () => {
    if (isPlayingChant) {
      engine.stopSpeaking();
      setIsPlayingChant(false);
    } else {
      setIsPlayingChant(true);
      // Play sacred synthesizer chant frequencies + TTS chanting
      engine.playSacredChant();
      engine.speakTextWithCostume(
        `${currentSloka.transliteration}. Meaning: ${currentSloka.englishMeaning}`,
        () => {
          setIsPlayingChant(false);
        }
      );
    }
  };

  const handleNext = () => {
    if (currentSlokaIndex < slokas.length - 1) {
      onSetSlokaIndex(currentSlokaIndex + 1);
    } else {
      onSetSlokaIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentSlokaIndex > 0) {
      onSetSlokaIndex(currentSlokaIndex - 1);
    } else {
      onSetSlokaIndex(slokas.length - 1);
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

        <div className="text-center">
          <h1 className="text-sm font-bold text-white tracking-wide">
            Today's Gita Session
          </h1>
          <p className="text-[10px] text-amber-400 font-medium">
            Verse {currentSloka.chapter}.{currentSloka.verse}
          </p>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Bhagavad Gita ${currentSloka.chapter}.${currentSloka.verse}`,
                text: `${currentSloka.transliteration}\n${currentSloka.englishMeaning}`,
              }).catch(() => {});
            }
          }}
          aria-label="Share"
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Sloka Sanskrit Card matching the screenshot */}
      <div className="rounded-2xl border border-orange-500/30 bg-zinc-950 p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
          <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
            Sloka (Bhagavad Gita {currentSloka.chapter}.{currentSloka.verse})
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {currentSloka.audioDuration}
          </span>
        </div>

        {/* Devanagari Sanskrit Verses */}
        <div className="py-1">
          <p className="text-base font-serif font-bold text-amber-100 leading-relaxed whitespace-pre-line tracking-wide">
            {currentSloka.sanskrit}
          </p>
        </div>

        {/* English Transliteration */}
        <p className="text-xs text-zinc-300 italic font-medium leading-relaxed whitespace-pre-line border-t border-zinc-900 pt-2">
          {currentSloka.transliteration}
        </p>

        {/* Audio Player Button matching screenshot */}
        <div className="pt-2">
          <button
            onClick={handlePlayChant}
            className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              isPlayingChant
                ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-orange-500/40'
            }`}
          >
            {isPlayingChant ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Divine Chanting</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Listen with {activeCostume.name}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tamil Pronunciation Card matching screenshot */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
            Tamil Pronunciation
          </span>
        </div>
        <p className="text-xs font-serif text-zinc-200 leading-relaxed whitespace-pre-line">
          {currentSloka.tamilPronunciation}
        </p>
      </div>

      {/* Meaning Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
        <h3 className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
          Meaning & Translation
        </h3>
        <p className="text-xs text-zinc-200 leading-relaxed font-medium">
          {currentSloka.englishMeaning}
        </p>
        <p className="text-xs text-zinc-400 pt-1 border-t border-zinc-900 font-serif leading-relaxed">
          {currentSloka.tamilMeaning}
        </p>
      </div>

      {/* Modern Life Application */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-zinc-950 to-orange-950/20 p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Modern Life Application</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {currentSloka.modernApplication}
        </p>
        <div className="pt-2 border-t border-zinc-800/60">
          <p className="text-[11px] text-zinc-400 italic">
            <span className="font-semibold text-amber-400/90">Real Example: </span>
            {currentSloka.realLifeExample}
          </p>
        </div>
      </div>

      {/* Bottom Navigation Buttons matching screenshot */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 transition-transform"
        >
          <span>Next Sloka</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
