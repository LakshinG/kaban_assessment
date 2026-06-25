import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { X, Trash2, Calendar, Tag, MessageSquare, Send, Plus, Users } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { format } from 'date-fns';
import { useTaskDetails } from '../hooks/useTaskDetails';


interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<string | undefined>;
  onDelete?: () => void;
  task: Task | null;
  initialStatus: TaskStatus;
  onRefetch?: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  initialStatus,
  onRefetch,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [dueDate, setDueDate] = useState('');

  const [newComment, setNewComment] = useState('');
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newLabelName, setNewLabelName] = useState('');

  // Draft States
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);
  const [activeAssigneeIds, setActiveAssigneeIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch relations when task exists
  const { 
    comments, 
    labels, 
    teamMembers, 
    fetchDetails, 
    addComment, 
    syncTaskRelations,
    createTeamMember,
    createLabel
  } = useTaskDetails(task?.id || null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '');
      setActiveLabelIds(task.labels?.map(l => l.id) || []);
      setActiveAssigneeIds(task.team_members?.map(tm => tm.id) || []);
      fetchDetails();
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setPriority('normal');
      setDueDate('');
      setActiveLabelIds([]);
      setActiveAssigneeIds([]);
    }
  }, [task, initialStatus, fetchDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);

    const savedTaskId = await onSave({
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate || null,
    });

    if (savedTaskId) {
      await syncTaskRelations(savedTaskId, activeLabelIds, activeAssigneeIds);
    }
    
    if (onRefetch) onRefetch();
    setIsSaving(false);
    onClose();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    await addComment(newComment.trim());
    setNewComment('');
  };

  const handleCreateAssignee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssigneeName.trim()) return;
    const colors = ['#ef4444', '#f97316', '#8b5cf6', '#3b82f6', '#10b981'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const member = await createTeamMember(newAssigneeName.trim(), randomColor);
    if (member) {
      setActiveAssigneeIds(prev => [...prev, member.id]);
    }
    setNewAssigneeName('');
  };

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const colors = ['#ef4444', '#f97316', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const label = await createLabel(newLabelName.trim(), randomColor);
    if (label) {
      setActiveLabelIds(prev => [...prev, label.id]);
    }
    setNewLabelName('');
  };

  const toggleDraftLabel = (labelId: string, isActive: boolean) => {
    setActiveLabelIds(prev => isActive ? prev.filter(id => id !== labelId) : [...prev, labelId]);
  };

  const toggleDraftAssignee = (assigneeId: string, isActive: boolean) => {
    setActiveAssigneeIds(prev => isActive ? prev.filter(id => id !== assigneeId) : [...prev, assigneeId]);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" />
        <Dialog.Content 
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-50 animate-fade-in focus:outline-none"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <Dialog.Title className="text-xl font-semibold">
              {task ? 'Edit Task' : 'Create Task'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-textSecondary hover:text-textPrimary rounded-full p-1 hover:bg-surfaceHover transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Column: Form & Comments */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar border-r border-border">
              <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                    className="bg-transparent text-2xl font-semibold focus:outline-none placeholder:text-zinc-600"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-medium text-textSecondary uppercase tracking-wider">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add some details..."
                    rows={4}
                    className="bg-surfaceHover border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600 resize-none"
                  />
                </div>
              </form>

              {task && (
                <div className="mt-8 flex flex-col gap-4 flex-1">
                  <h3 className="text-sm font-medium flex items-center gap-2 border-b border-border pb-2">
                    <MessageSquare className="w-4 h-4" /> Activity & Comments
                  </h3>
                  
                  <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {comments.length === 0 ? (
                      <div className="text-sm text-textSecondary text-center py-4">No comments yet.</div>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                            Me
                          </div>
                          <div className="flex flex-col gap-1 bg-surfaceHover border border-border p-3 rounded-lg flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">Me</span>
                              <span className="text-[10px] text-textSecondary">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                            </div>
                            <p className="text-sm">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="mt-auto flex items-end gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={1}
                      className="flex-1 bg-surfaceHover border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="p-2 bg-zinc-100 text-zinc-900 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="w-72 bg-surface/50 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-textSecondary uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  form="task-form"
                  className="bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 transition-all cursor-pointer"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-textSecondary uppercase tracking-wider">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  form="task-form"
                  className="bg-surface border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 transition-all cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-textSecondary uppercase tracking-wider">Due Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    form="task-form"
                    className="w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-zinc-500 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              {task && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-textSecondary uppercase tracking-wider flex items-center justify-between">
                      Assignees
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {teamMembers.filter(tm => activeAssigneeIds.includes(tm.id)).map(tm => (
                        <div key={tm.id} className="flex items-center gap-1.5 bg-surface border border-border px-2 py-1 rounded-md">
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                            style={{ backgroundColor: tm.color }}
                          >
                            {tm.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs">{tm.name}</span>
                        </div>
                      ))}
                    </div>

                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button type="button" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-border bg-surfaceHover px-3 py-1.5 rounded-md transition-colors w-fit">
                          <Users className="w-3 h-3" /> Select Assignees
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content align="start" className="bg-surface border border-border rounded-lg shadow-xl p-2 w-56 z-50">
                          {teamMembers.map(member => {
                            const isActive = activeAssigneeIds.includes(member.id);
                            return (
                              <DropdownMenu.Item 
                                key={member.id}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  toggleDraftAssignee(member.id, isActive);
                                }}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-surfaceHover rounded-md outline-none"
                              >
                                <input type="checkbox" checked={isActive} readOnly className="pointer-events-none" />
                                <div 
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: member.color }}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                {member.name}
                              </DropdownMenu.Item>
                            );
                          })}
                          
                          <DropdownMenu.Separator className="h-px bg-border my-2" />
                          
                          <div className="px-2 pb-1">
                            <form onSubmit={handleCreateAssignee} className="flex gap-2">
                              <input
                                type="text"
                                value={newAssigneeName}
                                onChange={(e) => setNewAssigneeName(e.target.value)}
                                placeholder="New member..."
                                className="flex-1 bg-surface border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-zinc-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                type="submit"
                                disabled={!newAssigneeName.trim()}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </form>
                          </div>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-4">
                    <label className="text-xs font-medium text-textSecondary uppercase tracking-wider flex items-center justify-between">
                      Labels
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {labels.filter(l => activeLabelIds.includes(l.id)).map(l => (
                        <span key={l.id} className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                          {l.name}
                        </span>
                      ))}
                    </div>
                    
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button type="button" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-border bg-surfaceHover px-3 py-1.5 rounded-md transition-colors w-fit">
                          <Tag className="w-3 h-3" /> Select Labels
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content align="start" className="bg-surface border border-border rounded-lg shadow-xl p-2 w-56 z-50">
                          {labels.map(label => {
                            const isActive = activeLabelIds.includes(label.id);
                            return (
                              <DropdownMenu.Item 
                                key={label.id}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  toggleDraftLabel(label.id, isActive);
                                }}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-surfaceHover rounded-md outline-none"
                              >
                                <input type="checkbox" checked={isActive} readOnly className="pointer-events-none" />
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
                                {label.name}
                              </DropdownMenu.Item>
                            );
                          })}
                          
                          <DropdownMenu.Separator className="h-px bg-border my-2" />
                          
                          <div className="px-2 pb-1">
                            <form onSubmit={handleCreateLabel} className="flex gap-2">
                              <input
                                type="text"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                placeholder="Create label..."
                                className="flex-1 bg-surface border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-zinc-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                type="submit"
                                disabled={!newLabelName.trim()}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Add
                              </button>
                            </form>
                          </div>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface/30">
            {task && onDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
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
                form="task-form"
                disabled={!title.trim() || isSaving}
                className="px-4 py-2 text-sm font-medium bg-zinc-100 text-zinc-900 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
