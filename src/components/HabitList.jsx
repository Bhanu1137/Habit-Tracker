import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Flame,
  Calendar,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  Filter,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { CATEGORIES } from '../types/habit';
import { calculateCurrentStreak, calculateLongestStreak, calculateCompletionPercentage, formatDate } from '../utils/streakEngine';

export default function HabitList({
  habits,
  logs,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
  onDeleteHabit,
  onToggleHabitStatus,
  onToggleCompletion,
  onOpenResetModal,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'archived' | 'all'
  const [sortBy, setSortBy] = useState('streak'); // 'streak' | 'rate' | 'name' | 'newest'

  const todayStr = formatDate(new Date());
  const completedTodaySet = new Set(
    logs.filter(l => l.completionDate === todayStr && l.status === 'completed').map(l => l.habitId)
  );

  const categoryMap = {};
  CATEGORIES.forEach(c => {
    categoryMap[c.id] = c;
  });

  // Filter & Sort Logic
  const filteredHabits = useMemo(() => {
    return habits
      .filter(habit => {
        // Status filter
        if (statusFilter === 'active' && habit.status !== 'active') return false;
        if (statusFilter === 'archived' && habit.status === 'active') return false;

        // Category filter
        if (selectedCategory !== 'ALL' && habit.category !== selectedCategory) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = habit.name.toLowerCase().includes(q);
          const matchesDesc = (habit.description || '').toLowerCase().includes(q);
          const matchesCat = habit.category.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'streak') {
          const sA = calculateCurrentStreak(a, logs);
          const sB = calculateCurrentStreak(b, logs);
          return sB - sA;
        }
        if (sortBy === 'rate') {
          const rA = calculateCompletionPercentage(a, logs);
          const rB = calculateCompletionPercentage(b, logs);
          return rB - rA;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return 0;
      });
  }, [habits, logs, searchQuery, selectedCategory, statusFilter, sortBy]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-title-group">
          <h1>Habits Management</h1>
          <div className="header-subtitle">
            Create, customize, edit, and audit all your daily and weekly habits.
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={onOpenResetModal} title="Reset Data & Progress Options" aria-label="Reset Options">
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
          <button className="btn-primary" onClick={onOpenAddModal} aria-label="Create New Habit">
            <Plus size={18} />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="habits-filter-bar">
        <div className="search-input-box">
          <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search habits by name, keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search habits"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'inline-flex', background: 'var(--surface-glass)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              className={`filter-pill ${statusFilter === 'active' ? 'active' : ''}`}
              style={{ padding: '4px 12px', minHeight: '30px', border: 'none' }}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-pill ${statusFilter === 'archived' ? 'active' : ''}`}
              style={{ padding: '4px 12px', minHeight: '30px', border: 'none' }}
              onClick={() => setStatusFilter('archived')}
            >
              Archived
            </button>
            <button
              className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '4px 12px', minHeight: '30px', border: 'none' }}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
          </div>

          {/* Sort Selector */}
          <select
            className="form-control"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem', minHeight: '36px', flex: '1 0 auto' }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort habits by"
          >
            <option value="streak">Sort by Streak</option>
            <option value="rate">Sort by Rate %</option>
            <option value="name">Sort Alphabetical</option>
            <option value="newest">Sort by Newest</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ marginBottom: '20px' }}>
        <div className="category-pills">
          <button
            className={`filter-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 20px',
            textAlign: 'center',
          }}
        >
          <Filter size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3>No Habits Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '16px' }}>
            No habits match your current search and filter criteria.
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setStatusFilter('active');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="habit-cards-grid">
          {filteredHabits.map(habit => {
            const currentStreak = calculateCurrentStreak(habit, logs);
            const longestStreak = calculateLongestStreak(habit, logs);
            const rate = calculateCompletionPercentage(habit, logs);
            const isDoneToday = completedTodaySet.has(habit.id);
            const cat = categoryMap[habit.category] || { name: habit.category, color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' };

            return (
              <div key={habit.id} className="habit-card">
                {/* Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span
                      className="category-badge"
                      style={{ background: cat.bg, color: cat.color }}
                    >
                      {cat.name}
                    </span>
                    <span className={`priority-badge priority-${habit.priority.toLowerCase()}`}>
                      {habit.priority}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--surface-glass)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {habit.frequency}
                    </span>
                    {habit.status === 'inactive' && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(100, 116, 139, 0.2)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Archived
                      </span>
                    )}
                  </div>

                  <h3
                    className="habit-card-name"
                    onClick={() => onOpenDetailModal(habit)}
                  >
                    {habit.name}
                  </h3>

                  {habit.description && (
                    <p className="habit-card-desc">{habit.description}</p>
                  )}
                </div>

                {/* 3 Metrics Box */}
                <div className="habit-card-stats">
                  <div className="habit-stat-item">
                    <div className="stat-num" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <Flame size={14} /> {currentStreak}d
                    </div>
                    <div className="stat-label">Current</div>
                  </div>

                  <div className="habit-stat-item">
                    <div className="stat-num">{longestStreak}d</div>
                    <div className="stat-label">Best Record</div>
                  </div>

                  <div className="habit-stat-item">
                    <div className="stat-num" style={{ color: 'var(--accent-primary)' }}>{rate}%</div>
                    <div className="stat-label">Consistency</div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="habit-card-footer">
                  <button
                    className={`btn-secondary ${isDoneToday ? 'btn-danger' : ''}`}
                    style={{
                      padding: '6px 12px',
                      minHeight: '36px',
                      fontSize: '0.8rem',
                      background: isDoneToday ? 'rgba(16, 185, 129, 0.15)' : undefined,
                      borderColor: isDoneToday ? 'rgba(16, 185, 129, 0.3)' : undefined,
                      color: isDoneToday ? '#10b981' : undefined,
                    }}
                    onClick={() => onToggleCompletion(habit.id)}
                    aria-label={isDoneToday ? `Mark ${habit.name} as incomplete` : `Mark ${habit.name} as done`}
                  >
                    <CheckCircle2 size={15} />
                    <span>{isDoneToday ? 'Done Today' : 'Mark Done'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="icon-btn"
                      style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
                      onClick={() => onOpenDetailModal(habit)}
                      title="View Calendar Heatmap"
                      aria-label="View Calendar Heatmap"
                    >
                      <Calendar size={15} />
                    </button>

                    <button
                      className="icon-btn"
                      style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
                      onClick={() => onOpenEditModal(habit)}
                      title="Edit Habit"
                      aria-label="Edit Habit"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      className="icon-btn"
                      style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
                      onClick={() => onToggleHabitStatus(habit.id)}
                      title={habit.status === 'active' ? 'Archive Habit' : 'Restore Habit'}
                      aria-label={habit.status === 'active' ? 'Archive Habit' : 'Restore Habit'}
                    >
                      {habit.status === 'active' ? <Archive size={15} /> : <ArchiveRestore size={15} />}
                    </button>

                    <button
                      className="icon-btn"
                      style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', color: '#ef4444' }}
                      onClick={() => onDeleteHabit(habit.id, habit.name)}
                      title="Delete Habit"
                      aria-label="Delete Habit"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
