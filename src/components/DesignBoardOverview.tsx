import React from 'react';
import {
  Sparkles,
  Smartphone,
  Eye,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AppScreen, VoiceCostumeSettings } from '../types';

interface DesignBoardOverviewProps {
  onSelectScreen: (screen: AppScreen) => void;
  activeCostume: VoiceCostumeSettings;
}

export const DesignBoardOverview: React.FC<DesignBoardOverviewProps> = ({
  onSelectScreen,
  activeCostume,
}) => {
  const screens = [
    {
      id: 'splash' as AppScreen,
      title: 'SPLASH SCREEN',
      subtitle: 'Celestial Eclipse & Mountain Silhouette Brand Identity',
      previewImage: '/src/assets/images/helioz_eclipse_mountains_1791894138495.jpg',
      tags: ['Branding', 'Solar Halo', '3 Pillars'],
    },
    {
      id: 'home' as AppScreen,
      title: 'HOME SCREEN',
      subtitle: 'Santosh Greeting, Morning & Evening Calls, Quick Actions',
      previewImage: '/src/assets/images/morning_sunrise_mountains_1791894140131.jpg',
      tags: ['Dashboard', 'Call Toggles', 'Quick Actions'],
    },
    {
      id: 'assistant' as AppScreen,
      title: 'VOICE ASSISTANT',
      subtitle: 'Real-time Listening Concentric Core & Audio Frequency Wave',
      previewImage: null,
      iconType: 'mic',
      tags: ['Speech Rec', 'Waveform', 'Real-time Orb'],
    },
    {
      id: 'conversation' as AppScreen,
      title: 'CONVERSATION MODE',
      subtitle: 'Interactive AI Chat with Schedule Checklist & Audio TTS',
      previewImage: null,
      iconType: 'chat',
      tags: ['Checklist', 'Dialogue', 'Costume TTS'],
    },
    {
      id: 'voice-costume' as AppScreen,
      title: 'VOICE COSTUME STUDIO',
      subtitle: 'Real-Time Audio Modifications, Mic Monitor & DSP Rack',
      previewImage: null,
      iconType: 'costume',
      tags: ['Real-time FX', 'Costume Presets', 'FFT Visualizer'],
      highlight: true,
    },
    {
      id: 'habits' as AppScreen,
      title: 'HABIT TRACKER & HEATMAP',
      subtitle: 'Visualizing Weekly Streaks & 10-Week Growth Heatmap Matrix',
      previewImage: null,
      iconType: 'habits',
      tags: ['Heatmap Chart', 'Streaks', 'Consistency'],
      highlight: true,
    },
    {
      id: 'workspace' as AppScreen,
      title: 'GOOGLE WORKSPACE HUB',
      subtitle: 'Google Sheets Journaling, Calendar Calls & Keep Notes',
      previewImage: null,
      iconType: 'workspace',
      tags: ['Sheets Sync', 'Calendar Events', 'Keep Notes'],
      highlight: true,
    },
    {
      id: 'reminders' as AppScreen,
      title: 'REMINDERS',
      subtitle: 'Task Scheduler with Category Badges & Active Toggles',
      previewImage: null,
      iconType: 'tasks',
      tags: ['Schedules', 'Toggles', 'Categorized'],
    },
    {
      id: 'gita-overview' as AppScreen,
      title: 'GITA MODE',
      subtitle: 'Lord Krishna & Arjuna Chariot Art, Sacred Verses & Pillars',
      previewImage: '/src/assets/images/gita_krishna_chariot_1791894139080.jpg',
      tags: ['Spiritual Art', 'Daily Sloka', 'Wisdom'],
    },
    {
      id: 'gita-session' as AppScreen,
      title: 'GITA SESSION',
      subtitle: 'Sanskrit Sloka 2.47, Tamil Phonetics, Chant Audio & Meaning',
      previewImage: null,
      iconType: 'gita',
      tags: ['Sanskrit Verses', 'Tamil Script', 'Chant Audio'],
    },
    {
      id: 'call-schedule' as AppScreen,
      title: 'CALL SCHEDULE',
      subtitle: 'Morning 7:30 AM & Evening 8:00 PM Photo Banners & Bullets',
      previewImage: '/src/assets/images/starry_evening_moon_1791894139806.jpg',
      tags: ['Sunrise & Moon', 'Simulations', 'Bullet Lessons'],
    },
    {
      id: 'settings' as AppScreen,
      title: 'SETTINGS',
      subtitle: 'Voice Profiles, Language, Call Timers & Preferences',
      previewImage: null,
      iconType: 'settings',
      tags: ['Voice Profiles', 'Language', 'Preferences'],
    },
  ];

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6 text-white">
      {/* Design Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40">
              Interactive Prototype Board
            </span>
            <span className="text-xs text-zinc-500">·</span>
            <span className="text-xs text-zinc-400">10 Functional App Screens</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            HELIOZ AI <span className="text-amber-400 font-serif">UI System</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Complete replica of the 10 screens from your uploaded design sheet, augmented with the requested real-time Costume Voice Changer & Audio DSP effects engine. Click any screen card to launch its live interactive mobile experience.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-amber-500/30 flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-zinc-400 text-[10px] block">Active Costume:</span>
              <span className="font-bold text-amber-300">{activeCostume.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {screens.map((screen, idx) => (
          <div
            key={screen.id}
            onClick={() => onSelectScreen(screen.id)}
            className={`group rounded-2xl border cursor-pointer overflow-hidden transition-all duration-200 flex flex-col justify-between ${
              screen.highlight
                ? 'bg-gradient-to-b from-amber-950/40 via-zinc-950 to-zinc-950 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.02]'
                : 'bg-zinc-950 border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-900/60 hover:scale-[1.02]'
            }`}
          >
            {/* Visual Header / Thumbnail */}
            <div className="relative h-44 w-full bg-black/90 overflow-hidden flex items-center justify-center p-3 border-b border-zinc-900">
              {screen.previewImage ? (
                <>
                  <img
                    src={screen.previewImage}
                    alt={screen.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600/30 to-orange-500/30 border border-amber-500/40 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">Interactive Screen</span>
                </div>
              )}

              {/* Screen Index badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700 text-[10px] font-mono text-zinc-300">
                0{idx + 1}
              </div>

              {screen.highlight && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-extrabold uppercase">
                  Requested Feature
                </div>
              )}
            </div>

            {/* Description Body */}
            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors">
                  {screen.title}
                </h3>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                  {screen.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {screen.tags.slice(0, 2).map((t, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Launch →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
