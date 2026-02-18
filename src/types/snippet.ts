export interface Tag {
  name: string;
  color: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Snippet {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  code: string;
  language: string;
  description: string | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
  folder?: Folder;
}

export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'css'
  | 'java'
  | 'c'
  | 'cpp'
  | 'markdown'
  | 'sql'
  | 'bash'
  | 'json';

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
];

export const LANGUAGE_ICONS: Record<string, string> = {
  javascript: 'JS',
  typescript: 'TS',
  python: 'PY',
  html: 'HTML',
  css: 'CSS',
  java: 'JAVA',
  c: 'C',
  cpp: 'C++',
  markdown: 'MD',
  sql: 'SQL',
  bash: 'SH',
  json: 'JSON',
};

export const FOLDER_COLORS = [
  '#f5a623', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

export const TAG_COLORS = [
  '#f5a623', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#fbbf24', '#a78bfa', '#34d399', '#60a5fa', '#f472b6',
];
