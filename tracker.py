"""
tracker.py - Core business logic and streak engine for Habit Tracker.
Handles streak calculations, completion percentages, and dashboard summaries.
"""

from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from database import DatabaseManager
from models import Habit, HabitLog


class HabitTracker:
    """Manages business logic, streak calculation, and summary aggregations."""

    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db = db_manager or DatabaseManager()

    # --- Habit Management Wrappers ---

    def create_habit(self, habit: Habit) -> int:
        """Create and validate a new habit."""
        return self.db.add_habit(habit)

    def get_habit(self, habit_id: int) -> Optional[Habit]:
        """Retrieve a habit by ID."""
        return self.db.get_habit(habit_id)

    def get_all_habits(self, status_filter: Optional[str] = None, search_query: Optional[str] = None, category_filter: Optional[str] = None) -> List[Habit]:
        """Fetch all habits matching optional filters."""
        return self.db.get_all_habits(status_filter, search_query, category_filter)

    def update_habit(self, habit: Habit) -> bool:
        """Update habit properties."""
        return self.db.update_habit(habit)

    def delete_habit(self, habit_id: int) -> bool:
        """Delete a habit and all associated logs."""
        return self.db.delete_habit(habit_id)

    def toggle_habit_status(self, habit_id: int) -> str:
        """Toggle active/inactive status."""
        return self.db.toggle_habit_status(habit_id)

    # --- Completion Logging ---

    def complete_habit_today(self, habit_id: int) -> bool:
        """Mark a habit as completed for today's date."""
        today_str = date.today().isoformat()
        return self.db.log_completion(habit_id, today_str)

    def undo_habit_today(self, habit_id: int) -> bool:
        """Undo completion for today's date."""
        today_str = date.today().isoformat()
        return self.db.undo_completion(habit_id, today_str)

    def toggle_today_completion(self, habit_id: int) -> bool:
        """Toggle completion state for today's date."""
        today_str = date.today().isoformat()
        if self.db.is_completed_on_date(habit_id, today_str):
            self.db.undo_completion(habit_id, today_str)
            return False
        else:
            self.db.log_completion(habit_id, today_str)
            return True

    def is_completed_today(self, habit_id: int) -> bool:
        """Check if habit is completed for today."""
        today_str = date.today().isoformat()
        return self.db.is_completed_on_date(habit_id, today_str)

    # --- Streak Calculation Engine ---

    def calculate_current_streak(self, habit_id: int, ref_date: Optional[date] = None) -> int:
        """
        Calculate current streak of consecutive completed days/weeks.
        If ref_date is not provided, defaults to date.today().
        """
        if ref_date is None:
            ref_date = date.today()

        habit = self.db.get_habit(habit_id)
        if not habit:
            return 0

        logs = self.db.get_logs_for_habit(habit_id)
        if not logs:
            return 0

        completed_dates = {date.fromisoformat(log.completion_date) for log in logs if log.status == "completed"}
        if not completed_dates:
            return 0

        if habit.frequency == "Weekly":
            return self._calculate_weekly_current_streak(completed_dates, ref_date)

        # Daily frequency calculation
        # If ref_date is completed, start from ref_date.
        # If ref_date is NOT completed, check if yesterday was completed to keep current streak active.
        check_date = ref_date
        if check_date not in completed_dates:
            check_date = ref_date - timedelta(days=1)
            if check_date not in completed_dates:
                return 0

        streak = 0
        while check_date in completed_dates:
            streak += 1
            check_date -= timedelta(days=1)

        return streak

    def calculate_longest_streak(self, habit_id: int) -> int:
        """
        Calculate longest historical streak of consecutive completed days/weeks.
        """
        habit = self.db.get_habit(habit_id)
        if not habit:
            return 0

        logs = self.db.get_logs_for_habit(habit_id)
        if not logs:
            return 0

        completed_dates = sorted(list({date.fromisoformat(log.completion_date) for log in logs if log.status == "completed"}))
        if not completed_dates:
            return 0

        if habit.frequency == "Weekly":
            return self._calculate_weekly_longest_streak(completed_dates)

        # Daily frequency
        longest = 1
        current = 1
        for i in range(1, len(completed_dates)):
            diff = (completed_dates[i] - completed_dates[i - 1]).days
            if diff == 1:
                current += 1
            elif diff > 1:
                current = 1
            longest = max(longest, current)

        return longest

    def _calculate_weekly_current_streak(self, completed_dates: set, ref_date: date) -> int:
        """Calculate current consecutive weekly completions."""
        # Convert date to (iso_year, iso_week)
        completed_weeks = {d.isocalendar()[:2] for d in completed_dates}
        
        current_year, current_week, _ = ref_date.isocalendar()
        check_year, check_week = current_year, current_week
        
        if (check_year, check_week) not in completed_weeks:
            # Check previous week
            prev_date = ref_date - timedelta(weeks=1)
            check_year, check_week, _ = prev_date.isocalendar()
            if (check_year, check_week) not in completed_weeks:
                return 0

        streak = 0
        curr_d = date.fromisocalendar(check_year, check_week, 1)
        while (curr_d.isocalendar()[0], curr_d.isocalendar()[1]) in completed_weeks:
            streak += 1
            curr_d -= timedelta(weeks=1)

        return streak

    def _calculate_weekly_longest_streak(self, sorted_dates: List[date]) -> int:
        """Calculate longest historical consecutive weekly completions."""
        weeks = sorted(list({d.isocalendar()[:2] for d in sorted_dates}))
        if not weeks:
            return 0

        longest = 1
        current = 1
        for i in range(1, len(weeks)):
            prev_year, prev_w = weeks[i - 1]
            curr_year, curr_w = weeks[i]
            
            prev_d = date.fromisocalendar(prev_year, prev_w, 1)
            curr_d = date.fromisocalendar(curr_year, curr_w, 1)
            
            if (curr_d - prev_d).days == 7:
                current += 1
            else:
                current = 1
            longest = max(longest, current)

        return longest

    def calculate_completion_percentage(self, habit_id: int, ref_date: Optional[date] = None) -> float:
        """
        Calculate completion percentage for a habit from start date to ref_date (default today).
        """
        if ref_date is None:
            ref_date = date.today()

        habit = self.db.get_habit(habit_id)
        if not habit:
            return 0.0

        try:
            start_d = date.fromisoformat(habit.start_date)
        except ValueError:
            start_d = ref_date

        if start_d > ref_date:
            return 0.0

        total_days = (ref_date - start_d).days + 1
        if total_days <= 0:
            return 0.0

        logs = self.db.get_logs_for_habit(habit_id)
        completed_count = sum(1 for log in logs if log.status == "completed" and date.fromisoformat(log.completion_date) <= ref_date)

        rate = (completed_count / total_days) * 100.0
        return round(min(100.0, rate), 1)

    # --- Dashboard Summary ---

    def get_dashboard_summary(self) -> Dict[str, Any]:
        """Compile high-level summary stats for dashboard view."""
        today_str = date.today().isoformat()
        active_habits = self.db.get_all_habits(status_filter="active")

        total_habits = len(active_habits)
        completed_today = 0
        current_streaks = []
        longest_streaks = []
        rates = []

        for habit in active_habits:
            if habit.id is None:
                continue

            is_done = self.db.is_completed_on_date(habit.id, today_str)
            if is_done:
                completed_today += 1

            c_streak = self.calculate_current_streak(habit.id)
            l_streak = self.calculate_longest_streak(habit.id)
            c_rate = self.calculate_completion_percentage(habit.id)

            current_streaks.append(c_streak)
            longest_streaks.append(l_streak)
            rates.append(c_rate)

        pending_today = total_habits - completed_today
        best_current_streak = max(current_streaks) if current_streaks else 0
        best_longest_streak = max(longest_streaks) if longest_streaks else 0
        overall_percentage = round(sum(rates) / len(rates), 1) if rates else 0.0

        return {
            "today_date": date.today().strftime("%A, %B %d, %Y"),
            "total_habits": total_habits,
            "completed_today": completed_today,
            "pending_today": pending_today,
            "best_current_streak": best_current_streak,
            "best_longest_streak": best_longest_streak,
            "overall_completion_percentage": overall_percentage,
            "active_habits": active_habits
        }
