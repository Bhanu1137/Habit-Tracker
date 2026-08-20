"""
gui/dashboard.py - Dashboard view showing key summary cards, today's habit checklist, and quick actions.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import Callable, Optional
from tracker import HabitTracker
from gui.habit_form import HabitFormDialog


class DashboardView(tk.Frame):
    """Dashboard view containing stat cards, today's habits, and quick buttons."""

    def __init__(
        self,
        parent: tk.Widget,
        tracker: HabitTracker,
        on_navigate: Callable[[str], None],
        colors: dict
    ):
        super().__init__(parent, bg=colors["bg"])
        self.tracker = tracker
        self.on_navigate = on_navigate
        self.colors = colors

        self._build_ui()
        self.refresh()

    def update_theme(self, colors: dict):
        """Update colors dynamically when theme changes."""
        self.colors = colors
        self.configure(bg=colors["bg"])
        # Rebuild UI for clean theme update
        for child in self.winfo_children():
            child.destroy()
        self._build_ui()
        self.refresh()

    def _build_ui(self):
        """Construct dashboard components."""
        # Scrollable container or main container
        main_container = tk.Frame(self, bg=self.colors["bg"], padx=24, pady=20)
        main_container.pack(fill=tk.BOTH, expand=True)

        # 1. Header Banner
        header_frame = tk.Frame(main_container, bg=self.colors["bg"])
        header_frame.pack(fill=tk.X, pady=(0, 20))

        lbl_welcome = tk.Label(
            header_frame,
            text="Welcome back! 👋",
            font=("Segoe UI", 20, "bold"),
            bg=self.colors["bg"],
            fg=self.colors["fg"]
        )
        lbl_welcome.pack(anchor="w")

        self.lbl_date = tk.Label(
            header_frame,
            text="",
            font=("Segoe UI", 11),
            bg=self.colors["bg"],
            fg=self.colors["subtext"]
        )
        self.lbl_date.pack(anchor="w", pady=(2, 0))

        # 2. Stat Cards Grid
        self.cards_frame = tk.Frame(main_container, bg=self.colors["bg"])
        self.cards_frame.pack(fill=tk.X, pady=(0, 24))
        for col in range(5):
            self.cards_frame.columnconfigure(col, weight=1)

        # 3. Action Bar (Quick Add & View Stats)
        action_bar = tk.Frame(main_container, bg=self.colors["bg"])
        action_bar.pack(fill=tk.X, pady=(0, 16))

        lbl_today_title = tk.Label(
            action_bar,
            text="Today's Habit Checklist",
            font=("Segoe UI", 14, "bold"),
            bg=self.colors["bg"],
            fg=self.colors["fg"]
        )
        lbl_today_title.pack(side=tk.LEFT)

        btn_view_stats = tk.Button(
            action_bar,
            text="📊 View Detailed Stats",
            font=("Segoe UI", 10),
            bg=self.colors["card_bg"],
            fg=self.colors["fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=12,
            pady=6,
            command=lambda: self.on_navigate("statistics")
        )
        btn_view_stats.pack(side=tk.RIGHT, padx=(8, 0))

        btn_add_habit = tk.Button(
            action_bar,
            text="➕ Quick Add Habit",
            font=("Segoe UI", 10, "bold"),
            bg=self.colors["primary"],
            fg=self.colors["primary_fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=14,
            pady=6,
            command=self._open_add_habit_dialog
        )
        btn_add_habit.pack(side=tk.RIGHT)

        # 4. Today's Habit List Frame
        self.list_container = tk.Frame(main_container, bg=self.colors["card_bg"], bd=1, relief=tk.FLAT)
        self.list_container.pack(fill=tk.BOTH, expand=True)

    def refresh(self):
        """Fetch fresh summary data and re-render cards and habit list."""
        summary = self.tracker.get_dashboard_summary()
        self.lbl_date.config(text=summary["today_date"])

        # Re-render Stat Cards
        for child in self.cards_frame.winfo_children():
            child.destroy()

        card_defs = [
            ("Total Habits", str(summary["total_habits"]), "📋", "#3b82f6"),
            ("Completed Today", str(summary["completed_today"]), "✅", "#10b981"),
            ("Pending Today", str(summary["pending_today"]), "⏳", "#f59e0b"),
            ("Current Streak", f"{summary['best_current_streak']} days", "🔥", "#ef4444"),
            ("Completion Rate", f"{summary['overall_completion_percentage']}%", "📈", "#8b5cf6")
        ]

        for i, (title, val, icon, accent_color) in enumerate(card_defs):
            self._render_card(self.cards_frame, i, title, val, icon, accent_color)

        # Re-render Today's Habits List
        for child in self.list_container.winfo_children():
            child.destroy()

        active_habits = summary["active_habits"]
        if not active_habits:
            lbl_empty = tk.Label(
                self.list_container,
                text="No habits created yet. Click '+ Quick Add Habit' above to create your first habit!",
                font=("Segoe UI", 11, "italic"),
                bg=self.colors["card_bg"],
                fg=self.colors["subtext"],
                pady=40
            )
            lbl_empty.pack(expand=True)
            return

        # Canvas + Scrollbar for habit list
        canvas = tk.Canvas(self.list_container, bg=self.colors["card_bg"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.list_container, orient=tk.VERTICAL, command=canvas.yview)
        scroll_frame = tk.Frame(canvas, bg=self.colors["card_bg"])

        scroll_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        canvas_window = canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
        
        def _on_canvas_configure(event):
            canvas.itemconfig(canvas_window, width=event.width)
        canvas.bind("<Configure>", _on_canvas_configure)

        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        for habit in active_habits:
            if habit.id is not None:
                self._render_habit_row(scroll_frame, habit)

    def _render_card(self, parent, col, title, value, icon, accent):
        card = tk.Frame(
            parent,
            bg=self.colors["card_bg"],
            padx=16,
            pady=16,
            bd=1,
            relief=tk.FLAT
        )
        card.grid(row=0, column=col, sticky="ew", padx=6, pady=4)

        top_row = tk.Frame(card, bg=self.colors["card_bg"])
        top_row.pack(fill=tk.X)

        lbl_icon = tk.Label(top_row, text=icon, font=("Segoe UI", 14), bg=self.colors["card_bg"])
        lbl_icon.pack(side=tk.LEFT)

        lbl_title = tk.Label(
            top_row,
            text=title,
            font=("Segoe UI", 9, "bold"),
            bg=self.colors["card_bg"],
            fg=self.colors["subtext"]
        )
        lbl_title.pack(side=tk.LEFT, padx=(6, 0))

        lbl_val = tk.Label(
            card,
            text=value,
            font=("Segoe UI", 18, "bold"),
            bg=self.colors["card_bg"],
            fg=accent
        )
        lbl_val.pack(anchor="w", pady=(8, 0))

    def _render_habit_row(self, parent, habit):
        is_done = self.tracker.is_completed_today(habit.id)
        c_streak = self.tracker.calculate_current_streak(habit.id)

        row_bg = self.colors["success_bg"] if is_done else self.colors["bg"]
        
        row = tk.Frame(
            parent,
            bg=row_bg,
            padx=16,
            pady=12,
            bd=1,
            relief=tk.FLAT
        )
        row.pack(fill=tk.X, padx=12, pady=6)

        # Left Info
        info_frame = tk.Frame(row, bg=row_bg)
        info_frame.pack(side=tk.LEFT, fill=tk.X, expand=True)

        title_text = f"✓  {habit.name}" if is_done else habit.name
        lbl_name = tk.Label(
            info_frame,
            text=title_text,
            font=("Segoe UI", 11, "bold" if not is_done else "overstrike"),
            bg=row_bg,
            fg=self.colors["success_fg"] if is_done else self.colors["fg"]
        )
        lbl_name.pack(anchor="w")

        sub_details = f"{habit.category} • Priority: {habit.priority} • Frequency: {habit.frequency}"
        if habit.description:
            sub_details += f" — {habit.description}"

        lbl_sub = tk.Label(
            info_frame,
            text=sub_details,
            font=("Segoe UI", 9),
            bg=row_bg,
            fg=self.colors["subtext"]
        )
        lbl_sub.pack(anchor="w", pady=(2, 0))

        # Streak Badge
        lbl_streak = tk.Label(
            row,
            text=f"🔥 {c_streak}d streak",
            font=("Segoe UI", 9, "bold"),
            bg=self.colors["card_bg"],
            fg="#ef4444",
            padx=8,
            pady=4
        )
        lbl_streak.pack(side=tk.LEFT, padx=12)

        # Toggle Button
        btn_text = "Undo" if is_done else "Complete Today"
        btn_bg = self.colors["card_bg"] if is_done else self.colors["primary"]
        btn_fg = self.colors["fg"] if is_done else self.colors["primary_fg"]

        btn_toggle = tk.Button(
            row,
            text=btn_text,
            font=("Segoe UI", 9, "bold"),
            bg=btn_bg,
            fg=btn_fg,
            relief=tk.FLAT,
            cursor="hand2",
            padx=12,
            pady=4,
            command=lambda h_id=habit.id: self._toggle_completion(h_id)
        )
        btn_toggle.pack(side=tk.RIGHT)

    def _toggle_completion(self, habit_id: int):
        """Toggle habit completion status for today."""
        self.tracker.toggle_today_completion(habit_id)
        self.refresh()

    def _open_add_habit_dialog(self):
        """Open the habit form dialog."""
        def save_cb(habit):
            self.tracker.create_habit(habit)
            self.refresh()
            messagebox.showinfo("Success", f"Habit '{habit.name}' created successfully!", parent=self)

        HabitFormDialog(self.winfo_toplevel(), habit=None, on_save=save_cb, colors=self.colors)
