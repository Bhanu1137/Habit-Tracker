"""
tests/test_statistics.py - Unit tests for streak engine and completion statistics.
"""

import sys
import os
import unittest
from datetime import date, timedelta

# Ensure root directory is on import path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import DatabaseManager
from models import Habit
from tracker import HabitTracker
from statistics import StatisticsManager


class TestStatistics(unittest.TestCase):
    """Test cases for streak calculation and analytical metrics."""

    def setUp(self):
        """Set up in-memory database."""
        self.db = DatabaseManager(":memory:")
        self.tracker = HabitTracker(self.db)
        self.stats = StatisticsManager(self.tracker)

    def test_current_streak_calculation(self):
        """Test accurate calculation of current streak for consecutive completed days."""
        today = date.today()
        start_date = today - timedelta(days=10)

        habit = Habit(name="Daily Workout", category="Fitness", start_date=start_date.isoformat())
        h_id = self.tracker.create_habit(habit)

        # Log completion for today, yesterday, 2 days ago, 3 days ago (4 consecutive days)
        for d in range(4):
            log_d = today - timedelta(days=d)
            self.db.log_completion(h_id, log_d.isoformat())

        current_streak = self.tracker.calculate_current_streak(h_id, ref_date=today)
        self.assertEqual(current_streak, 4)

    def test_current_streak_active_yesterday(self):
        """Test current streak remains active if yesterday was completed but today is not completed yet."""
        today = date.today()
        start_date = today - timedelta(days=10)

        habit = Habit(name="Read Docs", category="Education", start_date=start_date.isoformat())
        h_id = self.tracker.create_habit(habit)

        # Log completion for yesterday, 2 days ago, 3 days ago (3 consecutive days)
        for d in [1, 2, 3]:
            log_d = today - timedelta(days=d)
            self.db.log_completion(h_id, log_d.isoformat())

        # Today is not completed yet
        current_streak = self.tracker.calculate_current_streak(h_id, ref_date=today)
        self.assertEqual(current_streak, 3)

    def test_streak_broken_by_missed_days(self):
        """Test that missing a day resets current streak to 0."""
        today = date.today()
        start_date = today - timedelta(days=10)

        habit = Habit(name="Journaling", category="Personal Growth", start_date=start_date.isoformat())
        h_id = self.tracker.create_habit(habit)

        # Log completion for 3 days ago and 4 days ago (missed yesterday and today)
        self.db.log_completion(h_id, (today - timedelta(days=3)).isoformat())
        self.db.log_completion(h_id, (today - timedelta(days=4)).isoformat())

        current_streak = self.tracker.calculate_current_streak(h_id, ref_date=today)
        self.assertEqual(current_streak, 0)

    def test_longest_streak_calculation(self):
        """Test calculation of longest historical streak."""
        today = date.today()
        start_date = today - timedelta(days=20)

        habit = Habit(name="Study Python", category="Coding", start_date=start_date.isoformat())
        h_id = self.tracker.create_habit(habit)

        # Historic streak 1: 5 consecutive days (days 15..11 ago)
        for d in range(11, 16):
            self.db.log_completion(h_id, (today - timedelta(days=d)).isoformat())

        # Current streak: 3 consecutive days (days 2..0 ago)
        for d in range(0, 3):
            self.db.log_completion(h_id, (today - timedelta(days=d)).isoformat())

        current_streak = self.tracker.calculate_current_streak(h_id, ref_date=today)
        longest_streak = self.tracker.calculate_longest_streak(h_id)

        self.assertEqual(current_streak, 3)
        self.assertEqual(longest_streak, 5)

    def test_completion_percentage(self):
        """Test calculation of habit completion percentage."""
        today = date.today()
        start_date = today - timedelta(days=9)  # 10 days total including today

        habit = Habit(name="Hydration", category="Health", start_date=start_date.isoformat())
        h_id = self.tracker.create_habit(habit)

        # Complete 5 days out of 10
        for d in [0, 2, 4, 6, 8]:
            self.db.log_completion(h_id, (today - timedelta(days=d)).isoformat())

        rate = self.tracker.calculate_completion_percentage(h_id, ref_date=today)
        self.assertEqual(rate, 50.0)

    def test_statistics_manager_aggregations(self):
        """Test summary statistics compiled by StatisticsManager."""
        habit1 = Habit(name="H1", category="Fitness")
        habit2 = Habit(name="H2", category="Coding")
        self.tracker.create_habit(habit1)
        self.tracker.create_habit(habit2)

        summary = self.stats.get_overall_summary_stats()
        self.assertEqual(summary["total_habits"], 2)
        self.assertEqual(summary["active_habits_count"], 2)

        days, counts = self.stats.get_weekly_completion_data()
        self.assertEqual(len(days), 7)
        self.assertEqual(len(counts), 7)


if __name__ == "__main__":
    unittest.main()
