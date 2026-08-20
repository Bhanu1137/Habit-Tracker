/**
 * LocalStorage Data Management & Backup/Export Engine
 */
import { formatDate } from './streakEngine';

const HABITS_KEY = 'habitpulse_habits_v2';
const LOGS_KEY = 'habitpulse_logs_v2';
const THEME_KEY = 'habitpulse_theme_v2';
const SOUND_KEY = 'habitpulse_sound_v2';

/**
 * Generate initial demo dataset with rich history
 */
export function generateSeedData() {
  const today = new Date();

  const habits = [
    {
      id: 'habit-1',
      name: 'Drink 2.5L Water Daily',
      category: 'Health',
      frequency: 'Daily',
      priority: 'High',
      description: 'Stay hydrated throughout the day for mental clarity and physical energy.',
      target: '2.5 Liters',
      startDate: formatDate(new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)),
      status: 'active',
      createdAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'habit-2',
      name: 'Morning Workout / Calisthenics',
      category: 'Fitness',
      frequency: 'Daily',
      priority: 'High',
      description: '30-45 minutes workout session including push-ups, pull-ups, squats and stretching.',
      target: '45 Mins',
      startDate: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
      status: 'active',
      createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'habit-3',
      name: 'Deep Work Coding Session',
      category: 'Coding',
      frequency: 'Daily',
      priority: 'High',
      description: 'Focus on coding algorithms, side projects or open-source software with zero distractions.',
      target: '1 Hour',
      startDate: formatDate(new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000)),
      status: 'active',
      createdAt: new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'habit-4',
      name: 'Read 20 Pages of Tech / Psychology Book',
      category: 'Reading',
      frequency: 'Daily',
      priority: 'Medium',
      description: 'Expand knowledge through non-fiction books before going to bed.',
      target: '20 Pages',
      startDate: formatDate(new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000)),
      status: 'active',
      createdAt: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'habit-5',
      name: 'Mindful Meditation & Breathwork',
      category: 'Mindfulness',
      frequency: 'Daily',
      priority: 'Medium',
      description: '10 minutes of box breathing and seated mindfulness meditation.',
      target: '10 Mins',
      startDate: formatDate(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)),
      status: 'active',
      createdAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'habit-6',
      name: 'Weekly Goal & Architecture Review',
      category: 'Productivity',
      frequency: 'Weekly',
      priority: 'Medium',
      description: 'Review system design, roadmap milestones, and weekly habits audit.',
      target: '1 Session',
      startDate: formatDate(new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000)),
      status: 'active',
      createdAt: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Generate realistic completion logs for past 30 days
  const logs = [];
  let logIdCounter = 1;

  for (let i = 35; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);

    // Habit 1: Very consistent (90% completion, completed today)
    if (i === 0 || (i % 7 !== 4 && i % 11 !== 0)) {
      logs.push({
        id: `log-${logIdCounter++}`,
        habitId: 'habit-1',
        completionDate: dateStr,
        status: 'completed',
      });
    }

    // Habit 2: 6-day streak up to today
    if (i <= 6 || (i >= 10 && i <= 22)) {
      logs.push({
        id: `log-${logIdCounter++}`,
        habitId: 'habit-2',
        completionDate: dateStr,
        status: 'completed',
      });
    }

    // Habit 3: Coding - very strong streak (completed yesterday, pending today)
    if (i > 0 && i <= 14) {
      logs.push({
        id: `log-${logIdCounter++}`,
        habitId: 'habit-3',
        completionDate: dateStr,
        status: 'completed',
      });
    } else if (i > 16 && i <= 28) {
      logs.push({
        id: `log-${logIdCounter++}`,
        habitId: 'habit-3',
        completionDate: dateStr,
        status: 'completed',
      });
    }

    // Habit 4: Reading
    if (i % 2 === 0 && i <= 24) {
      logs.push({
        id: `log-${logIdCounter++}`,
        habitId: 'habit-4',
        completionDate: dateStr,
        status: 'completed',
      });
    }

    // Habit 5: Meditation
    if (i <= 4 || (i >= 8 && i <= 12)) {
      logs.push({
        id: `log-${logIdCounter++}`,
        habitId: 'habit-5',
        completionDate: dateStr,
        status: 'completed',
      });
    }

    // Habit 6: Weekly on Sundays
    if (d.getDay() === 0 && i <= 35) {
      logs.push({
        id: `log-${logIdCounter++}`,
        habitId: 'habit-6',
        completionDate: dateStr,
        status: 'completed',
      });
    }
  }

  return { habits, logs };
}

/**
 * Load habits from localStorage (or initialize with seed data)
 */
export function loadHabits() {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) {
      const seed = generateSeedData();
      saveHabits(seed.habits);
      saveLogs(seed.logs);
      return seed.habits;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading habits', e);
    return [];
  }
}

/**
 * Save habits to localStorage
 */
export function saveHabits(habits) {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits', e);
  }
}

/**
 * Load completion logs from localStorage
 */
export function loadLogs() {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      const seed = generateSeedData();
      saveHabits(seed.habits);
      saveLogs(seed.logs);
      return seed.logs;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading logs', e);
    return [];
  }
}

/**
 * Save logs to localStorage
 */
export function saveLogs(logs) {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs', e);
  }
}

/**
 * Get stored theme (dark or light)
 */
export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

/**
 * Save theme preference
 */
export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Get stored sound setting
 */
export function loadSoundSetting() {
  const v = localStorage.getItem(SOUND_KEY);
  return v === null ? true : v === 'true';
}

/**
 * Save sound setting
 */
export function saveSoundSetting(enabled) {
  localStorage.setItem(SOUND_KEY, String(enabled));
}

/**
 * Export data as JSON file download
 */
export function exportDataAsJSON(habits, logs) {
  const data = {
    app: 'HabitPulse',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    habits,
    logs,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habitpulse_backup_${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export logs as CSV file download
 */
export function exportLogsAsCSV(habits, logs) {
  const habitMap = {};
  habits.forEach(h => {
    habitMap[h.id] = h;
  });

  const headers = ['Log ID', 'Habit Name', 'Category', 'Priority', 'Frequency', 'Completion Date', 'Status'];
  const rows = logs.map(l => {
    const habit = habitMap[l.habitId] || { name: 'Unknown', category: 'N/A', priority: 'N/A', frequency: 'N/A' };
    return [
      `"${l.id}"`,
      `"${habit.name.replace(/"/g, '""')}"`,
      `"${habit.category}"`,
      `"${habit.priority}"`,
      `"${habit.frequency}"`,
      `"${l.completionDate}"`,
      `"${l.status}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habitpulse_history_${formatDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse JSON backup file
 */
export function parseJSONBackup(fileContent) {
  try {
    const data = JSON.parse(fileContent);
    if (!Array.isArray(data.habits) || !Array.isArray(data.logs)) {
      throw new Error('Invalid backup file structure: missing habits or logs array.');
    }
    return {
      habits: data.habits,
      logs: data.logs,
    };
  } catch (err) {
    throw new Error('Failed to parse backup JSON: ' + err.message);
  }
}
