import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { CATEGORIES, PRIORITIES, FREQUENCIES, HABIT_TEMPLATES } from '../types/habit';
import { formatDate } from '../utils/streakEngine';

export default function HabitModal({
  isOpen,
  onClose,
  onSave,
  editHabit = null,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [frequency, setFrequency] = useState('Daily');
  const [priority, setPriority] = useState('Medium');
  const [target, setTarget] = useState('');
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [error, setError] = useState('');

  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name || '');
      setDescription(editHabit.description || '');
      setCategory(editHabit.category || 'Health');
      setFrequency(editHabit.frequency || 'Daily');
      setPriority(editHabit.priority || 'Medium');
      setTarget(editHabit.target || '');
      setStartDate(editHabit.startDate || formatDate(new Date()));
    } else {
      setName('');
      setDescription('');
      setCategory('Health');
      setFrequency('Daily');
      setPriority('Medium');
      setTarget('');
      setStartDate(formatDate(new Date()));
    }
    setError('');
  }, [editHabit, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (template) => {
    setName(template.name);
    setCategory(template.category);
    setFrequency(template.frequency);
    setPriority(template.priority);
    setDescription(template.description);
    setTarget(template.target);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Habit name cannot be empty.');
      return;
    }

    const habitData = {
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      priority,
      target: target.trim(),
      startDate,
    };

    onSave(habitData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.2rem, 1.5vw + 0.8rem, 1.4rem)' }}>
              {editHabit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {editHabit ? 'Update habit parameters & schedule.' : 'Define your target habit and schedule.'}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Template Quick Loader (only when creating new) */}
        {!editHabit && (
          <div style={{ marginBottom: '16px', background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="var(--accent-primary)" /> Quick Inspiration Templates:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {HABIT_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="filter-pill"
                  style={{ fontSize: '0.72rem', padding: '3px 10px', minHeight: '28px' }}
                  onClick={() => handleApplyTemplate(tmpl)}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="habit-name-input">Habit Title *</label>
            <input
              id="habit-name-input"
              type="text"
              className="form-control"
              placeholder="e.g. Read 20 pages, 30 min morning run..."
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              autoFocus
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="habit-category-select">Category</label>
              <select
                id="habit-category-select"
                className="form-control"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="habit-priority-select">Priority</label>
              <select
                id="habit-priority-select"
                className="form-control"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="habit-frequency-select">Frequency</label>
              <select
                id="habit-frequency-select"
                className="form-control"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
              >
                {FREQUENCIES.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.desc})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="habit-target-input">Target Goal / Metric</label>
              <input
                id="habit-target-input"
                type="text"
                className="form-control"
                placeholder="e.g. 2.5L, 30 Mins, 1 Chapter"
                value={target}
                onChange={e => setTarget(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="habit-startdate-input">Start Tracking Date</label>
            <input
              id="habit-startdate-input"
              type="date"
              className="form-control"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="habit-desc-input">Description & Purpose (Optional)</label>
            <textarea
              id="habit-desc-input"
              className="form-control"
              rows="3"
              placeholder="Why is this habit important to your goals? Add any specific instructions or routine details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={18} />
              <span>{editHabit ? 'Save Changes' : 'Create Habit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
