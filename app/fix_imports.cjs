const fs = require('fs');

function fix() {
  try {
    let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
    appContent = appContent.replace('rightPanelWidth, setRightPanelWidth,', 'setRightPanelWidth,');
    fs.writeFileSync('src/App.tsx', appContent);
    console.log('Fixed App.tsx');

    let feContent = fs.readFileSync('src/components/FileExplorer.tsx', 'utf-8');
    feContent = feContent.replace('ChevronRight, ChevronDown, Search, GitBranch, Github', 'ChevronRight, ChevronDown, Github');
    feContent = feContent.replace('onFileUpload: (files: FileList) => void;', '');
    feContent = feContent.replace('  onFileUpload,\n', '');
    feContent = feContent.replace('fileInputRef: React.RefObject<HTMLInputElement, null>;', 'fileInputRef: React.RefObject<HTMLInputElement>;');
    fs.writeFileSync('src/components/FileExplorer.tsx', feContent);
    console.log('Fixed FileExplorer.tsx');
  } catch(e){
    console.error(e);
  }
}
fix();
