import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Task, TaskStatus } from '../types';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*, task_assignees(team_members(*)), task_labels(labels(*))')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'position'>) => {
    if (!user) return null;
    
    // Find highest position in the current status to append to the bottom
    const tasksInStatus = tasks.filter(t => t.status === taskData.status);
    const maxPosition = tasksInStatus.length > 0 ? Math.max(...tasksInStatus.map(t => t.position)) : -1;
    const position = maxPosition + 1;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id, position }])
        .select()
        .single();

      if (error) throw error;
      if (data) setTasks(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) {
        // Revert on error
        await fetchTasks();
        throw error;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
    // Find task
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    const oldStatus = task.status;
    const oldPosition = task.position;
    
    // If nothing changed, do nothing
    if (oldStatus === newStatus && oldPosition === newPosition) return;

    // Deep clone tasks for optimistic update calculation
    let newTasks = [...tasks];
    
    if (oldStatus === newStatus) {
      // Reordering within the same column
      const columnTasks = newTasks.filter(t => t.status === oldStatus).sort((a, b) => a.position - b.position);
      
      const [movedItem] = columnTasks.splice(columnTasks.findIndex(t => t.id === taskId), 1);
      columnTasks.splice(newPosition, 0, movedItem);
      
      // Update positions
      columnTasks.forEach((t, i) => { t.position = i; });
      
      // Merge back
      newTasks = newTasks.map(t => {
        const updated = columnTasks.find(ct => ct.id === t.id);
        return updated ? updated : t;
      });
    } else {
      // Moving to a different column
      // 1. Remove from old column and shift remaining up
      const oldColumnTasks = newTasks.filter(t => t.status === oldStatus && t.id !== taskId).sort((a, b) => a.position - b.position);
      oldColumnTasks.forEach((t, i) => { t.position = i; });

      // 2. Insert into new column and shift remaining down
      const newColumnTasks = newTasks.filter(t => t.status === newStatus).sort((a, b) => a.position - b.position);
      
      // Update the moved task
      const movedTask = { ...task, status: newStatus, position: newPosition };
      newColumnTasks.splice(newPosition, 0, movedTask);
      
      newColumnTasks.forEach((t, i) => { t.position = i; });
      
      // Merge all back
      newTasks = newTasks.map(t => {
        if (t.id === taskId) return movedTask;
        const inOld = oldColumnTasks.find(ct => ct.id === t.id);
        if (inOld) return inOld;
        const inNew = newColumnTasks.find(ct => ct.id === t.id);
        if (inNew) return inNew;
        return t;
      });
    }

    // Apply optimistic update
    setTasks(newTasks);

    // Save to Supabase (simplistic: just update the moved task and let RLS handle it,
    // but really we should update all affected positions. For the sake of simplicity and
    // reducing DB calls, we might just update the positions that changed).
    try {
      // Prepare bulk update array for all tasks whose status or position changed
      const changes = newTasks.filter(nt => {
        const ot = tasks.find(t => t.id === nt.id);
        return ot && (ot.status !== nt.status || ot.position !== nt.position);
      }).map(t => ({ ...t }));

      if (changes.length > 0) {
        const { error } = await supabase
          .from('tasks')
          .upsert(changes, { onConflict: 'id' });

        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
      fetchTasks(); // Revert
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== id));
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        await fetchTasks();
        throw error;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { tasks, loading, error, addTask, updateTask, moveTask, deleteTask, fetchTasks };
};
