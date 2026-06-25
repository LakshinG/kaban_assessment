import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, AlertCircle } from 'lucide-react';
import type { Task } from '../types';
import { format, isPast, isToday, addDays } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'normal': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'low': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getDueDateStatus = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date) || (date > new Date() && date <= addDays(new Date(), 1))) return 'soon';
    return 'normal';
  };

  const dueDateStatus = getDueDateStatus(task.due_date);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[104px] bg-surfaceHover/50 border-2 border-dashed border-zinc-700 rounded-lg opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-surfaceHover border border-zinc-700 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] rounded-lg p-3.5 cursor-grab active:cursor-grabbing hover:border-zinc-500 transition-all duration-200 ease-out group relative"
    >
      <div className="flex flex-col gap-3">
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {task.labels.map((l: any) => (
              <span key={l.id} className="text-[9px] px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 flex items-center gap-1 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-sm font-medium leading-snug line-clamp-2">{task.title}</h3>
        
        <div className="flex items-center gap-2 mt-auto">
          <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-widest", getPriorityColor(task.priority))}>
            {task.priority}
          </span>
          
          {task.due_date && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
              dueDateStatus === 'overdue' ? "text-red-400 bg-red-500/10" : 
              dueDateStatus === 'soon' ? "text-orange-400 bg-orange-500/10" : 
              "text-zinc-500"
            )}>
              {dueDateStatus === 'overdue' ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3 text-zinc-600" />}
              {format(new Date(task.due_date), 'MMM d')}
            </div>
          )}

          {task.team_members && task.team_members.length > 0 && (
            <div className="ml-auto flex -space-x-1.5">
              {task.team_members.map((tm, i) => (
                <div 
                  key={tm.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 border border-zinc-800"
                  style={{ backgroundColor: tm.color, zIndex: 10 - i }}
                  title={`Assigned to ${tm.name}`}
                >
                  {tm.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
