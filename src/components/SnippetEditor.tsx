import { useState, useRef, useEffect } from 'react';
import { Snippet, Tag, LANGUAGES, TAG_COLORS, FOLDER_COLORS } from '@/types/snippet';
import { Folder } from '@/types/snippet';
import { X, Plus, Save, Trash2, ChevronDown } from 'lucide-react';

interface SnippetEditorProps {
  snippet?: Snippet;
  folders: Folder[];
  onSave: (data: Partial<Snippet>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function SnippetEditor({ snippet, folders, onSave, onCancel, onDelete }: SnippetEditorProps) {
  const [name, setName] = useState(snippet?.name || '');
  const [code, setCode] = useState(snippet?.code || '');
  const [language, setLanguage] = useState(snippet?.language || 'javascript');
  const [folderId, setFolderId] = useState(snippet?.folder_id || '');
  const [description, setDescription] = useState(snippet?.description || '');
  const [tags, setTags] = useState<Tag[]>(snippet?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.find(t => t.name === trimmed)) return;
    setTags([...tags, { name: trimmed, color: tagColor }]);
    setTagInput('');
    setShowTagPicker(false);
  };

  const removeTag = (name: string) => setTags(tags.filter(t => t.name !== name));

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      code,
      language,
      folder_id: folderId || null,
      description: description || null,
      tags,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Snippet name..."
          className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber text-primary-foreground font-medium rounded-lg hover:bg-amber-glow transition-all disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0 flex-wrap">
        {/* Language */}
        <div className="relative">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="appearance-none bg-muted border border-border rounded-lg pl-3 pr-7 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber/50 cursor-pointer"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
        </div>

        {/* Folder */}
        <div className="relative">
          <select
            value={folderId}
            onChange={e => setFolderId(e.target.value)}
            className="appearance-none bg-muted border border-border rounded-lg pl-3 pr-7 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber/50 cursor-pointer"
          >
            <option value="">No folder</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="// Paste or type your code here..."
          spellCheck={false}
          className="flex-1 w-full bg-code text-foreground font-mono text-sm p-4 focus:outline-none resize-none border-b border-border placeholder:text-muted-foreground/50"
          style={{ fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.6' }}
        />

        {/* Tags + Description */}
        <div className="px-4 py-3 space-y-3 overflow-y-auto max-h-48 shrink-0">
          {/* Tags */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span
                  key={tag.name}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: tag.color + '22', color: tag.color }}
                >
                  {tag.name}
                  <button onClick={() => removeTag(tag.name)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative flex items-center gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag..."
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber/50"
              />
              <button
                type="button"
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="w-6 h-6 rounded-full border-2 border-border hover:border-amber/50 transition-all shrink-0"
                style={{ backgroundColor: tagColor }}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="p-1.5 bg-amber/10 text-amber rounded-lg hover:bg-amber/20 transition-all disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {showTagPicker && (
                <div className="absolute top-8 right-0 z-10 bg-popover border border-border rounded-xl p-2.5 shadow-xl flex flex-wrap gap-1.5 w-36">
                  {TAG_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setTagColor(c); setShowTagPicker(false); }}
                      className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${tagColor === c ? 'ring-2 ring-offset-1 ring-amber ring-offset-popover' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes / Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add context, approach, or notes (Markdown supported)..."
              rows={3}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber/50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
