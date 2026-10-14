import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Layers,
  Sparkles,
  Wifi,
  Battery,
  Volume2,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { AppScreen, TaskReminder, VoiceCostumeId, VoiceCostumeSettings, HabitItem } from './types';
import { INITIAL_REMINDERS, GITA_SLOKAS } from './data/appData';
import { INITIAL_HABITS, formatDateKey, calculateStreakStats } from './data/habitData';
import { AudioEngine, globalAudioEngine, VOICE_COSTUMES } from './services/audioEngine';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { VoiceAssistantScreen } from './components/VoiceAssistantScreen';
import { ConversationScreen } from './components/ConversationScreen';
import { VoiceCostumeStudio } from './components/VoiceCostumeStudio';
import { RemindersScreen } from './components/RemindersScreen';
import { GitaModeScreen } from './components/GitaModeScreen';
import { GitaSessionScreen } from './components/GitaSessionScreen';
import { CallScheduleScreen } from './components/CallScheduleScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DesignBoardOverview } from './components/DesignBoardOverview';
import { NavigationDrawer } from './components/NavigationDrawer';
import { WorkspaceHubScreen } from './components/WorkspaceHubScreen';
import { HabitTracker } from './components/HabitTracker';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import { CallPermissionModal } from './components/CallPermissionModal';
import { IncomingCallScreen } from './components/IncomingCallScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [viewMode, setViewMode] = useState<'mobile' | 'board'>('mobile');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reminders state
  const [reminders, setReminders] = useState<TaskReminder[]>(INITIAL_REMINDERS);

  // Habits tracking state (persisted to localStorage)
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem('helioz_habits_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback to initial habits
    }
    return INITIAL_HABITS;
  });

  // Persist habits whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('helioz_habits_v2', JSON.stringify(habits));
    } catch (e) {
      console.warn('Failed to save habits to localStorage', e);
    }
  }, [habits]);

  const handleToggleHabitDay = (habitId: string, dateKey: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentVal = !!h.history[dateKey];
        const nextVal = !currentVal;
        const newHistory = { ...h.history, [dateKey]: nextVal };

        // Recalculate streak across ALL days without limit
        const { currentStreak, longestStreak } = calculateStreakStats(newHistory);

        return {
          ...h,
          history: newHistory,
          currentStreak,
          longestStreak: Math.max(h.longestStreak, longestStreak),
        };
      })
    );
  };

  const handleToggleAllHabitsDay = (dateKey: string, forceDone?: boolean) => {
    setHabits((prev) => {
      // If forceDone is not provided, check if all are already done; if so, uncheck all, else check all
      const allDone = prev.every((h) => !!h.history[dateKey]);
      const targetState = forceDone !== undefined ? forceDone : !allDone;

      return prev.map((h) => {
        const newHistory = { ...h.history, [dateKey]: targetState };
        const { currentStreak, longestStreak } = calculateStreakStats(newHistory);
        return {
          ...h,
          history: newHistory,
          currentStreak,
          longestStreak: Math.max(h.longestStreak, longestStreak),
        };
      });
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const handleAddHabit = (
    newHabitData: Omit<HabitItem, 'id' | 'currentStreak' | 'longestStreak' | 'history'>
  ) => {
    const today = new Date();
    const todayKey = formatDateKey(today);
    const initialHistory = { [todayKey]: true };
    const { currentStreak, longestStreak } = calculateStreakStats(initialHistory);
    const newHabit: HabitItem = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      currentStreak,
      longestStreak,
      history: initialHistory,
    };
    setHabits((prev) => [newHabit, ...prev]);
  };

  // Call schedule states
  const [morningCallEnabled, setMorningCallEnabled] = useState(true);
  const [eveningCallEnabled, setEveningCallEnabled] = useState(true);

  // Gita state
  const [currentSlokaIndex, setCurrentSlokaIndex] = useState(0);

  // Audio & Voice Costume state
  const [activeCostume, setActiveCostume] = useState<VoiceCostumeSettings>(
    VOICE_COSTUMES['gita-sage']
  );
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [initialConversationQuery, setInitialConversationQuery] = useState<string | undefined>(
    undefined
  );

  // Permissions & Incoming Call States
  const [isMicPermissionModalOpen, setIsMicPermissionModalOpen] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isCallPermissionModalOpen, setIsCallPermissionModalOpen] = useState(false);
  const [callPermissionState, setCallPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [activeIncomingCall, setActiveIncomingCall] = useState<'Morning' | 'Evening' | null>(null);

  // Check browser permissions on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((res) => {
          setMicPermissionState(res.state as any);
          res.onchange = () => setMicPermissionState(res.state as any);
        })
        .catch(() => {});

      navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then((res) => {
          setCallPermissionState(res.state as any);
          res.onchange = () => setCallPermissionState(res.state as any);
        })
        .catch(() => {});
    }
  }, []);

  // Setup audio engine listener
  useEffect(() => {
    globalAudioEngine.applyCostumeSettings(activeCostume);

    globalAudioEngine.setOnStateChange(() => {
      setIsMicActive(globalAudioEngine.isMicActive);
      setIsSpeakingTTS(globalAudioEngine.isSpeakingTTS);
    });
  }, []);

  const handleSelectCostume = (id: VoiceCostumeId) => {
    const selected = VOICE_COSTUMES[id] || VOICE_COSTUMES['natural'];
    setActiveCostume(selected);
    globalAudioEngine.applyCostumeSettings(selected);
  };

  const handleUpdateCostumeSettings = (settings: VoiceCostumeSettings) => {
    setActiveCostume(settings);
    globalAudioEngine.applyCostumeSettings(settings);
  };

  const handleToggleReminderEnabled = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleToggleReminderCompleted = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleAddReminder = (item: Omit<TaskReminder, 'id'>) => {
    const newReminder: TaskReminder = {
      ...item,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [newReminder, ...prev]);
  };

  const handleTestCostumeVoice = () => {
    globalAudioEngine.speakTextWithCostume(
      `Costume voice active: ${activeCostume.name}. Discipline today, freedom tomorrow.`
    );
  };

  const handleRequestMicPermission = () => {
    setIsMicPermissionModalOpen(true);
  };

  const handleMicPermissionGranted = () => {
    setMicPermissionState('granted');
  };

  const handleRequestCallPermission = () => {
    setIsCallPermissionModalOpen(true);
  };

  const handleCallPermissionGranted = () => {
    setCallPermissionState('granted');
  };

  const handleSimulateIncomingCall = (type: 'Morning' | 'Evening' = 'Morning') => {
    setActiveIncomingCall(type);
  };

  const handleToggleMic = async () => {
    if (isMicActive) {
      globalAudioEngine.stopMicrophone();
    } else {
      if (micPermissionState !== 'granted') {
        setIsMicPermissionModalOpen(true);
        return;
      }
      await globalAudioEngine.startMicrophone();
    }
  };

  const handleOpenConversation = (query?: string) => {
    setInitialConversationQuery(query);
    setCurrentScreen('conversation');
  };

  // Render the active mobile screen
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onEnter={() => setCurrentScreen('home')}
            onOpenCostume={() => setCurrentScreen('voice-costume')}
          />
        );

      case 'home':
        return (
          <HomeScreen
            onNavigate={(s) => setCurrentScreen(s)}
            activeCostume={activeCostume}
            morningCallEnabled={morningCallEnabled}
            setMorningCallEnabled={setMorningCallEnabled}
            eveningCallEnabled={eveningCallEnabled}
            setEveningCallEnabled={setEveningCallEnabled}
            onTestCostumeVoice={handleTestCostumeVoice}
            onRequestMicPermission={handleRequestMicPermission}
            onRequestCallPermission={handleRequestCallPermission}
            onSimulateIncomingCall={handleSimulateIncomingCall}
            micPermissionState={micPermissionState}
            callPermissionState={callPermissionState}
          />
        );

      case 'assistant':
        return (
          <VoiceAssistantScreen
            onBack={() => setCurrentScreen('home')}
            onOpenSettings={() => setCurrentScreen('settings')}
            onOpenConversation={handleOpenConversation}
            onOpenCostumeStudio={() => setCurrentScreen('voice-costume')}
            activeCostume={activeCostume}
            onSelectCostume={handleSelectCostume}
            isMicActive={isMicActive}
            onToggleMic={handleToggleMic}
            onRequestMicPermission={handleRequestMicPermission}
            micPermissionState={micPermissionState}
          />
        );

      case 'conversation':
        return (
          <ConversationScreen
            onBack={() => setCurrentScreen('home')}
            onOpenVoiceAssistant={() => setCurrentScreen('assistant')}
            activeCostume={activeCostume}
            onSpeakText={(text) => globalAudioEngine.speakTextWithCostume(text)}
            isSpeaking={isSpeakingTTS}
            onStopSpeaking={() => globalAudioEngine.stopSpeaking()}
            initialQuery={initialConversationQuery}
          />
        );

      case 'voice-costume':
        return (
          <VoiceCostumeStudio
            engine={globalAudioEngine}
            activeCostume={activeCostume}
            onSelectCostume={handleSelectCostume}
            onUpdateCostumeSettings={handleUpdateCostumeSettings}
            onRequestMicPermission={handleRequestMicPermission}
            micPermissionState={micPermissionState}
          />
        );

      case 'habits':
        return (
          <HabitTracker
            habits={habits}
            onToggleHabitDay={handleToggleHabitDay}
            onToggleAllHabitsDay={handleToggleAllHabitsDay}
            onDeleteHabit={handleDeleteHabit}
            onAddHabit={handleAddHabit}
            onOpenWorkspace={() => setCurrentScreen('workspace')}
          />
        );

      case 'workspace':
        return (
          <WorkspaceHubScreen
            tasks={reminders}
            onBack={() => setCurrentScreen('home')}
          />
        );

      case 'reminders':
        return (
          <RemindersScreen
            reminders={reminders}
            onToggleReminderEnabled={handleToggleReminderEnabled}
            onToggleReminderCompleted={handleToggleReminderCompleted}
            onAddReminder={handleAddReminder}
            onOpenWorkspace={() => setCurrentScreen('workspace')}
            onOpenHabits={() => setCurrentScreen('habits')}
          />
        );

      case 'gita-overview':
        return (
          <GitaModeScreen
            onStartSession={() => setCurrentScreen('gita-session')}
            onNavigateHome={() => setCurrentScreen('home')}
          />
        );

      case 'gita-session':
        return (
          <GitaSessionScreen
            slokas={GITA_SLOKAS}
            currentSlokaIndex={currentSlokaIndex}
            onSetSlokaIndex={setCurrentSlokaIndex}
            onBack={() => setCurrentScreen('gita-overview')}
            engine={globalAudioEngine}
            activeCostume={activeCostume}
          />
        );

      case 'call-schedule':
        return (
          <CallScheduleScreen
            onBack={() => setCurrentScreen('home')}
            onOpenSettings={() => setCurrentScreen('settings')}
            morningCallEnabled={morningCallEnabled}
            setMorningCallEnabled={setMorningCallEnabled}
            eveningCallEnabled={eveningCallEnabled}
            setEveningCallEnabled={setEveningCallEnabled}
            engine={globalAudioEngine}
            activeCostume={activeCostume}
            onOpenWorkspace={() => setCurrentScreen('workspace')}
            onSimulateIncomingCall={handleSimulateIncomingCall}
            onRequestCallPermission={handleRequestCallPermission}
            callPermissionState={callPermissionState}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            onNavigate={(s) => setCurrentScreen(s)}
            activeCostume={activeCostume}
            onSelectCostume={handleSelectCostume}
            engine={globalAudioEngine}
            onRequestMicPermission={handleRequestMicPermission}
            onRequestCallPermission={handleRequestCallPermission}
            onSimulateIncomingCall={handleSimulateIncomingCall}
            micPermissionState={micPermissionState}
            callPermissionState={callPermissionState}
          />
        );

      default:
        return (
          <HomeScreen
            onNavigate={(s) => setCurrentScreen(s)}
            activeCostume={activeCostume}
            morningCallEnabled={morningCallEnabled}
            setMorningCallEnabled={setMorningCallEnabled}
            eveningCallEnabled={eveningCallEnabled}
            setEveningCallEnabled={setEveningCallEnabled}
            onTestCostumeVoice={handleTestCostumeVoice}
            habits={habits}
            onRequestMicPermission={handleRequestMicPermission}
            onRequestCallPermission={handleRequestCallPermission}
            onSimulateIncomingCall={handleSimulateIncomingCall}
            micPermissionState={micPermissionState}
            callPermissionState={callPermissionState}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 antialiased">
      {/* Native Mobile App Container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col min-h-screen relative bg-black shadow-2xl">
        {/* App Top Navigation Bar */}
        <Header
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          onOpenMenu={() => setIsDrawerOpen(true)}
          activeCostume={activeCostume}
          isMicActive={isMicActive}
        />

        {/* Screen Content Container with scrolling */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative bg-black pb-20">
          {renderScreenContent()}
        </main>

        {/* Bottom Tab Bar */}
        <BottomNav
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
        />
      </div>

      {/* Side Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={currentScreen}
        onSelectScreen={(s) => setCurrentScreen(s)}
        activeCostume={activeCostume}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'mobile' ? 'board' : 'mobile')}
      />

      {/* Microphone Permission Modal */}
      <MicrophonePermissionModal
        isOpen={isMicPermissionModalOpen}
        onClose={() => setIsMicPermissionModalOpen(false)}
        onPermissionGranted={handleMicPermissionGranted}
      />

      {/* Incoming Call Permission Modal */}
      <CallPermissionModal
        isOpen={isCallPermissionModalOpen}
        onClose={() => setIsCallPermissionModalOpen(false)}
        onPermissionGranted={handleCallPermissionGranted}
        onSimulateIncomingCall={() => handleSimulateIncomingCall('Morning')}
      />

      {/* Real-time Incoming Call Overlay */}
      {activeIncomingCall && (
        <IncomingCallScreen
          callType={activeIncomingCall}
          activeCostume={activeCostume}
          engine={globalAudioEngine}
          onDecline={() => setActiveIncomingCall(null)}
          onEndCall={() => setActiveIncomingCall(null)}
        />
      )}
    </div>
  );
}
