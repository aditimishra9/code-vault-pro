import { useState, useMemo } from 'react';
import { useSnippets } from '@/hooks/useSnippets';
import { Snippet } from '@/types/snippet';
import { SnippetListItem } from '@/components/SnippetListItem';
import { SnippetView } from '@/components/SnippetView';
import { SnippetEditor } from '@/components/SnippetEditor';
import { SearchPanel } from '@/components/SearchPanel';
import { FolderDialog } from '@/components/FolderDialog';
import { AuthPage } from '@/components/AuthPage';
import { supabase } from '@/integrations/supabase/client';
import {
  Vault, Plus, Search, Folder as FolderIcon, LogOut, Sun, Moon,
  ChevronRight, ChevronDown, MoreHorizontal, Trash2, Edit2, X
} from 'lucide-react';
import { useEffect } from 'react';

type RightPanel = 'view' | 'edit' | 'new';

export default function Index() {
  const { folders, snippets, loading, createFolder, updateFolder, deleteFolder, createSnippet, updateSnippet, deleteSnippet } = useSnippets();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>('view');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.remove('light');
    else document.documentElement.classList.add('light');
  }, [isDark]);

  const filteredSnippets = useMemo(() => {
    let list = snippets;
    if (selectedFolderId) list = list.filter(s => s.folder_id === selectedFolderId);
    if (!isSearching || !searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q) ||
      s.tags.some(t => t.name.toLowerCase().includes(q)) ||
      (s.description || '').toLowerCase().includes(q)
    );
  }, [snippets, selectedFolderId, searchQuery, isSearching]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSearching(!!searchQuery.trim());
  };

  const handleSearchInput = (v: string) => {
    setSearchQuery(v);
    if (!v.trim()) setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleSelectSnippet = (s: Snippet) => {
    setSelectedSnippet(s);
    setRightPanel('view');
  };

  const handleNewSnippet = () => {
    setSelectedSnippet(null);
    setRightPanel('new');
  };

  const handleSaveNew = async (data: Partial<Snippet>) => {
    const created = await createSnippet({
      name: data.name!,
      code: data.code || '',
      language: data.language || 'javascript',
      folder_id: data.folder_id || null,
      description: data.description || null,
      tags: data.tags || [],
    });
    if (created) { setSelectedSnippet(created); setRightPanel('view'); }
  };

  const handleSaveEdit = async (data: Partial<Snippet>) => {
    if (!selectedSnippet) return;
    await updateSnippet(selectedSnippet.id, data);
    setRightPanel('view');
    // Refresh the selected snippet data
    setSelectedSnippet(prev => prev ? { ...prev, ...data } : null);
  };

  const handleDelete = async () => {
    if (!selectedSnippet) return;
    await deleteSnippet(selectedSnippet.id);
    setSelectedSnippet(null);
    setRightPanel('view');
  };

  const toggleFolder = (id: string) => {
    setCollapsedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const signOut = () => supabase.auth.signOut();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!session) return <AuthPage />;

  const noFolder = snippets.filter(s => !s.folder_id);
  const snippetCountByFolder = (fid: string) => snippets.filter(s => s.folder_id === fid).length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-56 flex flex-col bg-sidebar border-r border-sidebar-border shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
          <div className="w-7 h-7 rounded-lg bg-amber/15 flex items-center justify-center">
            <Vault className="w-4 h-4 text-amber" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight">Snippet Vault</span>
        </div>

        {/* New Snippet Button */}
        <div className="px-3 py-3 border-b border-sidebar-border">
          <button
            onClick={handleNewSnippet}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber text-primary-foreground text-xs font-semibold rounded-lg hover:bg-amber-glow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Snippet
          </button>
        </div>

        {/* Folder list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* All snippets */}
          <button
            onClick={() => { setSelectedFolderId(null); setIsSearching(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-all group ${
              !selectedFolderId && !isSearching
                ? 'text-amber bg-amber/10'
                : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent'
            }`}
          >
            <span className="font-medium">All Snippets</span>
            <span className="text-[10px] text-muted-foreground">{snippets.length}</span>
          </button>

          {/* Folders section */}
          <div className="mt-2">
            <div className="flex items-center justify-between px-3 py-1 mb-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Folders</span>
              <button
                onClick={() => { setEditingFolder(null); setShowFolderDialog(true); }}
                className="text-muted-foreground hover:text-amber transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {folders.map(folder => (
              <div key={folder.id} className="relative">
                <div className={`flex items-center group px-3 py-1.5 cursor-pointer transition-all ${
                  selectedFolderId === folder.id ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                }`}>
                  <button onClick={() => toggleFolder(folder.id)} className="mr-1 text-muted-foreground">
                    {collapsedFolders.has(folder.id)
                      ? <ChevronRight className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                    }
                  </button>
                  <button
                    className="flex items-center gap-1.5 flex-1 min-w-0"
                    onClick={() => setSelectedFolderId(folder.id === selectedFolderId ? null : folder.id)}
                  >
                    <FolderIcon className="w-3.5 h-3.5 shrink-0" style={{ color: folder.color }} />
                    <span className="text-xs truncate">{folder.name}</span>
                  </button>
                  <div className="flex items-center gap-1 ml-1">
                    <span className="text-[10px] text-muted-foreground">{snippetCountByFolder(folder.id)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFolderMenuOpen(folderMenuOpen === folder.id ? null : folder.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground transition-all"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {folderMenuOpen === folder.id && (
                  <div className="absolute right-2 top-7 z-20 bg-popover border border-border rounded-lg shadow-xl py-1 w-28" onClick={() => setFolderMenuOpen(null)}>
                    <button
                      onClick={() => { setEditingFolder(folder); setShowFolderDialog(true); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-all"
                    >
                      <Edit2 className="w-3 h-3" /> Rename
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-muted transition-all"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}

            {folders.length === 0 && (
              <p className="text-[11px] text-muted-foreground px-3 py-1 italic">No folders yet</p>
            )}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-sidebar-border p-3 flex items-center justify-between">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-sidebar-accent"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-all px-2 py-1.5 rounded-lg hover:bg-sidebar-accent"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* MIDDLE COLUMN */}
      <div className="w-72 flex flex-col border-r border-border shrink-0">
        {/* Search */}
        <form onSubmit={handleSearch} className="px-3 py-3 border-b border-border">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => handleSearchInput(e.target.value)}
              placeholder="Search snippets..."
              className="w-full pl-8 pr-7 py-2 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber/50 focus:border-amber/30 transition-all"
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} className="absolute right-2 text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </form>

        {/* Column header */}
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {isSearching ? 'Search Results' : selectedFolderId
              ? folders.find(f => f.id === selectedFolderId)?.name || 'Folder'
              : 'All Snippets'
            }
          </span>
          <span className="text-[10px] text-muted-foreground">
            {isSearching ? filteredSnippets.length : (selectedFolderId ? snippetCountByFolder(selectedFolderId) : snippets.length)}
          </span>
        </div>

        {/* Snippet list or search results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-4 h-4 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isSearching ? (
            <SearchPanel
              snippets={snippets}
              folders={folders}
              query={searchQuery}
              onSelect={handleSelectSnippet}
              selectedId={selectedSnippet?.id}
            />
          ) : filteredSnippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-4">
              <p className="text-sm text-muted-foreground">No snippets here yet</p>
              <button onClick={handleNewSnippet} className="mt-2 text-xs text-amber hover:underline">
                + Create your first snippet
              </button>
            </div>
          ) : (
            filteredSnippets.map(s => (
              <SnippetListItem
                key={s.id}
                snippet={s}
                isActive={s.id === selectedSnippet?.id}
                onClick={() => handleSelectSnippet(s)}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {rightPanel === 'new' ? (
          <SnippetEditor
            folders={folders}
            onSave={handleSaveNew}
            onCancel={() => setRightPanel('view')}
          />
        ) : rightPanel === 'edit' && selectedSnippet ? (
          <SnippetEditor
            snippet={selectedSnippet}
            folders={folders}
            onSave={handleSaveEdit}
            onCancel={() => setRightPanel('view')}
            onDelete={handleDelete}
          />
        ) : selectedSnippet ? (
          <SnippetView
            snippet={selectedSnippet}
            onEdit={() => setRightPanel('edit')}
            isDark={isDark}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center mb-4">
              <Vault className="w-6 h-6 text-amber" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Select a snippet</h3>
            <p className="text-sm text-muted-foreground mb-4">or create a new one to get started</p>
            <button
              onClick={handleNewSnippet}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber text-primary-foreground text-sm font-medium rounded-lg hover:bg-amber-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              New Snippet
            </button>
          </div>
        )}
      </div>

      {/* Folder Dialog */}
      {showFolderDialog && (
        <FolderDialog
          folder={editingFolder}
          onSave={(name, color) => {
            if (editingFolder) updateFolder(editingFolder.id, { name, color });
            else createFolder(name, color);
          }}
          onClose={() => { setShowFolderDialog(false); setEditingFolder(null); }}
        />
      )}

      {/* Overlay to close folder menu */}
      {folderMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setFolderMenuOpen(null)} />
      )}
    </div>
  );
}
