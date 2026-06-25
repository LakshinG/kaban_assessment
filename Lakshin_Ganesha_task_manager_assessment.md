# Task Management Application Assessment
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

## Design Philosophy
The UI was meticulously crafted to provide a premium, "wow" factor:
* **Color Palette:** Deep, muted dark mode using Tailwind's `zinc` palette with subtle border outlines.
* **Micro-interactions:** Cards feature a slight upward spring animation (`hover:-translate-y-1`) and a distinct glowing drop-shadow on hover to lift off the board.
* **Component Architecture:** The `TaskModal` utilizes a dual-pane layout separating the active discussion feed from metadata properties, ensuring readability and focus.

## Database Architecture
The application leverages Supabase with strict **Row-Level Security (RLS)** ensuring isolated environments.
1. `tasks`: Core task data.
2. `team_members`: Defines assignees (Name, Color).
3. `task_assignees`: Many-to-many join table linking tasks to multiple team members.
4. `labels`: Custom tags (Name, Color).
5. `task_labels`: Many-to-many join table linking tasks to multiple labels.
6. `comments`: Text feed entries bound to a specific task.

*(See `schema_update.sql` and `schema_update_assignees.sql` for the raw migrations)*
