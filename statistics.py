"""
statistics.py - Statistics calculations and data aggregation for charts and views.
"""

from datetime import date, timedelta
from typing import Dict, List, Any, Tuple
from tracker import HabitTracker


class StatisticsManager:
    """Computes analytical metrics, chart series, and category breakdowns."""

    def __init__(self, tracker: HabitTracker):
        self.tracker = tracker
        self.db = tracker.db

    def get_weekly_completion_data(self) -> Tuple[List[str], List[int]]:
        """
        Get habit completion count for each of the last 7 days.
        Returns (list_of_day_labels, list_of_completed_counts).
        """
        today = date.today()
        day_labels = []
        counts = []

        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            d_str = d.isoformat()
            day_label = d.strftime("%a (%b %d)")
            day_labels.append(day_label)

            # Count completed logs on date d
            with self.db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT COUNT(*) FROM habit_logs WHERE completion_date = ? AND status = 'completed'",
                    (d_str,)
                )
                count = cursor.fetchone()[0]
                counts.append(count)

        return day_labels, counts

    def get_monthly_progress_data(self) -> Tuple[List[str], List[float]]:
        """
        Get overall completion percentage for the last 30 days broken into 5-day intervals.
        Returns (interval_labels, completion_rates).
        """
        today = date.today()
        labels = []
        rates = []
        active_habits = self.db.get_all_habits(status_filter="active")

        if not active_habits:
            return ["Day -25", "Day -20", "Day -15", "Day -10", "Day -5", "Today"], [0, 0, 0, 0, 0, 0]

        for step in [25, 20, 15, 10, 5, 0]:
            d = today - timedelta(days=step)
            label = "Today" if step == 0 else d.strftime("%b %d")
            labels.append(label)

            step_rates = []
            for habit in active_habits:
                if habit.id is not None:
                    step_rates.append(self.tracker.calculate_completion_percentage(habit.id, ref_date=d))
            avg_rate = round(sum(step_rates) / len(step_rates), 1) if step_rates else 0.0
            rates.append(avg_rate)

        return labels, rates

    def get_category_comparison_data(self) -> Tuple[List[str], List[int]]:
        """
        Get habit distribution across categories.
        Returns (categories, habit_counts).
        """
        categories = ["Education", "Fitness", "Health", "Coding", "Reading", "Personal Growth", "Other"]
        counts = []

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            for cat in categories:
                cursor.execute("SELECT COUNT(*) FROM habits WHERE category = ?", (cat,))
                count = cursor.fetchone()[0]
                counts.append(count)

        # Filter out categories with zero habits if any exist, or keep all non-zero
        filtered = [(cat, cnt) for cat, cnt in zip(categories, counts) if cnt > 0]
        if not filtered:
            return ["No Habits"], [0]

        return [f[0] for f in filtered], [f[1] for f in filtered]

    def get_overall_summary_stats(self) -> Dict[str, Any]:
        """
        Compile full statistics metrics summary.
        """
        all_habits = self.db.get_all_habits()
        active_habits = [h for h in all_habits if h.status == "active"]

        total_completed_logs = 0
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM habit_logs WHERE status = 'completed'")
            total_completed_logs = cursor.fetchone()[0]

        best_current_streak = 0
        best_longest_streak = 0
        current_streak_habit = None
        longest_streak_habit = None

        habit_stats_list = []

        for h in active_habits:
            if h.id is None:
                continue
            c_streak = self.tracker.calculate_current_streak(h.id)
            l_streak = self.tracker.calculate_longest_streak(h.id)
            rate = self.tracker.calculate_completion_percentage(h.id)

            if c_streak > best_current_streak:
                best_current_streak = c_streak
                current_streak_habit = h.name

            if l_streak > best_longest_streak:
                best_longest_streak = l_streak
                longest_streak_habit = h.name

            habit_stats_list.append({
                "habit": h,
                "current_streak": c_streak,
                "longest_streak": l_streak,
                "completion_rate": rate
            })

        avg_completion_rate = (
            round(sum(item["completion_rate"] for item in habit_stats_list) / len(habit_stats_list), 1)
            if habit_stats_list else 0.0
        )

        return {
            "total_habits": len(all_habits),
            "active_habits_count": len(active_habits),
            "total_completed_logs": total_completed_logs,
            "best_current_streak": best_current_streak,
            "best_current_streak_habit": current_streak_habit or "N/A",
            "best_longest_streak": best_longest_streak,
            "best_longest_streak_habit": longest_streak_habit or "N/A",
            "overall_completion_rate": avg_completion_rate,
            "habit_details": habit_stats_list
        }
