import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Settings,
  Flame,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  PlusCircle,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  habits,
  logs,
  theme,
  toggleTheme,
  soundEnabled,
  toggleSound,
  onOpenAddModal,
  isMobileOpen,
  setIsMobileOpen,
  dashboardStats,
}) {
  const activeHabitsCount = habits.filter(h => h.status === 'active').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: `${dashboardStats.completedToday}/${dashboardStats.totalActive}` },
    { id: 'habits', label: 'Habits Manager', icon: CheckSquare, badge: activeHabitsCount },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'settings', label: 'Data & Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 45 }}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`} aria-label="Main Navigation">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="sidebar-brand-title">
              HabitPulse
              <span className="sidebar-version-badge">v2.0</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Daily Consistency OS
            </div>
          </div>
          {isMobileOpen && (
            <button
              className="icon-btn"
              style={{ marginLeft: 'auto' }}
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          <div style={{ padding: '0 8px 6px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Menu
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}

          <div style={{ marginTop: '16px', padding: '0 4px' }}>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                onOpenAddModal();
                if (isMobileOpen) setIsMobileOpen(false);
              }}
              aria-label="Create New Habit"
            >
              <PlusCircle size={18} />
              <span>New Habit</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer Widgets */}
        <div className="sidebar-footer">
          {/* Quick Streak Widget */}
          <div className="quick-stats-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color="#f59e0b" />
              <div>
                <div className="stat-lbl">Top Streak</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Best</div>
              </div>
            </div>
            <div className="stat-val">{dashboardStats.bestCurrentStreak}d</div>
          </div>

          {/* Theme & Sound Actions */}
          <div className="sidebar-actions">
            <button
              className="icon-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="icon-btn"
              title={soundEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
              onClick={toggleSound}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={18} color="var(--accent-primary)" /> : <VolumeX size={18} />}
            </button>

            <button
              className="icon-btn"
              title="Settings"
              onClick={() => {
                setActiveTab('settings');
                if (isMobileOpen) setIsMobileOpen(false);
              }}
              aria-label="Open Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
