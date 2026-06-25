import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2 } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: () => void;
  task: Task | null;
  initialStatus: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  initialStatus,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setPriority('normal');
      setDueDate('');
    }
  }, [task, initialStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate || null,
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-xl shadow-2xl p-6 w-full max-w-lg z-50 animate-fade-in focus:outline-none">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {task ? 'Edit Task' : 'Create Task'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-textSecondary hover:text-textPrimary rounded-full p-1 hover:bg-surfaceHover transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-medium text-textSecondary">Title</label>
              <input
                id="title"
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="bg-surfaceHover border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-sm font-medium text-textSecondary">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details..."
                rows={4}
                className="bg-surfaceHover border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="status" className="text-sm font-medium text-textSecondary">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="bg-surfaceHover border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="priority" className="text-sm font-medium text-textSecondary">Priority</label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="bg-surfaceHover border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="dueDate" className="text-sm font-medium text-textSecondary">Due Date (Optional)</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-surfaceHover border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              {task && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Task
                </button>
              ) : <div />}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-textPrimary hover:bg-surfaceHover border border-transparent rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-4 py-2 text-sm font-medium bg-zinc-100 text-zinc-900 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {task ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
