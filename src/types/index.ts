export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

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
}

export type NewTask = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type UpdateTask = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
