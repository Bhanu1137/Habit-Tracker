import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Flame,
  Award,
  Calendar,
} from 'lucide-react';
import { CATEGORIES } from '../types/habit';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionPercentage,
  getHeatmapGridData,
  formatDate,
} from '../utils/streakEngine';

export default function AnalyticsView({ habits, logs }) {
  const activeHabits = habits.filter(h => h.status === 'active');
  const today = new Date();

  // 1. Last 7 Days Completion Data for Bar Chart
  const weeklyData = useMemo(() => {
    const days = [];
    let maxVal = 1;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const count = logs.filter(l => l.completionDate === dateStr && l.status === 'completed').length;
      if (count > maxVal) maxVal = count;

      days.push({
        label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr,
        count,
      });
    }
    return { days, maxVal };
  }, [logs]);

  // 2. 30-Day Progress Trendline in 6 steps
  const trendData = useMemo(() => {
    const points = [];
    const steps = [25, 20, 15, 10, 5, 0];
    
    steps.forEach(step => {
      const d = new Date(today);
      d.setDate(d.getDate() - step);
      const label = step === 0 ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let sumRates = 0;
      activeHabits.forEach(h => {
        sumRates += calculateCompletionPercentage(h, logs, d);
      });
      const avgRate = activeHabits.length > 0 ? Math.round(sumRates / activeHabits.length) : 0;

      points.push({ label, rate: avgRate });
    });

    return points;
  }, [activeHabits, logs]);

  // 3. Category Distribution
  const categoryStats = useMemo(() => {
    const counts = {};
    activeHabits.forEach(h => {
      counts[h.category] = (counts[h.category] || 0) + 1;
    });

    const items = CATEGORIES.map(cat => ({
      ...cat,
      count: counts[cat.id] || 0,
    })).filter(c => c.count > 0);

    const total = activeHabits.length || 1;
    return items.map(item => ({
      ...item,
      percentage: Math.round((item.count / total) * 100),
    }));
  }, [activeHabits]);

  // 4. Global 90-Day Heatmap
  const globalHeatmapCells = useMemo(() => {
    return getHeatmapGridData(null, logs, 91); // 13 weeks = 91 days
  }, [logs]);

  // 5. Leaderboard
  const leaderboard = useMemo(() => {
    return [...activeHabits].map(h => {
      const current = calculateCurrentStreak(h, logs);
      const longest = calculateLongestStreak(h, logs);
      const rate = calculateCompletionPercentage(h, logs);
      const totalDone = logs.filter(l => l.habitId === h.id && l.status === 'completed').length;
      return {
        habit: h,
        currentStreak: current,
        longestStreak: longest,
        rate,
        totalDone,
      };
    }).sort((a, b) => b.currentStreak - a.currentStreak || b.rate - a.rate);
  }, [activeHabits, logs]);

  // SVG dimensions for Trendline chart
  const svgWidth = 460;
  const svgHeight = 160;
  const paddingX = 35;
  const paddingY = 20;

  const pointsSvgString = trendData.map((pt, i) => {
    const x = paddingX + (i / (trendData.length - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (pt.rate / 100) * (svgHeight - 2 * paddingY);
    return `${x},${y}`;
  }).join(' ');

  const areaSvgString = `${paddingX},${svgHeight - paddingY} ${pointsSvgString} ${svgWidth - paddingX},${svgHeight - paddingY}`;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-title-group">
          <h1>Analytics & Consistency Engine</h1>
          <div className="header-subtitle">
            Deep dive into your habits consistency, completion trajectories, and streak leaderboards.
          </div>
        </div>
      </div>

      {/* Global 90-Day Heatmap Banner */}
      <div className="heatmap-container">
        <div className="heatmap-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--accent-primary)" />
              <span>91-Day Global Activity Matrix (All Habits)</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              Visual record of total habit completions per day across your entire system.
            </p>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            {logs.filter(l => l.status === 'completed').length} Total Completions
          </div>
        </div>

        <div className="heatmap-scroll-wrapper">
          <div className="heatmap-grid" style={{ gridTemplateRows: 'repeat(7, 13px)', gridAutoColumns: '13px', gap: '3.5px' }}>
            {globalHeatmapCells.map((cell, idx) => (
              <div
                key={idx}
                className={`heatmap-cell level-${cell.level}`}
                style={{ width: '13px', height: '13px' }}
                title={`${cell.displayDate}: ${cell.count} habits completed`}
              />
            ))}
          </div>
        </div>

        <div className="heatmap-legend">
          <span>0 Done</span>
          <div className="heatmap-cell level-0" style={{ width: '10px', height: '10px' }} />
          <div className="heatmap-cell level-1" style={{ width: '10px', height: '10px' }} />
          <div className="heatmap-cell level-2" style={{ width: '10px', height: '10px' }} />
          <div className="heatmap-cell level-3" style={{ width: '10px', height: '10px' }} />
          <div className="heatmap-cell level-4" style={{ width: '10px', height: '10px' }} />
          <span>5+ Done</span>
        </div>
      </div>

      {/* 2-Column Analytical Charts */}
      <div className="analytics-grid">
        {/* Weekly Completion Bar Chart */}
        <div className="chart-card">
          <h3>
            <BarChart3 size={18} color="var(--accent-primary)" />
            <span>7-Day Completion Volume</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Habits completed each day over the past week.
          </p>

          <div className="bar-chart-container">
            {weeklyData.days.map((d, idx) => {
              const heightPct = Math.max(8, (d.count / (weeklyData.maxVal || 1)) * 100);
              return (
                <div key={idx} className="bar-group">
                  <div className="bar-val">{d.count}</div>
                  <div
                    className="bar-fill"
                    style={{
                      height: `${heightPct}%`,
                      background: idx === weeklyData.days.length - 1
                        ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                        : undefined,
                    }}
                    title={`${d.dateStr}: ${d.count} completions`}
                  />
                  <div className="bar-label">{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-Day Completion Rate Trendline Chart */}
        <div className="chart-card">
          <h3>
            <TrendingUp size={18} color="#06b6d4" />
            <span>30-Day Consistency Trajectory (%)</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Overall habit completion percentage over time.
          </p>

          <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '180px' }} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="var(--border-subtle)" strokeDasharray="3,3" />
              <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="var(--border-subtle)" strokeDasharray="3,3" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="var(--border-subtle)" />

              {/* Area Fill */}
              <polygon points={areaSvgString} fill="url(#areaGradient)" />

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsSvgString}
              />

              {/* Data points */}
              {trendData.map((pt, i) => {
                const x = paddingX + (i / (trendData.length - 1)) * (svgWidth - 2 * paddingX);
                const y = svgHeight - paddingY - (pt.rate / 100) * (svgHeight - 2 * paddingY);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="#06b6d4" stroke="var(--bg-secondary)" strokeWidth="2" />
                    <text x={x} y={y - 9} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">
                      {pt.rate}%
                    </text>
                    <text x={x} y={svgHeight - 4} textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Leaderboard Grid */}
      <div className="analytics-grid">
        {/* Category Breakdown */}
        <div className="chart-card">
          <h3>
            <PieChart size={18} color="#ec4899" />
            <span>Category Distribution</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Breakdown of active habits across lifestyle domains.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryStats.map(item => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                    {item.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {item.count} habits ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-glass)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.percentage}%`,
                      background: item.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Leaderboard */}
        <div className="chart-card">
          <h3>
            <Award size={18} color="#f59e0b" />
            <span>Streak & Consistency Leaderboard</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Ranked by current active streak performance.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaderboard.slice(0, 5).map((entry, rank) => (
              <div
                key={entry.habit.id}
                style={{
                  background: 'var(--surface-glass)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px', flex: 1 }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: rank === 0 ? '#f59e0b' : rank === 1 ? '#94a3b8' : rank === 2 ? '#d97706' : 'var(--bg-tertiary)',
                      color: rank < 3 ? '#000000' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {rank + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.habit.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {entry.totalDone} total completions • {entry.rate}% consistency
                    </div>
                  </div>
                </div>

                <div className="streak-pill">
                  <Flame size={14} />
                  <span>{entry.currentStreak}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
