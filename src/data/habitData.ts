import { HabitItem, DayHeatmapData } from '../types';

// Helper to format date YYYY-MM-DD
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parse YYYY-MM-DD into Date object safely
export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Format friendly date (e.g., "Monday, Oct 13, 2026")
export function formatFriendlyDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Calculate current and longest streaks across ALL days without any artificial limit
export function calculateStreakStats(history: Record<string, boolean>): {
  currentStreak: number;
  longestStreak: number;
} {
  const completedKeys = Object.keys(history).filter((k) => history[k]);
  if (completedKeys.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // 1. Current streak calculation (counting backwards from today or yesterday)
  const today = new Date();
  const todayKey = formatDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  let currentStreak = 0;
  // If completed today, count backwards from today
  // If not completed today, but completed yesterday, count backwards from yesterday
  const anchorDate = history[todayKey] ? new Date(today) : history[yesterdayKey] ? new Date(yesterday) : null;

  if (anchorDate) {
    const cursor = new Date(anchorDate);
    while (true) {
      const key = formatDateKey(cursor);
      if (history[key]) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 2. Longest streak calculation across the entire unlimited history
  const sortedDates = completedKeys.sort();
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const curr = parseDateKey(dateStr);
    if (prevDate) {
      const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    } else {
      running = 1;
    }

    if (running > longestStreak) {
      longestStreak = running;
    }
    prevDate = curr;
  }

  return {
    currentStreak: Math.max(currentStreak, 0),
    longestStreak: Math.max(longestStreak, currentStreak),
  };
}

// Generate past history for realistic demo data across up to 120 days
function generatePastHistory(probability: number, daysCount = 90): Record<string, boolean> {
  const history: Record<string, boolean> = {};
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);

    // Give higher probability to recent days
    const factor = i < 14 ? 0.95 : i < 45 ? 0.85 : 0.78;
    history[key] = Math.random() < probability * factor;
  }
  // Ensure today is true for strong current feel
  history[formatDateKey(today)] = true;
  return history;
}

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'habit-1',
    title: 'Morning Awakening & Meditation (7:30 AM)',
    category: 'mindset',
    icon: 'Sun',
    targetDaysPerWeek: 7,
    currentStreak: 18,
    longestStreak: 45,
    color: '#f59e0b',
    history: generatePastHistory(0.92, 100),
  },
  {
    id: 'habit-2',
    title: 'Bhagavad Gita Wisdom & Reflection',
    category: 'wisdom',
    icon: 'BookOpen',
    targetDaysPerWeek: 7,
    currentStreak: 24,
    longestStreak: 52,
    color: '#ea580c',
    history: generatePastHistory(0.88, 100),
  },
  {
    id: 'habit-3',
    title: 'Physical Strength & Gym Workout',
    category: 'fitness',
    icon: 'Dumbbell',
    targetDaysPerWeek: 5,
    currentStreak: 8,
    longestStreak: 21,
    color: '#fbbf24',
    history: generatePastHistory(0.78, 100),
  },
  {
    id: 'habit-4',
    title: '3D Printing Business Deep Focus',
    category: 'business',
    icon: 'Flame',
    targetDaysPerWeek: 6,
    currentStreak: 12,
    longestStreak: 30,
    color: '#38bdf8',
    history: generatePastHistory(0.82, 100),
  },
  {
    id: 'habit-5',
    title: 'Evening Review & Gratitude (8:00 PM)',
    category: 'discipline',
    icon: 'Moon',
    targetDaysPerWeek: 7,
    currentStreak: 15,
    longestStreak: 36,
    color: '#a855f7',
    history: generatePastHistory(0.85, 100),
  },
  {
    id: 'habit-6',
    title: 'Mindful Hydration & Daily Discipline',
    category: 'discipline',
    icon: 'Sparkles',
    targetDaysPerWeek: 7,
    currentStreak: 20,
    longestStreak: 38,
    color: '#10b981',
    history: generatePastHistory(0.9, 100),
  },
];

// Helper to compute flexible heatmap matrix (supporting 4, 10, 26, or 52 weeks without limit)
export function computeHeatmapMatrix(
  habits: HabitItem[],
  numWeeks: number = 10,
  referenceDate: Date = new Date()
): DayHeatmapData[][] {
  const matrix: DayHeatmapData[][] = [];
  const ref = new Date(referenceDate);

  // Find the end date (Saturday of current or selected week)
  const currentDayOfWeek = ref.getDay(); // 0 (Sun) to 6 (Sat)
  const daysOffsetToSaturday = 6 - currentDayOfWeek;
  const lastSaturday = new Date(ref);
  lastSaturday.setDate(ref.getDate() + daysOffsetToSaturday);

  // Total days to generate = numWeeks * 7
  const totalDays = numWeeks * 7;
  const startDate = new Date(lastSaturday);
  startDate.setDate(lastSaturday.getDate() - (totalDays - 1));

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Initialize columns (weeks)
  for (let w = 0; w < numWeeks; w++) {
    const weekDays: DayHeatmapData[] = [];
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(startDate);
      const dayIndex = w * 7 + d;
      dayDate.setDate(startDate.getDate() + dayIndex);

      const dateStr = formatDateKey(dayDate);
      const isFuture = dayDate > today;

      const completedHabitTitles: string[] = [];
      let completedCount = 0;

      if (!isFuture) {
        habits.forEach((h) => {
          if (h.history[dateStr]) {
            completedCount++;
            completedHabitTitles.push(h.title);
          }
        });
      }

      const totalHabits = habits.length;
      const ratio = totalHabits > 0 ? completedCount / totalHabits : 0;

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (completedCount === 0 || isFuture) intensity = 0;
      else if (ratio <= 0.34) intensity = 1;
      else if (ratio <= 0.67) intensity = 2;
      else if (ratio < 1) intensity = 3;
      else intensity = 4;

      weekDays.push({
        date: dateStr,
        dayOfWeek: dayDate.getDay(),
        weekIndex: w,
        completedCount,
        totalHabits,
        intensity,
        completedHabitTitles,
      });
    }
    matrix.push(weekDays);
  }

  return matrix;
}
