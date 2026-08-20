import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Menu,
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  Plus,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HabitList from './components/HabitList';
import HabitModal from './components/HabitModal';
import HabitDetailModal from './components/HabitDetailModal';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import ResetModal from './components/ResetModal';
import Toast from './components/Toast';

import {
  loadHabits,
  saveHabits,
  loadLogs,
  saveLogs,
  loadTheme,
  saveTheme,
  loadSoundSetting,
  saveSoundSetting,
  generateSeedData,
} from './utils/storage';

import { soundEngine } from './utils/audio';
import {
  calculateDashboardSummary,
  calculateCurrentStreak,
  formatDate,
} from './utils/streakEngine';

export default function App() {
  const [habits, setHabits] = useState(() => loadHabits());
  const [logs, setLogs] = useState(() => loadLogs());
  const [theme, setTheme] = useState(() => loadTheme());
  const [soundEnabled, setSoundEnabled] = useState(() => loadSoundSetting());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'habits' | 'analytics' | 'settings'

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [detailHabit, setDetailHabit] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Apply Theme Attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // Sync Audio Setting
  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
    saveSoundSetting(soundEnabled);
  }, [soundEnabled]);

  // Sync Storage
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  // Toast Helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Theme Toggle
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Sound Toggle
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // Stats computation
  const dashboardStats = useMemo(() => {
    return calculateDashboardSummary(habits, logs);
  }, [habits, logs]);

  // Confetti Blast Helper
  const triggerConfetti = useCallback((count = 45) => {
    try {
      confetti({
        particleCount: count,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Habit CRUD Actions
  const handleSaveHabit = useCallback((habitData) => {
    if (editingHabit) {
      setHabits(prev =>
        prev.map(h => (h.id === editingHabit.id ? { ...h, ...habitData } : h))
      );
      addToast(`Updated habit: "${habitData.name}"`, 'success');
      setEditingHabit(null);
    } else {
      const newHabit = {
        ...habitData,
        id: `habit-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setHabits(prev => [newHabit, ...prev]);
      addToast(`Created new habit: "${habitData.name}"`, 'success');
      triggerConfetti(30);
    }
    setIsAddModalOpen(false);
  }, [editingHabit, addToast, triggerConfetti]);

  const handleDeleteHabit = useCallback((habitId, habitName) => {
    if (window.confirm(`Are you sure you want to delete "${habitName}" and all its history?`)) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
      setLogs(prev => prev.filter(l => l.habitId !== habitId));
      if (detailHabit?.id === habitId) setDetailHabit(null);
      addToast(`Deleted habit "${habitName}"`, 'info');
    }
  }, [detailHabit, addToast]);

  const handleToggleHabitStatus = useCallback((habitId) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          const newStatus = h.status === 'active' ? 'inactive' : 'active';
          addToast(`Habit ${newStatus === 'active' ? 'activated' : 'archived'}`, 'info');
          return { ...h, status: newStatus };
        }
        return h;
      })
    );
  }, [addToast]);

  // Completion Logging Logic
  const handleToggleCompletion = useCallback((habitId, dateStr = formatDate(new Date())) => {
    const isToday = dateStr === formatDate(new Date());
    const existingLogIndex = logs.findIndex(
      l => l.habitId === habitId && l.completionDate === dateStr && l.status === 'completed'
    );

    if (existingLogIndex >= 0) {
      // Undo completion
      setLogs(prev => prev.filter((_, idx) => idx !== existingLogIndex));
      soundEngine.playUndo();
    } else {
      // Mark completed
      const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        habitId,
        completionDate: dateStr,
        status: 'completed',
      };
      const nextLogs = [...logs, newLog];
      setLogs(nextLogs);

      const targetHabit = habits.find(h => h.id === habitId);
      const newStreak = targetHabit ? calculateCurrentStreak(targetHabit, nextLogs) : 0;

      // Celebrate!
      soundEngine.playComplete();
      triggerConfetti(35);

      // Check if all done today
      if (isToday) {
        const activeHabits = habits.filter(h => h.status === 'active');
        const completedCount = activeHabits.filter(h =>
          nextLogs.some(l => l.habitId === h.id && l.completionDate === dateStr && l.status === 'completed')
        ).length;

        if (completedCount === activeHabits.length && activeHabits.length > 0) {
          soundEngine.playFanfare();
          triggerConfetti(100);
          addToast('🎉 All habits completed for today! Amazing work!', 'success');
        } else if (newStreak > 0 && newStreak % 7 === 0) {
          soundEngine.playFanfare();
          triggerConfetti(75);
          addToast(`🔥 Awesome! You hit a ${newStreak}-day milestone streak on "${targetHabit?.name}"!`, 'success');
        }
      }
    }
  }, [habits, logs, triggerConfetti, addToast]);

  // Database & Reset Management
  const handleImportData = useCallback((importedHabits, importedLogs) => {
    setHabits(importedHabits);
    setLogs(importedLogs);
  }, []);

  const handleResetToday = useCallback(() => {
    const todayStr = formatDate(new Date());
    const countBefore = logs.filter(l => l.completionDate === todayStr && l.status === 'completed').length;
    if (countBefore === 0) {
      addToast("No habits were marked complete today to reset.", 'info');
      return;
    }
    setLogs(prev => prev.filter(l => !(l.completionDate === todayStr && l.status === 'completed')));
    soundEngine.playUndo();
    addToast(`Reset ${countBefore} completed habit${countBefore > 1 ? 's' : ''} for today.`, 'info');
  }, [logs, addToast]);

  const handleResetAllHistory = useCallback(() => {
    setLogs([]);
    soundEngine.playUndo();
    addToast('All streak & completion history has been reset to 0.', 'info');
  }, [addToast]);

  const handleResetHabitHistory = useCallback((habitId, habitName) => {
    setLogs(prev => prev.filter(l => l.habitId !== habitId));
    soundEngine.playUndo();
    addToast(`Reset history for "${habitName}".`, 'info');
  }, [addToast]);

  const handleResetData = useCallback(() => {
    const seed = generateSeedData();
    setHabits(seed.habits);
    setLogs(seed.logs);
    soundEngine.playFanfare();
    triggerConfetti(50);
    addToast('Database reloaded with sample demo habits & 35-day streaks!', 'success');
  }, [triggerConfetti, addToast]);

  const handleClearAllData = useCallback(() => {
    setHabits([]);
    setLogs([]);
    soundEngine.playUndo();
    addToast('All habits and history cleared.', 'info');
  }, [addToast]);

  return (
    <div className="app-container">
      {/* Ambient background glows */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        habits={habits}
        logs={logs}
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        onOpenAddModal={() => {
          setEditingHabit(null);
          setIsAddModalOpen(true);
        }}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        dashboardStats={dashboardStats}
      />

      {/* Main Content Layout */}
      <div className="main-wrapper">
        {/* Mobile Sticky Top Header */}
        <header className="mobile-top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="icon-btn"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Navigation Drawer"
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              <span>HabitPulse</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="icon-btn"
              onClick={() => setIsResetModalOpen(true)}
              title="Reset Data & Progress"
              aria-label="Open Reset Options"
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="icon-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="btn-primary"
              style={{ padding: '6px 12px', minHeight: '36px', fontSize: '0.82rem', gap: '4px' }}
              onClick={() => {
                setEditingHabit(null);
                setIsAddModalOpen(true);
              }}
              aria-label="Add Habit"
            >
              <Plus size={16} />
              <span>Habit</span>
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        <main className="content-container">
          {activeTab === 'dashboard' && (
            <Dashboard
              habits={habits}
              logs={logs}
              onToggleCompletion={handleToggleCompletion}
              onOpenAddModal={() => {
                setEditingHabit(null);
                setIsAddModalOpen(true);
              }}
              onOpenResetModal={() => setIsResetModalOpen(true)}
              onResetToday={handleResetToday}
              onOpenDetailModal={habit => setDetailHabit(habit)}
              onNavigateToAnalytics={() => setActiveTab('analytics')}
              stats={dashboardStats}
            />
          )}

          {activeTab === 'habits' && (
            <HabitList
              habits={habits}
              logs={logs}
              onOpenAddModal={() => {
                setEditingHabit(null);
                setIsAddModalOpen(true);
              }}
              onOpenEditModal={habit => {
                setEditingHabit(habit);
                setIsAddModalOpen(true);
              }}
              onOpenDetailModal={habit => setDetailHabit(habit)}
              onDeleteHabit={handleDeleteHabit}
              onToggleHabitStatus={handleToggleHabitStatus}
              onToggleCompletion={handleToggleCompletion}
              onOpenResetModal={() => setIsResetModalOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView habits={habits} logs={logs} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              habits={habits}
              logs={logs}
              theme={theme}
              toggleTheme={toggleTheme}
              soundEnabled={soundEnabled}
              toggleSound={toggleSound}
              onImportData={handleImportData}
              onResetToday={handleResetToday}
              onResetAllHistory={handleResetAllHistory}
              onResetData={handleResetData}
              onClearAllData={handleClearAllData}
              onOpenResetModal={() => setIsResetModalOpen(true)}
              addToast={addToast}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
          <button
            className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            aria-label="Dashboard"
          >
            <div className="mobile-nav-icon-wrap">
              <LayoutDashboard size={19} />
            </div>
            <span>Dashboard</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
            aria-label="Habits Manager"
          >
            <div className="mobile-nav-icon-wrap">
              <CheckSquare size={19} />
            </div>
            <span>Habits</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            aria-label="Analytics"
          >
            <div className="mobile-nav-icon-wrap">
              <BarChart3 size={19} />
            </div>
            <span>Analytics</span>
          </button>

          <button
            className={`mobile-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            aria-label="Settings"
          >
            <div className="mobile-nav-icon-wrap">
              <Settings size={19} />
            </div>
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Add / Edit Habit Modal */}
      <HabitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
      />

      {/* Habit Deep-Dive Detail & Heatmap Modal */}
      <HabitDetailModal
        isOpen={Boolean(detailHabit)}
        habit={detailHabit}
        logs={logs}
        onClose={() => setDetailHabit(null)}
        onOpenEditModal={habit => {
          setEditingHabit(habit);
          setIsAddModalOpen(true);
        }}
        onToggleDateCompletion={handleToggleCompletion}
        onResetHabitHistory={handleResetHabitHistory}
      />

      {/* Universal Reset Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetToday={handleResetToday}
        onResetAllHistory={handleResetAllHistory}
        onResetData={handleResetData}
        onClearAllData={handleClearAllData}
        completedTodayCount={dashboardStats.completedToday}
      />

      {/* Global Toasts */}
      <Toast toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
