import express from 'express';
import { WebSocketServer } from 'ws';
import { spawn, exec } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Project root directory (where commands will be executed)
const PROJECT_ROOT = path.join(__dirname, '..');

// Windows uchun cross-platform path
const getCrossPlatformPath = (inputPath) => {
  return inputPath.replace(/\\/g, '/');
};

// HTTP API for simple commands
app.post('/api/execute', (req, res) => {
  const { command, cwd } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command required' });
  }

  const workingDir = cwd || PROJECT_ROOT;
  
  // Parse command and arguments
  const parts = command.split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);
  
  console.log(`[EXECUTE] ${command} in ${workingDir}`);
  
  const child = spawn(cmd, args, {
    cwd: workingDir,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  child.on('close', (code) => {
    res.json({
      stdout,
      stderr,
      exitCode: code,
      command
    });
  });

  child.on('error', (error) => {
    res.json({
      stdout: '',
      stderr: error.message,
      exitCode: -1,
      command
    });
  });
});

// API for saving files to disk (for code execution)
import fs from 'fs';
import { mkdir } from 'fs/promises';

app.post('/api/save-file', async (req, res) => {
  const { filename, content, cwd } = req.body;
  
  if (!filename || content === undefined) {
    return res.status(400).json({ error: 'Filename and content required' });
  }

  const workingDir = cwd || path.join(PROJECT_ROOT, 'app');
  const filePath = path.join(workingDir, filename);
  
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    await mkdir(dir, { recursive: true });
    
    // Write file
    await fs.promises.writeFile(filePath, content, 'utf8');
    console.log(`[SAVE] ${filePath}`);
    
    res.json({ success: true, path: filePath });
  } catch (error) {
    console.error('[SAVE ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket server for interactive terminal
const server = app.listen(PORT, () => {
  console.log(`[SERVER] Backend running on http://localhost:${PORT}`);
  console.log(`[SERVER] Project root: ${PROJECT_ROOT}`);
});

const wss = new WebSocketServer({ server, path: '/terminal' });

const activeProcesses = new Map();

wss.on('connection', (ws, req) => {
  console.log('[WS] Terminal client connected');
  
  let currentProcess = null;
  let currentWorkingDir = PROJECT_ROOT;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'command':
          const { command, cwd } = message;
          const workingDir = cwd || currentWorkingDir;
          
          console.log(`[WS COMMAND] ${command}`);
          
          // Parse command
          const parts = command.split(' ');
          const cmd = parts[0];
          const args = parts.slice(1);
          
          // Send start notification
          ws.send(JSON.stringify({
            type: 'start',
            command
          }));
          
          const child = spawn(cmd, args, {
            cwd: workingDir,
            shell: true,
            env: { ...process.env, FORCE_COLOR: '1', COLORTERM: 'truecolor' }
          });
          
          currentProcess = child;
          
          child.stdout.on('data', (data) => {
            ws.send(JSON.stringify({
              type: 'stdout',
              data: data.toString()
            }));
          });
          
          child.stderr.on('data', (data) => {
            ws.send(JSON.stringify({
              type: 'stderr',
              data: data.toString()
            }));
          });
          
          child.on('close', (code) => {
            ws.send(JSON.stringify({
              type: 'exit',
              code,
              command
            }));
            currentProcess = null;
          });
          
          child.on('error', (error) => {
            ws.send(JSON.stringify({
              type: 'error',
              data: error.message
            }));
            currentProcess = null;
          });
          break;
          
        case 'input':
          // Send input to running process
          if (currentProcess && currentProcess.stdin) {
            currentProcess.stdin.write(message.data);
          }
          break;
          
        case 'kill':
          if (currentProcess) {
            currentProcess.kill();
            ws.send(JSON.stringify({ type: 'killed' }));
          }
          break;
          
        case 'cwd':
          currentWorkingDir = message.path || PROJECT_ROOT;
          ws.send(JSON.stringify({
            type: 'cwd',
            path: currentWorkingDir
          }));
          break;
      }
    } catch (err) {
      console.error('[WS ERROR]', err);
      ws.send(JSON.stringify({
        type: 'error',
        data: err.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('[WS] Terminal client disconnected');
    if (currentProcess) {
      currentProcess.kill();
    }
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'stdout',
    data: `INNOHUB Real Terminal v1.0.0\r\nWorking directory: ${currentWorkingDir}\r\nType 'help' for available commands\r\n\r\n$ `
  }));
});

console.log('[SERVER] WebSocket terminal ready at ws://localhost:' + PORT + '/terminal');
