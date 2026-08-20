"""
database.py - Database manager for Habit Tracker.
Handles SQLite connection, schema creation, and parameterized CRUD operations.
"""

import sqlite3
from pathlib import Path
from typing import List, Optional, Tuple
from models import Habit, HabitLog


class DatabaseManager:
    """Manages SQLite database connections and table operations."""

    def __init__(self, db_path: Optional[str] = None):
        self._mem_conn: Optional[sqlite3.Connection] = None
        if db_path is None:
            # Default database location in data/habits.db relative to project root
            base_dir = Path(__file__).parent.resolve()
            data_dir = base_dir / "data"
            data_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = str(data_dir / "habits.db")
        else:
            self.db_path = db_path

        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        """Create and return a database connection with foreign keys enabled."""
        if self.db_path == ":memory:":
            if self._mem_conn is None:
                self._mem_conn = sqlite3.connect(":memory:", check_same_thread=False)
                self._mem_conn.execute("PRAGMA foreign_keys = ON;")
            return self._mem_conn
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_db(self):
        """Create database tables if they do not exist."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Create habits table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS habits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    category TEXT NOT NULL,
                    frequency TEXT NOT NULL DEFAULT 'Daily',
                    priority TEXT NOT NULL DEFAULT 'Medium',
                    start_date TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    created_at TEXT NOT NULL
                );
            """)

            # Create habit_logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS habit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    habit_id INTEGER NOT NULL,
                    completion_date TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'completed',
                    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
                    UNIQUE(habit_id, completion_date)
                );
            """)
            conn.commit()

    # --- Habit CRUD ---

    def add_habit(self, habit: Habit) -> int:
        """Insert a new habit into the database."""
        query = """
            INSERT INTO habits (name, description, category, frequency, priority, start_date, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (
                habit.name.strip(),
                habit.description.strip(),
                habit.category,
                habit.frequency,
                habit.priority,
                habit.start_date,
                habit.status,
                habit.created_at
            ))
            conn.commit()
            habit.id = cursor.lastrowid
            return habit.id

    def get_habit(self, habit_id: int) -> Optional[Habit]:
        """Fetch a single habit by ID."""
        query = "SELECT id, name, description, category, frequency, priority, start_date, status, created_at FROM habits WHERE id = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (habit_id,))
            row = cursor.fetchone()
            if row:
                return Habit.from_row(row)
            return None

    def get_all_habits(self, status_filter: Optional[str] = None, search_query: Optional[str] = None, category_filter: Optional[str] = None) -> List[Habit]:
        """Fetch habits matching filters."""
        query = "SELECT id, name, description, category, frequency, priority, start_date, status, created_at FROM habits WHERE 1=1"
        params: List[object] = []

        if status_filter:
            query += " AND status = ?"
            params.append(status_filter)

        if category_filter and category_filter != "All":
            query += " AND category = ?"
            params.append(category_filter)

        if search_query:
            query += " AND (name LIKE ? OR description LIKE ?)"
            term = f"%{search_query.strip()}%"
            params.extend([term, term])

        query += " ORDER BY status ASC, priority DESC, id DESC"

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [Habit.from_row(row) for row in rows]

    def update_habit(self, habit: Habit) -> bool:
        """Update existing habit details."""
        if habit.id is None:
            raise ValueError("Cannot update habit without an ID.")
        query = """
            UPDATE habits
            SET name = ?, description = ?, category = ?, frequency = ?, priority = ?, start_date = ?, status = ?
            WHERE id = ?
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (
                habit.name.strip(),
                habit.description.strip(),
                habit.category,
                habit.frequency,
                habit.priority,
                habit.start_date,
                habit.status,
                habit.id
            ))
            conn.commit()
            return cursor.rowcount > 0

    def delete_habit(self, habit_id: int) -> bool:
        """Delete a habit and associated logs (via foreign key CASCADE)."""
        query = "DELETE FROM habits WHERE id = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (habit_id,))
            conn.commit()
            return cursor.rowcount > 0

    def toggle_habit_status(self, habit_id: int) -> str:
        """Toggle status between active and inactive."""
        habit = self.get_habit(habit_id)
        if not habit:
            raise ValueError("Habit not found.")
        new_status = "inactive" if habit.status == "active" else "active"
        habit.status = new_status
        self.update_habit(habit)
        return new_status

    # --- Habit Logs CRUD ---

    def log_completion(self, habit_id: int, completion_date: str, status: str = "completed") -> bool:
        """Record completion for a habit on a specific date. Ignores duplicates safely."""
        query = """
            INSERT OR IGNORE INTO habit_logs (habit_id, completion_date, status)
            VALUES (?, ?, ?)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (habit_id, completion_date, status))
            conn.commit()
            return cursor.rowcount > 0

    def undo_completion(self, habit_id: int, completion_date: str) -> bool:
        """Remove a completion log for a specific habit and date."""
        query = "DELETE FROM habit_logs WHERE habit_id = ? AND completion_date = ?"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (habit_id, completion_date))
            conn.commit()
            return cursor.rowcount > 0

    def is_completed_on_date(self, habit_id: int, completion_date: str) -> bool:
        """Check if a habit was completed on a given date."""
        query = "SELECT COUNT(*) FROM habit_logs WHERE habit_id = ? AND completion_date = ? AND status = 'completed'"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (habit_id, completion_date))
            return cursor.fetchone()[0] > 0

    def get_logs_for_habit(self, habit_id: int) -> List[HabitLog]:
        """Get all completion logs for a habit sorted by date ascending."""
        query = "SELECT id, habit_id, completion_date, status FROM habit_logs WHERE habit_id = ? ORDER BY completion_date ASC"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (habit_id,))
            rows = cursor.fetchall()
            return [HabitLog.from_row(row) for row in rows]

    def get_all_logs(self) -> List[HabitLog]:
        """Get all completion logs in system."""
        query = "SELECT id, habit_id, completion_date, status FROM habit_logs ORDER BY completion_date ASC"
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            return [HabitLog.from_row(row) for row in rows]
