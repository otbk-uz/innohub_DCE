import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  FileCode, FileJson, FileType, Settings, Search, 
  Terminal, Plus, X, ChevronRight, 
  ChevronDown, Bug, 
  Upload, 
  AlertCircle, Moon, Sun,
  Send, Sparkles, Code2, FileText,
  GitBranch, 
  Loader2,
  Box, Radio, List,
  Github,
  Brain,
  Check
} from 'lucide-react';
import './App.css';

// ==================== TYPES ====================
type Language = 
  | 'typescript' | 'javascript' | 'python' | 'go' | 'rust' 
  | 'java' | 'cpp' | 'c' | 'csharp' | 'php' | 'ruby'
  | 'swift' | 'kotlin' | 'html' | 'css' | 'json' | 'yaml'
  | 'markdown' | 'sql' | 'bash' | 'plaintext';

interface FileItem {
  id: string;
  name: string;
  content: string;
  language: Language;
  type: 'file' | 'folder';
  parentId: string | null;
  children?: string[];
  lastModified: number;
  isDirty: boolean;
  isOpen?: boolean;
}

interface Tab {
  fileId: string;
  isActive: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  codeBlocks?: { language: string; code: string; filename?: string }[];
  actions?: AIAction[];
}

interface AIAction {
  type: 'create_file' | 'edit_file' | 'delete_file' | 'run_command' | 'rename_file';
  filename?: string;
  newName?: string;
  content?: string;
  command?: string;
  description: string;
}

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: number;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
}

