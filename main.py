"""
main.py - Application Entry Point for Habit Tracker.
"""

import sys
import os
import tkinter as tk
from tkinter import messagebox

# Ensure local modules are accessible
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from gui.app import HabitTrackerApp


def handle_uncaught_exception(exc_type, exc_value, exc_traceback):
    """Global exception handler to show user-friendly error dialog instead of silent crashing."""
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return

    error_msg = f"An unexpected error occurred:\n\n{exc_value}"
    print(f"ERROR: {exc_type.__name__}: {exc_value}", file=sys.stderr)
    try:
        messagebox.showerror("Application Error", error_msg)
    except Exception:
        pass


def main():
    """Start Habit Tracker Tkinter desktop application."""
    sys.excepthook = handle_uncaught_exception

    root = tk.Tk()
    
    # Try setting window icon or styling fallback
    try:
        root.iconname("HabitTracker")
    except Exception:
        pass

    app = HabitTrackerApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
