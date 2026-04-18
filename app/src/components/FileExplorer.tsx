import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileCode, FileJson, FileType, Plus, Upload,
  ChevronRight, ChevronDown, Github
} from 'lucide-react';
import { FileItem, SidebarIcon, SearchResult } from '../types';

interface FileExplorerProps {
  files: FileItem[];
  activeFile?: FileItem;
  activeSidebarIcon: SidebarIcon;
  searchQuery: string;
  searchResults: SearchResult[];
  isGithubConnected: boolean;
  githubUser: { login: string; avatar_url: string; name: string } | null;
  onFileClick: (fileId: string) => void;
  onNewFile: () => void;
  onSearch: (query: string) => void;
  onGitHubLogin: () => void;
  onGitHubPush: () => void;
  onGitHubPull: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const FileIcon: React.FC<{ file: FileItem }> = React.memo(({ file }) => {
  if (file.type === 'folder') {
    return file.isOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />;
  }
  const icons: Record<string, React.ReactNode> = {
    typescript: <FileCode size={16} className="text-blue-400" aria-hidden="true" />,
    javascript: <FileCode size={16} className="text-yellow-400" aria-hidden="true" />,
    python: <FileCode size={16} className="text-green-400" aria-hidden="true" />,
    html: <FileType size={16} className="text-orange-500" aria-hidden="true" />,
    css: <FileType size={16} className="text-blue-500" aria-hidden="true" />,
    json: <FileJson size={16} className="text-yellow-500" aria-hidden="true" />,
  };
  return icons[file.language] || <FileType size={16} className="text-gray-400" aria-hidden="true" />;
});

FileIcon.displayName = 'FileIcon';

const FileTreeItem: React.FC<{
  file: FileItem;
  level: number;
  isActive: boolean;
  onClick: (fileId: string) => void;
  renderSubTree: (parentId: string | null, level: number) => React.ReactNode;
}> = React.memo(({ file, level, isActive, onClick, renderSubTree }) => {
  return (
    <div>
      <motion.div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[#2a2d2e] rounded ${isActive ? 'bg-[#37373d]' : ''}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onClick(file.id)}
        whileHover={{ x: 2 }}
        role="treeitem"
        aria-selected={isActive}
        aria-expanded={file.type === 'folder' ? file.isOpen : undefined}
      >
        <span className="text-gray-500"><FileIcon file={file} /></span>
        <span className={`text-sm ${file.isDirty ? 'italic text-yellow-400' : 'text-[#cccccc]'}`}>
          {file.name}
        </span>
        {file.isDirty && <span className="ml-1 text-yellow-400" aria-label="Unsaved changes">●</span>}
      </motion.div>
      {file.type === 'folder' && file.isOpen && file.children && (
        <div role="group">{renderSubTree(file.id, level + 1)}</div>
      )}
    </div>
  );
});

FileTreeItem.displayName = 'FileTreeItem';

export const FileExplorer: React.FC<FileExplorerProps> = React.memo(({
  files,
  activeFile,
  activeSidebarIcon,
  searchQuery,
  searchResults,
  isGithubConnected,
  githubUser,
  onFileClick,
  onNewFile,
  onSearch,
  onGitHubLogin,
  onGitHubPush,
  onGitHubPull,
  fileInputRef,
}) => {
  const renderFileTree = useCallback((parentId: string | null, level: number = 0) => {
    const children = files.filter(f => f.parentId === parentId);
    return children.map(file => (
      <FileTreeItem
        key={file.id}
        file={file}
        level={level}
        isActive={activeFile?.id === file.id}
        onClick={onFileClick}
        renderSubTree={renderFileTree}
      />
    ));
  }, [files, activeFile, onFileClick]);

  const panelTitles: Record<SidebarIcon, string> = {
    explorer: 'Explorer',
    search: 'Search',
    git: 'Source Control',
    debug: 'Debug',
    extensions: 'Extensions',
  };

  return (
    <div className="flex flex-col border-r border-[#2b2b2b] bg-[#181818]" role="region" aria-label={panelTitles[activeSidebarIcon]}>
      <div className="h-9 flex items-center justify-between px-3 border-b border-[#2b2b2b]">
        <span className="text-xs font-semibold uppercase text-gray-400">
          {panelTitles[activeSidebarIcon]}
        </span>
        {activeSidebarIcon === 'explorer' && (
          <div className="flex gap-1">
            <button
              onClick={onNewFile}
              className="p-1 hover:bg-[#2a2d2e] rounded"
              aria-label="New file"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:bg-[#2a2d2e] rounded"
              aria-label="Upload file"
            >
              <Upload size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto p-2" role="tree">
        {activeSidebarIcon === 'explorer' && renderFileTree('root')}

        {activeSidebarIcon === 'search' && (
          <div className="space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 bg-[#3c3c3c] rounded text-sm outline-none"
              aria-label="Search files"
            />
            {searchResults.map((r, i) => (
              <div
                key={i}
                className="p-2 hover:bg-[#2a2d2e] rounded cursor-pointer text-xs"
                onClick={() => onFileClick(r.file.id)}
                role="button"
                tabIndex={0}
              >
                <div className="text-blue-400">{r.file.name}:{r.line}</div>
                <div className="text-gray-500 truncate">{r.content}</div>
              </div>
            ))}
          </div>
        )}

        {activeSidebarIcon === 'git' && (
          <div className="space-y-3">
            {!isGithubConnected ? (
              <button
                onClick={onGitHubLogin}
                className="w-full py-1.5 bg-[#007acc] text-white text-xs rounded flex items-center justify-center gap-2"
              >
                <Github size={14} aria-hidden="true" /> Connect GitHub
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 p-2 bg-[#2a2d2e] rounded">
                  <img src={githubUser?.avatar_url} className="w-6 h-6 rounded-full" alt="" aria-hidden="true" />
                  <div className="text-xs">
                    <div className="text-white">{githubUser?.name}</div>
                    <div className="text-gray-400">@{githubUser?.login}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onGitHubPush}
                    className="flex-1 py-1 bg-green-600 text-white text-xs rounded"
                  >
                    Push
                  </button>
                  <button
                    onClick={onGitHubPull}
                    className="flex-1 py-1 bg-[#3c3c3c] text-white text-xs rounded"
                  >
                    Pull
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
