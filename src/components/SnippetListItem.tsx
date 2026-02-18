import { Snippet } from '@/types/snippet';
import { LANGUAGE_ICONS } from '@/types/snippet';
import { formatDistanceToNow } from 'date-fns';

interface SnippetListItemProps {
  snippet: Snippet;
  isActive: boolean;
  onClick: () => void;
}

export function SnippetListItem({ snippet, isActive, onClick }: SnippetListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-border transition-all group ${
        isActive
          ? 'bg-amber/10 border-l-2 border-l-amber'
          : 'hover:bg-surface-elevated border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={`text-sm font-medium truncate ${isActive ? 'text-amber' : 'text-foreground group-hover:text-amber/80'}`}>
          {snippet.name}
        </span>
        <span className="text-[10px] font-mono font-semibold shrink-0 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          {LANGUAGE_ICONS[snippet.language] || snippet.language.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {snippet.folder && (
          <span className="text-[11px] flex items-center gap-1 text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: snippet.folder.color }} />
            {snippet.folder.name}
          </span>
        )}
        {snippet.tags.slice(0, 3).map(tag => (
          <span
            key={tag.name}
            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: tag.color + '22', color: tag.color }}
          >
            {tag.name}
          </span>
        ))}
        {snippet.tags.length > 3 && (
          <span className="text-[10px] text-muted-foreground">+{snippet.tags.length - 3}</span>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1.5">
        {formatDistanceToNow(new Date(snippet.updated_at), { addSuffix: true })}
      </div>
    </button>
  );
}
