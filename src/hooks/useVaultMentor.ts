import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function useVaultMentor(snippetId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const { toast } = useToast();

  const loadMessages = async (sid: string) => {
    const { data } = await supabase
      .from('vault_mentor_chats')
      .select('*')
      .eq('snippet_id', sid)
      .order('created_at');
    if (data) setMessages(data as ChatMessage[]);
  };

  const sendMessage = async (content: string, snippetCode: string, snippetName: string, snippetLanguage: string) => {
    if (!snippetId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setStreaming(true);

    // Save user message
    await supabase.from('vault_mentor_chats').insert({
      snippet_id: snippetId,
      user_id: user.id,
      role: 'user',
      content,
    });

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/vault-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history, snippetCode, snippetName, snippetLanguage }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
        if (resp.status === 402) throw new Error('Usage limit reached. Please add credits.');
        throw new Error(err.error || 'AI service error');
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = crypto.randomUUID();

      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      let buffer = '';
      let done = false;

      while (!done) {
        const { done: rdone, value } = await reader.read();
        if (rdone) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              assistantContent += chunk;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Save assistant message
      await supabase.from('vault_mentor_chats').insert({
        snippet_id: snippetId,
        user_id: user.id,
        role: 'assistant',
        content: assistantContent,
      });
    } catch (err: any) {
      toast({ title: 'Vault Mentor Error', description: err.message, variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.role !== 'assistant' || m.content !== ''));
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const clearMessages = async () => {
    if (!snippetId) return;
    await supabase.from('vault_mentor_chats').delete().eq('snippet_id', snippetId);
    setMessages([]);
  };

  return { messages, loading, streaming, loadMessages, sendMessage, clearMessages };
}
