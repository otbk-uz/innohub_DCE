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
  type: 'create_file' | 'edit_file' | 'delete_file' | 'run_command';
  filename?: string;
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

// ==================== SUPER AI ENGINE ====================
class SuperAI {
  private currentFile?: FileItem;

  setContext(_files: FileItem[], currentFile?: FileItem) {
    this.currentFile = currentFile;
  }

  async process(message: string): Promise<{
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  }> {
    const lower = message.toLowerCase();

    // ========== CREATE REACT COMPONENT ==========
    if (/(yarat|create|generate|yoz).*(react|component|komponent)/i.test(lower)) {
      const nameMatch = message.match(/(?:komponent|component|nomi|named?)[\s:]*(\w+)/i);
      const name = nameMatch?.[1] || 'MyComponent';
      return this.createReactComponent(name, lower);
    }

    // ========== CREATE API ==========
    if (/(yarat|create|generate).*(api|endpoint|route|backend)/i.test(lower)) {
      return this.createAPI(lower);
    }

    // ========== CREATE PAGE ==========
    if (/(yarat|create|generate).*(page|sahifa|screen|view)/i.test(lower)) {
      const nameMatch = message.match(/(?:page|sahifa|nomi)[\s:]*(\w+)/i);
      return this.createPage(nameMatch?.[1] || 'HomePage');
    }

    // ========== CREATE HOOK ==========
    if (/(yarat|create|generate).*(hook|use\w+)/i.test(lower)) {
      const nameMatch = message.match(/(?:hook|use)[\s:]*(\w+)/i);
      return this.createHook(nameMatch?.[1] || 'Data');
    }

    // ========== CREATE STYLES ==========
    if (/(yarat|create|generate).*(style|css|scss|tailwind)/i.test(lower)) {
      return this.createStyles(lower);
    }

    // ========== CREATE FULL APP ==========
    if (/(yarat|create|generate).*(app|application|ilova|loyiha|project)/i.test(lower)) {
      return this.createFullApp(lower);
    }

    // ========== FIX CODE ==========
    if (/(tuzat|fix|repair|to'g'irla|correct)/i.test(lower)) {
      return this.fixCode();
    }

    // ========== OPTIMIZE ==========
    if (/(optimallashtir|optimize|tezlashtir|improve)/i.test(lower)) {
      return this.optimizeCode();
    }

    // ========== EXPLAIN ==========
    if (/(tushuntir|explain|nima|qanday|what|how)/i.test(lower)) {
      return this.explainCode();
    }

    // ========== ANALYZE ==========
    if (/(tahlil|analyze|tekshir|review|check)/i.test(lower)) {
      return this.analyzeCode();
    }

    // ========== REFACTOR ==========
    if (/(refactor|qayta yoz|rewrite)/i.test(lower)) {
      return this.refactorCode();
    }

    // ========== ADD TYPESCRIPT TYPES ==========
    if (/(type|interface|typescript).*(qosh|add|yoz)/i.test(lower)) {
      return this.addTypes();
    }

    // ========== CREATE TEST ==========
    if (/(yarat|create|generate).*(test|spec|jest|vitest)/i.test(lower)) {
      return this.createTest();
    }

    // ========== INSTALL PACKAGE ==========
    if (/(install|npm|yarn|pnpm|package|kutubxona)/i.test(lower)) {
      const pkgMatch = message.match(/(?:install|npm|package)[\s:]*(\S+)/i);
      return this.installPackage(pkgMatch?.[1] || '');
    }

    // ========== RUN COMMAND ==========
    if (/(run|bajar|ishga tushur|start|dev)/i.test(lower)) {
      return this.runCommand(lower);
    }

    // ========== DELETE FILE ==========
    if (/(o'chir|delete|remove|clean)/i.test(lower)) {
      return this.deleteFile(message);
    }

    // ========== RENAME FILE ==========
    if (/(rename|qayta nomla|yangi nom)/i.test(lower)) {
      return this.renameFile(message);
    }

    // ========== SEARCH & REPLACE ==========
    if (/(almashtir|replace|change|o'zgartir)/i.test(lower)) {
      return this.searchReplace(message);
    }

    // ========== FORMAT CODE ==========
    if (/(format|beautify|prettify)/i.test(lower)) {
      return this.formatCode();
    }

    // ========== ADD COMMENTS ==========
    if (/(comment|izoh|document)/i.test(lower)) {
      return this.addComments();
    }

    // ========== CONVERT LANGUAGE ==========
    if (/(convert|o'zgartir).*(js|ts|jsx|tsx)/i.test(lower)) {
      return this.convertLanguage(lower);
    }

    // ========== GENERIC RESPONSE ==========
    return {
      response: `🤔 Buyruqni to'liq tushunmadim.\n\nQuyidagi buyruqlardan foydalaning:\n\n**Yaratish:**\n• "React komponent yarat: Button"\n• "API endpoint yarat"\n• "Hook yarat: useAuth"\n• "Page yarat: Dashboard"\n• "To'liq ilova yarat"\n\n**Tahrirlash:**\n• "Kodni tuzat"\n• "Kodni optimallashtir"\n• "Type qo'sh"\n• "Comment yoz"\n\n**Boshqa:**\n• "Kodni tahlil qil"\n• "Kodni tushuntir"\n• "Test yarat"\n• "npm install axios"`,
      actions: [],
      codeBlocks: []
    };
  }

  // ========== CREATE REACT COMPONENT ==========
  private createReactComponent(name: string, lower: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    const withProps = /prop|props|props/i.test(lower);
    const withState = /state|holat|usestate/i.test(lower);
    const withEffect = /effect|useeffect|lifecycle/i.test(lower);
    const withCallback = /callback|usecallback|memo/i.test(lower);
    const withStyles = /style|css|tailwind|styled/i.test(lower);

    let imports = "import React";
    if (withState) imports += ", { useState }";
    if (withEffect) imports += withState ? ", { useEffect }" : ", { useEffect }";
    if (withCallback) imports += ", { useCallback }";
    imports += " from 'react';";

    if (withStyles) imports += "\nimport './" + name + ".css';";

    let propsInterface = '';
    let propsParam = '';
    if (withProps) {
      propsInterface = `\n\ninterface ${name}Props {\n  /** Komponent sarlavhasi */\n  title: string;\n  /** Tavsif matni */\n  description?: string;\n  /** Bosilganda ishga tushuvchi funksiya */\n  onAction?: () => void;\n  /** Yopiq holat */\n  isOpen?: boolean;\n}`;
      propsParam = `props: ${name}Props`;
    }

    let stateCode = '';
    if (withState) {
      stateCode = `\n  // State\n  const [count, setCount] = useState<number>(0);\n  const [loading, setLoading] = useState<boolean>(false);\n  const [error, setError] = useState<string | null>(null);`;
    }

    let effectCode = '';
    if (withEffect) {
      effectCode = `\n\n  // Lifecycle\n  useEffect(() => {\n    // Komponent yuklanganda ishga tushadi\n    console.log('${name} mounted');\n    \n    // Tozalash funksiyasi\n    return () => {\n      console.log('${name} unmounted');\n    };\n  }, []);`;
    }

    let callbackCode = '';
    if (withCallback) {
      callbackCode = `\n\n  // Memoized handlers\n  const handleClick = useCallback(() => {\n    ${withState ? 'setCount(prev => prev + 1);' : ''}\n    ${withProps ? 'props.onAction?.();' : ''}\n  }, [${withProps ? 'props.onAction' : ''}]);`;
    }

    const code = `${imports}${propsInterface}

/**
 * ${name} komponenti
 * ${withProps ? '\n * @param props - Komponent parametrlari' : ''}
 */
export const ${name}: React.FC${withProps ? `<${name}Props>` : ''} = (${propsParam}) => {${stateCode}${effectCode}${callbackCode}

  return (
    <div className="${name.toLowerCase()}-container">${withProps ? '\n      <h2 className="text-2xl font-bold">{props.title}</h2>' : `\n      <h2 className="text-2xl font-bold">${name}</h2>`}
      ${withProps ? '{props.description && <p className="mt-2 text-gray-600">{props.description}</p>}' : ''}
      ${withState ? '\n      <p className="mt-4">Count: {count}</p>' : ''}
      <button 
        onClick={${withCallback ? 'handleClick' : withProps ? 'props.onAction' : '() => {}'}}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Click
      </button>
    </div>
  );
};`;

    return {
      response: `✅ **${name}** komponenti tayyor!\n\n📁 \`src/components/${name}.tsx\`\n\n🔹 Xususiyatlar:${withProps ? '\n  • Props bilan ishlaydi' : ''}${withState ? '\n  • State boshqaruvi' : ''}${withEffect ? '\n  • useEffect lifecycle' : ''}${withCallback ? '\n  • useCallback optimallashtirish' : ''}${withStyles ? '\n  • CSS moduli' : ''}\n\n💾 Faylni yaratishni xohlaysizmi?`,
      actions: [{
        type: 'create_file',
        filename: `src/components/${name}.tsx`,
        content: code,
        description: `Create ${name}.tsx`
      }],
      codeBlocks: [{ language: 'typescript', code, filename: `${name}.tsx` }]
    };
  }

  // ========== CREATE API ==========
  private createAPI(_lower: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    const code = `import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';

const router: Router = express.Router();

// Middleware - xatolarni tekshirish
const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ============================================
// GET /api/items - Barcha elementlarni olish
// ============================================
router.get('/items', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const items = await getItemsFromDatabase({
      page: Number(page),
      limit: Number(limit),
      search: search as string
    });
    
    res.json({ 
      success: true, 
      data: items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: items.length
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch items' 
    });
  }
});

// ============================================
// GET /api/items/:id - Bitta elementni olish
// ============================================
router.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await getItemById(id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch item' 
    });
  }
});

// ============================================
// POST /api/items - Yangi element yaratish
// ============================================
router.post('/items',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    handleValidationErrors
  ],
  async (req: Request, res: Response) => {
    try {
      const newItem = await createItem(req.body);
      res.status(201).json({ 
        success: true, 
        data: newItem,
        message: 'Item created successfully'
      });
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(400).json({ 
        success: false, 
        error: 'Failed to create item' 
      });
    }
  }
);

// ============================================
// PUT /api/items/:id - Elementni yangilash
// ============================================
router.put('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedItem = await updateItem(id, req.body);
    
    res.json({ 
      success: true, 
      data: updatedItem,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to update item' 
    });
  }
});

// ============================================
// DELETE /api/items/:id - Elementni o'chirish
// ============================================
router.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteItem(id);
    
    res.json({ 
      success: true, 
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete item' 
    });
  }
});

// ============================================
// Mock Database Functions
// ============================================
interface GetItemsOptions {
  page: number;
  limit: number;
  search?: string;
}

async function getItemsFromDatabase(options: GetItemsOptions) {
  const allItems = [
    { id: '1', name: 'Item 1', description: 'Description 1' },
    { id: '2', name: 'Item 2', description: 'Description 2' },
    { id: '3', name: 'Item 3', description: 'Description 3' },
  ];
  
  let items = allItems;
  
  if (options.search) {
    items = items.filter(item => 
      item.name.toLowerCase().includes(options.search!.toLowerCase())
    );
  }
  
  const start = (options.page - 1) * options.limit;
  const end = start + options.limit;
  
  return items.slice(start, end);
}

async function getItemById(id: string) {
  return { id, name: 'Item ' + id, description: 'Description' };
}

async function createItem(data: any) {
  return { id: String(Date.now()), ...data, createdAt: new Date() };
}

async function updateItem(id: string, data: any) {
  return { id, ...data, updatedAt: new Date() };
}

async function deleteItem(_id: string) {
  return true;
}

export default router;`;

    return {
      response: `✅ **Express.js API** tayyor!\n\n📁 \`src/routes/api.ts\`\n\n🔹 Endpointlar:\n  • GET /api/items - Barcha elementlar (pagination, search)\n  • GET /api/items/:id - Bitta element\n  • POST /api/items - Yaratish (validation bilan)\n  • PUT /api/items/:id - Yangilash\n  • DELETE /api/items/:id - O'chirish\n\n📦 Kerakli paketlar:\n  \`npm install express express-validator\``,
      actions: [{
        type: 'create_file',
        filename: 'src/routes/api.ts',
        content: code,
        description: 'Create API router'
      }],
      codeBlocks: [{ language: 'typescript', code, filename: 'api.ts' }]
    };
  }

  // ========== CREATE PAGE ==========
  private createPage(name: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    const code = `import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

/**
 * ${name} sahifasi
 */
export const ${name}: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ma'lumotlarni yuklash
    const loadData = async () => {
      try {
        setIsLoading(true);
        // API chaqiruvi...
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>${name} | My App</title>
        <meta name="description" content="${name} sahifasi" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              ${name}
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Bu sahifa tavsifi. O'zingizga mos matn yozing.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Bosh sahifa
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Sarlavha</h2>
              <p className="text-gray-600">
                Bu yerda asosiy kontent bo'ladi.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};`;

    return {
      response: `✅ **${name}** sahifasi tayyor!\n\n📁 \`src/pages/${name}.tsx\`\n\n🔹 Xususiyatlar:\n  • React Router bilan integratsiya\n  • Helmet SEO optimallashtirish\n  • Loading holati\n  • Responsive design\n  • Gradient hero section`,
      actions: [{
        type: 'create_file',
        filename: `src/pages/${name}.tsx`,
        content: code,
        description: `Create ${name}.tsx`
      }],
      codeBlocks: [{ language: 'typescript', code, filename: `${name}.tsx` }]
    };
  }

  // ========== CREATE HOOK ==========
  private createHook(name: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    const hookName = name.startsWith('use') ? name : `use${name}`;
    
    const code = `import { useState, useEffect, useCallback } from 'react';

interface Use${name}Options {
  /** Boshlang'ich qiymat */
  initialValue?: any;\n  /** Kechikish vaqti (ms) */
  delay?: number;\n}

interface Use${name}Return {
  /** Joriy qiymat */
  value: any;\n  /** Qiymatni o'zgartirish */
  setValue: (value: any) => void;\n  /** Yuklanish holati */
  isLoading: boolean;\n  /** Xato holati */
  error: Error | null;\n  /** Qayta yuklash */
  refetch: () => void;\n}

/**
 * ${hookName} hook
 * \n * @example\n * const { value, isLoading, error } = ${hookName}({ initialValue: [] });\n */
export function ${hookName}(options: Use${name}Options = {}): Use${name}Return {
  const { initialValue, delay = 0 } = options;
  
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Kechikish (agar kerak bo'lsa)
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Ma'lumotlarni olish
      // const response = await api.get('/data');
      // setValue(response.data);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [delay]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    value,
    setValue,
    isLoading,
    error,
    refetch,
  };
}`;

    return {
      response: `✅ **${hookName}** hook tayyor!\n\n📁 \`src/hooks/${hookName}.ts\`\n\n🔹 Xususiyatlar:\n  • TypeScript bilan to'liq tipizatsiya\n  • Loading va error holatlari\n  • refetch funksiyasi\n  • Kechikish parametri`,
      actions: [{
        type: 'create_file',
        filename: `src/hooks/${hookName}.ts`,
        content: code,
        description: `Create ${hookName}.ts`
      }],
      codeBlocks: [{ language: 'typescript', code, filename: `${hookName}.ts` }]
    };
  }

  // ========== CREATE STYLES ==========
  private createStyles(_lower: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    const code = `/* ============================================
   Global Styles
   ============================================ */

/* CSS Variables */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-dark: #111827;
  
  --border-radius: 8px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Base */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  line-height: 1.5;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

/* Cards */
.card {
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
}

/* Form Elements */
.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Utilities */
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.p-4 { padding: 1rem; }`;

    return {
      response: `✅ **Global Styles** tayyor!\n\n📁 \`src/styles/globals.css\`\n\n🔹 Xususiyatlar:\n  • CSS Variables\n  • Reset styles\n  • Button components\n  • Card components\n  • Form elements\n  • Utility classes`,
      actions: [{
        type: 'create_file',
        filename: 'src/styles/globals.css',
        content: code,
        description: 'Create globals.css'
      }],
      codeBlocks: [{ language: 'css', code, filename: 'globals.css' }]
    };
  }

  // ========== CREATE FULL APP ==========
  private createFullApp(_lower: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    const actions: AIAction[] = [];

    // App.tsx
    actions.push({
      type: 'create_file',
      filename: 'src/App.tsx',
      content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import './styles/globals.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;`,
      description: 'Create App.tsx'
    });

    // Layout
    actions.push({
      type: 'create_file',
      filename: 'src/components/Layout.tsx',
      content: `import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};`,
      description: 'Create Layout.tsx'
    });

    // Navbar
    actions.push({
      type: 'create_file',
      filename: 'src/components/Navbar.tsx',
      content: `import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">MyApp</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
        </div>
      </div>
    </nav>
  );
};`,
      description: 'Create Navbar.tsx'
    });

    // Footer
    actions.push({
      type: 'create_file',
      filename: 'src/components/Footer.tsx',
      content: `import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>&copy; 2024 MyApp. All rights reserved.</p>
    </footer>
  );
};`,
      description: 'Create Footer.tsx'
    });

    // HomePage
    actions.push({
      type: 'create_file',
      filename: 'src/pages/HomePage.tsx',
      content: `import React from 'react';
import { Helmet } from 'react-helmet-async';

export const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Home | MyApp</title>
      </Helmet>
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold">Welcome to MyApp</h1>
      </div>
    </>
  );
};`,
      description: 'Create HomePage.tsx'
    });

    // AboutPage
    actions.push({
      type: 'create_file',
      filename: 'src/pages/AboutPage.tsx',
      content: `import React from 'react';
import { Helmet } from 'react-helmet-async';

export const AboutPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>About | MyApp</title>
      </Helmet>
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold">About Us</h1>
      </div>
    </>
  );
};`,
      description: 'Create AboutPage.tsx'
    });

    return {
      response: `🚀 **To'liq React ilovasi** yaratildi!\n\n📁 Yaratilgan fayllar:\n  • src/App.tsx\n  • src/components/Layout.tsx\n  • src/components/Navbar.tsx\n  • src/components/Footer.tsx\n  • src/pages/HomePage.tsx\n  • src/pages/AboutPage.tsx\n\n📦 Kerakli paketlar:\n  \`npm install react-router-dom react-helmet-async @tanstack/react-query\``,
      actions,
      codeBlocks: []
    };
  }

  // ========== FIX CODE ==========
  private fixCode(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    if (!this.currentFile) {
      return {
        response: '❌ Avval faylni oching.',
        actions: [],
        codeBlocks: []
      };
    }

    let fixed = this.currentFile.content;
    const fixes: string[] = [];

    if (fixed.match(/\bvar\s+/)) {
      fixed = fixed.replace(/\bvar\b/g, 'const');
      fixes.push('✓ var → const');
    }

    if (fixed.match(/console\.log\(/)) {
      fixed = fixed.replace(/console\.log\([^)]+\);?\n?/g, '');
      fixes.push('✓ console.log olib tashlandi');
    }

    if (fixed.match(/==(?!=)/)) {
      fixed = fixed.replace(/==(?!=)/g, '===');
      fixes.push('✓ == → ===');
    }

    if (fixed.match(/:\s*any/)) {
      fixed = fixed.replace(/:\s*any/g, ': unknown');
      fixes.push('✓ any → unknown');
    }

    return {
      response: `✅ **${this.currentFile.name}** tuzatildi!\n\n${fixes.join('\n') || 'Kod allaqachon toza!'}`,
      actions: [{
        type: 'edit_file',
        filename: this.currentFile.name,
        content: fixed,
        description: `Fix ${this.currentFile.name}`
      }],
      codeBlocks: [{ language: this.currentFile.language, code: fixed }]
    };
  }

  // ========== OPTIMIZE CODE ==========
  private optimizeCode(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    if (!this.currentFile) {
      return {
        response: '❌ Avval faylni oching.',
        actions: [],
        codeBlocks: []
      };
    }

    let optimized = this.currentFile.content;
    const optimizations: string[] = [];

    if (optimized.match(/console\.log\(/)) {
      optimized = optimized.replace(/console\.log\([^)]+\);?\n?/g, '');
      optimizations.push('✓ console.log olib tashlandi');
    }

    return {
      response: `⚡ **${this.currentFile.name}** optimallashtirildi!\n\n${optimizations.join('\n') || 'Kod allaqachon optimal!'}`,
      actions: [{
        type: 'edit_file',
        filename: this.currentFile.name,
        content: optimized,
        description: `Optimize ${this.currentFile.name}`
      }],
      codeBlocks: [{ language: this.currentFile.language, code: optimized }]
    };
  }

  // ========== EXPLAIN CODE ==========
  private explainCode(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    if (!this.currentFile) {
      return {
        response: '❌ Avval faylni oching.',
        actions: [],
        codeBlocks: []
      };
    }

    const lines = this.currentFile.content.split('\n').length;
    const functions = (this.currentFile.content.match(/function|=>/g) || []).length;

    return {
      response: `📖 **${this.currentFile.name}** tavsifi:\n\n• Qatorlar: ${lines}\n• Funksiyalar: ${functions}\n• Tili: ${this.currentFile.language}`,
      actions: [],
      codeBlocks: []
    };
  }

  // ========== ANALYZE CODE ==========
  private analyzeCode(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    if (!this.currentFile) {
      return {
        response: '❌ Avval faylni oching.',
        actions: [],
        codeBlocks: []
      };
    }

    const issues: string[] = [];

    if (this.currentFile.content.match(/console\.log\(/)) {
      issues.push('⚠️ console.log mavjud');
    }
    if (this.currentFile.content.match(/\bvar\s+/)) {
      issues.push('⚠️ var ishlatilgan');
    }

    return {
      response: issues.length > 0 
        ? `🔍 Topilgan muammolar:\n${issues.join('\n')}`
        : '✅ Kodda muammolar yo\'q!',
      actions: [],
      codeBlocks: []
    };
  }

  // ========== REFACTOR ==========
  private refactorCode(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    return {
      response: '🔄 Refactor qilish uchun aniqroq ko\'rsatma bering.',
      actions: [],
      codeBlocks: []
    };
  }

  // ========== ADD TYPES ==========
  private addTypes(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    return {
      response: '📝 Type qo\'shish uchun faylni oching.',
      actions: [],
      codeBlocks: []
    };
  }

  // ========== CREATE TEST ==========
  private createTest(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    const code = `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    render(<div>Test</div>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});`;

    return {
      response: `✅ **Test** tayyor!\n\n📁 \`src/__tests__/example.test.tsx\``,
      actions: [{
        type: 'create_file',
        filename: 'src/__tests__/example.test.tsx',
        content: code,
        description: 'Create test file'
      }],
      codeBlocks: [{ language: 'typescript', code, filename: 'example.test.tsx' }]
    };
  }

  // ========== INSTALL PACKAGE ==========
  private installPackage(pkg: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    return {
      response: pkg 
        ? `📦 \`npm install ${pkg}\` bajarilsinmi?`
        : 'Qaysi paketni o\'rnatishni xohlaysiz?',
      actions: pkg ? [{
        type: 'run_command',
        command: `npm install ${pkg}`,
        description: `Install ${pkg}`
      }] : [],
      codeBlocks: []
    };
  }

  // ========== RUN COMMAND ==========
  private runCommand(lower: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    let command = 'npm run dev';
    if (lower.includes('build')) command = 'npm run build';
    if (lower.includes('test')) command = 'npm test';
    if (lower.includes('lint')) command = 'npm run lint';

    return {
      response: `▶️ \`${command}\` bajarilsinmi?`,
      actions: [{
        type: 'run_command',
        command,
        description: `Run ${command}`
      }],
      codeBlocks: []
    };
  }

  // ========== DELETE FILE ==========
  private deleteFile(message: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    const fileMatch = message.match(/(?:o'chir|delete|remove)\s+(\S+)/i);
    const filename = fileMatch?.[1];

    return {
      response: filename 
        ? `🗑️ **${filename}** o'chirilsinmi?`
        : 'Qaysi faylni o\'chirishni xohlaysiz?',
      actions: filename ? [{
        type: 'delete_file',
        filename,
        description: `Delete ${filename}`
      }] : [],
      codeBlocks: []
    };
  }

  // ========== RENAME FILE ==========
  private renameFile(_message: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    return {
      response: '📝 Faylni qayta nomlash uchun eski va yangi nomni ayting.',
      actions: [],
      codeBlocks: []
    };
  }

  // ========== SEARCH & REPLACE ==========
  private searchReplace(_message: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    return {
      response: '🔍 Nima almashtirishni xohlaysiz?',
      actions: [],
      codeBlocks: []
    };
  }

  // ========== FORMAT CODE ==========
  private formatCode(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    return {
      response: '✨ Kod formatlash - prettier ishlatiladi.',
      actions: [{
        type: 'run_command',
        command: 'npx prettier --write .',
        description: 'Format code with Prettier'
      }],
      codeBlocks: []
    };
  }

  // ========== ADD COMMENTS ==========
  private addComments(): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    return {
      response: '📝 Comment qo\'shish uchun faylni oching.',
      actions: [],
      codeBlocks: []
    };
  }

  // ========== CONVERT LANGUAGE ==========
  private convertLanguage(lower: string): {
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  } {
    return {
      response: lower.includes('ts') 
        ? '🔄 JavaScript → TypeScript o\'zgartirish'
        : '🔄 TypeScript → JavaScript o\'zgartirish',
      actions: [],
      codeBlocks: []
    };
  }
}

// ==================== INITIAL FILES ====================
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

// ==================== MAIN APP COMPONENT ====================
const App: React.FC = () => {
  // State
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [tabs, setTabs] = useState<Tab[]>([{ fileId: 'app-tsx', isActive: true }]);
  const [activeSidebarIcon, setActiveSidebarIcon] = useState<'explorer' | 'search' | 'git' | 'debug' | 'extensions'>('explorer');
  const [bottomPanelTab, setBottomPanelTab] = useState<'terminal' | 'problems' | 'ports' | 'output'>('terminal');
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: '1', type: 'output', content: 'INNOHUB Terminal v3.0.0 - Super AI', timestamp: Date.now() },
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ file: FileItem; line: number; content: string }[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizingRight, setIsResizingRight] = useState(false);
  
  // GitHub State
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [_githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  
  // AI
  const aiEngine = useMemo(() => new SuperAI(), []);

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
