import React, { useState, useMemo, useRef } from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Trophy,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  X,
  Sun,
  BookOpen,
  Dumbbell,
  Moon,
  Shield,
  Zap,
  CheckCheck,
  History,
  ListFilter,
  Download,
  Trash2,
  CalendarDays,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react';
import { HabitItem, DayHeatmapData } from '../types';
import {
  formatDateKey,
  parseDateKey,
  formatFriendlyDate,
  computeHeatmapMatrix,
  calculateStreakStats,
} from '../data/habitData';

interface HabitTrackerProps {
  habits: HabitItem[];
  onToggleHabitDay: (habitId: string, dateKey: string) => void;
  onToggleAllHabitsDay?: (dateKey: string, forceDone?: boolean) => void;
  onDeleteHabit?: (habitId: string) => void;
  onAddHabit: (newHabit: Omit<HabitItem, 'id' | 'currentStreak' | 'longestStreak' | 'history'>) => void;
  onOpenWorkspace?: () => void;
}

type TrackerTab = 'daily' | 'all-days' | 'heatmap';
type HeatmapRange = 4 | 10 | 26 | 52;

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  onToggleHabitDay,
  onToggleAllHabitsDay,
  onDeleteHabit,
  onAddHabit,
  onOpenWorkspace,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  // Main UI States
  const [activeTab, setActiveTab] = useState<TrackerTab>('daily');
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [selectedCellData, setSelectedCellData] = useState<DayHeatmapData | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Heatmap configuration without limit (4, 10, 26, or 52 weeks / 1 full year)
  const [heatmapRangeWeeks, setHeatmapRangeWeeks] = useState<HeatmapRange>(10);

  // All Days Log Pagination without limit
  const [allDaysLimit, setAllDaysLimit] = useState(30);
  const [allDaysFilter, setAllDaysFilter] = useState<'all' | 'perfect' | 'missed'>('all');

  // Interactive Month Picker Modal state
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(() => new Date());

  // New habit form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitItem['category']>('mindset');
  const [newTargetDays, setNewTargetDays] = useState(7);

  // Calculate heatmap matrix for selected range
  const heatmapMatrix = useMemo(
    () => computeHeatmapMatrix(habits, heatmapRangeWeeks),
    [habits, heatmapRangeWeeks]
  );

  // Active stats computed across ALL days and habits
  const stats = useMemo(() => {
    let totalCompletedToday = 0;
    let longestOverallStreak = 0;
    let activeStreaksSum = 0;

    habits.forEach((h) => {
      if (h.history[todayKey]) totalCompletedToday++;
      if (h.longestStreak > longestOverallStreak) longestOverallStreak = h.longestStreak;
      activeStreaksSum += h.currentStreak;
    });

    const averageStreak = habits.length > 0 ? Math.round(activeStreaksSum / habits.length) : 0;
    const todayCompletionRate =
      habits.length > 0 ? Math.round((totalCompletedToday / habits.length) * 100) : 0;

    return {
      completedToday: totalCompletedToday,
      totalHabits: habits.length,
      completionRate: todayCompletionRate,
      longestStreak: longestOverallStreak,
      averageStreak,
    };
  }, [habits, todayKey]);

  // Selected date stats
  const selectedDateStats = useMemo(() => {
    let completed = 0;
    habits.forEach((h) => {
      if (h.history[selectedDateKey]) completed++;
    });
    const total = habits.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, pct };
  }, [habits, selectedDateKey]);

  // Days of the week containing the currently selected date (allows navigating ANY week in time without limit!)
  const selectedWeekDays = useMemo(() => {
    const list: { name: string; dateKey: string; isToday: boolean; isSelected: boolean; dayNum: number; fullDate: Date }[] = [];
    const selDate = parseDateKey(selectedDateKey);
    const day = selDate.getDay(); // 0 Sun, 1 Mon
    const diff = selDate.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(selDate);
    monday.setDate(diff);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const k = formatDateKey(d);
      list.push({
        name: dayNames[i],
        dateKey: k,
        isToday: k === todayKey,
        isSelected: k === selectedDateKey,
        dayNum: d.getDate(),
        fullDate: d,
      });
    }
    return list;
  }, [selectedDateKey, todayKey]);

  // Date step handlers
  const handleShiftDay = (days: number) => {
    const curr = parseDateKey(selectedDateKey);
    curr.setDate(curr.getDate() + days);
    setSelectedDateKey(formatDateKey(curr));
  };

  const handleShiftWeek = (weeks: number) => {
    const curr = parseDateKey(selectedDateKey);
    curr.setDate(curr.getDate() + weeks * 7);
    setSelectedDateKey(formatDateKey(curr));
  };

  // Friendly label for selected date relative to today
  const getSelectedDateRelativeLabel = useMemo(() => {
    const sel = parseDateKey(selectedDateKey);
    const tod = parseDateKey(todayKey);
    const diffDays = Math.round((sel.getTime() - tod.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  }, [selectedDateKey, todayKey]);

  // Filtered habits list
  const filteredHabits = useMemo(() => {
    if (filterCategory === 'all') return habits;
    return habits.filter((h) => h.category === filterCategory);
  }, [habits, filterCategory]);

  // All days list (generated backwards from today without limit based on allDaysLimit)
  const allDaysList = useMemo(() => {
    const days: {
      dateKey: string;
      friendlyDate: string;
      isToday: boolean;
      completedCount: number;
      totalHabits: number;
      pct: number;
      completedTitles: string[];
    }[] = [];

    const base = new Date(today);
    for (let i = 0; i < allDaysLimit; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const k = formatDateKey(d);

      let completed = 0;
      const completedTitles: string[] = [];

      habits.forEach((h) => {
        if (h.history[k]) {
          completed++;
          completedTitles.push(h.title);
        }
      });

      const total = habits.length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      if (allDaysFilter === 'perfect' && pct < 100) continue;
      if (allDaysFilter === 'missed' && pct === 100) continue;

      days.push({
        dateKey: k,
        friendlyDate: formatFriendlyDate(k),
        isToday: k === todayKey,
        completedCount: completed,
        totalHabits: total,
        pct,
        completedTitles,
      });
    }

    return days;
  }, [habits, allDaysLimit, allDaysFilter, today, todayKey]);

  // Month grid for full calendar picker modal
  const calendarMonthDays = useMemo(() => {
    const year = calendarViewMonth.getFullYear();
    const month = calendarViewMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayIndex = firstDayOfMonth.getDay(); // 0 Sun, 1 Mon
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon start

    const days: { dateKey: string; dayNum: number; isCurrentMonth: boolean; completedCount: number }[] = [];

    // Preceding padding
    for (let i = startOffset; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      const k = formatDateKey(d);
      let count = 0;
      habits.forEach((h) => {
        if (h.history[k]) count++;
      });
      days.push({ dateKey: k, dayNum: d.getDate(), isCurrentMonth: false, completedCount: count });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      const k = formatDateKey(d);
      let count = 0;
      habits.forEach((h) => {
        if (h.history[k]) count++;
      });
      days.push({ dateKey: k, dayNum: i, isCurrentMonth: true, completedCount: count });
    }

    // Trailing padding to make full 35 or 42 grid
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const k = formatDateKey(d);
      let count = 0;
      habits.forEach((h) => {
        if (h.history[k]) count++;
      });
      days.push({ dateKey: k, dayNum: d.getDate(), isCurrentMonth: false, completedCount: count });
    }

    return days;
  }, [calendarViewMonth, habits]);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      category: newCategory,
      targetDaysPerWeek: newTargetDays,
      icon: newCategory === 'fitness' ? 'Dumbbell' : newCategory === 'wisdom' ? 'BookOpen' : 'Sparkles',
      color:
        newCategory === 'mindset'
          ? '#f59e0b'
          : newCategory === 'wisdom'
          ? '#ea580c'
          : newCategory === 'fitness'
          ? '#fbbf24'
          : newCategory === 'business'
          ? '#38bdf8'
          : '#10b981',
    });

    setNewTitle('');
    setIsAddModalOpen(false);
  };

  // Export full habit data as JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(habits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `helioz_habits_all_days_${todayKey}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getHeatmapColorClass = (intensity: number) => {
    switch (intensity) {
      case 0:
        return 'bg-zinc-900/90 border-zinc-800/80';
      case 1:
        return 'bg-amber-950/70 border-amber-900/60 text-amber-500';
      case 2:
        return 'bg-orange-900/90 border-orange-700/70 text-orange-400';
      case 3:
        return 'bg-orange-500 border-orange-400 text-black';
      case 4:
        return 'bg-amber-400 border-amber-300 text-black shadow-[0_0_8px_rgba(245,158,11,0.7)]';
      default:
        return 'bg-zinc-900 border-zinc-800';
    }
  };

  const getCategoryIcon = (cat: HabitItem['category']) => {
    switch (cat) {
      case 'mindset':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'wisdom':
        return <BookOpen className="w-3.5 h-3.5 text-orange-400" />;
      case 'fitness':
        return <Dumbbell className="w-3.5 h-3.5 text-yellow-400" />;
      case 'business':
        return <Flame className="w-3.5 h-3.5 text-sky-400" />;
      case 'discipline':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <h1 className="text-base font-bold text-white">Growth Habit Tracker</h1>
          </div>
          <p className="text-[11px] text-amber-400/90 font-medium">
            Track All Days Without Limit • Lifelong Streaks
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Month / Calendar Modal Button */}
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            title="Browse Any Month / Date Without Limit"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 active:scale-95 transition-all flex items-center gap-1 text-[11px]"
          >
            <CalendarDays className="w-4 h-4 text-amber-400" />
          </button>

          {/* Sync / Workspace button */}
          {onOpenWorkspace && (
            <button
              onClick={onOpenWorkspace}
              title="Sync habits with Google Sheets"
              className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          )}

          {/* Export JSON Button */}
          <button
            onClick={handleExportData}
            title="Export all-days habit data (JSON backup)"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Add Habit Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Add Habit"
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-left">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>Avg Streak</span>
          </div>
          <p className="text-lg font-black text-amber-300 font-mono">
            {stats.averageStreak} <span className="text-[11px] font-sans font-normal text-zinc-400">days</span>
          </p>
          <span className="text-[9px] text-zinc-500 font-mono">Peak: {stats.longestStreak}d</span>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-left">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>Today's Goal</span>
          </div>
          <p className="text-lg font-black text-white font-mono">
            {stats.completedToday}/{stats.totalHabits}
          </p>
          <span className="text-[9px] text-emerald-400 font-medium">{stats.completionRate}% Met</span>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-left">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Lifelong</span>
          </div>
          <p className="text-lg font-black text-emerald-400 font-mono">
            {habits.reduce((acc, h) => acc + Object.keys(h.history).filter((k) => h.history[k]).length, 0)}
          </p>
          <span className="text-[9px] text-amber-300 font-medium">All Check-ins</span>
        </div>
      </div>

      {/* Top Main Tab Navigation: Daily Tracker vs All Days Log vs Heatmap */}
      <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('all-days')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'all-days'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>All Days Log</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'heatmap'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Heatmap</span>
        </button>
      </div>

      {/* HEATMAP SECTION (Expandable in Daily, or Primary in Heatmap Tab) */}
      {(activeTab === 'daily' || activeTab === 'heatmap') && (
        <div className="rounded-3xl border border-amber-500/30 bg-zinc-950 p-4 space-y-3 shadow-[0_0_25px_rgba(245,158,11,0.12)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-xs font-bold text-white tracking-wide">
                Heatmap Consistency ({heatmapRangeWeeks * 7} Days)
              </h3>
            </div>

            {/* Timeframe selector: 4w, 10w, 26w, 52w without limit */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
              {([4, 10, 26, 52] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setHeatmapRangeWeeks(w)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                    heatmapRangeWeeks === w
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {w === 52 ? '1Yr' : `${w}w`}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap Grid with horizontal scroll for unlimited history */}
          <div className="overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-1.5 min-w-max pb-1">
              {heatmapMatrix.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((cell) => {
                    const isSelected = selectedDateKey === cell.date;

                    return (
                      <button
                        key={cell.date}
                        onClick={() => {
                          setSelectedDateKey(cell.date);
                          setSelectedCellData(cell);
                        }}
                        title={`${cell.date}: ${cell.completedCount}/${cell.totalHabits} habits`}
                        className={`w-4 h-4 rounded-md border transition-all transform active:scale-90 ${getHeatmapColorClass(
                          cell.intensity
                        )} ${isSelected ? 'ring-2 ring-white scale-110 z-10' : 'hover:scale-105'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend and Cell info */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[10px] text-zinc-500">
            <span>Tap any cell to view/log habits:</span>
            <div className="flex items-center gap-1.5">
              <span>0%</span>
              <div className="w-2.5 h-2.5 rounded bg-zinc-900 border border-zinc-800" />
              <div className="w-2.5 h-2.5 rounded bg-amber-950/70 border border-amber-900/60" />
              <div className="w-2.5 h-2.5 rounded bg-orange-900/90 border border-orange-700/70" />
              <div className="w-2.5 h-2.5 rounded bg-orange-500 border border-orange-400" />
              <div className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-300" />
              <span>100%</span>
            </div>
          </div>

          {/* Selected Cell Banner */}
          {selectedCellData && (
            <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-200">{formatFriendlyDate(selectedCellData.date)}</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {selectedCellData.completedCount} of {selectedCellData.totalHabits} completed
                </p>
              </div>
              <button
                onClick={() => setSelectedDateKey(selectedCellData.date)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold"
              >
                Focus Day
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: DAILY TRACKER (Unlimited Day Navigator & Habit List) */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Unlimited Date Navigator Toolbar */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              {/* Prev Day / Next Day navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleShiftDay(-1)}
                  title="Previous Day"
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShiftDay(1)}
                  title="Next Day"
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Center Date Display & Relative Tag */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    {formatFriendlyDate(selectedDateKey)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      selectedDateKey === todayKey
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {getSelectedDateRelativeLabel}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  {selectedDateStats.completed}/{selectedDateStats.total} habits finished ({selectedDateStats.pct}%)
                </div>
              </div>

              {/* Quick Jump: Today or Calendar Picker */}
              <div className="flex items-center gap-1">
                {selectedDateKey !== todayKey && (
                  <button
                    onClick={() => setSelectedDateKey(todayKey)}
                    className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold active:scale-95"
                  >
                    Today
                  </button>
                )}
                {/* Native HTML5 Date Picker for unlimited instant jump */}
                <label
                  title="Jump to any date in history or future without limit"
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer relative active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="date"
                    value={selectedDateKey}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDateKey(e.target.value);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>

            {/* Week navigation strip for the selected date's week */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-900">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1">
                <button
                  onClick={() => handleShiftWeek(-1)}
                  className="flex items-center gap-0.5 hover:text-amber-400 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Prev Week</span>
                </button>
                <span className="font-mono text-zinc-500">
                  Week of {selectedWeekDays[0]?.dateKey}
                </span>
                <button
                  onClick={() => handleShiftWeek(1)}
                  className="flex items-center gap-0.5 hover:text-amber-400 transition-colors"
                >
                  <span>Next Week</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* 7-Day interactive selector strip */}
              <div className="grid grid-cols-7 gap-1.5">
                {selectedWeekDays.map((d) => {
                  let dayCompletedCount = 0;
                  habits.forEach((h) => {
                    if (h.history[d.dateKey]) dayCompletedCount++;
                  });
                  const isAllCompleted = habits.length > 0 && dayCompletedCount === habits.length;

                  return (
                    <button
                      key={d.dateKey}
                      onClick={() => setSelectedDateKey(d.dateKey)}
                      className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                        d.isSelected
                          ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105 z-10'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-[10px] tracking-tight">{d.name}</span>
                      <span className="text-xs font-mono font-bold mt-0.5">{d.dayNum}</span>
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          isAllCompleted
                            ? d.isSelected
                              ? 'bg-black'
                              : 'bg-amber-400'
                            : dayCompletedCount > 0
                            ? d.isSelected
                              ? 'bg-black/60'
                              : 'bg-orange-500'
                            : 'bg-zinc-800'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Bulk Action: Mark All Complete for Selected Day */}
            {onToggleAllHabitsDay && (
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900/80">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Day Actions:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleAllHabitsDay(selectedDateKey, true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold active:scale-95 transition-all"
                  >
                    ✓ Complete All
                  </button>
                  <button
                    onClick={() => onToggleAllHabitsDay(selectedDateKey, false)}
                    className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-medium active:scale-95 transition-all"
                  >
                    Reset Day
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {['all', 'mindset', 'wisdom', 'fitness', 'business', 'discipline'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap shrink-0 transition-all ${
                  filterCategory === cat
                    ? 'bg-zinc-800 text-amber-300 border border-zinc-700'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Habits List for Selected Date */}
          <div className="space-y-2.5">
            {filteredHabits.map((habit) => {
              const isDone = !!habit.history[selectedDateKey];

              return (
                <div
                  key={habit.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isDone
                      ? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/30 border-amber-500/50 shadow-sm'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div
                    onClick={() => onToggleHabitDay(habit.id, selectedDateKey)}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    {/* Status Toggle Icon */}
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-400 fill-amber-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                      )}
                    </div>

                    {/* Habit Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs font-semibold ${
                            isDone ? 'text-zinc-100 font-bold' : 'text-zinc-300'
                          }`}
                        >
                          {habit.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(habit.category)}
                          <span className="capitalize">{habit.category}</span>
                        </span>
                        <span>·</span>
                        <span className="text-amber-400 font-medium flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{habit.currentStreak}d streak</span>
                        </span>
                        <span>·</span>
                        <span className="text-zinc-500 font-mono">
                          Max: {habit.longestStreak}d
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Target Indicator */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {habit.targetDaysPerWeek}x/wk
                    </span>
                    {onDeleteHabit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete habit "${habit.title}"?`)) {
                            onDeleteHabit(habit.id);
                          }
                        }}
                        title="Delete habit"
                        className="p-1 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredHabits.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No habits found in this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL DAYS LOG WITHOUT LIMIT (Infinite Scrollable History) */}
      {activeTab === 'all-days' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Unlimited Historical Check-ins</span>
              </h3>
              <p className="text-[10px] text-zinc-400">
                Viewing past {allDaysLimit} days without limit
              </p>
            </div>

            {/* Filter pills: All / Perfect / Incomplete */}
            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
              {(['all', 'perfect', 'missed'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAllDaysFilter(mode)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] capitalize transition-all ${
                    allDaysFilter === mode
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* List of Days */}
          <div className="space-y-2">
            {allDaysList.map((day) => {
              const isSelected = day.dateKey === selectedDateKey;

              return (
                <div
                  key={day.dateKey}
                  className={`p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-500/50'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDateKey(day.dateKey);
                          setActiveTab('daily');
                        }}
                        className="text-xs font-bold text-white hover:text-amber-300 transition-colors flex items-center gap-1.5"
                      >
                        <span>{day.friendlyDate}</span>
                        {day.isToday && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Today
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        {day.completedCount}/{day.totalHabits}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                          day.pct === 100
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : day.pct >= 50
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {day.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${day.pct}%` }}
                    />
                  </div>

                  {/* Mini Habits Checkboxes for that Day */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                    <div className="flex flex-wrap gap-1.5">
                      {habits.map((h) => {
                        const done = !!h.history[day.dateKey];
                        return (
                          <button
                            key={h.id}
                            onClick={() => onToggleHabitDay(h.id, day.dateKey)}
                            title={`${h.title}: ${done ? 'Completed' : 'Missed'}`}
                            className={`px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 border transition-all ${
                              done
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-400'
                            }`}
                          >
                            <span>{done ? '✓' : '○'}</span>
                            <span className="truncate max-w-[80px]">{h.title}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Complete All for this past date */}
                    {onToggleAllHabitsDay && (
                      <button
                        onClick={() => onToggleAllHabitsDay(day.dateKey, day.pct < 100)}
                        title="Toggle all habits for this date"
                        className="text-[10px] font-semibold text-zinc-400 hover:text-amber-400 ml-2 shrink-0"
                      >
                        {day.pct === 100 ? 'Reset' : 'Check All'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Days Button (Infinite Tracking Without Limit) */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setAllDaysLimit((prev) => prev + 30)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Load 30 Earlier Days</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <p className="text-[10px] text-zinc-500 mt-1">
              Currently tracking all days seamlessly. Keep tapping to scroll back months or years.
            </p>
          </div>
        </div>
      )}

      {/* FULL MONTH / CALENDAR PICKER MODAL */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            {/* Header with Month Navigation */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {calendarViewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const m = new Date(calendarViewMonth);
                    m.setMonth(m.getMonth() - 1);
                    setCalendarViewMonth(m);
                  }}
                  title="Previous Month"
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const m = new Date(calendarViewMonth);
                    m.setMonth(m.getMonth() + 1);
                    setCalendarViewMonth(m);
                  }}
                  title="Next Month"
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-500">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarMonthDays.map((d) => {
                const isSelected = d.dateKey === selectedDateKey;
                const isToday = d.dateKey === todayKey;
                const allDone = habits.length > 0 && d.completedCount === habits.length;

                return (
                  <button
                    key={d.dateKey}
                    onClick={() => {
                      setSelectedDateKey(d.dateKey);
                      setIsCalendarModalOpen(false);
                      setActiveTab('daily');
                    }}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-sm'
                        : isToday
                        ? 'bg-zinc-900 border-amber-500/40 text-amber-300 font-bold'
                        : d.isCurrentMonth
                        ? 'bg-zinc-950 border-zinc-900 text-zinc-200 hover:border-zinc-700'
                        : 'bg-zinc-950/40 border-transparent text-zinc-600'
                    }`}
                  >
                    <span className="font-mono text-[11px]">{d.dayNum}</span>
                    <div
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        allDone
                          ? isSelected
                            ? 'bg-black'
                            : 'bg-amber-400'
                          : d.completedCount > 0
                          ? isSelected
                            ? 'bg-black/60'
                            : 'bg-orange-500'
                          : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-900 text-xs">
              <button
                onClick={() => {
                  setSelectedDateKey(todayKey);
                  setCalendarViewMonth(new Date());
                  setIsCalendarModalOpen(false);
                  setActiveTab('daily');
                }}
                className="text-amber-400 hover:underline font-semibold text-[11px]"
              >
                Jump to Today
              </button>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE HABIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Create Growth Habit</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Read 1 Sloka of Bhagavad Gita"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mindset', 'wisdom', 'fitness', 'business', 'discipline'] as const).map(
                    (cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setNewCategory(cat)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-medium capitalize border transition-all ${
                          newCategory === cat
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Target Frequency ({newTargetDays} days/week)
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  step={1}
                  value={newTargetDays}
                  onChange={(e) => setNewTargetDays(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>1 day</span>
                  <span>Daily (7 days)</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  Add Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
