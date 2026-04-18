import { FileItem, AIAction } from '../types';
import { GoogleGenAI } from '@google/genai';

// ==================== SUPER AI ENGINE (Powered By Gemini) ====================
export class SuperAI {
  private currentFile?: FileItem;

  private get apiKey() {
    return localStorage.getItem('gemini_api_key') || '';
  }

  setContext(_files: FileItem[], currentFile?: FileItem) {
    this.currentFile = currentFile;
  }

  async process(message: string): Promise<{
    response: string;
    actions: AIAction[];
    codeBlocks: { language: string; code: string; filename?: string }[];
  }> {
    
    // Agar API kalit saqlanmagan bo'lsa
    if (!this.apiKey) {
      return {
        response: `⚠️ **API Kalit topilmadi!**\n\nIltimos, haqiqiy SuperAI imkoniyatlaridan foydalanish uchun Sozlamalar (⚙️ Settings) bo'limidan yoxud shunchaki 'gemini_api_key' nomli localStorage kaliti orqali Google Gemini API kalitini kiriting.\n\n[Google AI Studio](https://aistudio.google.com/) orqali kalit olishingiz mumkin.`,
        actions: [],
        codeBlocks: []
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });

      const systemInstruction = `Siz INNOHUB - ilg'or dasturlash muhiti (IDE) ning sun'iy intellekti - SuperAIsiz.
Dasturchiga kod yozishda, fayl yaratishda va muammolarni hal qilishda o'zbek tilida (yoki so'ralgan tilda) javob berasiz.
Siz faqatgina aniq JSON formatda javob qaytarishingiz shart. Boshqa hech qanday izoh qo'shmang. JSON strukturasi:
{
  "response": "Sizning yozma javobingiz, tavsiyalaringiz yoxud muammo tahlili. Markdown formatni to'liq qabul qiladi.",
  "actions": [ // agar fayl yaratish, tahrirlash yoki buyruq berish kerak bo'lsa
    { "type": "create_file", "filename": "src/components/MyComponent.tsx", "content": "...", "description": "MyComponent yaratish" },
    { "type": "edit_file", "filename": "app.js", "content": "yangi kod ustma-ust", "description": "Faylni tahrirlash" },
    { "type": "run_command", "command": "npm install axios", "description": "Paketni o'rnatish" }
  ],
  "codeBlocks": [ // ixtiyoriy, muhim kod bo'laklarini alohida ko'rsatish
    { "language": "typescript", "code": "...", "filename": "example.ts" }
  ]
}

Joriy ochiq fayl nomi: ${this.currentFile?.name || "Yo'q"}
Joriy fayl ichidagi kod: ${this.currentFile?.content || "Yo'q"}`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: `${systemInstruction}\n\nFoydalanuvchi so'rovi: ${message}` }] }
        ],
        config: {
            responseMimeType: "application/json",
            temperature: 0.7
        }
      });

      const text = res.text || "{}";
      const result = JSON.parse(text);

      return {
        response: result.response || "Javob hosil qilinmadi.",
        actions: result.actions || [],
        codeBlocks: result.codeBlocks || []
      };

    } catch (err: any) {
      return {
        response: `❌ **LLM integratsiyasida xatolik yuz berdi:**\n\n\`${err.message}\`\n\nAPI kalit to'g'riligini va internet aloqasini tekshiring.`,
        actions: [],
        codeBlocks: []
      };
    }
  }
}
