import React from 'react';
import {
  X,
  RotateCcw,
  Flame,
  Sparkles,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function ResetModal({
  isOpen,
  onClose,
  onResetToday,
  onResetAllHistory,
  onResetData,
  onClearAllData,
  completedTodayCount = 0,
}) {
  if (!isOpen) return null;

  const handleAction = (actionFn, confirmMsg) => {
    if (confirmMsg) {
      if (window.confirm(confirmMsg)) {
        actionFn();
        onClose();
      }
    } else {
      actionFn();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '580px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              <RotateCcw size={15} />
              <span>Reset Center</span>
            </div>
            <h2 id="reset-modal-title" style={{ fontSize: 'clamp(1.2rem, 1.5vw + 0.8rem, 1.45rem)' }}>
              Reset Data & Progress
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              Choose the exact scope of reset you want to perform.
            </p>
          </div>

          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* 4 Reset Scope Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Option 1: Reset Today's Checklist */}
          <div className="reset-card">
            <div className="reset-card-header">
              <div className="reset-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                <RotateCcw size={20} />
              </div>
              <div className="reset-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="reset-card-title">Reset Today's Completions</div>
                  <span className="reset-badge badge-safe">Routine Reset</span>
                </div>
                <div className="reset-card-desc">
                  Unchecks all habits marked done today ({completedTodayCount} done). Historical streaks prior to today are preserved.
                </div>
              </div>
            </div>
            <button
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              onClick={() => handleAction(onResetToday)}
              aria-label="Reset Today's Habits"
            >
              <RotateCcw size={15} />
              <span>Reset Today's Checks ({completedTodayCount} Active)</span>
            </button>
          </div>

          {/* Option 2: Reset All Streaks & History */}
          <div className="reset-card">
            <div className="reset-card-header">
              <div className="reset-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Flame size={20} />
              </div>
              <div className="reset-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="reset-card-title">Reset Streaks & History Only</div>
                  <span className="reset-badge badge-warning">Habits Kept</span>
                </div>
                <div className="reset-card-desc">
                  Clears all completion logs and resets streak counts back to 0, while keeping all your custom habits.
                </div>
              </div>
            </div>
            <button
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              onClick={() => handleAction(onResetAllHistory, 'Are you sure you want to reset all completion history and streaks? Your habits will be kept.')}
              aria-label="Reset All Streaks & History"
            >
              <Flame size={15} />
              <span>Reset All Streaks to 0</span>
            </button>
          </div>

          {/* Option 3: Restore Demo / Sample Data */}
          <div className="reset-card">
            <div className="reset-card-header">
              <div className="reset-card-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <Sparkles size={20} />
              </div>
              <div className="reset-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="reset-card-title">Restore Demo Sample Data</div>
                  <span className="reset-badge badge-info">Popular Demo</span>
                </div>
                <div className="reset-card-desc">
                  Reloads 6 realistic starter habits with 35 days of historical completion data and streak milestones.
                </div>
              </div>
            </div>
            <button
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              onClick={() => handleAction(onResetData, 'Reset database to 6 sample demo habits with 35-day streak logs?')}
              aria-label="Restore Sample Demo Data"
            >
              <Sparkles size={15} />
              <span>Restore Sample Demo Data</span>
            </button>
          </div>

          {/* Option 4: Factory Reset / Clear All */}
          <div className="reset-card reset-card-danger">
            <div className="reset-card-header">
              <div className="reset-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <Trash2 size={20} />
              </div>
              <div className="reset-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="reset-card-title" style={{ color: '#ef4444' }}>Factory Reset (Clear All)</div>
                  <span className="reset-badge badge-danger">Destructive</span>
                </div>
                <div className="reset-card-desc">
                  Permanently deletes all habits and all logs. Leaves you with a clean slate.
                </div>
              </div>
            </div>
            <button
              className="btn-danger"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              onClick={() => handleAction(onClearAllData, 'WARNING: Are you sure you want to permanently delete ALL habits and history? This cannot be undone.')}
              aria-label="Clear All Habits and Logs"
            >
              <Trash2 size={15} />
              <span>Clear Everything (Factory Wipe)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ minWidth: '80px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
