-- Enable UUID extension if not already enabled
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

-- Set up Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous guest access (tied to user_id)
-- Policy: Users can only select their own tasks
CREATE POLICY "Users can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only insert tasks with their own user_id
CREATE POLICY "Users can insert their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own tasks
CREATE POLICY "Users can update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own tasks
CREATE POLICY "Users can delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create a function and trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
