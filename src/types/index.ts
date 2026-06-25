export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export interface TeamMember {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface TaskLabel {
  task_id: string;
  label_id: string;
  user_id: string;
  labels?: Label; // from join
}

export interface Comment {
  id: string;
  task_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Relations mapped by Supabase select
  team_members?: TeamMember[];
  labels?: Label[];
}

export type NewTask = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'team_members' | 'labels'>;
export type UpdateTask = Partial<NewTask>;
