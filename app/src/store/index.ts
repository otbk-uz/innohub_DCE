import { create } from 'zustand';
import { FileItem, Tab, TerminalLine, ChatMessage, SidebarIcon, BottomPanelTab, GitHubUser, GitHubRepo, AuthUser } from '../types';

export interface AppState {
  // Files and Tabs
  files: FileItem[];
  setFiles: (files: FileItem[] | ((prev: FileItem[]) => FileItem[])) => void;
  tabs: Tab[];
  setTabs: (tabs: Tab[] | ((prev: Tab[]) => Tab[])) => void;
  
  // UI Panels
  activeSidebarIcon: SidebarIcon;
  setActiveSidebarIcon: (icon: SidebarIcon) => void;
  bottomPanelTab: BottomPanelTab;
  setBottomPanelTab: (tab: BottomPanelTab) => void;
  showBottomPanel: boolean;
  setShowBottomPanel: (show: boolean) => void;
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  
  // Layout Options
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  bottomPanelHeight: number;
  setBottomPanelHeight: (height: number) => void;
  rightPanelWidth: number;
  setRightPanelWidth: (width: number) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;

  // Terminal & Chat
  terminalLines: TerminalLine[];
  setTerminalLines: (lines: TerminalLine[] | ((prev: TerminalLine[]) => TerminalLine[])) => void;
  addTerminalLine: (type: 'input' | 'output' | 'error', content: string) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  isAiResponding: boolean;
  setIsAiResponding: (isEngaged: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: { file: FileItem; line: number; content: string }[];
  setSearchResults: (results: { file: FileItem; line: number; content: string }[]) => void;

  // Problems Panel
  problems: { file: string; line: number; column: number; severity: 'error' | 'warning' | 'info'; message: string; code?: string }[];
  setProblems: (problems: { file: string; line: number; column: number; severity: 'error' | 'warning' | 'info'; message: string; code?: string }[]) => void;
  addProblem: (problem: { file: string; line: number; column: number; severity: 'error' | 'warning' | 'info'; message: string; code?: string }) => void;
  clearProblems: () => void;

  // Debug Console
  debugLogs: { id: string; type: 'log' | 'error' | 'warn' | 'info'; message: string; timestamp: number; source?: string }[];
  setDebugLogs: (logs: { id: string; type: 'log' | 'error' | 'warn' | 'info'; message: string; timestamp: number; source?: string }[]) => void;
  addDebugLog: (log: { type: 'log' | 'error' | 'warn' | 'info'; message: string; source?: string }) => void;
  clearDebugLogs: () => void;

  // Ports Panel
  ports: { port: number; process: string; pid?: number; status: 'listening' | 'established' | 'closed' }[];
  setPorts: (ports: { port: number; process: string; pid?: number; status: 'listening' | 'established' | 'closed' }[]) => void;
  addPort: (port: { port: number; process: string; pid?: number; status: 'listening' | 'established' | 'closed' }) => void;
  removePort: (port: number) => void;

  // GitHub
  githubUser: GitHubUser | null;
  setGithubUser: (user: GitHubUser | null) => void;
  githubRepos: GitHubRepo[];
  setGithubRepos: (repos: GitHubRepo[]) => void;
  isGithubConnected: boolean;
  setIsGithubConnected: (connected: boolean) => void;

  // Actions
  addFile: (file: FileItem) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  deleteFile: (id: string) => void;

  // Auth
  isAuthenticated: boolean;
  authUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const initialFiles: FileItem[] = [
  {
    id: 'root',
    name: 'project',
    content: '',
    language: 'plaintext',
    type: 'folder',
    parentId: null,
    children: ['src', 'public'],
    lastModified: Date.now(),
    isDirty: false,
    isOpen: true,
  },
  {
    id: 'src',
    name: 'src',
    content: '',
    language: 'plaintext',
    type: 'folder',
    parentId: 'root',
    children: ['app-tsx'],
    lastModified: Date.now(),
    isDirty: false,
    isOpen: true,
  },
  {
    id: 'public',
    name: 'public',
    content: '',
    language: 'plaintext',
    type: 'folder',
    parentId: 'root',
    children: [],
    lastModified: Date.now(),
    isDirty: false,
    isOpen: false,
  },
  {
    id: 'app-tsx',
    name: 'App.tsx',
    content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to INNOHUB</h1>
    </div>
  );
}

export default App;`,
    language: 'typescript',
    type: 'file',
    parentId: 'src',
    lastModified: Date.now(),
    isDirty: false,
  },
];

export const useAppStore = create<AppState>((set) => ({
  files: initialFiles,
  setFiles: (updater) => set((state) => ({ files: typeof updater === 'function' ? updater(state.files) : updater })),
  tabs: [{ fileId: 'app-tsx', isActive: true }],
  setTabs: (updater) => set((state) => ({ tabs: typeof updater === 'function' ? updater(state.tabs) : updater })),
  
  activeSidebarIcon: 'explorer',
  setActiveSidebarIcon: (icon) => set({ activeSidebarIcon: icon }),
  bottomPanelTab: 'terminal',
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),
  showBottomPanel: true,
  setShowBottomPanel: (show) => set({ showBottomPanel: show }),
  showRightPanel: true,
  setShowRightPanel: (show) => set({ showRightPanel: show }),
  
  sidebarWidth: 250,
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  bottomPanelHeight: 200,
  setBottomPanelHeight: (height) => set({ bottomPanelHeight: height }),
  rightPanelWidth: 320,
  setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  fontSize: 14,
  setFontSize: (size) => set({ fontSize: size }),
  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
  showCommandPalette: false,
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),

  terminalLines: [{ id: '1', type: 'output', content: 'INNOHUB Terminal v3.0.0 - Super AI', timestamp: Date.now() }],
  setTerminalLines: (updater) => set((state) => ({ terminalLines: typeof updater === 'function' ? updater(state.terminalLines) : updater })),
  addTerminalLine: (type: 'input' | 'output' | 'error', content: string) => set((state) => ({
    terminalLines: [...state.terminalLines, { id: `term-${Date.now()}`, type, content, timestamp: Date.now() }]
  })),
  chatMessages: [],
  setChatMessages: (updater) => set((state) => ({ chatMessages: typeof updater === 'function' ? updater(state.chatMessages) : updater })),
  isAiResponding: false,
  setIsAiResponding: (isAiResponding) => set({ isAiResponding }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),

  // Problems Panel
  problems: [],
  setProblems: (problems) => set({ problems }),
  addProblem: (problem) => set((state) => ({ problems: [...state.problems, problem] })),
  clearProblems: () => set({ problems: [] }),

  // Debug Console
  debugLogs: [],
  setDebugLogs: (logs) => set({ debugLogs: logs }),
  addDebugLog: (log) => set((state) => ({ 
    debugLogs: [...state.debugLogs, { ...log, id: `debug-${Date.now()}`, timestamp: Date.now() }] 
  })),
  clearDebugLogs: () => set({ debugLogs: [] }),

  // Ports Panel
  ports: [],
  setPorts: (ports) => set({ ports }),
  addPort: (port) => set((state) => ({ ports: [...state.ports, port] })),
  removePort: (portNum) => set((state) => ({ ports: state.ports.filter(p => p.port !== portNum) })),

  githubUser: null,
  setGithubUser: (user) => set({ githubUser: user }),
  githubRepos: [],
  setGithubRepos: (repos) => set({ githubRepos: repos }),
  isGithubConnected: false,
  setIsGithubConnected: (connected) => set({ isGithubConnected: connected }),

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFile: (id, updates) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, ...updates } : f)
  })),
  deleteFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id),
    tabs: state.tabs.filter(t => t.fileId !== id)
  })),

  // Auth
  isAuthenticated: false,
  authUser: null,
  login: (user) => set({ isAuthenticated: true, authUser: user }),
  logout: () => set({ isAuthenticated: false, authUser: null }),
}));
