import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Comment, Label, TeamMember } from '../types';

export const useTaskDetails = (taskId: string | null) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!user || !taskId) return;
    setLoading(true);
    try {
      // Fetch comments for this task
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (commentsData) setComments(commentsData);

      // Fetch all available labels for the user
      const { data: labelsData } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', user.id);
      
      if (labelsData) setLabels(labelsData);

      // Fetch all available team members for the user
      const { data: teamData } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id);
      
      if (teamData) setTeamMembers(teamData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, taskId]);

  const addComment = async (content: string) => {
    if (!user || !taskId) return;
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ task_id: taskId, content, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) setComments(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
    }
  };

  const createLabel = async (name: string, color: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('labels')
        .insert([{ name, color, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setLabels(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const createTeamMember = async (name: string, color: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{ name, color, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setTeamMembers(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const syncTaskRelations = async (id: string, labelIds: string[], assigneeIds: string[]) => {
    if (!user) return;
    try {
      // 1. Sync Labels
      const { error: d1 } = await supabase.from('task_labels').delete().eq('task_id', id);
      if (d1) throw new Error("Task labels delete error: " + d1.message);

      if (labelIds.length > 0) {
        // Try with user_id first
        let labelInserts = labelIds.map(label_id => ({ task_id: id, label_id, user_id: user.id }));
        let { error: i1 } = await supabase.from('task_labels').insert(labelInserts);
        
        if (i1 && i1.message.includes('user_id')) {
          // Fallback if user_id column is missing
          const safeInserts = labelIds.map(label_id => ({ task_id: id, label_id }));
          const { error: i1Fallback } = await supabase.from('task_labels').insert(safeInserts);
          if (i1Fallback) throw new Error("Task labels insert fallback error: " + i1Fallback.message);
        } else if (i1) {
          throw new Error("Task labels insert error: " + i1.message);
        }
      }

      // 2. Sync Assignees
      const { error: d2 } = await supabase.from('task_assignees').delete().eq('task_id', id);
      if (d2) throw new Error("Task assignees delete error: " + d2.message);

      if (assigneeIds.length > 0) {
        // Try with user_id first
        let assigneeInserts = assigneeIds.map(team_member_id => ({ task_id: id, team_member_id, user_id: user.id }));
        let { error: i2 } = await supabase.from('task_assignees').insert(assigneeInserts);
        
        if (i2 && i2.message.includes('user_id')) {
          // Fallback if user_id column is missing
          const safeInserts = assigneeIds.map(team_member_id => ({ task_id: id, team_member_id }));
          const { error: i2Fallback } = await supabase.from('task_assignees').insert(safeInserts);
          if (i2Fallback) throw new Error("Task assignees insert fallback error: " + i2Fallback.message);
        } else if (i2) {
          throw new Error("Task assignees insert error: " + i2.message);
        }
      }
    } catch (err: any) {
      console.error("Sync Task Relations Error:", err);
      alert("Failed to save labels or assignees to the database: " + (err.message || "Unknown error"));
    }
  };

  return { 
    comments, 
    labels, 
    teamMembers, 
    loading, 
    fetchDetails, 
    addComment, 
    createLabel, 
    createTeamMember,
    syncTaskRelations 
  };
};
