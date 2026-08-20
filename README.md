# 🎯 Habit Tracker — Desktop Application

A modern, desktop-based Habit Tracking application built with **Python 3**, **Tkinter**, **SQLite3**, and **Matplotlib**. Designed to help users build, monitor, and maintain daily habits with accurate streak tracking, completion percentage metrics, and interactive statistical visualisations.

---

## 🌟 Features

### 1. 🏠 Professional Dashboard
- **Live Summary Cards**: Overview of Total Habits, Completed Today, Pending Today, Current Best Streak, and Overall Completion Rate.
- **Today's Habit Checklist**: Interactive checklist allowing quick daily completion toggles directly from the dashboard.
- **Quick Action Bar**: One-click access to add new habits or jump into statistics.

### 2. ➕ Habit Creation & Validation
- Customize habit name, detailed description, category, frequency, priority, and start date.
- **Categories**: Education, Fitness, Health, Coding, Reading, Personal Growth, Other.
- **Priorities**: High, Medium, Low.
- **Frequencies**: Daily, Weekly.
- Strict input validation ensuring non-empty habit names and valid date formats.

### 3. 📋 Habit Management
- Search habits by title or description.
- Filter by Category and Status (Active vs. Inactive).
- Modal detail view displaying full log history, total active days, and streak analysis.
- Edit habit properties or activate/deactivate habits without losing completion history.
- Safe deletion with confirmation modal dialogs.

### 4. 🔥 Intelligent Streak Engine
- **Current Streak**: Calculates consecutive completed days up to today (or yesterday if today is still in progress).
- **Longest Streak**: Tracks historical maximum consecutive completion streaks over all time.
- **Weekly Frequency Support**: Calculates consecutive weekly completions accurately.

### 5. 📊 Interactive Statistics & Analytics
- Powered by **Matplotlib** integrated cleanly into Tkinter.
- **Weekly Completion Bar Chart**: Visualize completion trends for the last 7 days.
- **Monthly Progress Line Chart**: Track 30-day completion rate progression over time.
- **Category Distribution Chart**: Visual breakdown of habits across categories.

### 6. 🎨 Light & Dark Theme Support
- Dynamic, smooth theme switching between Light Mode and Dark Mode.
- Modern color schemes with responsive card UI elements.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Language** | Python 3.10+ |
| **GUI Framework** | Tkinter & ttk (Native Python GUI) |
| **Database** | SQLite3 (Persistent relational data storage) |
| **Data Visualization** | Matplotlib (`backend_tkagg`) |
| **Testing** | `unittest` (Standard Python Test Framework) |
| **Architecture** | Object-Oriented Programming (OOP) & Modular MVC/Layered Architecture |

---

## 📁 Project Structure

```
Habit-Tracker/
├── main.py                     # Application Entry Point & exception handling
├── database.py                 # SQLite DatabaseManager (Schema & parameterized CRUD)
├── models.py                   # Data Models (Habit and HabitLog dataclasses)
├── tracker.py                  # HabitTracker business logic & streak engine
├── statistics.py               # StatisticsManager analytical aggregations
├── requirements.txt            # External dependencies (matplotlib)
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore rules
├── data/                       # Local data folder
│   └── habits.db               # SQLite database (auto-created on startup)
├── gui/                        # Tkinter User Interface modules
│   ├── __init__.py
│   ├── app.py                  # Main window layout, sidebar navigation, & theme toggle
│   ├── dashboard.py            # Overview dashboard & today's habit checklist
│   ├── habit_form.py           # Add/Edit habit modal dialog with validation
│   ├── habit_list.py           # Habit management view (search, filter, detail, CRUD)
│   └── statistics_view.py      # Embedded Matplotlib charts & stat cards
└── tests/                      # Automated unit test suite
    ├── __init__.py
    ├── test_habits.py          # Unit tests for CRUD and completion logging
    └── test_statistics.py      # Unit tests for streak engine & statistics
```

---

## ⚙️ Installation & Usage

### Prerequisites
- Python 3.8 or higher installed on your system.

### 1. Clone or Download Project
Navigate to the project root directory:
```bash
cd Habit-Tracker
```

### 2. Set Up Virtual Environment (Recommended)
**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python main.py
# or using npm
npm run dev
```

---

## 🧪 Running Unit Tests

Run the automated test suite with standard Python `unittest`:

```bash
python -m unittest discover tests/
# or using npm
npm test
```

Or run individual test modules:
```bash
python -m unittest tests/test_habits.py
python -m unittest tests/test_statistics.py
```

---

## 🗄️ Database Architecture

The SQLite database (`data/habits.db`) is generated automatically upon first launch.

### Table Schema: `habits`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique habit identifier |
| `name` | TEXT | NOT NULL | Habit title |
| `description` | TEXT | | Habit description |
| `category` | TEXT | NOT NULL | Category (e.g. Fitness, Coding) |
| `frequency` | TEXT | NOT NULL | Daily or Weekly |
| `priority` | TEXT | NOT NULL | High, Medium, Low |
| `start_date` | TEXT | NOT NULL | ISO date string (YYYY-MM-DD) |
| `status` | TEXT | DEFAULT 'active' | active / inactive |
| `created_at` | TEXT | NOT NULL | Creation timestamp |

### Table Schema: `habit_logs`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique log identifier |
| `habit_id` | INTEGER | NOT NULL, FOREIGN KEY -> `habits(id)` | Associated habit ID |
| `completion_date`| TEXT | NOT NULL | ISO date string (YYYY-MM-DD) |
| `status` | TEXT | DEFAULT 'completed' | Log completion status |
| | | `UNIQUE(habit_id, completion_date)` | Prevents duplicate daily completions |

---

## 🚀 Future Enhancements

The architecture is modularly designed to support future extensions:
- 👥 Multi-user authentication & profile management
- 🔔 Desktop & Email notifications for pending daily habits
- 🏆 Achievement badges & gamified level-up system
- 📄 Export habit logs to CSV & PDF summary reports
- 🌐 Synchronization with cloud databases or web APIs

---

## ✒️ Author & License

Developed as a CS portfolio project adhering to standard Object-Oriented Principles and clean code guidelines.
Released under the MIT License.
