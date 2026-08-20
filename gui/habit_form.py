"""
gui/habit_form.py - Add / Edit Habit Modal Dialog with strict input validation.
"""

import tkinter as tk
from tkinter import ttk, messagebox
from datetime import date, datetime
from typing import Optional, Callable
from models import Habit


class HabitFormDialog(tk.Toplevel):
    """Modal dialog for creating or editing a habit."""

    CATEGORIES = [
        "Education",
        "Fitness",
        "Health",
        "Coding",
        "Reading",
        "Personal Growth",
        "Other"
    ]
    PRIORITIES = ["High", "Medium", "Low"]
    FREQUENCIES = ["Daily", "Weekly"]

    def __init__(
        self,
        parent: tk.Tk,
        habit: Optional[Habit] = None,
        on_save: Optional[Callable[[Habit], None]] = None,
        colors: Optional[dict] = None
    ):
        super().__init__(parent)
        self.habit = habit
        self.on_save = on_save
        self.colors = colors or {
            "bg": "#ffffff",
            "fg": "#1e293b",
            "card_bg": "#f8fafc",
            "primary": "#3b82f6",
            "primary_fg": "#ffffff",
            "border": "#cbd5e1"
        }

        self.title("Edit Habit" if habit else "Add New Habit")
        self.geometry("480x580")
        self.resizable(False, False)
        self.configure(bg=self.colors["bg"])

        # Make modal
        self.transient(parent)
        self.grab_set()

        self._build_ui()
        self._load_habit_data()

    def _build_ui(self):
        """Construct form fields and controls."""
        main_frame = tk.Frame(self, bg=self.colors["bg"], padx=24, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Header
        title_text = "Edit Habit Details" if self.habit else "Create a New Habit"
        lbl_header = tk.Label(
            main_frame,
            text=title_text,
            font=("Segoe UI", 16, "bold"),
            bg=self.colors["bg"],
            fg=self.colors["fg"]
        )
        lbl_header.pack(anchor="w", pady=(0, 16))

        # Fields container
        form_grid = tk.Frame(main_frame, bg=self.colors["bg"])
        form_grid.pack(fill=tk.BOTH, expand=True)

        # 1. Habit Name
        self._create_label(form_grid, "Habit Name *", 0)
        self.ent_name = tk.Entry(
            form_grid,
            font=("Segoe UI", 10),
            bg=self.colors["card_bg"],
            fg=self.colors["fg"],
            insertbackground=self.colors["fg"],
            relief=tk.FLAT,
            bd=1,
            highlightthickness=1,
            highlightcolor=self.colors["primary"],
            highlightbackground=self.colors["border"]
        )
        self.ent_name.grid(row=1, column=0, columnspan=2, sticky="ew", pady=(0, 12), ipady=6)

        # 2. Description
        self._create_label(form_grid, "Description", 2)
        self.ent_desc = tk.Entry(
            form_grid,
            font=("Segoe UI", 10),
            bg=self.colors["card_bg"],
            fg=self.colors["fg"],
            insertbackground=self.colors["fg"],
            relief=tk.FLAT,
            bd=1,
            highlightthickness=1,
            highlightcolor=self.colors["primary"],
            highlightbackground=self.colors["border"]
        )
        self.ent_desc.grid(row=3, column=0, columnspan=2, sticky="ew", pady=(0, 12), ipady=6)

        # 3. Category & Frequency (Side by Side)
        self._create_label(form_grid, "Category", 4, col=0)
        self.cmb_category = ttk.Combobox(form_grid, values=self.CATEGORIES, state="readonly", font=("Segoe UI", 10))
        self.cmb_category.grid(row=5, column=0, sticky="ew", pady=(0, 12), padx=(0, 6), ipady=4)
        self.cmb_category.current(0)

        self._create_label(form_grid, "Frequency", 4, col=1)
        self.cmb_frequency = ttk.Combobox(form_grid, values=self.FREQUENCIES, state="readonly", font=("Segoe UI", 10))
        self.cmb_frequency.grid(row=5, column=1, sticky="ew", pady=(0, 12), padx=(6, 0), ipady=4)
        self.cmb_frequency.current(0)

        # 4. Priority & Start Date
        self._create_label(form_grid, "Priority", 6, col=0)
        self.cmb_priority = ttk.Combobox(form_grid, values=self.PRIORITIES, state="readonly", font=("Segoe UI", 10))
        self.cmb_priority.grid(row=7, column=0, sticky="ew", pady=(0, 12), padx=(0, 6), ipady=4)
        self.cmb_priority.current(1)  # Default "Medium"

        self._create_label(form_grid, "Start Date (YYYY-MM-DD)", 6, col=1)
        self.ent_start_date = tk.Entry(
            form_grid,
            font=("Segoe UI", 10),
            bg=self.colors["card_bg"],
            fg=self.colors["fg"],
            insertbackground=self.colors["fg"],
            relief=tk.FLAT,
            bd=1,
            highlightthickness=1,
            highlightcolor=self.colors["primary"],
            highlightbackground=self.colors["border"]
        )
        self.ent_start_date.grid(row=7, column=1, sticky="ew", pady=(0, 12), padx=(6, 0), ipady=6)
        self.ent_start_date.insert(0, date.today().isoformat())

        form_grid.columnconfigure(0, weight=1)
        form_grid.columnconfigure(1, weight=1)

        # Buttons
        btn_frame = tk.Frame(main_frame, bg=self.colors["bg"])
        btn_frame.pack(fill=tk.X, pady=(16, 0))

        btn_cancel = tk.Button(
            btn_frame,
            text="Cancel",
            font=("Segoe UI", 10),
            bg=self.colors["card_bg"],
            fg=self.colors["fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=16,
            pady=8,
            command=self.destroy
        )
        btn_cancel.pack(side=tk.RIGHT, padx=(8, 0))

        btn_save = tk.Button(
            btn_frame,
            text="Save Habit",
            font=("Segoe UI", 10, "bold"),
            bg=self.colors["primary"],
            fg=self.colors["primary_fg"],
            relief=tk.FLAT,
            cursor="hand2",
            padx=20,
            pady=8,
            command=self._on_save_clicked
        )
        btn_save.pack(side=tk.RIGHT)

    def _create_label(self, parent, text, row, col=0):
        lbl = tk.Label(
            parent,
            text=text,
            font=("Segoe UI", 9, "bold"),
            bg=self.colors["bg"],
            fg=self.colors["fg"]
        )
        lbl.grid(row=row, column=col, sticky="w", pady=(0, 4))

    def _load_habit_data(self):
        """Populate form if editing an existing habit."""
        if not self.habit:
            return

        self.ent_name.delete(0, tk.END)
        self.ent_name.insert(0, self.habit.name)

        self.ent_desc.delete(0, tk.END)
        self.ent_desc.insert(0, self.habit.description)

        if self.habit.category in self.CATEGORIES:
            self.cmb_category.current(self.CATEGORIES.index(self.habit.category))

        if self.habit.frequency in self.FREQUENCIES:
            self.cmb_frequency.current(self.FREQUENCIES.index(self.habit.frequency))

        if self.habit.priority in self.PRIORITIES:
            self.cmb_priority.current(self.PRIORITIES.index(self.habit.priority))

        self.ent_start_date.delete(0, tk.END)
        self.ent_start_date.insert(0, self.habit.start_date)

    def _on_save_clicked(self):
        """Validate inputs and invoke callback."""
        name = self.ent_name.get().strip()
        description = self.ent_desc.get().strip()
        category = self.cmb_category.get()
        frequency = self.cmb_frequency.get()
        priority = self.cmb_priority.get()
        start_date_str = self.ent_start_date.get().strip()

        # Validation 1: Habit Name
        if not name:
            messagebox.showerror("Validation Error", "Habit name cannot be empty.", parent=self)
            self.ent_name.focus_set()
            return

        # Validation 2: Start Date Format
        try:
            parsed_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except ValueError:
            messagebox.showerror(
                "Validation Error",
                "Invalid Start Date format. Please use YYYY-MM-DD (e.g. 2026-08-18).",
                parent=self
            )
            self.ent_start_date.focus_set()
            return

        if self.habit:
            # Update existing instance
            self.habit.name = name
            self.habit.description = description
            self.habit.category = category
            self.habit.frequency = frequency
            self.habit.priority = priority
            self.habit.start_date = parsed_date.isoformat()
            saved_habit = self.habit
        else:
            # Create new instance
            saved_habit = Habit(
                name=name,
                description=description,
                category=category,
                frequency=frequency,
                priority=priority,
                start_date=parsed_date.isoformat()
            )

        if self.on_save:
            self.on_save(saved_habit)

        self.destroy()
