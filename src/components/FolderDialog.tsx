import { useState } from 'react';
import { Folder } from '@/types/snippet';
import { FOLDER_COLORS } from '@/types/snippet';
import { X, Folder as FolderIcon } from 'lucide-react';

interface FolderDialogProps {
  folder?: Folder;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}

export function FolderDialog({ folder, onSave, onClose }: FolderDialogProps) {
  const [name, setName] = useState(folder?.name || '');
  const [color, setColor] = useState(folder?.color || FOLDER_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-xl p-5 w-80 shadow-xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{folder ? 'Edit Folder' : 'New Folder'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Folder"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-amber scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-muted rounded-lg border border-border">
              <FolderIcon className="w-4 h-4" style={{ color }} />
              <span className="text-sm text-foreground">{name || 'Folder name'}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="flex-1 py-2 text-sm bg-amber text-primary-foreground font-medium rounded-lg hover:bg-amber-glow transition-all disabled:opacity-40">
              {folder ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
