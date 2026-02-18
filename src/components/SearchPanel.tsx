import { useState } from 'react';
import { Snippet, Folder } from '@/types/snippet';
import { SnippetListItem } from './SnippetListItem';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { LANGUAGES } from '@/types/snippet';

interface SearchPanelProps {
  snippets: Snippet[];
  folders: Folder[];
  query: string;
  onSelect: (snippet: Snippet) => void;
  selectedId?: string;
}

export function SearchPanel({ snippets, folders, query, onSelect, selectedId }: SearchPanelProps) {
  const [filterLang, setFilterLang] = useState<string[]>([]);
  const [filterFolder, setFilterFolder] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Collect all unique tags
  const allTags = Array.from(new Set(snippets.flatMap(s => s.tags.map(t => t.name))));
  const allTagColors: Record<string, string> = {};
  snippets.forEach(s => s.tags.forEach(t => { allTagColors[t.name] = t.color; }));

  const filtered = snippets.filter(s => {
    if (filterLang.length && !filterLang.includes(s.language)) return false;
    if (filterFolder.length && !filterFolder.includes(s.folder_id || '')) return false;
    if (filterTag.length && !filterTag.every(t => s.tags.some(st => st.name === t))) return false;
    return true;
  });

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const hasFilters = filterLang.length + filterFolder.length + filterTag.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{filtered.length}</span> results for "{query}"
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${
              showFilters || hasFilters ? 'border-amber/30 text-amber bg-amber/10' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter className="w-3 h-3" />
            Filters
            {hasFilters && <span className="text-[10px] bg-amber text-primary-foreground rounded-full px-1">{filterLang.length + filterFolder.length + filterTag.length}</span>}
          </button>
        </div>

        {showFilters && (
          <div className="mt-2 space-y-3 animate-fade-in">
            {/* Language */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Language</p>
              <div className="flex flex-wrap gap-1">
                {LANGUAGES.filter(l => snippets.some(s => s.language === l.value)).map(l => (
                  <button
                    key={l.value}
                    onClick={() => toggle(filterLang, setFilterLang, l.value)}
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border transition-all ${
                      filterLang.includes(l.value)
                        ? 'bg-amber/15 border-amber/30 text-amber'
                        : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Folder */}
            {folders.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Folder</p>
                <div className="flex flex-wrap gap-1">
                  {folders.map(f => (
                    <button
                      key={f.id}
                      onClick={() => toggle(filterFolder, setFilterFolder, f.id)}
                      className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border transition-all ${
                        filterFolder.includes(f.id)
                          ? 'border-amber/30 text-amber bg-amber/10'
                          : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {allTags.map(t => (
                    <button
                      key={t}
                      onClick={() => toggle(filterTag, setFilterTag, t)}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border transition-all ${
                        filterTag.includes(t) ? 'border-transparent' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: filterTag.includes(t)
                          ? allTagColors[t] + '33'
                          : allTagColors[t] + '15',
                        color: allTagColors[t],
                        outline: filterTag.includes(t) ? `1px solid ${allTagColors[t]}55` : 'none',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground">No snippets found</p>
          </div>
        ) : (
          filtered.map(s => (
            <SnippetListItem
              key={s.id}
              snippet={s}
              isActive={s.id === selectedId}
              onClick={() => onSelect(s)}
            />
          ))
        )}
      </div>
    </div>
  );
}