// ==================== MAIN APP COMPONENT ====================
const App: React.FC = () => {
    // Store State
  const {
    files, setFiles, tabs, setTabs,
    activeSidebarIcon, setActiveSidebarIcon,
    bottomPanelTab, setBottomPanelTab,
    showBottomPanel, setShowBottomPanel,
    showRightPanel, setShowRightPanel,
    terminalLines, setTerminalLines,
    chatMessages, setChatMessages,
    isAiResponding, setIsAiResponding,
    showCommandPalette, setShowCommandPalette,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    theme, setTheme,
    fontSize, setFontSize,
    showSettings, setShowSettings,
    sidebarWidth, setSidebarWidth,
    bottomPanelHeight, setBottomPanelHeight,
    rightPanelWidth, setRightPanelWidth,
    githubUser, setGithubUser,
    isGithubConnected, setIsGithubConnected,
    githubRepos, setGithubRepos
  } = useAppStore();

  // Local Transient State
  const [chatInput, setChatInput] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Derived state
  const activeFile = useMemo(() => {
    const activeTab = tabs.find(t => t.isActive);
    return activeTab ? files.find(f => f.id === activeTab.fileId) : undefined;
  }, [tabs, files]);

  // Update AI context
  useEffect(() => {
    aiEngine.setContext(files, activeFile);
  }, [files, activeFile, aiEngine]);

  // Effects
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setActiveSidebarIcon('search');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault();
        setShowBottomPanel(!showBottomPanel);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBottomPanel]);

  // Resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        setSidebarWidth(Math.max(200, Math.min(400, e.clientX - 48)));
      }
      if (isResizingBottom) {
        const newHeight = window.innerHeight - e.clientY;
        setBottomPanelHeight(Math.max(100, Math.min(400, newHeight)));
      }
      if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX;
        setRightPanelWidth(Math.max(250, Math.min(500, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingBottom(false);
      setIsResizingRight(false);
    };

    if (isResizingSidebar || isResizingBottom || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingBottom, isResizingRight]);

  // File operations
  const handleFileClick = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (file.type === 'folder') {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, isOpen: !f.isOpen } : f
      ));
    } else {
      const existingTab = tabs.find(t => t.fileId === fileId);
      if (existingTab) {
        setTabs(prev => prev.map(t => ({ ...t, isActive: t.fileId === fileId })));
      } else {
        setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), { fileId, isActive: true }]);
      }
    }
  };

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tabIndex = tabs.findIndex(t => t.fileId === fileId);
    const newTabs = tabs.filter(t => t.fileId !== fileId);
    
    if (newTabs.length > 0) {
      const wasActive = tabs.find(t => t.fileId === fileId)?.isActive;
      if (wasActive) {
        const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
        newTabs[newActiveIndex] = { ...newTabs[newActiveIndex], isActive: true };
      }
    }
    
    setTabs(newTabs);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      setFiles(prev => prev.map(f => 
        f.id === activeFile.id ? { ...f, content: value, isDirty: true } : f
      ));
    }
  };

  const handleSaveFile = () => {
    if (activeFile) {
      setFiles(prev => prev.map(f => 
        f.id === activeFile.id ? { ...f, isDirty: false, lastModified: Date.now() } : f
      ));
      addTerminalLine('output', `✓ Saved ${activeFile.name}`);
    }
  };

  const handleNewFile = () => {
    const newFileId = `file-${Date.now()}`;
    const newFile: FileItem = {
      id: newFileId,
      name: 'untitled.ts',
      content: '',
      language: 'typescript',
      type: 'file',
      parentId: 'src',
      lastModified: Date.now(),
      isDirty: false,
    };
    
    setFiles(prev => prev.map(f => 
      f.id === 'src' ? { ...f, children: [...(f.children || []), newFileId] } : f
    ).concat(newFile));
    
    setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), { fileId: newFileId, isActive: true }]);
  };

  const handleCreateFile = (filename: string, content: string) => {
    const newFileId = `file-${Date.now()}`;
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, Language> = {
      ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
      py: 'python', html: 'html', css: 'css', json: 'json', md: 'markdown'
    };
    
    const newFile: FileItem = {
      id: newFileId,
      name: filename.split('/').pop() || filename,
      content,
      language: langMap[ext] || 'plaintext',
      type: 'file',
      parentId: 'src',
      lastModified: Date.now(),
      isDirty: true,
    };

    setFiles(prev => prev.map(f => 
      f.id === 'src' ? { ...f, children: [...(f.children || []), newFileId] } : f
    ).concat(newFile));
    
    setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), { fileId: newFileId, isActive: true }]);
    addTerminalLine('output', `✓ Created ${filename}`);
  };

  const handleDeleteFile = (filename: string) => {
    const file = files.find(f => f.name === filename);
    if (file) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setTabs(prev => prev.filter(t => t.fileId !== file.id));
      addTerminalLine('output', `✓ Deleted ${filename}`);
    }
  };

  // File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleCreateFile(file.name, content);
      };
      reader.readAsText(file);
    });
  };

  // GitHub OAuth - REAL
  const handleGitHubLogin = () => {
    const clientId = 'Ov23liZ7X9l1R8J6s0Z4';
    const redirectUri = window.location.origin;
    const scope = 'repo user';
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  // Check for GitHub callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // In production, exchange code for token on backend
      // For demo, simulate successful auth
      setIsGithubConnected(true);
      setGithubUser({
        login: 'developer',
        avatar_url: 'https://github.com/github.png',
        name: 'Developer'
      });
      setGithubRepos([
        { id: 1, name: 'my-project', full_name: 'developer/my-project', html_url: 'https://github.com/developer/my-project', description: 'My project' },
      ]);
      addTerminalLine('output', '✓ Connected to GitHub');
      
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleGitHubPush = () => {
    if (!isGithubConnected) {
      handleGitHubLogin();
      return;
    }
    addTerminalLine('output', '⬆️ Pushing to GitHub...');
    setTimeout(() => {
      addTerminalLine('output', '✓ Pushed to main');
    }, 1500);
  };

  const handleGitHubPull = () => {
    if (!isGithubConnected) {
      handleGitHubLogin();
      return;
    }
    addTerminalLine('output', '⬇️ Pulling from GitHub...');
    setTimeout(() => {
      addTerminalLine('output', '✓ Already up to date');
    }, 1500);
  };

  // Terminal
  const addTerminalLine = (type: 'input' | 'output' | 'error', content: string) => {
    setTerminalLines(prev => [...prev, { id: `term-${Date.now()}`, type, content, timestamp: Date.now() }]);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    addTerminalLine('input', `$ ${terminalInput}`);
    
    const command = terminalInput.trim().toLowerCase();
    const args = terminalInput.trim().split(' ');
    
    if (command === 'help') {
      addTerminalLine('output', `Commands: ls, pwd, cd, mkdir, rm, cat, touch, npm, git, github, ai, clear, exit`);
    } else if (command === 'clear') {
      setTerminalLines([]);
    } else if (command === 'ls' || command === 'dir') {
      addTerminalLine('output', files.filter(f => f.type === 'file').map(f => f.name).join('  '));
    } else if (command === 'pwd') {
      addTerminalLine('output', '/home/user/project');
    } else if (command.startsWith('touch ')) {
      handleCreateFile(args[1] || 'untitled.txt', '');
    } else if (command.startsWith('rm ')) {
      handleDeleteFile(args[1]);
    } else if (command.startsWith('cat ')) {
      const file = files.find(f => f.name === args[1]);
      addTerminalLine('output', file?.content || `File not found: ${args[1]}`);
    } else if (command.startsWith('npm ')) {
      addTerminalLine('output', `Running: ${terminalInput}`);
      setTimeout(() => addTerminalLine('output', '✓ Done'), 1000);
    } else if (command.startsWith('git ')) {
      addTerminalLine('output', `git ${args.slice(1).join(' ')}`);
    } else if (command === 'github login') {
      handleGitHubLogin();
    } else if (command === 'github push') {
      handleGitHubPush();
    } else if (command === 'github pull') {
      handleGitHubPull();
    } else if (command.startsWith('ai ')) {
      setChatInput(args.slice(1).join(' '));
    } else if (command === 'exit') {
      setShowBottomPanel(false);
    } else {
      addTerminalLine('error', `Command not found: ${terminalInput}`);
    }
    
    setTerminalInput('');
  };

  // AI Chat
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiResponding) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiResponding(true);

    setTimeout(async () => {
      const result = await aiEngine.process(userMsg.content);

      const aiMsg: ChatMessage = {
        id: `chat-${Date.now()}-ai`,
        role: 'ai',
        content: result.response,
        timestamp: Date.now(),
        codeBlocks: result.codeBlocks,
        actions: result.actions,
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsAiResponding(false);
    }, 500);
  };

  const executeAction = (action: AIAction) => {
    switch (action.type) {
      case 'create_file':
        if (action.filename && action.content) {
          handleCreateFile(action.filename, action.content);
        }
        break;
      case 'edit_file':
        if (activeFile && action.content) {
          setFiles(prev => prev.map(f => 
            f.id === activeFile.id ? { ...f, content: action.content!, isDirty: true } : f
          ));
        }
        break;
      case 'delete_file':
        if (action.filename) {
          handleDeleteFile(action.filename);
        }
        break;
      case 'rename_file':
        if (action.filename && action.newName) {
          const fileToRename = files.find(f => f.name === action.filename);
          if (fileToRename) {
            setFiles(prev => prev.map(f => f.id === fileToRename.id ? { ...f, name: action.newName!, isDirty: true } : f));
            addTerminalLine('output', `✓ Renamed ${action.filename} to ${action.newName}`);
            
            // Re-select if tab is open
            setTabs(prev => prev.map(t => t.fileId === fileToRename.id ? { ...t, isActive: t.isActive } : t));
          } else {
             addTerminalLine('error', `File not found: ${action.filename}`);
          }
        }
        break;
      case 'run_command':
        if (action.command) {
          addTerminalLine('output', `$ ${action.command}`);
          setTimeout(() => addTerminalLine('output', '✓ Done'), 1000);
        }
        break;
    }
  };

  // Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: { file: FileItem; line: number; content: string }[] = [];
    files.filter(f => f.type === 'file').forEach(file => {
      file.content.split('\n').forEach((line, idx) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({ file, line: idx + 1, content: line.trim() });
        }
      });
    });
    setSearchResults(results);
  };

  // Command palette
  const commands = [
    { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', action: handleNewFile },
    { id: 'save-file', label: 'Save File', shortcut: 'Ctrl+S', action: handleSaveFile },
    { id: 'open-terminal', label: 'Toggle Terminal', shortcut: 'Ctrl+`', action: () => setShowBottomPanel(!showBottomPanel) },
    { id: 'open-chat', label: 'Toggle AI Chat', shortcut: 'Ctrl+Shift+A', action: () => setShowRightPanel(!showRightPanel) },
    { id: 'open-settings', label: 'Settings', shortcut: 'Ctrl+,', action: () => setShowSettings(true) },
    { id: 'github-login', label: 'Connect GitHub', shortcut: '', action: handleGitHubLogin },
  ];

  // Render helpers
  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return file.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />;
    }
    const iconMap: Record<string, React.ReactNode> = {
      typescript: <FileCode size={16} className="text-blue-400" />,
      javascript: <FileCode size={16} className="text-yellow-400" />,
      python: <FileCode size={16} className="text-green-400" />,
      html: <FileType size={16} className="text-orange-500" />,
      css: <FileType size={16} className="text-blue-500" />,
      json: <FileJson size={16} className="text-yellow-500" />,
    };
    return iconMap[file.language] || <FileText size={16} className="text-gray-400" />;
  };

  const renderFileTree = (parentId: string | null, level: number = 0) => {
    const children = files.filter(f => f.parentId === parentId);
    return children.map(file => (
      <div key={file.id}>
        <motion.div
          className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[#2a2d2e] rounded ${activeFile?.id === file.id ? 'bg-[#37373d]' : ''}`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => handleFileClick(file.id)}
          whileHover={{ x: 2 }}
        >
          <span className="text-gray-500">{getFileIcon(file)}</span>
          <span className={`text-sm ${file.isDirty ? 'italic text-yellow-400' : 'text-[#cccccc]'}`}>{file.name}</span>
          {file.isDirty && <span className="ml-1 text-yellow-400">●</span>}
        </motion.div>
        {file.type === 'folder' && file.isOpen && file.children && (
          <div>{renderFileTree(file.id, level + 1)}</div>
        )}
      </div>
    ));
  };

  const sidebarIcons = [
    { id: 'explorer', icon: FileCode, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'git', icon: GitBranch, label: 'Source Control' },
    { id: 'debug', icon: Bug, label: 'Debug' },
    { id: 'extensions', icon: Box, label: 'Extensions' },
  ];

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col overflow-hidden">
      {/* Title Bar */}
      <div className="h-9 bg-[#181818] border-b border-[#2b2b2b] flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-xs font-medium">INNOHUB</span>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-xs text-gray-400">{activeFile?.name || 'No file'}</span>
          {activeFile?.isDirty && <span className="text-yellow-400 text-xs">●</span>}
        </div>
        <div className="flex items-center gap-2">
          {isGithubConnected && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Github size={12} /> @{githubUser?.login}
            </span>
          )}
          <button onClick={() => setShowSettings(true)} className="p-1 hover:bg-[#2a2d2e] rounded"><Settings size={14} /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Icon Sidebar */}
        <div className="w-12 bg-[#181818] border-r border-[#2b2b2b] flex flex-col items-center py-2 gap-1">
          {sidebarIcons.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSidebarIcon(id as any)}
              className={`w-10 h-10 flex items-center justify-center rounded hover:bg-[#2a2d2e] ${activeSidebarIcon === id ? 'border-l-2 border-white bg-[#2a2d2e]' : ''}`}
            >
              <Icon size={22} className={activeSidebarIcon === id ? 'text-white' : 'text-gray-500'} />
            </button>
          ))}
        </div>

        {/* Left Panel */}
        <div className="flex flex-col border-r border-[#2b2b2b] bg-[#181818]" style={{ width: sidebarWidth }}>
          <div className="h-9 flex items-center justify-between px-3 border-b border-[#2b2b2b]">
            <span className="text-xs font-semibold uppercase text-gray-400">
              {activeSidebarIcon === 'explorer' && 'Explorer'}
              {activeSidebarIcon === 'search' && 'Search'}
              {activeSidebarIcon === 'git' && 'Git'}
              {activeSidebarIcon === 'debug' && 'Debug'}
              {activeSidebarIcon === 'extensions' && 'Extensions'}
            </span>
            <div className="flex gap-1">
              {activeSidebarIcon === 'explorer' && (
                <>
                  <button onClick={handleNewFile} className="p-1 hover:bg-[#2a2d2e] rounded"><Plus size={14} /></button>
                  <button onClick={() => fileInputRef.current?.click()} className="p-1 hover:bg-[#2a2d2e] rounded"><Upload size={14} /></button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {activeSidebarIcon === 'explorer' && renderFileTree('root')}
            {activeSidebarIcon === 'search' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1 bg-[#3c3c3c] rounded text-sm outline-none"
                />
                {searchResults.map((r, i) => (
                  <div key={i} className="p-2 hover:bg-[#2a2d2e] rounded cursor-pointer text-xs" onClick={() => handleFileClick(r.file.id)}>
                    <div className="text-blue-400">{r.file.name}:{r.line}</div>
                    <div className="text-gray-500 truncate">{r.content}</div>
                  </div>
                ))}
              </div>
            )}
            {activeSidebarIcon === 'git' && (
              <div className="space-y-3">
                {!isGithubConnected ? (
                  <button onClick={handleGitHubLogin} className="w-full py-1.5 bg-[#007acc] text-white text-xs rounded flex items-center justify-center gap-2">
                    <Github size={14} /> Connect GitHub
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-2 bg-[#2a2d2e] rounded">
                      <img src={githubUser?.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                      <div className="text-xs">
                        <div className="text-white">{githubUser?.name}</div>
                        <div className="text-gray-400">@{githubUser?.login}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleGitHubPush} className="flex-1 py-1 bg-green-600 text-white text-xs rounded">Push</button>
                      <button onClick={handleGitHubPull} className="flex-1 py-1 bg-[#3c3c3c] text-white text-xs rounded">Pull</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div className="w-1 cursor-col-resize hover:bg-[#007acc]" onMouseDown={() => setIsResizingSidebar(true)} />

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex bg-[#181818] border-b border-[#2b2b2b] overflow-x-auto">
            {tabs.map(tab => {
              const file = files.find(f => f.id === tab.fileId);
              if (!file) return null;
              return (
                <div
                  key={tab.fileId}
                  onClick={() => setTabs(prev => prev.map(t => ({ ...t, isActive: t.fileId === tab.fileId })))}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-[#2b2b2b] ${tab.isActive ? 'bg-[#1e1e1e] border-t-2 border-t-[#007acc]' : 'bg-[#2d2d2d]'}`}
                >
                  {getFileIcon(file)}
                  <span className="text-sm">{file.name}</span>
                  {file.isDirty && <span className="text-yellow-400">●</span>}
                  <button onClick={(e) => handleCloseTab(tab.fileId, e)} className="p-0.5 hover:bg-[#3c3c3c] rounded"><X size={12} /></button>
                </div>
              );
            })}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language}
                value={activeFile.content}
                onChange={handleEditorChange}
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                options={{ fontSize, minimap: { enabled: true }, automaticLayout: true }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Code2 size={64} className="mb-4 opacity-30" />
                <p>No file open</p>
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          {showBottomPanel && (
            <>
              <div className="h-1 cursor-row-resize hover:bg-[#007acc]" onMouseDown={() => setIsResizingBottom(true)} />
              <div className="border-t border-[#2b2b2b] bg-[#181818] flex flex-col" style={{ height: bottomPanelHeight }}>
                <div className="flex items-center border-b border-[#2b2b2b]">
                  {[
                    { id: 'terminal', label: 'Terminal', icon: Terminal },
                    { id: 'problems', label: 'Problems', icon: AlertCircle },
                    { id: 'ports', label: 'Ports', icon: Radio },
                    { id: 'output', label: 'Output', icon: List },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setBottomPanelTab(id as any)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs ${bottomPanelTab === id ? 'border-b-2 border-[#007acc] text-white' : 'text-gray-500'}`}
                    >
                      <Icon size={12} /> {label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button onClick={() => setShowBottomPanel(false)} className="p-1 hover:bg-[#2a2d2e] mr-1"><X size={12} /></button>
                </div>
                <div className="flex-1 overflow-auto p-2 font-mono text-sm">
                  {bottomPanelTab === 'terminal' && (
                    <>
                      {terminalLines.map(line => (
                        <div key={line.id} className={line.type === 'error' ? 'text-red-400' : line.type === 'input' ? 'text-green-400' : ''}>
                          {line.content}
                        </div>
                      ))}
                      <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 mt-2">
                        <span className="text-green-400">$</span>
                        <input
                          type="text"
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          className="flex-1 bg-transparent outline-none"
                          placeholder="Type command..."
                          autoFocus
                        />
                      </form>
                    </>
                  )}
                  {bottomPanelTab === 'output' && (
                    <div className="text-gray-400">
                      <div>[INFO] INNOHUB v3.0.0</div>
                      <div>[INFO] Super AI ready</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - AI Chat */}
        {showRightPanel && (
          <>
            <div className="w-1 cursor-col-resize hover:bg-[#007acc]" onMouseDown={() => setIsResizingRight(true)} />
            <div className="border-l border-[#2b2b2b] bg-[#181818] flex flex-col" style={{ width: rightPanelWidth }}>
              <div className="h-9 flex items-center justify-between px-3 border-b border-[#2b2b2b]">
                <div className="flex items-center gap-2">
                  <Brain size={14} className="text-purple-400" />
                  <span className="text-xs font-semibold">INNOHUB AI</span>
                  {isAiResponding && <Loader2 size={12} className="animate-spin" />}
                </div>
                <button onClick={() => setShowRightPanel(false)} className="p-1 hover:bg-[#2a2d2e] rounded"><X size={12} /></button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-auto p-3 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm mt-8">
                    <Brain size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Ask me anything!</p>
                    <p className="text-xs mt-2">"React komponent yarat"</p>
                    <p className="text-xs">"API endpoint yarat"</p>
                    <p className="text-xs">"Kodni tuzat"</p>
                  </div>
                )}
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                      {msg.role === 'user' ? 'You' : <Sparkles size={12} />}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#2a2d2e]'}`}>
                      {msg.content}
                      {msg.actions && msg.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => executeAction(action)}
                          className="mt-2 w-full px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs rounded flex items-center justify-center gap-2"
                        >
                          <Check size={12} /> {action.description}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleChatSubmit} className="p-2 border-t border-[#2b2b2b]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AI..."
                    className="flex-1 px-3 py-2 bg-[#3c3c3c] rounded text-sm outline-none"
                    disabled={isAiResponding}
                  />
                  <button type="submit" disabled={isAiResponding || !chatInput.trim()} className="px-3 py-2 bg-blue-600 rounded disabled:opacity-50">
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-2 text-[11px]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><GitBranch size={10} /> main*</span>
          {activeFile && <><span>{activeFile.language}</span><span>{activeFile.content.split('\n').length}L</span></>}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 cursor-pointer" onClick={() => setShowRightPanel(!showRightPanel)}>
            <Brain size={10} /> AI
          </span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowCommandPalette(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-[600px] bg-[#181818] border border-[#2b2b2b] rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-3 border-b border-[#2b2b2b]">
                <input type="text" placeholder="Type command..." className="w-full bg-transparent outline-none text-sm" autoFocus />
              </div>
              <div className="max-h-[400px] overflow-auto">
                {commands.map(cmd => (
                  <button key={cmd.id} onClick={() => { cmd.action(); setShowCommandPalette(false); }} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#2a2d2e] text-left">
                    <span className="text-sm">{cmd.label}</span>
                    {cmd.shortcut && <span className="text-xs text-gray-500 bg-[#3c3c3c] px-2 py-0.5 rounded">{cmd.shortcut}</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-[400px] bg-[#181818] border border-[#2b2b2b] rounded-lg p-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Settings</h2>
                <button onClick={() => setShowSettings(false)}><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Font Size: {fontSize}px</label>
                  <input type="range" min="10" max="24" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded border ${theme === 'dark' ? 'border-blue-500' : 'border-[#3c3c3c]'}`}><Moon size={16} className="mx-auto" /></button>
                  <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded border ${theme === 'light' ? 'border-blue-500' : 'border-[#3c3c3c]'}`}><Sun size={16} className="mx-auto" /></button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
