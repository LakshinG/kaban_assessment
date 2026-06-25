import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '../types';
import { Plus } from 'lucide-react';

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-zinc-500' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500' },
  in_review: { label: 'In Review', color: 'bg-orange-500' },
  done: { label: 'Done', color: 'bg-green-500' },
};

export const Column: React.FC<ColumnProps> = ({ status, tasks, onTaskClick, onAddTask }) => {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col flex-1 min-w-[300px] max-w-[350px] bg-surface/50 rounded-xl border border-border overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border bg-surface sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
          <h2 className="font-medium text-sm">{config.label}</h2>
          <span className="text-xs text-textSecondary bg-zinc-800 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask(status)}
          className="text-textSecondary hover:text-textPrimary hover:bg-zinc-800 p-1 rounded transition-colors"
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col gap-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[150px]">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
            {tasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-sm text-textSecondary/50 border-2 border-dashed border-zinc-800/50 rounded-lg py-8">
                Drop here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
