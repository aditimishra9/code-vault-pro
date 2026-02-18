import { useState } from 'react';
import { Snippet } from '@/types/snippet';
import { LANGUAGE_ICONS } from '@/types/snippet';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Edit2, Folder, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { VaultMentor } from './VaultMentor';

interface SnippetViewProps {
  snippet: Snippet;
  onEdit: () => void;
  isDark: boolean;
}

export function SnippetView({ snippet, onEdit, isDark }: SnippetViewProps) {
  const [copied, setCopied] = useState(false);
  const [showMentor, setShowMentor] = useState(true);

  const copyCode = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const langMap: Record<string, string> = {
    cpp: 'cpp',
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    html: 'html',
    css: 'css',
    java: 'java',
    c: 'c',
    markdown: 'markdown',
    sql: 'sql',
    bash: 'bash',
    json: 'json',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex-1 min-w-0 mr-3">
          <h2 className="text-base font-bold text-foreground truncate">{snippet.name}</h2>
          <div className="flex items-center flex-wrap gap-2 mt-1">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber/10 text-amber border border-amber/20">
              {LANGUAGE_ICONS[snippet.language] || snippet.language}
            </span>
            {snippet.folder && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: snippet.folder.color }} />
                {snippet.folder.name}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {formatDistanceToNow(new Date(snippet.updated_at), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="w-2.5 h-2.5" />
              {format(new Date(snippet.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          {snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {snippet.tags.map(tag => (
                <span
                  key={tag.name}
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: tag.color + '22', color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-amber/30 transition-all shrink-0"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Code block */}
        <div className="relative group mx-4 mt-3 rounded-xl overflow-hidden border border-border">
          <div className="flex items-center justify-between px-3 py-2 bg-code border-b border-border">
            <span className="text-[10px] font-mono text-muted-foreground">{snippet.language}</span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-amber transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <SyntaxHighlighter
            language={langMap[snippet.language] || 'text'}
            style={isDark ? atomOneDark : atomOneLight}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'hsl(var(--code-bg))',
              fontSize: '12px',
              lineHeight: '1.6',
              fontFamily: "'JetBrains Mono', monospace",
              maxHeight: '280px',
              overflowY: 'auto',
            }}
            showLineNumbers
          >
            {snippet.code || '// Empty snippet'}
          </SyntaxHighlighter>
        </div>

        {/* Description */}
        {snippet.description && (
          <div className="mx-4 mt-3 p-3 bg-surface border border-border rounded-xl">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
            <div className="prose prose-xs max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown>{snippet.description}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Vault Mentor */}
        <div className="mx-4 mt-3 mb-3 border border-border rounded-xl overflow-hidden flex flex-col" style={{ minHeight: '300px', height: '380px' }}>
          <VaultMentor snippet={snippet} />
        </div>
      </div>
    </div>
  );
}
