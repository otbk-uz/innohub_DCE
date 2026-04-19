# INNOHUB DCE - Dynamic Code Execution Environment

Professional browser-based IDE with AI assistance, real terminal, and code execution capabilities.

## 🚀 Features

- **Modern Code Editor**: Monaco Editor based (VS Code-like interface)
- **Real Terminal**: WebSocket-powered terminal connection
- **AI Assistant**: SuperAI powered by Google Gemini
- **GitHub Integration**: Full repository management
- **Code Execution**: Run JavaScript, TypeScript, Python directly
- **Multi-language Support**: 50+ programming languages

## 📁 Project Structure

```
innohub_DCE/
├── app/                    # Main IDE application (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── lib/           # Utilities (SuperAI, GitHub Auth)
│   │   ├── store/         # Zustand state management
│   │   └── types/         # TypeScript definitions
│   └── package.json
├── server/                # Backend server (Express + WebSocket)
│   └── server.js          # Main server file
├── innoai/               # AI module (basic React app)
└── package.json          # Root package.json
```

## 🛠️ Installation

### 1. Install all dependencies:

```bash
# Root directory
cd c:\Users\admin\innohub_DCE

# Install all dependencies (root + app + server)
npm run install:all

# Or manually:
npm install
cd app && npm install
cd ../server && npm install
```

### 2. Start the Server:

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Server will run on http://localhost:3002
```

### 3. Start the App:

```bash
# Terminal 2 - Start frontend app
cd app
npm run dev

# App will run on http://localhost:5173
```

## 🔧 Fixed Issues

### ✅ Windows Compatibility
- Removed `node-pty` dependency (requires native compilation)
- Using pure `child_process` for terminal functionality
- Cross-platform path handling

### ✅ Dynamic Code Execution (DCE)
- Added `/api/save-file` endpoint to save files before execution
- Run button now saves files to disk before executing
- Better error handling and debugging output

### ✅ Boshlash (Start) Button
- Added error handling in login function
- Better console logging for debugging

### ✅ Terminal Connection
- Improved WebSocket error messages
- Better connection status indicators

## 📝 Usage

1. **Start the Server**: `cd server && npm run dev`
2. **Start the App**: `cd app && npm run dev`
3. **Open Browser**: Go to `http://localhost:5173`
4. **Click "Boshlash"**: Guest login (no authentication required)
5. **Start Coding**: Create files, edit code, run programs!

## 🔌 API Endpoints

- `POST /api/execute` - Execute a command
- `POST /api/save-file` - Save file to disk
- `WS /terminal` - WebSocket terminal connection

## 🌐 Environment Variables

Create `.env` file in `app/` directory:

```env
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

## ⚠️ Requirements

- Node.js 18+
- npm or yarn
- Modern browser (Chrome, Firefox, Edge)

## 🐛 Troubleshooting

### "WebSocket connection failed"
- Make sure server is running: `node server/server.js`
- Check if port 3002 is available

### "Faylni saqlashda xatolik"
- Check if `app/` folder exists and is writable
- Verify server is running with admin permissions

### "Boshlash tugmasi ishlamaydi"
- Check browser console for errors
- Verify Zustand store is working

## 👨‍💻 Author

Created by **Otabekxoff Creator**

## 📄 License

MIT License