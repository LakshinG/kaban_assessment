# Kaban Task Manager
**Name:** Lakshin Ganesha

## App Link: https://kaban-assessment.vercel.app

## Overview
This repository contains a professional, comprehensive Kanban board application built with React, TypeScript, Vite, and Supabase. Designed with a premium aesthetic, featuring deep dark modes, micro-animations, and full relational database support for advanced task management.

## Tech Stack
* **Frontend:** React, TypeScript, Vite
* **Styling:** Tailwind CSS (custom "zinc" aesthetic with micro-animations)
* **Drag-and-Drop:** `@dnd-kit/core`
* **Backend / Database:** Supabase (PostgreSQL)
* **Authentication:** Supabase Auth (Anonymous / Session-based)
* **Routing:** React Router (Optional for scaling, currently single-page Kanban)

## Features Implemented

### Core Requirements
- [x] **Task Creation:** Users can create tasks with a Title, Description, Status (To Do, In Progress, In Review, Done), and Priority.
- [x] **Task Management:** Users can edit and delete tasks via a comprehensive detail modal.
- [x] **Status Updates:** Tasks can be dragged and dropped between status columns seamlessly.

### Advanced Features
- [x] **Search & Filtering:** Real-time search by task title/description and priority filtering.
- [x] **Due Dates:** Visual indicators for overdue (red alert) and upcoming tasks (orange alert).
- [x] **Summary Statistics:** A sleek top bar showing total tasks, completed tasks, and overdue tasks.
- [x] **Team Members (Assignees):** Multi-select assignee system. Users can create team members and assign multiple members to a task.
- [x] **Labels:** Custom color-coded labels that can be created, applied, and multi-selected on tasks.
- [x] **Task Comments:** A chronological, real-time activity feed inside the task detail modal.

## Database Architecture
The application leverages Supabase with strict **Row-Level Security** ensuring isolated environments.
1. `tasks`: Core task data.
2. `team_members`: Defines assignees (Name, Color).
3. `task_assignees`: Many-to-many join table linking tasks to multiple team members.
4. `labels`: Custom tags (Name, Color).
5. `task_labels`: Many-to-many join table linking tasks to multiple labels.
6. `comments`: Text feed entries bound to a specific task.

*(See `schema_update.sql` and `schema_update_assignees.sql` for the raw migrations)*


## Local Setup

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

## Build for Production

```bash
npm run build
```
This generates an optimized static bundle in the `dist` folder.
