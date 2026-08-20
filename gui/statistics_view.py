"""
gui/statistics_view.py - Statistics view with embedded Matplotlib interactive graphs.
"""

import tkinter as tk
from tkinter import ttk
from typing import Optional
from statistics import StatisticsManager
import matplotlib
matplotlib.use("TkAgg")
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure


class StatisticsView(tk.Frame):
    """Statistics tab embedding Matplotlib charts into Tkinter canvas."""

    def __init__(self, parent: tk.Widget, stats_manager: StatisticsManager, colors: dict):
        super().__init__(parent, bg=colors["bg"])
        self.stats_manager = stats_manager
        self.colors = colors

        self._build_ui()
        self.refresh()

    def update_theme(self, colors: dict):
        """Update colors and re-draw charts on theme change."""
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

        lbl_title = tk.Label(
            header,
            text="Habit Statistics & Analytics 📊",
            font=("Segoe UI", 20, "bold"),
            bg=self.colors["bg"],
            fg=self.colors["fg"]
        )
        lbl_title.pack(anchor="w")

        # Top Metric Cards
        self.cards_frame = tk.Frame(main, bg=self.colors["bg"])
        self.cards_frame.pack(fill=tk.X, pady=(0, 20))
        for c in range(4):
            self.cards_frame.columnconfigure(c, weight=1)

        # Matplotlib Charts Container (Grid layout 2x2 or 3 charts)
        self.charts_frame = tk.Frame(main, bg=self.colors["bg"])
        self.charts_frame.pack(fill=tk.BOTH, expand=True)
        self.charts_frame.columnconfigure(0, weight=1)
        self.charts_frame.columnconfigure(1, weight=1)
        self.charts_frame.rowconfigure(0, weight=1)
        self.charts_frame.rowconfigure(1, weight=1)

    def refresh(self):
        """Fetch fresh statistics data and redraw Matplotlib plots."""
        summary = self.stats_manager.get_overall_summary_stats()

        # Render Metric Cards
        for child in self.cards_frame.winfo_children():
            child.destroy()

        card_defs = [
            ("Best Current Streak", f"{summary['best_current_streak']} days", summary['best_current_streak_habit'], "🔥"),
            ("Best Longest Streak", f"{summary['best_longest_streak']} days", summary['best_longest_streak_habit'], "🏆"),
            ("Total Logs Recorded", f"{summary['total_completed_logs']}", "All time completed logs", "✅"),
            ("Overall Habit Rate", f"{summary['overall_completion_rate']}%", "Average completion %", "📈")
        ]

        for i, (title, val, sub, icon) in enumerate(card_defs):
            card = tk.Frame(self.cards_frame, bg=self.colors["card_bg"], padx=14, pady=12, bd=1, relief=tk.FLAT)
            card.grid(row=0, column=i, sticky="ew", padx=6)

            lbl_t = tk.Label(card, text=f"{icon} {title}", font=("Segoe UI", 9, "bold"), bg=self.colors["card_bg"], fg=self.colors["subtext"])
            lbl_t.pack(anchor="w")
            lbl_v = tk.Label(card, text=val, font=("Segoe UI", 16, "bold"), bg=self.colors["card_bg"], fg=self.colors["primary"])
            lbl_v.pack(anchor="w", pady=(4, 0))
            lbl_s = tk.Label(card, text=sub, font=("Segoe UI", 8), bg=self.colors["card_bg"], fg=self.colors["subtext"])
            lbl_s.pack(anchor="w")

        # Clear existing charts
        for child in self.charts_frame.winfo_children():
            child.destroy()

        # Configure Matplotlib styles based on theme
        is_dark = self.colors["bg"] in ["#0f172a", "#1e1e1e"]
        fig_bg = self.colors["card_bg"]
        text_color = self.colors["fg"]
        grid_color = "#334155" if is_dark else "#e2e8f0"

        # Chart 1: Weekly Completion Bar Chart
        days, counts = self.stats_manager.get_weekly_completion_data()
        fig1 = Figure(figsize=(5, 3.5), dpi=100, facecolor=fig_bg)
        ax1 = fig1.add_subplot(111)
        ax1.set_facecolor(fig_bg)
        bars = ax1.bar(days, counts, color="#3b82f6", edgecolor="none", width=0.55)
        ax1.set_title("Weekly Habit Completions (Last 7 Days)", color=text_color, fontsize=10, fontweight="bold")
        ax1.tick_params(colors=text_color, labelsize=8)
        ax1.spines['top'].set_visible(False)
        ax1.spines['right'].set_visible(False)
        ax1.spines['left'].set_color(text_color)
        ax1.spines['bottom'].set_color(text_color)
        ax1.grid(axis='y', linestyle='--', alpha=0.5, color=grid_color)
        fig1.tight_layout()

        canvas1 = FigureCanvasTkAgg(fig1, master=self.charts_frame)
        canvas1.draw()
        canvas1.get_tk_widget().grid(row=0, column=0, sticky="nsew", padx=6, pady=6)

        # Chart 2: Monthly Progress Line Chart
        labels, rates = self.stats_manager.get_monthly_progress_data()
        fig2 = Figure(figsize=(5, 3.5), dpi=100, facecolor=fig_bg)
        ax2 = fig2.add_subplot(111)
        ax2.set_facecolor(fig_bg)
        ax2.plot(labels, rates, marker='o', color="#10b981", linewidth=2.5, markersize=5)
        ax2.fill_between(labels, rates, color="#10b981", alpha=0.15)
        ax2.set_title("30-Day Completion Rate Progress (%)", color=text_color, fontsize=10, fontweight="bold")
        ax2.tick_params(colors=text_color, labelsize=8)
        ax2.set_ylim(0, 105)
        ax2.spines['top'].set_visible(False)
        ax2.spines['right'].set_visible(False)
        ax2.spines['left'].set_color(text_color)
        ax2.spines['bottom'].set_color(text_color)
        ax2.grid(axis='y', linestyle='--', alpha=0.5, color=grid_color)
        fig2.tight_layout()

        canvas2 = FigureCanvasTkAgg(fig2, master=self.charts_frame)
        canvas2.draw()
        canvas2.get_tk_widget().grid(row=0, column=1, sticky="nsew", padx=6, pady=6)

        # Chart 3: Category Distribution Pie Chart
        cats, cat_counts = self.stats_manager.get_category_comparison_data()
        fig3 = Figure(figsize=(10, 3.2), dpi=100, facecolor=fig_bg)
        ax3 = fig3.add_subplot(111)
        ax3.set_facecolor(fig_bg)
        
        colors_list = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"]
        
        if sum(cat_counts) == 0:
            ax3.text(0.5, 0.5, "No habits created yet", horizontalalignment='center', verticalalignment='center', color=text_color, fontsize=11)
            ax3.axis('off')
        else:
            wedges, texts, autotexts = ax3.pie(
                cat_counts,
                labels=cats,
                autopct='%1.0f%%',
                startangle=140,
                colors=colors_list[:len(cats)],
                textprops=dict(color=text_color, fontsize=8)
            )
            for autotext in autotexts:
                autotext.set_color('white')
                autotext.set_weight('bold')

        ax3.set_title("Habit Distribution by Category", color=text_color, fontsize=10, fontweight="bold")
        fig3.tight_layout()

        canvas3 = FigureCanvasTkAgg(fig3, master=self.charts_frame)
        canvas3.draw()
        canvas3.get_tk_widget().grid(row=1, column=0, columnspan=2, sticky="nsew", padx=6, pady=6)
