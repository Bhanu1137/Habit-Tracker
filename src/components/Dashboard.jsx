import React from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Clock
} from 'lucide-react';
import { CATEGORIES } from '../types/habit';
import { calculateCurrentStreak, calculateCompletionPercentage, formatDate } from '../utils/streakEngine';

export default function Dashboard({
  habits,
  logs,
  onToggleCompletion,
  onOpenAddModal,
  onOpenDetailModal,
  onNavigateToAnalytics,
  stats,
}) {
  const activeHabits = habits.filter(h => h.status === 'active');
  const todayStr = formatDate(new Date());
  const completedTodayHabitIds = new Set(
    logs.filter(l => l.completionDate === todayStr && l.status === 'completed').map(l => l.habitId)
  );

  // Time-of-day greeting
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  // Date formatting
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryMap = {};
  CATEGORIES.forEach(c => {
    categoryMap[c.id] = c;
  });

  // Calculate SVG progress ring values
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.completionPercentageToday / 100) * circumference;

  return (
    <div>
      {/* Header Greeting */}
      <div className="page-header">
        <div className="header-title-group">
          <h1>
            <span>{greeting}</span> <Sparkles size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
          </h1>
          <div className="header-subtitle">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> {todayFormatted}
            </span>
            <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
            <span>Small consistent steps compound into extraordinary results.</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={onNavigateToAnalytics} aria-label="View Analytics">
            <TrendingUp size={16} />
            <span>Analytics</span>
          </button>
          <button className="btn-primary" onClick={onOpenAddModal} aria-label="Add Habit">
            <Plus size={18} />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Progress Banner Hero Card */}
      <div className="progress-banner-card">
        <div className="progress-banner-info">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <Target size={15} /> Today's Focus
          </div>
          <h3>
            {stats.completedToday === stats.totalActive && stats.totalActive > 0
              ? '🎉 All habits completed for today! Outstanding work!'
              : `You have completed ${stats.completedToday} of ${stats.totalActive} habits today.`}
          </h3>
          <p>
            {stats.pendingToday > 0
              ? `Keep the momentum going! Complete ${stats.pendingToday} more ${stats.pendingToday === 1 ? 'habit' : 'habits'} to achieve 100% daily score.`
              : 'Your daily streaks have been updated. Take time to relax or review your weekly goals.'}
          </p>
        </div>

        <div className="progress-ring-container">
          <svg width="96" height="96" className="progress-ring-svg" viewBox="0 0 100 100">
            <circle
              className="progress-ring-bg"
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              className="progress-ring-fill"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
          </svg>
          <div>
            <div className="progress-ring-text">{stats.completionPercentageToday}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</div>
          </div>
        </div>
      </div>

      {/* Live Summary Cards Grid */}
      <div className="summary-grid">
        <div className="summary-card">
          <div
            className="summary-card-icon"
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div className="summary-card-info">
            <div className="summary-card-label">Active Habits</div>
            <div className="summary-card-value">{stats.totalActive}</div>
            <div className="summary-card-meta">Tracked daily</div>
          </div>
        </div>

        <div className="summary-card">
          <div
            className="summary-card-icon"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
          >
            <Zap size={24} />
          </div>
          <div className="summary-card-info">
            <div className="summary-card-label">Done Today</div>
            <div className="summary-card-value">{stats.completedToday}</div>
            <div className="summary-card-meta">{stats.pendingToday} pending</div>
          </div>
        </div>

        <div className="summary-card">
          <div
            className="summary-card-icon"
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
          >
            <Flame size={24} />
          </div>
          <div className="summary-card-info">
            <div className="summary-card-label">Best Streak</div>
            <div className="summary-card-value">{stats.bestCurrentStreak} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>days</span></div>
            <div className="summary-card-meta">All-time: {stats.bestLongestStreak}d</div>
          </div>
        </div>

        <div className="summary-card">
          <div
            className="summary-card-icon"
            style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}
          >
            <Award size={24} />
          </div>
          <div className="summary-card-info">
            <div className="summary-card-label">Consistency</div>
            <div className="summary-card-value">{stats.overallRate}%</div>
            <div className="summary-card-meta">Completion rate</div>
          </div>
        </div>
      </div>

      {/* Today's Checklist Section */}
      <div className="section-title-bar">
        <h2>
          <Clock size={20} color="var(--accent-primary)" />
          <span>Today's Habit Checklist</span>
        </h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Click to mark complete
        </span>
      </div>

      {activeHabits.length === 0 ? (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: '44px 20px',
            textAlign: 'center',
          }}
        >
          <Sparkles size={40} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
          <h3>No Active Habits Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', marginBottom: '20px' }}>
            Start building your routine by creating your first habit.
          </p>
          <button className="btn-primary" onClick={onOpenAddModal}>
            <Plus size={18} />
            <span>Create Your First Habit</span>
          </button>
        </div>
      ) : (
        <div className="habit-checklist-grid">
          {activeHabits.map(habit => {
            const isCompleted = completedTodayHabitIds.has(habit.id);
            const streak = calculateCurrentStreak(habit, logs);
            const cat = categoryMap[habit.category] || { name: habit.category, color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' };

            return (
              <div
                key={habit.id}
                className={`checklist-item ${isCompleted ? 'completed' : ''}`}
              >
                <div className="checklist-left">
                  <button
                    className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
                    onClick={() => onToggleCompletion(habit.id)}
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as completed today'}
                    aria-label={`Toggle completion for ${habit.name}`}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={18} />}
                  </button>

                  <div
                    className="checklist-details"
                    onClick={() => onOpenDetailModal(habit)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="checklist-title">
                      <span>{habit.name}</span>
                      {habit.target && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                          ({habit.target})
                        </span>
                      )}
                    </div>
                    {habit.description && (
                      <div className="checklist-desc">{habit.description}</div>
                    )}
                  </div>
                </div>

                <div className="checklist-right">
                  <span
                    className="category-badge"
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    {cat.name}
                  </span>

                  <span className={`priority-badge priority-${habit.priority.toLowerCase()}`}>
                    {habit.priority}
                  </span>

                  <div className="streak-pill" title={`Current consecutive streak: ${streak} days`}>
                    <Flame size={14} />
                    <span>{streak}d</span>
                  </div>

                  <button
                    className="icon-btn"
                    onClick={() => onOpenDetailModal(habit)}
                    title="View habit heatmap & stats"
                    aria-label={`View details for ${habit.name}`}
                    style={{ width: '34px', height: '34px', minWidth: '34px', minHeight: '34px' }}
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
