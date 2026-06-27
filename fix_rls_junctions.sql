-- Fix RLS Policies for task_labels and task_assignees junction tables
-- Run this in the Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- 2. Drop any broken existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their task labels" ON public.task_labels;
DROP POLICY IF EXISTS "Users can manage their task assignees" ON public.task_assignees;
DROP POLICY IF EXISTS "Allow All Insert" ON public.task_labels;
DROP POLICY IF EXISTS "Allow All Delete" ON public.task_labels;
DROP POLICY IF EXISTS "Allow All Select" ON public.task_labels;
DROP POLICY IF EXISTS "Allow All Insert" ON public.task_assignees;
DROP POLICY IF EXISTS "Allow All Delete" ON public.task_assignees;
DROP POLICY IF EXISTS "Allow All Select" ON public.task_assignees;

-- 3. Create SELECT policies (Required to view the labels/assignees on the board)
CREATE POLICY "Allow Select task_labels" ON public.task_labels 
FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow Select task_assignees" ON public.task_assignees 
FOR SELECT TO authenticated, anon USING (true);

-- 4. Create INSERT policies (Required to add new labels/assignees)
CREATE POLICY "Allow Insert task_labels" ON public.task_labels 
FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow Insert task_assignees" ON public.task_assignees 
FOR INSERT TO authenticated, anon WITH CHECK (true);

-- 5. Create DELETE policies (Required to update/remove labels/assignees)
CREATE POLICY "Allow Delete task_labels" ON public.task_labels 
FOR DELETE TO authenticated, anon USING (true);

CREATE POLICY "Allow Delete task_assignees" ON public.task_assignees 
FOR DELETE TO authenticated, anon USING (true);
