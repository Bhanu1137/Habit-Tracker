"""
gui/app.py - Main Tkinter Application Window with sidebar navigation and Light/Dark themes.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import Dict
from database import DatabaseManager
from tracker import HabitTracker
from statistics import StatisticsManager
from gui.dashboard import DashboardView
from gui.habit_list import HabitListView
from gui.habit_form import HabitFormDialog
from gui.statistics_view import StatisticsView


LIGHT_THEME = {
    "name": "light",
    "bg": "#f8fafc",
    "card_bg": "#ffffff",
    "fg": "#0f172a",
    "subtext": "#64748b",
    "primary": "#2563eb",
    "primary_fg": "#ffffff",
    "sidebar_bg": "#1e293b",
    "sidebar_fg": "#f8fafc",
    "sidebar_active": "#3b82f6",
    "border": "#e2e8f0",
    "success_bg": "#f0fdf4",
    "success_fg": "#166534"
}

DARK_THEME = {
    "name": "dark",
    "bg": "#0f172a",
    "card_bg": "#1e293b",
    "fg": "#f8fafc",
    "subtext": "#94a3b8",
    "primary": "#3b82f6",
    "primary_fg": "#ffffff",
    "sidebar_bg": "#020617",
    "sidebar_fg": "#f8fafc",
    "sidebar_active": "#2563eb",
    "border": "#334155",
    "success_bg": "#064e3b",
    "success_fg": "#6ee7b7"
}


class HabitTrackerApp:
    """Main window holding sidebar navigation and view management."""

    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Habit Tracker — Monitor & Achieve Your Goals")
        self.root.geometry("1100x720")
        self.root.minsize(900, 600)

        # Theme State
        self.current_theme = LIGHT_THEME

        # Core Engines
        self.db_manager = DatabaseManager()
        self.tracker = HabitTracker(self.db_manager)
        self.stats_manager = StatisticsManager(self.tracker)

        self._apply_global_styles()
        self._build_ui()
        self.navigate("dashboard")

    def _apply_global_styles(self):
        self.root.configure(bg=self.current_theme["bg"])
        style = ttk.Style()
        style.theme_use("clam")

    def _build_ui(self):
        # Master Layout Container
        self.master_frame = tk.Frame(self.root, bg=self.current_theme["bg"])
        self.master_frame.pack(fill=tk.BOTH, expand=True)

        # 1. Sidebar Frame
        self.sidebar = tk.Frame(self.master_frame, bg=self.current_theme["sidebar_bg"], width=220)
        self.sidebar.pack(side=tk.LEFT, fill=tk.Y)
        self.sidebar.pack_propagate(False)

        # App Brand Header
        brand_frame = tk.Frame(self.sidebar, bg=self.current_theme["sidebar_bg"], padx=16, pady=20)
        brand_frame.pack(fill=tk.X)

        lbl_logo = tk.Label(
            brand_frame,
            text="🎯 Habit Tracker",
            font=("Segoe UI", 14, "bold"),
            bg=self.current_theme["sidebar_bg"],
            fg=self.current_theme["sidebar_fg"]
        )
        lbl_logo.pack(anchor="w")

        lbl_sub = tk.Label(
            brand_frame,
            text="Build better daily routines",
            font=("Segoe UI", 8),
            bg=self.current_theme["sidebar_bg"],
            fg="#94a3b8"
        )
        lbl_sub.pack(anchor="w", pady=(2, 0))

        # Divider
        div = tk.Frame(self.sidebar, bg="#334155", height=1)
        div.pack(fill=tk.X, padx=16, pady=(0, 16))

        # Nav Buttons Container
        self.nav_frame = tk.Frame(self.sidebar, bg=self.current_theme["sidebar_bg"])
        self.nav_frame.pack(fill=tk.BOTH, expand=True)

        self.nav_buttons: Dict[str, tk.Button] = {}

        nav_items = [
            ("dashboard", "🏠 Dashboard"),
            ("habits", "📋 My Habits"),
            ("add_habit", "➕ Add Habit"),
            ("statistics", "📊 Statistics"),
        ]

        for nav_key, label_text in nav_items:
            btn = tk.Button(
                self.nav_frame,
                text=label_text,
                font=("Segoe UI", 10, "bold"),
                bg=self.current_theme["sidebar_bg"],
                fg=self.current_theme["sidebar_fg"],
                activebackground=self.current_theme["sidebar_active"],
                activeforeground=self.current_theme["sidebar_fg"],
                anchor="w",
                bd=0,
                padx=20,
                pady=10,
                cursor="hand2",
                command=lambda k=nav_key: self.navigate(k)
            )
            btn.pack(fill=tk.X, pady=2)
            self.nav_buttons[nav_key] = btn

        # Bottom Sidebar (Theme Toggle & Exit)
        bottom_nav = tk.Frame(self.sidebar, bg=self.current_theme["sidebar_bg"], pady=16)
        bottom_nav.pack(side=tk.BOTTOM, fill=tk.X)

        self.btn_theme = tk.Button(
            bottom_nav,
            text="🌙 Dark Mode",
            font=("Segoe UI", 9, "bold"),
            bg=self.current_theme["sidebar_bg"],
            fg=self.current_theme["sidebar_fg"],
            bd=0,
            anchor="w",
            padx=20,
            pady=8,
            cursor="hand2",
            command=self.toggle_theme
        )
        self.btn_theme.pack(fill=tk.X)

        btn_exit = tk.Button(
            bottom_nav,
            text="🚪 Exit",
            font=("Segoe UI", 9, "bold"),
            bg=self.current_theme["sidebar_bg"],
            fg="#f87171",
            bd=0,
            anchor="w",
            padx=20,
            pady=8,
            cursor="hand2",
            command=self.root.quit
        )
        btn_exit.pack(fill=tk.X)

        # 2. Main View Container
        self.content_area = tk.Frame(self.master_frame, bg=self.current_theme["bg"])
        self.content_area.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        # Create Views
        self.views = {
            "dashboard": DashboardView(self.content_area, self.tracker, self.navigate, self.current_theme),
            "habits": HabitListView(self.content_area, self.tracker, self.current_theme),
            "statistics": StatisticsView(self.content_area, self.stats_manager, self.current_theme)
        }

    def navigate(self, nav_key: str):
        """Handle sidebar navigation."""
        if nav_key == "add_habit":
            self._open_add_habit_dialog()
            return

        for k, btn in self.nav_buttons.items():
            if k == nav_key:
                btn.configure(bg=self.current_theme["sidebar_active"])
            else:
                btn.configure(bg=self.current_theme["sidebar_bg"])

        for view_name, view_widget in self.views.items():
            if view_name == nav_key:
                view_widget.pack(fill=tk.BOTH, expand=True)
                view_widget.refresh()
            else:
                view_widget.pack_forget()

    def _open_add_habit_dialog(self):
        """Open add habit form modal dialog from sidebar."""
        def save_cb(habit):
            self.tracker.create_habit(habit)
            # Refresh currently active view
            for v in self.views.values():
                if v.winfo_ismapped():
                    v.refresh()
            messagebox.showinfo("Success", f"Habit '{habit.name}' created successfully!", parent=self.root)

        HabitFormDialog(self.root, habit=None, on_save=save_cb, colors=self.current_theme)

    def toggle_theme(self):
        """Toggle between Light and Dark themes."""
        if self.current_theme["name"] == "light":
            self.current_theme = DARK_THEME
            self.btn_theme.config(text="☀️ Light Mode")
        else:
            self.current_theme = LIGHT_THEME
            self.btn_theme.config(text="🌙 Dark Mode")

        # Update root background
        self.root.configure(bg=self.current_theme["bg"])
        self.master_frame.configure(bg=self.current_theme["bg"])
        self.content_area.configure(bg=self.current_theme["bg"])
        self.sidebar.configure(bg=self.current_theme["sidebar_bg"])

        # Update views
        for view in self.views.values():
            view.update_theme(self.current_theme)
