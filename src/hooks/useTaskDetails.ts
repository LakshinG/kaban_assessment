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
      await supabase.from('task_labels').delete().eq('task_id', id);
      if (labelIds.length > 0) {
        const labelInserts = labelIds.map(label_id => ({ task_id: id, label_id }));
        await supabase.from('task_labels').insert(labelInserts);
      }

      // 2. Sync Assignees
      await supabase.from('task_assignees').delete().eq('task_id', id);
      if (assigneeIds.length > 0) {
        const assigneeInserts = assigneeIds.map(team_member_id => ({ task_id: id, team_member_id }));
        await supabase.from('task_assignees').insert(assigneeInserts);
      }
    } catch (err) {
      console.error(err);
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
