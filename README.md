# Next Play Games - Internship Assessment
**Candidate:** Lakshin Ganesha  
**Project:** Kanban Task Board — Full-Stack Challenge  

## APP LINK: kaban-assessment.vercel.app

---

## 🚀 Overview

This submission is a high-fidelity, fully-functional Kanban task board heavily inspired by the sophisticated, minimal design systems of tools like **Linear** and **Notion**. 

The application is built to be fast, responsive, and seamlessly real-time, utilizing optimistic UI updates during drag-and-drop actions to ensure a fluid user experience while background synchronization ensures robust data persistence.

---

## 🛠️ Architecture & Tech Stack

### Frontend
* **React 18 & Vite:** For blazing-fast compilation and a robust component lifecycle.
* **TypeScript:** Ensuring strict end-to-end type safety mapping to the database schema.
* **Tailwind CSS v3:** Powering the visual hierarchy, sophisticated dark mode (`zinc-900`/`zinc-950` palette), micro-animations, and responsive layout.
* **Radix UI Primitives:** Providing accessible, unstyled components (like Dialog modals) that are wrapped with custom Tailwind to maintain complete design control.
* **@dnd-kit:** A lightweight, highly customizable drag-and-drop toolkit. Chosen over `react-beautiful-dnd` for its robust accessibility and physics-based spring animations.
* **lucide-react & date-fns:** For clean iconography and precise date formatting.

### Backend & Database
* **Supabase:** Providing a serverless PostgreSQL database and robust authentication.
* **Row Level Security (RLS):** Policies are strictly enforced so that anonymous users can securely read, insert, update, and delete *only* their own tasks.

---

## ✨ Advanced Features Implemented

1. **Intelligent Drag & Drop:**
   Physics-based drag interactions with smooth `transition-all duration-200 ease-out` easings. Drops instantly trigger optimistic UI state updates so the interface never feels blocked by network latency.

2. **Anonymous Guest Auth:**
   On initial app load, the application silently triggers Supabase's `signInAnonymously()`. This binds all subsequent tasks to a unique `user_id`, guaranteeing secure, isolated guest sessions.

3. **Search & Priority Filtering:**
   A sleek top header features a real-time text filter searching across task titles and descriptions, alongside quick-toggle filters for task priority levels.

4. **Due Date Indicators:**
   Visual badges on cards evaluate the distance to the deadline. Tasks flag as **Red (Overdue)** or **Orange (Soon)** to intuitively guide user attention.

5. **Board Summary Stats:**
   A muted, pill-shaped dashboard badge sits quietly above the board, automatically tracking Total Tasks, Completed Tasks, and Overdue Tasks in real-time.

---

## 🎨 Design Philosophy

Design was treated as a top-tier priority. Generic UI components were avoided in favor of a bespoke aesthetic:
* **Micro-interactions:** Cards feature a physical "lift" (`hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg`) and borders light up when interacted with, creating a tactile feel.
* **Typography:** Tight tracking and meticulous font sizing (`text-[9px]` for badges) ensure that secondary information stays out of the way of the core task titles.
* **Deep Dark Mode:** The app defaults to a deep, intentional dark palette without harsh true blacks or plain grays.

---

## 🗄️ Database Schema & RLS

Below is the complete SQL schema and security policies running in Supabase:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')) DEFAULT 'todo',
    priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high')) DEFAULT 'normal',
    due_date DATE,
    position INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Enforce isolation
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
```

---

## 🚀 Setup & Deployment

### Run Locally
1. Clone the repository and run `npm install`.
2. Copy `.env.example` to `.env.local` and add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `npm run dev` to start the local Vite server.

### Tradeoffs & Future Improvements
With more time, I would:
1. Implement virtualized lists (e.g., `@tanstack/react-virtual`) if columns were expected to hold thousands of tasks.
2. Abstract the Tailwind classes into reusable `cva` (class-variance-authority) variants to scale the component library.
3. Allow users to "upgrade" their anonymous session to a persistent email/password account using Supabase Auth linking.
