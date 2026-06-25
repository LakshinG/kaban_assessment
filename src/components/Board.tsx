import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { useTasks } from '../hooks/useTasks';
import type { Task, TaskStatus } from '../types';
import { Loader2 } from 'lucide-react';

interface BoardProps {
  searchQuery: string;
  priorityFilter: string;
}

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];

const Board: React.FC<BoardProps> = ({ searchQuery, priorityFilter }) => {
  const { tasks, loading, error, addTask, updateTask, moveTask, deleteTask, fetchTasks } = useTasks();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (task.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    
    // Sort tasks globally by position before distributing
    const sorted = [...filteredTasks].sort((a, b) => a.position - b.position);
    
    sorted.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: implement if you want real-time rearranging during drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isOverTask) {
      const overTask = tasks.find(t => t.id === overId);
      const activeTask = tasks.find(t => t.id === activeId);
      if (overTask && activeTask) {
        moveTask(activeId as string, overTask.status, overTask.position);
      }
    } else if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      // Moving to an empty column or end of a column
      const tasksInColumn = tasksByStatus[newStatus];
      const newPosition = tasksInColumn.length > 0 
        ? tasksInColumn[tasksInColumn.length - 1].position + 1 
        : 0;
      moveTask(activeId as string, newStatus, newPosition);
    }
  };

  const handleAddTaskClick = (status: TaskStatus) => {
    setEditingTask(null);
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      return editingTask.id;
    } else {
      const newTask = await addTask(taskData as Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'position'>);
      return newTask?.id;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchTasks(); // Refetch to catch any label/assignee changes
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-textSecondary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400">
        Error loading tasks: {error}
      </div>
    );
  }

  // Summary stats
  const totalTasks = tasks.length;
  const completedTasks = tasksByStatus.done.length;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

  return (
    <>
      <div className="flex items-center gap-4 mb-6 text-xs border border-zinc-800/60 bg-surface/30 w-fit px-3 py-1.5 rounded-full shadow-sm">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="font-semibold text-zinc-200">{totalTasks}</span> Tasks
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-700" />
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="font-semibold text-green-500/90">{completedTasks}</span> Done
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-700" />
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="font-semibold text-red-500/90">{overdueTasks}</span> Overdue
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 scale-105 shadow-xl">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onDelete={editingTask ? () => { deleteTask(editingTask.id); setIsModalOpen(false); fetchTasks(); } : undefined}
          task={editingTask}
          initialStatus={initialStatus}
          onRefetch={fetchTasks}
        />
      )}
    </>
  );
};

export default Board;
