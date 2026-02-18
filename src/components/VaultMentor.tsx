import { useEffect, useState, useRef } from 'react';
import { useVaultMentor } from '@/hooks/useVaultMentor';
import { Snippet } from '@/types/snippet';
import { Send, Trash2, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface VaultMentorProps {
  snippet: Snippet;
}

export function VaultMentor({ snippet }: VaultMentorProps) {
  const { messages, loading, streaming, loadMessages, sendMessage, clearMessages } = useVaultMentor(snippet.id);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMessages(snippet.id);
  }, [snippet.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    await sendMessage(msg, snippet.code, snippet.name, snippet.language);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Explain this code",
    "What's the time complexity?",
    "How can I optimize this?",
    "Ask me an interview question",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Vault Mentor</span>
            <span className="text-[10px] text-amber ml-2 font-medium">AI</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-amber" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Ask me anything about this snippet</p>
            <p className="text-xs text-muted-foreground mb-4">Analysis, complexity, explanations, interview prep</p>
            <div className="grid grid-cols-2 gap-1.5 w-full max-w-xs">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-left text-[11px] px-2.5 py-2 bg-surface border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-amber/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
              msg.role === 'assistant' ? 'bg-amber/15' : 'bg-secondary'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-3.5 h-3.5 text-amber" />
                : <User className="w-3 h-3 text-muted-foreground" />
              }
            </div>
            <div className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-amber/15 text-foreground'
                : 'bg-surface border border-border text-foreground'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-xs prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{msg.content || (streaming ? '▋' : '')}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
              {msg.role === 'assistant' && msg.content === '' && streaming && (
                <span className="inline-block w-1.5 h-3.5 bg-amber animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 shrink-0">
        <div className="flex items-end gap-2 bg-surface border border-border rounded-xl p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this snippet..."
            rows={1}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-24"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 bg-amber text-primary-foreground rounded-lg hover:bg-amber-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
