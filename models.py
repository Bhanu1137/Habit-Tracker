"""
models.py - Data models for Habit Tracker.
Defines Habit and HabitLog classes.
"""

from dataclasses import dataclass
from datetime import datetime, date
from typing import Optional, Dict, Any


@dataclass
class Habit:
    """Represents a user habit."""
    name: str
    category: str
    frequency: str = "Daily"
    priority: str = "Medium"
    description: str = ""
    start_date: Optional[str] = None
    status: str = "active"
    id: Optional[int] = None
    created_at: Optional[str] = None

    def __post_init__(self):
        if self.start_date is None:
            self.start_date = date.today().isoformat()
        if self.created_at is None:
            self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if not self.name or not self.name.strip():
            raise ValueError("Habit name cannot be empty.")

    def to_dict(self) -> Dict[str, Any]:
        """Convert habit object to dictionary."""
        return {
            "id": self.id,
            "name": self.name.strip(),
            "description": self.description.strip(),
            "category": self.category,
            "frequency": self.frequency,
            "priority": self.priority,
            "start_date": self.start_date,
            "status": self.status,
            "created_at": self.created_at,
        }

    @classmethod
    def from_row(cls, row: tuple) -> "Habit":
        """Construct a Habit object from a database tuple row."""
        # Row order: id, name, description, category, frequency, priority, start_date, status, created_at
        return cls(
            id=row[0],
            name=row[1],
            description=row[2] or "",
            category=row[3],
            frequency=row[4],
            priority=row[5],
            start_date=row[6],
            status=row[7],
            created_at=row[8],
        )


@dataclass
class HabitLog:
    """Represents a completion record for a habit."""
    habit_id: int
    completion_date: str
    status: str = "completed"
    id: Optional[int] = None

    def __post_init__(self):
        if not self.completion_date:
            self.completion_date = date.today().isoformat()

    @classmethod
    def from_row(cls, row: tuple) -> "HabitLog":
        """Construct a HabitLog object from a database tuple row."""
        # Row order: id, habit_id, completion_date, status
        return cls(
            id=row[0],
            habit_id=row[1],
            completion_date=row[2],
            status=row[3],
        )
