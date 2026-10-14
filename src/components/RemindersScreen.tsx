import React, { useState } from 'react';
import {
  Plus,
  Phone,
  Dumbbell,
  GraduationCap,
  Palette,
  Briefcase,
  CheckCircle2,
  Circle,
  X,
  Bell,
} from 'lucide-react';
import { TaskReminder } from '../types';

interface RemindersScreenProps {
  reminders: TaskReminder[];
  onToggleReminderEnabled: (id: string) => void;
  onToggleReminderCompleted: (id: string) => void;
  onAddReminder: (reminder: Omit<TaskReminder, 'id'>) => void;
  onOpenWorkspace?: () => void;
  onOpenHabits?: () => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  reminders,
  onToggleReminderEnabled,
  onToggleReminderCompleted,
  onAddReminder,
  onOpenWorkspace,
  onOpenHabits,
}) => {
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('Today • 7:00 PM');
  const [newCategory, setNewCategory] = useState<TaskReminder['category']>('calls');

  const getCategoryIcon = (cat: TaskReminder['category']) => {
    switch (cat) {
      case 'calls':
        return <Phone className="w-4 h-4 text-orange-400" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-amber-400" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-sky-400" />;
      case 'design':
        return <Palette className="w-4 h-4 text-pink-400" />;
      case 'business':
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  const filteredReminders = reminders.filter((item) => {
    if (filter === 'upcoming') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddReminder({
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      enabled: true,
      completed: false,
      isToday: newTime.toLowerCase().includes('today'),
    });
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="pb-24 px-4 pt-4 space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Reminders</h1>
          <p className="text-xs text-zinc-400">Stay on track, stay consistent.</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenHabits && (
            <button
              onClick={onOpenHabits}
              title="View Habit Streaks & Heatmap"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              <span>🔥 Habits</span>
            </button>
          )}
          {onOpenWorkspace && (
            <button
              onClick={onOpenWorkspace}
              title="Sync with Google Sheets & Calendar"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 active:scale-95 transition-all"
            >
              <span>Sheets</span>
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Add Reminder"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
        {(['upcoming', 'completed', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reminder List matching the screenshot */}
      <div className="space-y-2.5">
        {filteredReminders.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Category Icon */}
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                {getCategoryIcon(item.category)}
              </div>

              {/* Title & Time */}
              <div
                onClick={() => onToggleReminderCompleted(item.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <p
                    className={`text-xs font-semibold ${
                      item.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.completed && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">{item.time}</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => onToggleReminderEnabled(item.id)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                item.enabled ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
              aria-label={`Toggle reminder for ${item.title}`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        ))}

        {filteredReminders.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No reminders found in this category.
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h2 className="text-sm font-bold text-white">Create New Reminder</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Design 3D Prototype Models"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Scheduled Time
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. Today • 8:30 PM"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['calls', 'workout', 'education', 'design', 'business'] as const).map(
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
                  Add Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
