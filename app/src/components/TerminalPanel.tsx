import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { 
  Terminal, 
  AlertCircle, 
  Radio, 
  List, 
  X, 
  Square, 
  Trash2,
  Circle,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import type { BottomPanelTab } from '../types';

interface TerminalPanelProps {
  onClose: () => void;
}

const WS_URL = 'ws://localhost:3002/terminal';

const TAB_CONFIG: { id: BottomPanelTab; label: string; icon: typeof Terminal }[] = [
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'problems', label: 'Problems', icon: AlertCircle },
  { id: 'output', label: 'Output', icon: List },
  { id: 'ports', label: 'Ports', icon: Radio },
];

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ onClose }) => {
  const { 
    bottomPanelTab, setBottomPanelTab, 
    bottomPanelHeight, addTerminalLine,
    problems, clearProblems,
    ports, setPorts
  } = useAppStore();
  const [terminalInput, setTerminalInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [realOutput, setRealOutput] = useState<string[]>([]);
  const [outputLogs, setOutputLogs] = useState<{type: 'info' | 'error' | 'success' | 'warn', message: string, timestamp: number}[]>([]);

  // WebSocket connection
  useEffect(() => {
    if (bottomPanelTab !== 'terminal') return;

    let isMounted = true;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMounted) return;
      setIsConnected(true);
      addTerminalLine('output', '[System] Real terminal connected');
    };

    ws.onmessage = (event) => {
      if (!isMounted) return;
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'stdout':
        case 'stderr':
          setRealOutput(prev => [...prev, data.data]);
          break;
        case 'start':
          setIsRunning(true);
          setRealOutput(prev => [...prev, `$ ${data.command}\r\n`]);
          break;
        case 'exit':
          setIsRunning(false);
          setRealOutput(prev => [...prev, `\r\n[Exit code: ${data.code}]\r\n$ `]);
          break;
        case 'error':
          setIsRunning(false);
          setRealOutput(prev => [...prev, `Error: ${data.data}\r\n$ `]);
          break;
        case 'killed':
          setIsRunning(false);
          setRealOutput(prev => [...prev, '\r\n[Process killed]\r\n$ ']);
          break;
      }
    };

    ws.onclose = () => {
      if (!isMounted) return;
      setIsConnected(false);
      addTerminalLine('output', '[System] Terminal disconnected');
    };

    ws.onerror = (err) => {
      if (!isMounted) return;
      console.error('[Terminal] WebSocket xatolik:', err);
      addTerminalLine('error', '[System] WebSocket xatolik - Server ishga tushirilganini tekshiring: node server/server.js');
    };

    return () => {
      isMounted = false;
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomPanelTab]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [realOutput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || !wsRef.current) return;
    
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        command: terminalInput
      }));
      setTerminalInput('');
    }
  };

  const handleKill = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'kill' }));
    }
  };

  // Helper to get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle size={14} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={14} className="text-yellow-500" />;
      case 'info': return <Info size={14} className="text-blue-500" />;
      default: return <CheckCircle2 size={14} className="text-green-500" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="border-t border-[#2b2b2b] bg-[#181818] flex flex-col" style={{ height: bottomPanelHeight }}>
      {/* Tab Bar */}
      <div className="flex items-center border-b border-[#2b2b2b] bg-[#1e1e1e]">
        <div className={`w-2 h-2 rounded-full mx-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
        
        {TAB_CONFIG.map(({ id, label, icon: Icon }) => {
          const count = id === 'problems' ? problems.length : id === 'ports' ? ports.length : 0;
          return (
            <button
              key={id}
              onClick={() => setBottomPanelTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                bottomPanelTab === id 
                  ? 'border-b-2 border-[#007acc] text-white bg-[#252526]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2d2e]'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${
                  id === 'problems' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        
        <div className="flex-1" />
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 mr-2">
          {bottomPanelTab === 'terminal' && isRunning && (
            <button 
              onClick={handleKill} 
              className="p-1.5 hover:bg-red-900/50 text-red-400 rounded"
              title="Kill process"
            >
              <Square size={12} fill="currentColor" />
            </button>
          )}
          
          {(bottomPanelTab === 'problems' || bottomPanelTab === 'output') && (
            <button 
              onClick={() => {
                if (bottomPanelTab === 'problems') clearProblems();
                if (bottomPanelTab === 'output') setOutputLogs([]);
              }}
              className="p-1.5 hover:bg-[#2a2d2e] text-gray-400 rounded"
              title="Clear"
            >
              <Trash2 size={12} />
            </button>
          )}
          
          <button onClick={onClose} className="p-1.5 hover:bg-[#2a2d2e] text-gray-400 rounded">
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Panel Content */}
      <div ref={outputRef} className="flex-1 overflow-auto bg-[#1e1e1e]">
        
        {/* ===== TERMINAL PANEL ===== */}
        {bottomPanelTab === 'terminal' && (
          <div className="h-full flex flex-col p-3 font-mono text-sm">
            <div className="flex-1 overflow-auto whitespace-pre-wrap break-words space-y-0.5">
              {realOutput.length === 0 ? (
                <div className="text-gray-500 italic">Terminal ready. Type a command to get started...</div>
              ) : (
                realOutput.map((line, i) => (
                  <div key={i} className="text-gray-300 leading-relaxed">{line}</div>
                ))
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3 pt-2 border-t border-[#2b2b2b]">
              <span className="text-green-400 font-bold">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-300 placeholder-gray-600"
                placeholder={isConnected ? "Type command..." : "Connecting..."}
                autoFocus
                disabled={!isConnected}
              />
            </form>
            {!isConnected && (
              <div className="text-yellow-400 text-xs mt-2 flex items-center gap-1.5">
                <AlertCircle size={12} />
                Terminal server not connected. Run: node server/server.js
              </div>
            )}
          </div>
        )}
        
        {/* ===== PROBLEMS PANEL ===== */}
        {bottomPanelTab === 'problems' && (
          <div className="h-full flex flex-col">
            {/* Problems Header */}
            <div className="flex items-center gap-4 px-3 py-2 border-b border-[#2b2b2b] bg-[#252526]">
              <span className="flex items-center gap-1.5 text-xs">
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-red-400 font-medium">{problems.filter(p => p.severity === 'error').length}</span>
                <span className="text-gray-500">Errors</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <AlertTriangle size={14} className="text-yellow-500" />
                <span className="text-yellow-400 font-medium">{problems.filter(p => p.severity === 'warning').length}</span>
                <span className="text-gray-500">Warnings</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <Info size={14} className="text-blue-500" />
                <span className="text-blue-400 font-medium">{problems.filter(p => p.severity === 'info').length}</span>
                <span className="text-gray-500">Infos</span>
              </span>
            </div>
            
            {/* Problems List */}
            <div className="flex-1 overflow-auto">
              {problems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <CheckCircle2 size={48} className="text-green-500/50 mb-2" />
                  <p className="text-sm">No problems detected</p>
                  <p className="text-xs text-gray-600 mt-1">Your workspace looks clean!</p>
                </div>
              ) : (
                <div className="divide-y divide-[#2b2b2b]">
                  {problems.map((problem, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#2a2d2e] cursor-pointer transition-colors"
                    >
                      <div className="mt-0.5">{getSeverityIcon(problem.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-gray-400 font-medium truncate">{problem.file}</span>
                          <span className="text-xs text-gray-600">[{problem.line}:{problem.column}]</span>
                        </div>
                        <p className="text-sm text-gray-300">{problem.message}</p>
                        {problem.code && (
                          <code className="text-xs text-gray-500 bg-[#2a2d2e] px-1.5 py-0.5 rounded mt-1 inline-block">
                            {problem.code}
                          </code>
                        )}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getSeverityColor(problem.severity)} uppercase tracking-wider`}>
                        {problem.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* ===== OUTPUT PANEL ===== */}
        {bottomPanelTab === 'output' && (
          <div className="h-full flex flex-col p-3 font-mono text-sm">
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 border-b border-[#2b2b2b] pb-2">
              <span className="flex items-center gap-1.5">
                <List size={12} />
                INNOHUB Output
              </span>
            </div>
            <div className="flex-1 overflow-auto space-y-1">
              {outputLogs.length === 0 ? (
                <>
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="text-xs">[INFO]</span>
                    <span>INNOHUB IDE v3.0.0 initialized</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <span className="text-xs">[READY]</span>
                    <span>Super AI engine loaded</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-xs">[READY]</span>
                    <span>Terminal service ready on port 3002</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-xs">[READY]</span>
                    <span>File explorer loaded with default project</span>
                  </div>
                </>
              ) : (
                outputLogs.map((log, i) => (
                  <div key={i} className={`flex items-center gap-2 ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
                  }`}>
                    <span className="text-xs text-gray-600">[{log.type.toUpperCase()}]</span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* ===== PORTS PANEL ===== */}
        {bottomPanelTab === 'ports' && (
          <div className="h-full flex flex-col">
            {/* Ports Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2b2b2b] bg-[#252526]">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-400">Local Address</span>
                <span className="text-gray-400">Process</span>
                <span className="text-gray-400">PID</span>
                <span className="text-gray-400">Status</span>
              </div>
              <button 
                onClick={() => {
                  // Simulate port refresh
                  setPorts([
                    { port: 3002, process: 'innohub-server', pid: 12345, status: 'listening' },
                    { port: 5173, process: 'vite-dev-server', pid: 12346, status: 'listening' },
                  ]);
                }}
                className="p-1.5 hover:bg-[#2a2d2e] text-gray-400 rounded"
                title="Refresh"
              >
                <Radio size={12} />
              </button>
            </div>
            
            {/* Ports List */}
            <div className="flex-1 overflow-auto">
              {ports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Radio size={48} className="text-gray-600/50 mb-2" />
                  <p className="text-sm">No forwarded ports</p>
                  <p className="text-xs text-gray-600 mt-1">Services will appear here when running</p>
                </div>
              ) : (
                <div className="divide-y divide-[#2b2b2b]">
                  {ports.map((port) => (
                    <div 
                      key={port.port} 
                      className="flex items-center gap-4 px-3 py-2.5 hover:bg-[#2a2d2e] transition-colors"
                    >
                      <div className="flex items-center gap-2 w-32">
                        <Circle size={8} className={port.status === 'listening' ? 'text-green-500 fill-green-500' : 'text-gray-500'} />
                        <span className="text-sm text-blue-400 font-mono">localhost:{port.port}</span>
                      </div>
                      <span className="text-sm text-gray-300 flex-1">{port.process}</span>
                      <span className="text-sm text-gray-500 font-mono w-16">{port.pid || '-'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        port.status === 'listening' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {port.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
