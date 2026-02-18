import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Folder, Snippet, Tag } from '@/types/snippet';
import { useToast } from '@/hooks/use-toast';

export function useSnippets() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFolders = useCallback(async () => {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name');
    if (!error && data) setFolders(data as Folder[]);
  }, []);

  const fetchSnippets = useCallback(async () => {
    const { data, error } = await supabase
      .from('snippets')
      .select('*, folder:folders(*)')
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setSnippets(data.map(s => ({
        ...s,
        tags: Array.isArray(s.tags) ? (s.tags as unknown as Tag[]) : [],
      })) as Snippet[]);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchFolders(), fetchSnippets()]);
    setLoading(false);
  }, [fetchFolders, fetchSnippets]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') fetchAll();
      if (event === 'SIGNED_OUT') {
        setFolders([]);
        setSnippets([]);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchAll();
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [fetchAll]);

  const createFolder = async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('folders').insert({ name, color, user_id: user.id }).select().single();
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return null; }
    await fetchFolders();
    return data as Folder;
  };

  const updateFolder = async (id: string, updates: Partial<Pick<Folder, 'name' | 'color'>>) => {
    const { error } = await supabase.from('folders').update(updates).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    await fetchFolders();
  };

  const deleteFolder = async (id: string) => {
    const { error } = await supabase.from('folders').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    await fetchAll();
  };

  const createSnippet = async (snippet: Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'folder'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('snippets').insert({
      ...snippet,
      tags: snippet.tags as any,
      user_id: user.id,
    }).select('*, folder:folders(*)').single();
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return null; }
    await fetchSnippets();
    return { ...data, tags: Array.isArray(data.tags) ? (data.tags as unknown as Tag[]) : [] } as Snippet;
  };

  const updateSnippet = async (id: string, updates: Partial<Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'folder'>>) => {
    const payload: any = { ...updates };
    if (updates.tags) payload.tags = updates.tags as any;
    const { error } = await supabase.from('snippets').update(payload).eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    await fetchSnippets();
  };

  const deleteSnippet = async (id: string) => {
    const { error } = await supabase.from('snippets').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    await fetchSnippets();
  };

  return {
    folders, snippets, loading,
    createFolder, updateFolder, deleteFolder,
    createSnippet, updateSnippet, deleteSnippet,
    refetch: fetchAll,
  };
}
