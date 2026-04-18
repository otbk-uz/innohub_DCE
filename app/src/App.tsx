import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useAppStore } from './store';
import { SuperAI } from './lib/SuperAI';
import { AIAction, FileItem } from './types';
import './App.css';

import { FileExplorer } from './components/FileExplorer';
import { EditorPanel } from './components/EditorPanel';
import { TerminalPanel } from './components/TerminalPanel';
import { ChatPanel } from './components/ChatPanel';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';

import { Sparkles, GitBranch, Brain, Settings, Github, FileCode, Search, Bug, Box } from 'lucide-react';

const App: React.FC = () => {
  const store = useAppStore();
  const {
    files, setFiles, tabs, setTabs,
    activeSidebarIcon, setActiveSidebarIcon,
    showBottomPanel, setShowBottomPanel,
    showRightPanel, setShowRightPanel,
    setShowSettings, setShowCommandPalette,
    sidebarWidth, setSidebarWidth,
    setRightPanelWidth,
    isGithubConnected, setIsGithubConnected,
    githubUser, setGithubUser, setGithubRepos,
    setTerminalLines, addTerminalLine, setChatMessages,
    setIsAiResponding, searchQuery, setSearchQuery, setSearchResults, searchResults
  } = store;

  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const aiEngine = useMemo(() => new SuperAI(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = files.find(f => f.id === tabs.find(t => t.isActive)?.fileId);

  useEffect(() => {
    aiEngine.setContext(files, activeFile);
  }, [files, activeFile, aiEngine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault(); setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault(); handleSaveFile();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault(); handleNewFile();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault(); setActiveSidebarIcon('search');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault(); setShowBottomPanel(!showBottomPanel);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false); setShowSettings(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBottomPanel]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) setSidebarWidth(Math.max(200, Math.min(400, e.clientX - 48)));
      if (isResizingRight) setRightPanelWidth(Math.max(250, Math.min(500, window.innerWidth - e.clientX)));
    };
    const handleMouseUp = () => { setIsResizingSidebar(false); setIsResizingRight(false); };
    if (isResizingSidebar || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingRight]);

  const handleSaveFile = () => {
    if (activeFile) {
      setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, isDirty: false, lastModified: Date.now() } : f));
      addTerminalLine('output', `✓ Saved ${activeFile.name}`);
    }
  };

  const handleNewFile = () => {
    const newFileId = `file-${Date.now()}`;
    const newFile: FileItem = { id: newFileId, name: 'untitled.ts', content: '', language: 'typescript', type: 'file', parentId: 'src', lastModified: Date.now(), isDirty: false };
    setFiles(prev => prev.map(f => f.id === 'src' ? { ...f, children: [...(f.children || []), newFileId] } : f).concat(newFile));
    setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), { fileId: newFileId, isActive: true }]);
  };

  const handleCreateFile = (filename: string, content: string) => {
    const newFileId = `file-${Date.now()}`;
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = { ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript', py: 'python', html: 'html', css: 'css', json: 'json', md: 'markdown' };
    const newFile: FileItem = { id: newFileId, name: filename.split('/').pop() || filename, content, language: (langMap[ext] || 'plaintext') as any, type: 'file', parentId: 'src', lastModified: Date.now(), isDirty: true };
    setFiles(prev => prev.map(f => f.id === 'src' ? { ...f, children: [...(f.children || []), newFileId] } : f).concat(newFile));
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    const results: { file: FileItem; line: number; content: string }[] = [];
    files.filter(f => f.type === 'file').forEach(file => {
      file.content.split('\n').forEach((line, idx) => {
        if (line.toLowerCase().includes(query.toLowerCase())) { results.push({ file, line: idx + 1, content: line.trim() }); }
      });
    });
    setSearchResults(results);
  };

  const handleFileClick = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    if (file.type === 'folder') {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isOpen: !f.isOpen } : f));
    } else {
      const existingTab = tabs.find(t => t.fileId === fileId);
      if (existingTab) {
        setTabs(prev => prev.map(t => ({ ...t, isActive: t.fileId === fileId })));
      } else {
        setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), { fileId, isActive: true }]);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;
    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => handleCreateFile(file.name, event.target?.result as string);
      reader.readAsText(file);
    });
  };

  const handleGitHubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=Ov23liZ7X9l1R8J6s0Z4&redirect_uri=${window.location.origin}&scope=repo user`;
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      setIsGithubConnected(true);
      setGithubUser({ login: 'developer', avatar_url: 'https://github.com/github.png', name: 'Developer' });
      setGithubRepos([{ id: 1, name: 'my-project', full_name: 'developer/my-project', html_url: 'https://github.com/developer/my-project', description: 'My project' }]);
      addTerminalLine('output', '✓ Connected to GitHub');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleTerminalSubmit = (terminalInput: string) => {
    addTerminalLine('input', `$ ${terminalInput}`);
    const command = terminalInput.trim().toLowerCase();
    const args = terminalInput.trim().split(' ');
    
    if (command === 'help') addTerminalLine('output', `Commands: ls, pwd, cd, mkdir, rm, cat, touch, npm, git, github, ai, clear, exit`);
    else if (command === 'clear') setTerminalLines([]);
    else if (command === 'ls' || command === 'dir') addTerminalLine('output', files.filter(f => f.type === 'file').map(f => f.name).join('  '));
    else if (command === 'pwd') addTerminalLine('output', '/home/user/project');
    else if (command.startsWith('touch ')) handleCreateFile(args[1] || 'untitled.txt', '');
    else if (command.startsWith('rm ')) handleDeleteFile(args[1]);
    else if (command.startsWith('cat ')) addTerminalLine('output', files.find(f => f.name === args[1])?.content || `File not found: ${args[1]}`);
    else if (command.startsWith('npm ')) { addTerminalLine('output', `Running: ${terminalInput}`); setTimeout(() => addTerminalLine('output', '✓ Done'), 1000); }
    else if (command === 'github login') handleGitHubLogin();
    else if (command === 'github push') { addTerminalLine('output', '⬆️ Pushing...'); setTimeout(() => addTerminalLine('output', '✓ Pushed'), 1000); }
    else if (command === 'exit') setShowBottomPanel(false);
    else addTerminalLine('error', `Command not found: ${terminalInput}`);
  };

  const executeAction = (action: AIAction) => {
    switch (action.type) {
      case 'create_file': if (action.filename && action.content) handleCreateFile(action.filename, action.content); break;
      case 'edit_file':
        if (activeFile && action.content) setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, content: action.content!, isDirty: true } : f));
        break;
      case 'delete_file': if (action.filename) handleDeleteFile(action.filename); break;
      case 'rename_file':
        if (action.filename && action.newName) {
          const fileToRename = files.find(f => f.name === action.filename);
          if (fileToRename) setFiles(prev => prev.map(f => f.id === fileToRename.id ? { ...f, name: action.newName!, isDirty: true } : f));
        }
        break;
      case 'run_command': if (action.command) { addTerminalLine('output', `$ ${action.command}`); setTimeout(() => addTerminalLine('output', '✓ Done'), 1000); } break;
    }
  };

  const handleChatSubmit = async (chatInput: string) => {
    const userMsg = { id: `chat-${Date.now()}`, role: 'user' as const, content: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiResponding(true);

    const result = await aiEngine.process(chatInput);
    const aiMsg = { id: `chat-${Date.now()}-ai`, role: 'ai' as const, content: result.response, timestamp: Date.now(), codeBlocks: result.codeBlocks, actions: result.actions };
    setChatMessages(prev => [...prev, aiMsg]);
    setIsAiResponding(false);
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
          {isGithubConnected && <span className="text-xs text-gray-400 flex items-center gap-1"><Github size={12} /> @{githubUser?.login}</span>}
          <button onClick={() => setShowSettings(true)} className="p-1 hover:bg-[#2a2d2e] rounded"><Settings size={14} /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Icon Sidebar */}
        <div className="w-12 bg-[#181818] border-r border-[#2b2b2b] flex flex-col items-center py-2 gap-1">
          {sidebarIcons.map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSidebarIcon(id as any)} className={`w-10 h-10 flex items-center justify-center rounded hover:bg-[#2a2d2e] ${activeSidebarIcon === id ? 'border-l-2 border-white bg-[#2a2d2e]' : ''}`}>
              <Icon size={22} className={activeSidebarIcon === id ? 'text-white' : 'text-gray-500'} />
            </button>
          ))}
        </div>

        {/* Left Panel */}
        <div className="flex flex-col border-r border-[#2b2b2b] bg-[#181818]" style={{ width: sidebarWidth }}>
          <FileExplorer
            files={files}
            activeFile={activeFile}
            activeSidebarIcon={activeSidebarIcon}
            searchQuery={searchQuery}
            searchResults={searchResults}
            isGithubConnected={isGithubConnected}
            githubUser={githubUser}
            onFileClick={handleFileClick}
            onNewFile={handleNewFile}
            onSearch={handleSearch}
            onGitHubLogin={handleGitHubLogin}
            onGitHubPush={() => { addTerminalLine('output', '⬆️ Pushing...'); setTimeout(() => addTerminalLine('output', '✓ Pushed'), 1000); }}
            onGitHubPull={() => { addTerminalLine('output', '⬇️ Pulling...'); setTimeout(() => addTerminalLine('output', '✓ Pulled'), 1000); }}
            fileInputRef={fileInputRef}
          />
        </div>

        <div className="w-1 cursor-col-resize hover:bg-[#007acc]" onMouseDown={() => setIsResizingSidebar(true)} />

        {/* Editor & Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          <EditorPanel />

          {showBottomPanel && (
            <TerminalPanel
              onTerminalSubmit={handleTerminalSubmit}
              onClose={() => setShowBottomPanel(false)}
            />
          )}
        </div>

        {/* Right Panel (Chat) */}
        {showRightPanel && (
          <>
            <div className="w-1 cursor-col-resize hover:bg-[#007acc]" onMouseDown={() => setIsResizingRight(true)} />
            <ChatPanel
              onChatSubmit={handleChatSubmit}
              onExecuteAction={executeAction}
              onClose={() => setShowRightPanel(false)}
            />
          </>
        )}
      </div>

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

      <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload as any} className="hidden" />

      <CommandPalette onNewFile={handleNewFile} onSaveFile={handleSaveFile} onGitHubLogin={handleGitHubLogin} />
      <SettingsModal />
    </div>
  );
};

export default App;
