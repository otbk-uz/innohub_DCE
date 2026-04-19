import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Terminal, AlertCircle, Radio, List, X, Square } from 'lucide-react';

interface TerminalPanelProps {
  onClose: () => void;
}

const WS_URL = 'ws://localhost:3002/terminal';

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ onClose }) => {
  const { 
    bottomPanelTab, setBottomPanelTab, 
    bottomPanelHeight, addTerminalLine
  } = useAppStore();
  const [terminalInput, setTerminalInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [realOutput, setRealOutput] = useState<string[]>([]);

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

  return (
    <div className="border-t border-[#2b2b2b] bg-[#181818] flex flex-col" style={{ height: bottomPanelHeight }}>
      <div className="flex items-center border-b border-[#2b2b2b]">
        <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
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
        {isRunning && (
          <button 
            onClick={handleKill} 
            className="p-1 hover:bg-red-900/50 mr-2 text-red-400"
            title="Kill process"
          >
            <Square size={12} />
          </button>
        )}
        <button onClick={onClose} className="p-1 hover:bg-[#2a2d2e] mr-1"><X size={12} /></button>
      </div>
      
      <div ref={outputRef} className="flex-1 overflow-auto p-2 font-mono text-sm">
        {bottomPanelTab === 'terminal' && (
          <>
            <div className="whitespace-pre-wrap break-words">
              {realOutput.map((line, i) => (
                <span key={i} className="text-gray-300">{line}</span>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
              <span className="text-green-400">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                placeholder={isConnected ? "Type command (npm run dev, ls, etc...)" : "Connecting to terminal server..."}
                autoFocus
                disabled={!isConnected}
              />
            </form>
            {!isConnected && (
              <div className="text-yellow-400 text-xs mt-2">
                ⚠️ Terminal server not connected. Run: node server/server.js
              </div>
            )}
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
  );
};
