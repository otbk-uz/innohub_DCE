const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf-8');

// 1. Remove SuperAI class
// Find "// ==================== SUPER AI ENGINE ====================" 
// and "// ==================== INITIAL FILES ===================="
const classStartIndex = content.indexOf('// ==================== SUPER AI ENGINE ====================');
const initialFilesIndex = content.indexOf('// ==================== INITIAL FILES ====================');

if (classStartIndex !== -1 && initialFilesIndex !== -1) {
    const mainAppIndex = content.indexOf('// ==================== MAIN APP COMPONENT ====================');
    
    // We will keep everything before SuperAI wrapper, and everything after MAIN APP COMPONENT
    let head = content.substring(0, classStartIndex);
    let tail = content.substring(mainAppIndex);
    
    // Inject imports
    head = head.replace("import { \n  FileCode", "import { useAppStore } from './store';\nimport { SuperAI } from './lib/SuperAI';\nimport { AIAction } from './types';\nimport { \n  FileCode");
    
    // In tail, replace the useState block:
    const stateRegex = /\/\/ State.*?\/\/ Refs/s;
    const replacementState = `  // Store State
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

  // Refs`;

    tail = tail.replace(stateRegex, replacementState);
    
    fs.writeFileSync(appPath, head + tail, 'utf-8');
    console.log("App.tsx has been refactored successfully.");
} else {
    console.log("Could not find the expected markers in App.tsx.");
}
