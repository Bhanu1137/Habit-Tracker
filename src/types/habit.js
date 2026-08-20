/**
 * Habit Data Models and Constant Definitions
 */

export const CATEGORIES = [
  { id: 'Health', name: 'Health & Wellness', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: 'Heart' },
  { id: 'Fitness', name: 'Fitness & Sport', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: 'Dumbbell' },
  { id: 'Coding', name: 'Coding & Tech', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', icon: 'Code' },
  { id: 'Reading', name: 'Reading & Learning', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', icon: 'BookOpen' },
  { id: 'Education', name: 'Education & Study', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: 'GraduationCap' },
  { id: 'Personal Growth', name: 'Personal Growth', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', icon: 'Sparkles' },
  { id: 'Mindfulness', name: 'Mindfulness & Meditation', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', icon: 'Sun' },
  { id: 'Productivity', name: 'Productivity & Work', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', icon: 'Zap' },
  { id: 'Other', name: 'Other Habits', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', icon: 'Tag' },
];

export const PRIORITIES = [
  { id: 'High', name: 'High Priority', color: '#ef4444', badgeClass: 'priority-high' },
  { id: 'Medium', name: 'Medium Priority', color: '#f59e0b', badgeClass: 'priority-medium' },
  { id: 'Low', name: 'Low Priority', color: '#10b981', badgeClass: 'priority-low' },
];

export const FREQUENCIES = [
  { id: 'Daily', name: 'Every Day', desc: 'Repeat every day' },
  { id: 'Weekly', name: 'Weekly Target', desc: 'At least once per week' },
  { id: 'Weekdays', name: 'Weekdays Only', desc: 'Monday to Friday' },
  { id: 'Weekends', name: 'Weekends Only', desc: 'Saturday and Sunday' },
];

export const HABIT_TEMPLATES = [
  {
    name: 'Morning Hydration (1L Water)',
    category: 'Health',
    frequency: 'Daily',
    priority: 'High',
    description: 'Drink 1 liter of fresh water right after waking up to kickstart metabolism.',
    target: '1 Liter',
  },
  {
    name: '30-Minute Gym Workout',
    category: 'Fitness',
    frequency: 'Daily',
    priority: 'High',
    description: 'Complete resistance training or cardio workout session.',
    target: '30 Mins',
  },
  {
    name: 'Daily LeetCode / Coding Practice',
    category: 'Coding',
    frequency: 'Daily',
    priority: 'High',
    description: 'Solve 1-2 algorithm problems or push commit to GitHub projects.',
    target: '1 Problem',
  },
  {
    name: 'Read 20 Pages of Non-Fiction',
    category: 'Reading',
    frequency: 'Daily',
    priority: 'Medium',
    description: 'Read insightful books on technology, psychology, or personal mastery.',
    target: '20 Pages',
  },
  {
    name: '10-Minute Vipassana Meditation',
    category: 'Mindfulness',
    frequency: 'Daily',
    priority: 'Medium',
    description: 'Sit in stillness, focus on mindful breath, and reduce stress.',
    target: '10 Mins',
  },
  {
    name: 'Weekly Deep Work Project Review',
    category: 'Productivity',
    frequency: 'Weekly',
    priority: 'Medium',
    description: 'Review weekly progress, plan upcoming sprints, and clear backlog.',
    target: '1 Review',
  },
];
