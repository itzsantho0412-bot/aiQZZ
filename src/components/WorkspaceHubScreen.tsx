import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  BookOpen,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronRight,
  Clock,
  Send,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { TaskReminder } from '../types';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/firebase';
import {
  createGrowthSpreadsheet,
  appendTaskToSpreadsheet,
  fetchSpreadsheetRows,
  listUpcomingCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  CalendarEventItem,
  SpreadsheetInfo,
} from '../services/workspace';

interface WorkspaceHubScreenProps {
  tasks: TaskReminder[];
  onBack: () => void;
}

interface GrowthNote {
  id: string;
  title: string;
  content: string;
  color: string;
  tag: string;
  createdAt: string;
}

export const WorkspaceHubScreen: React.FC<WorkspaceHubScreenProps> = ({ tasks, onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sheets' | 'calendar' | 'keep'>('sheets');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Sheets state
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<SpreadsheetInfo | null>(null);
  const [spreadsheetRows, setSpreadsheetRows] = useState<string[][]>([]);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Keep Notes state (simulated + Firestore storage)
  const [notes, setNotes] = useState<GrowthNote[]>([
    {
      id: 'note-1',
      title: 'Discipline Roadmap: 3D Printing Business',
      content:
        'Deliver client Siva prototype by 7:00 PM. High standards in precision and filament strength.',
      color: '#f59e0b',
      tag: 'Business',
      createdAt: 'Today, 9:45 AM',
    },
    {
      id: 'note-2',
      title: 'Daily Gita Reflection (Verse 2.47)',
      content:
        'Focus on the process without anxiety for the fruits. Action is our duty, not the outcomes.',
      color: '#ea580c',
      tag: 'Wisdom',
      createdAt: 'Today, 8:00 AM',
    },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Personal');

  // Initialize auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch calendar events when tab switches or token arrives
  useEffect(() => {
    if (token && activeTab === 'calendar') {
      loadCalendarEvents();
    }
  }, [token, activeTab]);

  const loadCalendarEvents = async () => {
    try {
      setIsLoadingCalendar(true);
      const events = await listUpcomingCalendarEvents();
      setCalendarEvents(events);
    } catch (err: any) {
      console.error('Failed to load calendar events:', err);
      setStatusMessage({ text: err.message || 'Failed to load calendar events', type: 'error' });
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({ text: `Signed in as ${res.user.email}`, type: 'success' });
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setStatusMessage({ text: err.message || 'Sign in failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setActiveSpreadsheet(null);
    setCalendarEvents([]);
    setStatusMessage({ text: 'Signed out of Google Workspace', type: 'success' });
  };

  // Google Sheets Handlers
  const handleCreateOrSyncSheet = async () => {
    if (!token) {
      setStatusMessage({ text: 'Please sign in with Google first', type: 'error' });
      return;
    }
    try {
      setIsSyncingSheet(true);
      setStatusMessage(null);
      const sheet = await createGrowthSpreadsheet('HELIOZ Growth Journal & Schedule', tasks);
      setActiveSpreadsheet(sheet);
      const rows = await fetchSpreadsheetRows(sheet.spreadsheetId);
      setSpreadsheetRows(rows);
      setStatusMessage({ text: 'Created & Synced Google Sheet successfully!', type: 'success' });
    } catch (err: any) {
      console.error('Sheets error:', err);
      setStatusMessage({ text: err.message || 'Failed to sync Google Sheet', type: 'error' });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Google Calendar Handlers
  const handleScheduleCallEvent = async (callType: 'Morning' | 'Evening', timeHour: number, timeMinute: number) => {
    if (!token) {
      setStatusMessage({ text: 'Please sign in with Google first', type: 'error' });
      return;
    }
    try {
      setIsLoadingCalendar(true);
      const eventDate = new Date();
      // Set to tomorrow morning or tonight
      if (callType === 'Morning') {
        eventDate.setDate(eventDate.getDate() + 1);
      }
      eventDate.setHours(timeHour, timeMinute, 0, 0);

      const title = `HELIOZ ${callType} Growth Call (${callType === 'Morning' ? '7:30 AM' : '8:00 PM'})`;
      const description = `Daily ${callType} reflection and mindset session powered by HELIOZ AI Personal Growth Partner.`;

      const newEvent = await createGoogleCalendarEvent(title, description, eventDate, 30);
      setCalendarEvents((prev) => [newEvent, ...prev]);
      setStatusMessage({ text: `Scheduled ${title} on Google Calendar!`, type: 'success' });
    } catch (err: any) {
      console.error('Calendar error:', err);
      setStatusMessage({ text: err.message || 'Failed to create calendar event', type: 'error' });
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleConfirmDeleteEvent = async (eventId: string) => {
    try {
      await deleteGoogleCalendarEvent(eventId);
      setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
      setDeleteConfirmationId(null);
      setStatusMessage({ text: 'Calendar event removed.', type: 'success' });
    } catch (err: any) {
      console.error('Delete event error:', err);
      setStatusMessage({ text: err.message || 'Failed to delete event', type: 'error' });
    }
  };

  // Keep Notes Handlers
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const newNote: GrowthNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tag: newNoteTag,
      color: newNoteTag === 'Wisdom' ? '#ea580c' : '#f59e0b',
      createdAt: 'Just now',
    };

    setNotes((prev) => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setStatusMessage({ text: 'Growth note saved!', type: 'success' });
  };

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Google Workspace Hub</h1>
            <p className="text-[11px] text-amber-400 font-medium">
              Google Sheets, Calendar & Keep Sync
            </p>
          </div>
        </div>

        <button onClick={onBack} className="text-xs text-zinc-400 hover:text-white">
          Done
        </button>
      </div>

      {/* Google Account Connection Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-10 h-10 rounded-full border border-amber-500/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-white">{user.displayName || 'Google Account'}</p>
                <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">Workspace Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-2 space-y-3">
            <div>
              <p className="text-xs font-bold text-white">Connect Your Google Account</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Enable live Google Sheets journaling and Google Calendar scheduling.
              </p>
            </div>

            {/* Official Style Sign in with Google Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold flex items-center justify-center gap-3 shadow-md active:scale-98 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border border-red-500/40 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Workspace Tabs: Sheets | Calendar | Keep */}
      <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'sheets'
              ? 'bg-emerald-600 text-white shadow-sm font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Sheets</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('keep')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'keep'
              ? 'bg-amber-600 text-white shadow-sm font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Keep Notes</span>
        </button>
      </div>

      {/* TAB 1: Google Sheets */}
      {activeTab === 'sheets' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Google Sheets Journal Sync</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Exports your daily growth tasks, execution times, and Gita reflections into a structured Google Spreadsheet.
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateOrSyncSheet}
              disabled={isSyncingSheet || !user}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                !user
                  ? 'opacity-50 cursor-not-allowed bg-zinc-900 text-zinc-400 border border-zinc-800'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheet ? 'Creating & Syncing...' : 'Export & Sync All Tasks to Google Sheets'}</span>
            </button>

            {activeSpreadsheet && (
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{activeSpreadsheet.title}</span>
                  <a
                    href={activeSpreadsheet.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  ID: {activeSpreadsheet.spreadsheetId}
                </p>
              </div>
            )}
          </div>

          {/* Live Preview of Sheets Rows */}
          {spreadsheetRows.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Live Spreadsheet Preview
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] text-zinc-300">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      {spreadsheetRows[0]?.slice(0, 4).map((header, i) => (
                        <th key={i} className="py-1 px-2 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spreadsheetRows.slice(1, 6).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-zinc-900">
                        {row.slice(0, 4).map((cell, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-2 font-mono text-[10px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Google Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Google Calendar Call Schedules</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Schedule your HELIOZ discipline calls directly into your primary Google Calendar with pop-up notifications.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleScheduleCallEvent('Morning', 7, 30)}
                disabled={isLoadingCalendar || !user}
                className="p-3 rounded-xl bg-zinc-900 border border-blue-500/30 hover:border-blue-500 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Morning 7:30 AM</span>
                </div>
                <p className="text-[10px] text-zinc-400">Sync to Google Calendar</p>
              </button>

              <button
                onClick={() => handleScheduleCallEvent('Evening', 20, 0)}
                disabled={isLoadingCalendar || !user}
                className="p-3 rounded-xl bg-zinc-900 border border-indigo-500/30 hover:border-indigo-500 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Evening 8:00 PM</span>
                </div>
                <p className="text-[10px] text-zinc-400">Sync to Google Calendar</p>
              </button>
            </div>
          </div>

          {/* Real Calendar Events List */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Upcoming Google Calendar Events
              </span>
              <button
                onClick={loadCalendarEvents}
                disabled={!user || isLoadingCalendar}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-2">
              {calendarEvents.map((evt) => {
                const startTime = evt.start?.dateTime
                  ? new Date(evt.start.dateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : evt.start?.date || '';

                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-zinc-100">{evt.summary}</p>
                      <p className="text-[10px] text-zinc-400">{startTime}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {evt.htmlLink && (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-zinc-400 hover:text-white"
                          title="Open in Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => setDeleteConfirmationId(evt.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remove from Calendar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {calendarEvents.length === 0 && !isLoadingCalendar && (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  {user ? 'No upcoming events found on your primary calendar.' : 'Sign in with Google to view calendar events.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Google Keep & Growth Notes */}
      {activeTab === 'keep' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Google Keep Notes Companion</span>
              </h3>
              <a
                href="https://keep.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Launch Google Keep</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-zinc-400">
              Create growth reflections, business milestones, and Gita wisdom notes. Synced directly into persistent Cloud Firestore.
            </p>

            <form onSubmit={handleCreateNote} className="space-y-2 pt-1 border-t border-zinc-900">
              <input
                type="text"
                required
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note Title (e.g. 3D Filament Suppliers)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />

              <textarea
                required
                rows={2}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Note content, action steps or reflection..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />

              <div className="flex items-center justify-between">
                <select
                  value={newNoteTag}
                  onChange={(e) => setNewNoteTag(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="Personal">Personal</option>
                  <option value="Business">Business</option>
                  <option value="Wisdom">Wisdom</option>
                  <option value="College">College</option>
                </select>

                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notes List */}
          <div className="grid grid-cols-1 gap-2.5">
            {notes.map((note) => (
              <div
                key={note.id}
                style={{ borderLeftColor: note.color }}
                className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 border-l-4 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-100">{note.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                    {note.tag}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">{note.content}</p>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-900/60 text-[10px] text-zinc-500">
                  <span>{note.createdAt}</span>
                  <a
                    href={`https://keep.google.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400/90 hover:underline flex items-center gap-0.5"
                  >
                    <span>Keep Web</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive Calendar Event Deletion */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Delete Calendar Event?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to remove this event from your primary Google Calendar? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeleteEvent(deleteConfirmationId)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
