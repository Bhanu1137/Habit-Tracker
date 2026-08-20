"""
tests/test_habits.py - Unit tests for Habit CRUD and completion operations.
"""

import sys
import os
import unittest
from datetime import date

# Ensure root directory is on import path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import DatabaseManager
from models import Habit
from tracker import HabitTracker


class TestHabits(unittest.TestCase):
    """Test cases for habit CRUD and completion logging."""

    def setUp(self):
        """Set up in-memory SQLite database for isolated test runs."""
        self.db = DatabaseManager(":memory:")
        self.tracker = HabitTracker(self.db)

    def test_add_habit(self):
        """Test adding a habit."""
        habit = Habit(
            name="Morning Yoga",
            category="Fitness",
            frequency="Daily",
            priority="High",
            description="15 minutes stretching"
        )
        habit_id = self.tracker.create_habit(habit)
        self.assertIsNotNone(habit_id)

        retrieved = self.tracker.get_habit(habit_id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.name, "Morning Yoga")
        self.assertEqual(retrieved.category, "Fitness")
        self.assertEqual(retrieved.status, "active")

    def test_update_habit(self):
        """Test editing habit details."""
        habit = Habit(name="Read Book", category="Reading")
        habit_id = self.tracker.create_habit(habit)

        habit.name = "Read 20 Pages"
        habit.priority = "High"
        updated = self.tracker.update_habit(habit)
        self.assertTrue(updated)

        retrieved = self.tracker.get_habit(habit_id)
        self.assertEqual(retrieved.name, "Read 20 Pages")
        self.assertEqual(retrieved.priority, "High")

    def test_delete_habit(self):
        """Test deleting a habit."""
        habit = Habit(name="Temporary Habit", category="Other")
        habit_id = self.tracker.create_habit(habit)
        self.assertIsNotNone(self.tracker.get_habit(habit_id))

        deleted = self.tracker.delete_habit(habit_id)
        self.assertTrue(deleted)
        self.assertIsNone(self.tracker.get_habit(habit_id))

    def test_toggle_habit_status(self):
        """Test toggling habit status between active and inactive."""
        habit = Habit(name="Meditation", category="Health")
        habit_id = self.tracker.create_habit(habit)

        new_status = self.tracker.toggle_habit_status(habit_id)
        self.assertEqual(new_status, "inactive")
        self.assertEqual(self.tracker.get_habit(habit_id).status, "inactive")

        new_status = self.tracker.toggle_habit_status(habit_id)
        self.assertEqual(new_status, "active")

    def test_complete_habit_and_prevent_duplicates(self):
        """Test logging completion and ensuring duplicate logs are ignored/prevented."""
        habit = Habit(name="Drink Water", category="Health")
        habit_id = self.tracker.create_habit(habit)

        today_str = date.today().isoformat()
        res1 = self.db.log_completion(habit_id, today_str)
        self.assertTrue(res1)

        # Attempting duplicate log on same date should return False (or ignore cleanly)
        res2 = self.db.log_completion(habit_id, today_str)
        self.assertFalse(res2)

        logs = self.db.get_logs_for_habit(habit_id)
        self.assertEqual(len(logs), 1)
        self.assertTrue(self.tracker.is_completed_today(habit_id))

    def test_undo_completion(self):
        """Test undoing completion for today."""
        habit = Habit(name="Coding Practice", category="Coding")
        habit_id = self.tracker.create_habit(habit)

        self.tracker.complete_habit_today(habit_id)
        self.assertTrue(self.tracker.is_completed_today(habit_id))

        self.tracker.undo_habit_today(habit_id)
        self.assertFalse(self.tracker.is_completed_today(habit_id))


if __name__ == "__main__":
    unittest.main()
