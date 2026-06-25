# Modern Kanban Task Manager

A high-performance, drag-and-drop Kanban board application built with React, TypeScript, Vite, and Supabase. Designed with a premium aesthetic inspired by Linear and Notion, featuring deep dark modes, micro-animations, and full relational database support for advanced task management.

## 🚀 Features

* **Interactive Kanban Board:** Drag and drop tasks smoothly between columns (`To Do`, `In Progress`, `In Review`, `Done`) using `@dnd-kit/core`.
* **Advanced Task Details:** A comprehensive modal to manage task descriptions, priorities, and statuses.
* **Multi-Assignee Support:** Create team members and assign multiple people to a single task with beautiful overlapping avatar clusters.
* **Custom Labels:** Create color-coded labels and apply them to tasks for better categorization.
* **Activity Comments:** A chronological, real-time comment feed for every task.
* **Smart Filtering & Search:** Instantly filter the board by title/description or priority.
* **Due Dates:** Visual warning indicators for overdue (red) and upcoming (orange) deadlines.
* **Summary Stats:** At-a-glance metrics for total tasks, completed tasks, and overdue items.

## 🛠 Tech Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Radix UI (accessible headless components), Lucide Icons
* **Backend:** Supabase (PostgreSQL, Row-Level Security, Authentication)

## 📦 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LakshinG/Intern_task.git
   cd Intern_task
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Migration:**
   To enable all advanced features, you must run the provided SQL scripts in your Supabase SQL Editor in this order:
   * `schema_update.sql` (Creates core relations, labels, and comments)
   * `schema_update_assignees.sql` (Migrates tasks to support multiple assignees via a join table)

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The app will be live at `http://localhost:5173`.

## 🏗 Build for Production

```bash
npm run build
```
This generates an optimized static bundle in the `dist` folder.

## 🎨 Design Philosophy

The application prioritizes a sleek, professional user experience:
* Uses the modern `zinc` scale from Tailwind CSS to avoid harsh blacks.
* Task cards employ subtle spring animations (`hover:-translate-y-1`) and dynamic glowing borders (`hover:border-zinc-500`) to provide tactile feedback during interactions.
* The `TaskModal` is split into a dual-pane layout, isolating the discussion feed from core metadata properties, optimizing screen real estate.
