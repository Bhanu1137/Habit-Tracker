import React, { useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Database,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  Code2,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { exportDataAsJSON, exportLogsAsCSV, parseJSONBackup } from '../utils/storage';

export default function SettingsView({
  habits,
  logs,
  theme,
  toggleTheme,
  soundEnabled,
  toggleSound,
  onImportData,
  onResetToday,
  onResetAllHistory,
  onResetData,
  onClearAllData,
  onOpenResetModal,
  addToast,
}) {
  const fileInputRef = useRef(null);

  const handleExportJSON = () => {
    exportDataAsJSON(habits, logs);
    addToast('Backup exported as JSON successfully!', 'success');
  };

  const handleExportCSV = () => {
    exportLogsAsCSV(habits, logs);
    addToast('Completion history exported as CSV successfully!', 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseJSONBackup(event.target.result);
        onImportData(parsed.habits, parsed.logs);
        addToast(`Successfully restored ${parsed.habits.length} habits and ${parsed.logs.length} logs!`, 'success');
      } catch (err) {
        addToast('Import error: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-title-group">
          <h1>Data Portability & Preferences</h1>
          <div className="header-subtitle">
            Manage your local database, backup & restore files, customize sound and visual themes.
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Card 1: Data Backup & Export */}
        <div className="chart-card">
          <h3>
            <Database size={18} color="var(--accent-primary)" />
            <span>Backup & Export</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Download complete snapshots of your habits, streaks, and completion history for safe keeping.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <button className="btn-secondary" style={{ justifyContent: 'space-between' }} onClick={handleExportJSON} aria-label="Export Full JSON Backup">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileJson size={18} color="var(--accent-primary)" /> Export JSON Backup
              </span>
              <Download size={16} />
            </button>

            <button className="btn-secondary" style={{ justifyContent: 'space-between' }} onClick={handleExportCSV} aria-label="Export Completion History as CSV">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={18} color="#10b981" /> Export History (CSV)
              </span>
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Card 2: Restore Backup */}
        <div className="chart-card">
          <h3>
            <Upload size={18} color="#06b6d4" />
            <span>Restore Database</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Import a previously exported JSON backup file to restore your habits and historical logs.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileUpload}
            aria-label="Upload JSON Backup File"
          />

          <div style={{ marginTop: 'auto' }}>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Select JSON Backup File"
            >
              <Upload size={18} />
              <span>Select Backup File</span>
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
              Local file processing only. Zero cloud upload.
            </div>
          </div>
        </div>

        {/* Card 3: Experience & Preferences */}
        <div className="chart-card">
          <h3>
            <Sparkles size={18} color="#f59e0b" />
            <span>Experience Preferences</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Tailor theme styling and audio feedback.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
            {/* Theme Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Theme Mode</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently: {theme === 'dark' ? 'Dark Obsidian' : 'Light Clean'}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '6px 12px', minHeight: '34px', fontSize: '0.8rem' }} onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* Sound Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Audio Synthesis</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chimes & streak fanfares</div>
              </div>
              <button className="btn-secondary" style={{ padding: '6px 12px', minHeight: '34px', fontSize: '0.8rem' }} onClick={toggleSound} aria-label="Toggle Audio">
                {soundEnabled ? <Volume2 size={15} color="var(--accent-primary)" /> : <VolumeX size={15} />}
                <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Database & Reset Management */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>
              <RotateCcw size={18} color="#ef4444" />
              <span>Reset & Sample Data</span>
            </h3>
            <button
              className="btn-secondary"
              style={{ padding: '4px 10px', minHeight: '30px', fontSize: '0.78rem', gap: '4px' }}
              onClick={onOpenResetModal}
              title="Open full reset options modal"
            >
              <RotateCcw size={13} />
              <span>Reset Hub</span>
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Quickly uncheck today's tasks, zero-out streaks, reload demo data, or factory wipe.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}
              onClick={onResetToday}
              aria-label="Reset Today's Completions"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#6366f1" /> Reset Today's Checks
              </span>
              <span className="reset-badge badge-safe">Routine</span>
            </button>

            <button
              className="btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}
              onClick={() => {
                if (window.confirm('Reset all historical streaks to 0? Your habits will NOT be deleted.')) {
                  onResetAllHistory();
                }
              }}
              aria-label="Reset All Streaks & History"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={16} color="#f59e0b" /> Reset All Streaks to 0
              </span>
              <span className="reset-badge badge-warning">Streaks</span>
            </button>

            <button
              className="btn-secondary"
              style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}
              onClick={() => {
                if (window.confirm('Reset database to 6 sample demo habits and 35-day completion history?')) {
                  onResetData();
                }
              }}
              aria-label="Load Realistic Sample Demo Data"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#06b6d4" /> Restore Demo Sample Data
              </span>
              <span className="reset-badge badge-info">Sample</span>
            </button>

            <button
              className="btn-danger"
              style={{ justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '4px' }}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete ALL habits and logs permanently? This cannot be undone.')) {
                  onClearAllData();
                }
              }}
              aria-label="Clear All Habits and History"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={16} /> Factory Reset (Clear All)
              </span>
              <span className="reset-badge badge-danger">Wipe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tech Stack Footer Card */}
      <div style={{ marginTop: '28px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sidebar-logo" style={{ width: '36px', height: '36px' }}>
            <Code2 size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>HabitPulse Web Engine v2.0</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Built with React 19, Vite, Vanilla CSS Responsive Design, Web Audio API & LocalStorage
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} color="#10b981" /> 100% Client-Side & Private
        </div>
      </div>
    </div>
  );
}
