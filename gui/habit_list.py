"""
gui/habit_list.py - Manage Habits view with search, filter, edit, delete, detail popup, and status toggle.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from typing import Callable, Optional
from tracker import HabitTracker
from models import Habit
from gui.habit_form import HabitFormDialog


class HabitDetailDialog(tk.Toplevel):
    """Modal dialog displaying detailed completion history, missed days, and streak analysis."""

    def __init__(self, parent: tk.Widget, habit: Habit, tracker: HabitTracker, colors: dict):
        super().__init__(parent)
        self.habit = habit
        self.tracker = tracker
        self.colors = colors

        self.title(f"Habit Details - {habit.name}")
        self.geometry("520x620")
        self.resizable(False, False)
        self.configure(bg=colors["bg"])

        self.transient(parent)
        self.grab_set()

        self._build_ui()

    def _build_ui(self):
        main = tk.Frame(self, bg=self.colors["bg"], padx=20, pady=20)
        main.pack(fill=tk.BOTH, expand=True)

        # Header
        lbl_title = tk.Label(
            main,
            text=self.habit.name,
            font=("Segoe UI", 16, "bold"),
            bg=self.colors["bg"],
            fg=self.colors["fg"]
        )
        lbl_title.pack(anchor="w")

        lbl_desc = tk.Label(
            main,
            text=self.habit.description or "No description provided.",
            font=("Segoe UI", 10, "italic"),
            bg=self.colors["bg"],
            fg=self.colors["subtext"]
        )
        lbl_desc.pack(anchor="w", pady=(2, 12))

        # Metrics Card Frame
        stats_frame = tk.Frame(main, bg=self.colors["card_bg"], padx=16, pady=16, bd=1, relief=tk.FLAT)
        stats_frame.pack(fill=tk.X, pady=(0, 16))

        c_streak = self.tracker.calculate_current_streak(self.habit.id)
        l_streak = self.tracker.calculate_longest_streak(self.habit.id)
        rate = self.tracker.calculate_completion_percentage(self.habit.id)
        logs = self.tracker.db.get_logs_for_habit(self.habit.id)
        completed_count = sum(1 for log in logs if log.status == "completed")

        items = [
            ("Category", self.habit.category),
            ("Frequency", self.habit.frequency),
            ("Priority", self.habit.priority),
            ("Start Date", self.habit.start_date),
            ("Current Streak", f"🔥 {c_streak} days"),
            ("Longest Streak", f"🏆 {l_streak} days"),
            ("Total Completed Days", f"✅ {completed_count} days"),
            ("Completion Rate", f"📈 {rate}%")
        ]

        for i, (k, v) in enumerate(items):
            r = i // 2
            c = i % 2
            lbl_k = tk.Label(stats_frame, text=f"{k}:", font=("Segoe UI", 9, "bold"), bg=self.colors["card_bg"], fg=self.colors["subtext"])
            lbl_k.grid(row=r*2, column=c, sticky="w", padx=8, pady=(4, 0))
            lbl_v = tk.Label(stats_frame, text=str(v), font=("Segoe UI", 10), bg=self.colors["card_bg"], fg=self.colors["fg"])
            lbl_v.grid(row=r*2+1, column=c, sticky="w", padx=8, pady=(0, 6))

        stats_frame.columnconfigure(0, weight=1)
        stats_frame.columnconfigure(1, weight=1)

        # Log History List
        lbl_hist = tk.Label(main, text="Completion History Logs", font=("Segoe UI", 12, "bold"), bg=self.colors["bg"], fg=self.colors["fg"])
        lbl_hist.pack(anchor="w", pady=(0, 8))

        log_box = tk.Frame(main, bg=self.colors["card_bg"], bd=1, relief=tk.FLAT)
        log_box.pack(fill=tk.BOTH, expand=True, pady=(0, 16))

        canvas = tk.Canvas(log_box, bg=self.colors["card_bg"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(log_box, orient=tk.VERTICAL, command=canvas.yview)
        scroll_frame = tk.Frame(canvas, bg=self.colors["card_bg"])

        scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        if not logs:
            lbl_empty = tk.Label(
                scroll_frame,
                text="No completion history recorded yet.",
                font=("Segoe UI", 10, "italic"),
                bg=self.colors["card_bg"],
                fg=self.colors["subtext"],
                pady=30
            )
            lbl_empty.pack()
        else:
            for log in reversed(logs):
                item_row = tk.Frame(scroll_frame, bg=self.colors["card_bg"], pady=4, padx=8)
                item_row.pack(fill=tk.X)
                lbl_d = tk.Label(item_row, text=f"•  {log.completion_date}", font=("Segoe UI", 10), bg=self.colors["card_bg"], fg=self.colors["fg"])
                lbl_d.pack(side=tk.LEFT)
                lbl_st = tk.Label(item_row, text="Completed", font=("Segoe UI", 9, "bold"), bg=self.colors["card_bg"], fg=self.colors["success_fg"])
                lbl_st.pack(side=tk.RIGHT)

        btn_close = tk.Button(
            main,
            text="Close",
            font=("Segoe UI", 10),
            bg=self.colors["card_bg"],
            fg=self.colors["fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=16,
            pady=6,
            command=self.destroy
        )
        btn_close.pack(side=tk.RIGHT)


class HabitListView(tk.Frame):
    """View to view, search, filter, edit, delete, and toggle habit status."""

    def __init__(self, parent: tk.Widget, tracker: HabitTracker, colors: dict):
        super().__init__(parent, bg=colors["bg"])
        self.tracker = tracker
        self.colors = colors

        self._build_ui()
        self.refresh()

    def update_theme(self, colors: dict):
        """Update colors dynamically when theme changes."""
        self.colors = colors
        self.configure(bg=colors["bg"])
        for child in self.winfo_children():
            child.destroy()
        self._build_ui()
        self.refresh()

    def _build_ui(self):
        main = tk.Frame(self, bg=self.colors["bg"], padx=24, pady=20)
        main.pack(fill=tk.BOTH, expand=True)

        # Header
        header = tk.Frame(main, bg=self.colors["bg"])
        header.pack(fill=tk.X, pady=(0, 16))

        lbl_title = tk.Label(header, text="My Habits", font=("Segoe UI", 20, "bold"), bg=self.colors["bg"], fg=self.colors["fg"])
        lbl_title.pack(side=tk.LEFT)

        btn_add = tk.Button(
            header,
            text="➕ Add New Habit",
            font=("Segoe UI", 10, "bold"),
            bg=self.colors["primary"],
            fg=self.colors["primary_fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=14,
            pady=6,
            command=self._open_add_habit_dialog
        )
        btn_add.pack(side=tk.RIGHT)

        # Search and Filter Toolbar
        filter_bar = tk.Frame(main, bg=self.colors["card_bg"], padx=16, pady=12, bd=1, relief=tk.FLAT)
        filter_bar.pack(fill=tk.X, pady=(0, 16))

        # Search Entry
        lbl_search = tk.Label(filter_bar, text="Search:", font=("Segoe UI", 9, "bold"), bg=self.colors["card_bg"], fg=self.colors["fg"])
        lbl_search.pack(side=tk.LEFT, padx=(0, 6))

        self.ent_search = tk.Entry(
            filter_bar,
            font=("Segoe UI", 10),
            bg=self.colors["bg"],
            fg=self.colors["fg"],
            insertbackground=self.colors["fg"],
            width=20
        )
        self.ent_search.pack(side=tk.LEFT, padx=(0, 16))
        self.ent_search.bind("<KeyRelease>", lambda e: self.refresh())

        # Category Filter
        lbl_cat = tk.Label(filter_bar, text="Category:", font=("Segoe UI", 9, "bold"), bg=self.colors["card_bg"], fg=self.colors["fg"])
        lbl_cat.pack(side=tk.LEFT, padx=(0, 6))

        categories = ["All"] + HabitFormDialog.CATEGORIES
        self.cmb_cat_filter = ttk.Combobox(filter_bar, values=categories, state="readonly", font=("Segoe UI", 9), width=14)
        self.cmb_cat_filter.pack(side=tk.LEFT, padx=(0, 16))
        self.cmb_cat_filter.current(0)
        self.cmb_cat_filter.bind("<<ComboboxSelected>>", lambda e: self.refresh())

        # Status Filter
        lbl_status = tk.Label(filter_bar, text="Status:", font=("Segoe UI", 9, "bold"), bg=self.colors["card_bg"], fg=self.colors["fg"])
        lbl_status.pack(side=tk.LEFT, padx=(0, 6))

        self.cmb_status_filter = ttk.Combobox(filter_bar, values=["All", "active", "inactive"], state="readonly", font=("Segoe UI", 9), width=10)
        self.cmb_status_filter.pack(side=tk.LEFT)
        self.cmb_status_filter.current(1)  # Default "active"
        self.cmb_status_filter.bind("<<ComboboxSelected>>", lambda e: self.refresh())

        # Reset button
        btn_reset = tk.Button(
            filter_bar,
            text="Reset Filters",
            font=("Segoe UI", 9),
            bg=self.colors["bg"],
            fg=self.colors["subtext"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=8,
            command=self._reset_filters
        )
        btn_reset.pack(side=tk.RIGHT)

        # Habit List Frame
        self.list_container = tk.Frame(main, bg=self.colors["bg"])
        self.list_container.pack(fill=tk.BOTH, expand=True)

    def _reset_filters(self):
        self.ent_search.delete(0, tk.END)
        self.cmb_cat_filter.current(0)
        self.cmb_status_filter.current(0)
        self.refresh()

    def refresh(self):
        search_query = self.ent_search.get().strip()
        cat_filter = self.cmb_cat_filter.get()
        status_val = self.cmb_status_filter.get()
        status_filter = None if status_val == "All" else status_val

        habits = self.tracker.get_all_habits(
            status_filter=status_filter,
            search_query=search_query,
            category_filter=cat_filter
        )

        for child in self.list_container.winfo_children():
            child.destroy()

        if not habits:
            lbl_none = tk.Label(
                self.list_container,
                text="No habits found matching current search/filter.",
                font=("Segoe UI", 11, "italic"),
                bg=self.colors["bg"],
                fg=self.colors["subtext"],
                pady=40
            )
            lbl_none.pack(expand=True)
            return

        canvas = tk.Canvas(self.list_container, bg=self.colors["bg"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.list_container, orient=tk.VERTICAL, command=canvas.yview)
        scroll_frame = tk.Frame(canvas, bg=self.colors["bg"])

        scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas_window = canvas.create_window((0, 0), window=scroll_frame, anchor="nw")

        def _on_canvas_configure(event):
            canvas.itemconfig(canvas_window, width=event.width)
        canvas.bind("<Configure>", _on_canvas_configure)

        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        for habit in habits:
            self._render_habit_card(scroll_frame, habit)

    def _render_habit_card(self, parent, habit: Habit):
        c_streak = self.tracker.calculate_current_streak(habit.id)
        l_streak = self.tracker.calculate_longest_streak(habit.id)
        rate = self.tracker.calculate_completion_percentage(habit.id)

        card = tk.Frame(
            parent,
            bg=self.colors["card_bg"],
            padx=16,
            pady=14,
            bd=1,
            relief=tk.FLAT
        )
        card.pack(fill=tk.X, pady=6)

        top_row = tk.Frame(card, bg=self.colors["card_bg"])
        top_row.pack(fill=tk.X)

        # Name & Status
        lbl_name = tk.Label(
            top_row,
            text=habit.name,
            font=("Segoe UI", 12, "bold"),
            bg=self.colors["card_bg"],
            fg=self.colors["fg"]
        )
        lbl_name.pack(side=tk.LEFT)

        status_fg = "#10b981" if habit.status == "active" else "#64748b"
        lbl_status_tag = tk.Label(
            top_row,
            text=f"[{habit.status.upper()}]",
            font=("Segoe UI", 8, "bold"),
            bg=self.colors["card_bg"],
            fg=status_fg
        )
        lbl_status_tag.pack(side=tk.LEFT, padx=(8, 0))

        # Action Buttons on Right
        btn_frame = tk.Frame(top_row, bg=self.colors["card_bg"])
        btn_frame.pack(side=tk.RIGHT)

        btn_details = tk.Button(
            btn_frame,
            text="👁 Details",
            font=("Segoe UI", 9),
            bg=self.colors["bg"],
            fg=self.colors["fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=8,
            command=lambda h=habit: self._open_details(h)
        )
        btn_details.pack(side=tk.LEFT, padx=(0, 4))

        btn_edit = tk.Button(
            btn_frame,
            text="✏ Edit",
            font=("Segoe UI", 9),
            bg=self.colors["bg"],
            fg=self.colors["fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=8,
            command=lambda h=habit: self._open_edit_dialog(h)
        )
        btn_edit.pack(side=tk.LEFT, padx=(0, 4))

        status_action = "Deactivate" if habit.status == "active" else "Activate"
        btn_toggle_status = tk.Button(
            btn_frame,
            text=f"⚡ {status_action}",
            font=("Segoe UI", 9),
            bg=self.colors["bg"],
            fg=self.colors["fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=8,
            command=lambda h_id=habit.id: self._toggle_status(h_id)
        )
        btn_toggle_status.pack(side=tk.LEFT, padx=(0, 4))

        btn_delete = tk.Button(
            btn_frame,
            text="🗑 Delete",
            font=("Segoe UI", 9, "bold"),
            bg="#ef4444",
            fg="#ffffff",
            relief=tk.FLAT,
            cursor="hand2",
            padx=8,
            command=lambda h=habit: self._confirm_delete(h)
        )
        btn_delete.pack(side=tk.LEFT)

        # Meta & Streaks
        meta_row = tk.Frame(card, bg=self.colors["card_bg"])
        meta_row.pack(fill=tk.X, pady=(8, 0))

        details_str = f"Category: {habit.category}  |  Priority: {habit.priority}  |  Frequency: {habit.frequency}  |  Started: {habit.start_date}"
        lbl_meta = tk.Label(meta_row, text=details_str, font=("Segoe UI", 9), bg=self.colors["card_bg"], fg=self.colors["subtext"])
        lbl_meta.pack(side=tk.LEFT)

        badge_str = f"🔥 Streak: {c_streak}d (Max: {l_streak}d)  |  Rate: {rate}%"
        lbl_badge = tk.Label(meta_row, text=badge_str, font=("Segoe UI", 9, "bold"), bg=self.colors["card_bg"], fg=self.colors["primary"])
        lbl_badge.pack(side=tk.RIGHT)

    def _open_add_habit_dialog(self):
        def save_cb(h):
            self.tracker.create_habit(h)
            self.refresh()
            messagebox.showinfo("Success", f"Habit '{h.name}' created!", parent=self)

        HabitFormDialog(self.winfo_toplevel(), habit=None, on_save=save_cb, colors=self.colors)

    def _open_edit_dialog(self, habit: Habit):
        def save_cb(h):
            self.tracker.update_habit(h)
            self.refresh()
            messagebox.showinfo("Success", f"Habit '{h.name}' updated!", parent=self)

        HabitFormDialog(self.winfo_toplevel(), habit=habit, on_save=save_cb, colors=self.colors)

    def _open_details(self, habit: Habit):
        HabitDetailDialog(self.winfo_toplevel(), habit=habit, tracker=self.tracker, colors=self.colors)

    def _toggle_status(self, habit_id: int):
        self.tracker.toggle_habit_status(habit_id)
        self.refresh()

    def _confirm_delete(self, habit: Habit):
        confirm = messagebox.askyesno(
            "Confirm Delete",
            f"Are you sure you want to delete the habit '{habit.name}'?\nThis will permanently delete all associated completion history.",
            icon="warning",
            parent=self
        )
        if confirm:
            self.tracker.delete_habit(habit.id)
            self.refresh()
            messagebox.showinfo("Deleted", f"Habit '{habit.name}' was deleted.", parent=self)
