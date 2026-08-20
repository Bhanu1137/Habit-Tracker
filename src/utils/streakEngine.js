/**
 * Intelligent Streak & Analytics Engine
 * Provides accurate daily & weekly streak metrics, completion rates, and heatmap data.
 */

/**
 * Format Date object to YYYY-MM-DD string
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string to local Date at midnight
 */
export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get ISO week number and year
 */
export function getIsoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Calculate Current Streak (consecutive completed days or weeks)
 */
export function calculateCurrentStreak(habit, logs, refDate = new Date()) {
  const habitLogs = logs.filter(l => l.habitId === habit.id && l.status === 'completed');
  if (habitLogs.length === 0) return 0;

  const completedDates = new Set(habitLogs.map(l => l.completionDate));
  const todayStr = formatDate(refDate);

  if (habit.frequency === 'Weekly') {
    return calculateWeeklyCurrentStreak(completedDates, refDate);
  }

  // Daily / Weekday / Weekend frequency
  let checkDate = new Date(refDate);
  let checkStr = formatDate(checkDate);

  // If today is not completed, check if yesterday was completed
  if (!completedDates.has(checkStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = formatDate(checkDate);
    if (!completedDates.has(checkStr)) {
      return 0;
    }
  }

  let streak = 0;
  while (completedDates.has(checkStr)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkStr = formatDate(checkDate);
  }

  return streak;
}

/**
 * Calculate Weekly Current Streak
 */
function calculateWeeklyCurrentStreak(completedDates, refDate) {
  const completedWeeks = new Set(
    Array.from(completedDates).map(dateStr => getIsoWeek(parseDate(dateStr)))
  );

  let checkDate = new Date(refDate);
  let checkWeek = getIsoWeek(checkDate);

  if (!completedWeeks.has(checkWeek)) {
    checkDate.setDate(checkDate.getDate() - 7);
    checkWeek = getIsoWeek(checkDate);
    if (!completedWeeks.has(checkWeek)) {
      return 0;
    }
  }

  let streak = 0;
  while (completedWeeks.has(checkWeek)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 7);
    checkWeek = getIsoWeek(checkDate);
  }

  return streak;
}

/**
 * Calculate Longest Historical Streak
 */
export function calculateLongestStreak(habit, logs) {
  const habitLogs = logs.filter(l => l.habitId === habit.id && l.status === 'completed');
  if (habitLogs.length === 0) return 0;

  const dates = Array.from(new Set(habitLogs.map(l => l.completionDate))).sort();

  if (habit.frequency === 'Weekly') {
    const weeks = Array.from(new Set(dates.map(d => getIsoWeek(parseDate(d))))).sort();
    if (weeks.length === 0) return 0;
    let longest = 1;
    let current = 1;
    for (let i = 1; i < weeks.length; i++) {
      // Calculate week differences
      const prevDate = parseWeekStringToDate(weeks[i - 1]);
      const currDate = parseWeekStringToDate(weeks[i]);
      const diffWeeks = Math.round((currDate - prevDate) / (7 * 24 * 60 * 60 * 1000));
      if (diffWeeks === 1) {
        current++;
      } else if (diffWeeks > 1) {
        current = 1;
      }
      longest = Math.max(longest, current);
    }
    return longest;
  }

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseDate(dates[i - 1]);
    const curr = parseDate(dates[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
    } else if (diffDays > 1) {
      current = 1;
    }
    longest = Math.max(longest, current);
  }

  return longest;
}

function parseWeekStringToDate(weekStr) {
  const [yearStr, wNum] = weekStr.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(wNum, 10);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

/**
 * Calculate Completion Percentage from start_date to today
 */
export function calculateCompletionPercentage(habit, logs, refDate = new Date()) {
  const habitLogs = logs.filter(l => l.habitId === habit.id && l.status === 'completed');
  if (habitLogs.length === 0) return 0;

  const startDate = parseDate(habit.startDate);
  const ref = new Date(refDate);

  if (startDate > ref) return 0;

  const diffTime = Math.abs(ref - startDate);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (totalDays <= 0) return 0;

  const completedSet = new Set(habitLogs.map(l => l.completionDate));
  const completedCount = Array.from(completedSet).filter(d => {
    const dt = parseDate(d);
    return dt >= startDate && dt <= ref;
  }).length;

  const percentage = (completedCount / totalDays) * 100;
  return Math.min(100, Math.round(percentage * 10) / 10);
}

/**
 * Generate 90-day activity matrix data for GitHub-style heatmap
 */
export function getHeatmapGridData(habitId, logs, totalDays = 90) {
  const relevantLogs = habitId
    ? logs.filter(l => l.habitId === habitId && l.status === 'completed')
    : logs.filter(l => l.status === 'completed');

  // Count completions by date
  const dateCounts = {};
  relevantLogs.forEach(log => {
    dateCounts[log.completionDate] = (dateCounts[log.completionDate] || 0) + 1;
  });

  const cells = [];
  const today = new Date();

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const count = dateCounts[dateStr] || 0;

    // Intensity level from 0 to 4
    let level = 0;
    if (habitId) {
      level = count > 0 ? 4 : 0;
    } else {
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;
    }

    cells.push({
      date: dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayOfWeek: d.getDay(),
      count,
      level,
    });
  }

  return cells;
}

/**
 * Calculate Summary Stats for Dashboard
 */
export function calculateDashboardSummary(habits, logs) {
  const activeHabits = habits.filter(h => h.status === 'active');
  const todayStr = formatDate(new Date());
  
  const todayCompletedLogs = logs.filter(l => l.completionDate === todayStr && l.status === 'completed');
  const todayCompletedSet = new Set(todayCompletedLogs.map(l => l.habitId));

  const completedTodayCount = activeHabits.filter(h => todayCompletedSet.has(h.id)).length;
  const pendingTodayCount = activeHabits.length - completedTodayCount;

  let bestCurrentStreak = 0;
  let bestLongestStreak = 0;
  const rates = [];

  activeHabits.forEach(h => {
    const cStreak = calculateCurrentStreak(h, logs);
    const lStreak = calculateLongestStreak(h, logs);
    const rate = calculateCompletionPercentage(h, logs);

    if (cStreak > bestCurrentStreak) bestCurrentStreak = cStreak;
    if (lStreak > bestLongestStreak) bestLongestStreak = lStreak;
    rates.push(rate);
  });

  const overallRate = rates.length > 0
    ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10
    : 0;

  return {
    totalActive: activeHabits.length,
    completedToday: completedTodayCount,
    pendingToday: pendingTodayCount,
    completionPercentageToday: activeHabits.length > 0
      ? Math.round((completedTodayCount / activeHabits.length) * 100)
      : 0,
    bestCurrentStreak,
    bestLongestStreak,
    overallRate,
  };
}
