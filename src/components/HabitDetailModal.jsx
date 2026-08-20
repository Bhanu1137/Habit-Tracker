import React from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Edit2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { CATEGORIES } from '../types/habit';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionPercentage,
  getHeatmapGridData,
  formatDate
} from '../utils/streakEngine';

export default function HabitDetailModal({
  habit,
  logs,
  isOpen,
  onClose,
  onOpenEditModal,
  onToggleDateCompletion,
  onResetHabitHistory,
}) {
  if (!isOpen || !habit) return null;

  const currentStreak = calculateCurrentStreak(habit, logs);
  const longestStreak = calculateLongestStreak(habit, logs);
  const completionRate = calculateCompletionPercentage(habit, logs);
  
  const habitLogs = logs.filter(l => l.habitId === habit.id && l.status === 'completed');
  const completedDateSet = new Set(habitLogs.map(l => l.completionDate));
  const heatmapCells = getHeatmapGridData(habit.id, logs, 84); // 12 weeks = 84 days

  const cat = CATEGORIES.find(c => c.id === habit.category) || {
    name: habit.category,
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.15)',
  };

  // Recent 14 days list for direct toggling
  const recentDays = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    recentDays.push({
      dateStr,
      label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      isCompleted: completedDateSet.has(dateStr),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="category-badge" style={{ background: cat.bg, color: cat.color }}>
                {cat.name}
              </span>
              <span className={`priority-badge priority-${habit.priority.toLowerCase()}`}>
                {habit.priority}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {habit.frequency}
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.2rem, 1.5vw + 0.8rem, 1.45rem)' }}>{habit.name}</h2>
            {habit.target && (
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '2px' }}>
                Target: {habit.target}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              className="icon-btn"
              onClick={() => {
                onClose();
                onOpenEditModal(habit);
              }}
              title="Edit Habit"
              aria-label="Edit Habit"
            >
              <Edit2 size={16} />
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>
        </div>

        {habit.description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px', lineHeight: 1.45 }}>
            {habit.description}
          </p>
        )}

        {/* 4 Stats Grid (Responsive 2x2 or 4x1) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              {currentStreak}d
            </div>
          </div>

          <div style={{ background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Longest</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {longestStreak}d
            </div>
          </div>

          <div style={{ background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Days</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              {habitLogs.length}
            </div>
          </div>

          <div style={{ background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rate</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              {completionRate}%
            </div>
          </div>
        </div>

        {/* 12-Week Heatmap Matrix */}
        <div style={{ background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="var(--accent-primary)" />
              <span>12-Week Consistency Matrix (84 Days)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Started: {habit.startDate}
            </div>
          </div>

          <div className="heatmap-scroll-wrapper">
            <div className="heatmap-grid" style={{ gridTemplateRows: 'repeat(7, 12px)', gridAutoColumns: '12px', gap: '3px' }}>
              {heatmapCells.map((cell, idx) => (
                <div
                  key={idx}
                  className={`heatmap-cell level-${cell.level}`}
                  style={{ width: '12px', height: '12px' }}
                  title={`${cell.displayDate}: ${cell.count > 0 ? 'Completed' : 'Missed'}`}
                  onClick={() => onToggleDateCompletion(habit.id, cell.date)}
                />
              ))}
            </div>
          </div>

          <div className="heatmap-legend">
            <span>Missed</span>
            <div className="heatmap-cell level-0" style={{ width: '10px', height: '10px' }} />
            <div className="heatmap-cell level-4" style={{ width: '10px', height: '10px' }} />
            <span>Completed</span>
          </div>
        </div>

        {/* Quick Log Editor (Last 14 days) */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="var(--accent-primary)" />
            <span>Recent 14-Day Completion Log (Tap to toggle)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
            {recentDays.map(day => (
              <button
                key={day.dateStr}
                onClick={() => onToggleDateCompletion(habit.id, day.dateStr)}
                style={{
                  background: day.isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-glass)',
                  border: `1px solid ${day.isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                  color: day.isCompleted ? '#10b981' : 'var(--text-secondary)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                  minHeight: '36px',
                }}
                aria-label={`Toggle completion for ${day.label}`}
              >
                <span>{day.label}</span>
                <CheckCircle2 size={15} style={{ opacity: day.isCompleted ? 1 : 0.2, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <button
            className="btn-danger"
            style={{ padding: '6px 12px', minHeight: '36px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => {
              if (window.confirm(`Reset all completion history for "${habit.name}"? Streak will be reset to 0.`)) {
                onResetHabitHistory(habit.id, habit.name);
              }
            }}
            aria-label="Reset Habit History"
          >
            <RotateCcw size={14} />
            <span>Reset Habit Streak & History</span>
          </button>

          <button className="btn-secondary" onClick={onClose} style={{ minWidth: '80px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
