-- Migration: Multiple Assignees

-- 1. Remove assignee_id from tasks
ALTER TABLE public.tasks DROP COLUMN IF EXISTS assignee_id;

-- 2. Create task_assignees join table
CREATE TABLE IF NOT EXISTS public.task_assignees (
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, team_member_id)
);

-- 3. Enable RLS and add policy
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their task assignees" ON public.task_assignees FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
