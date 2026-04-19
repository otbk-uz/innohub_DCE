import React from 'react';
import { useAppStore } from '../store';
import { 
  Code2, 
  Terminal, 
  Zap, 
  Globe, 
  Play,
  Github,
  Star,
  Users,
  ArrowRight,
  CheckCircle2,
  Bot,
  GitBranch,
  Layout
} from 'lucide-react';

export const Welcome: React.FC = () => {
  const { login } = useAppStore();

  const handleStart = () => {
    console.log('[Welcome] Boshlash tugmasi bosildi');
    try {
      // Guest login - no authentication required
      const guestUser = {
        email: 'guest@innohub.uz',
        name: 'Mehmon Foydalanuvchi',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
      };
      login(guestUser);
      console.log('[Welcome] Login muvaffaqiyatli bajarildi', guestUser);
    } catch (error) {
      console.error('[Welcome] Login xatoligi:', error);
      alert('Tizimga kirishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  const features = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: 'Zamonaviy Kod Muharriri',
      description: 'Monaco Editor asosida qurilgan, VS Code kabi qulay interfeys'
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: 'Real Terminal',
      description: 'Haqiqiy terminal bilan ishlash imkoniyati, WebSocket orqali ulanish'
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'AI Yordamchi',
      description: 'Sun\'iy intellekt yordamida kod yozish va tushuntirishlar'
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: 'GitHub Integratsiya',
      description: 'GitHub bilan to\'liq integratsiya, repository boshqaruvi'
    },
    {
      icon: <Layout className="w-6 h-6" />,
      title: 'Split View',
      description: 'Bir nechta fayllar bilan bir vaqtda ishlash imkoniyati'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Tezkor Ishlash',
      description: 'Vite asosida qurilgan, tezkor hot reload qo\'llab-quvvatlash'
    }
  ];

  const stats = [
    { value: '50+', label: 'Dasturlash tillari', icon: <Code2 className="w-4 h-4" /> },
    { value: '100%', label: 'Tekin', icon: <Star className="w-4 h-4" /> },
    { value: '24/7', label: 'Ishlash', icon: <Globe className="w-4 h-4" /> },
    { value: '∞', label: 'Loyihalar', icon: <Users className="w-4 h-4" /> }
  ];

  const highlights = [
    'Cloud-bazali ish rejimi',
    'Avtomatik saqlash',
    'Syntax highlighting',
    'IntelliSense qo\'llab-quvvatlash',
    'Debugging vositalari',
    'VCS integratsiyasi'
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            INNOHUB IDE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/otabekxoff-creator/innohub_DCE" target="_blank" rel="noopener noreferrer" 
             className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10">
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Kelajakning
            </span>
            <br />
            <span className="text-white">Dasturlash Muhiti</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            INNOHUB IDE - bu brauzerda ishlaydigan professional dasturlash muhiti. 
            Kod yozing, terminaldan foydalaning, AI yordamchi bilan ishlang.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              type="button"
              onClick={handleStart}
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <Play className="w-5 h-5" />
              Boshlash
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a href="#features" 
               className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-medium transition-all">
              <span>Batafsil</span>
            </a>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-12 border-y border-white/10 bg-black/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="flex items-center justify-center gap-2 mb-2 text-blue-400">
                {stat.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Imkoniyatlar
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              INNOHUB IDE sizga professional dasturlash muhiti bilan taqdim etadi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <div className="text-blue-400">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 px-6 py-16 border-y border-white/10 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-8 text-gray-300">Zamonaviy Texnologiyalar</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['React', 'TypeScript', 'Vite', 'Monaco Editor', 'WebSocket', 'Tailwind CSS', 'Zustand'].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:border-blue-500/30 transition-all">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Hozir boshlang
          </h2>
          <p className="text-gray-400 mb-8">
            Ro'yxatdan o'tish shart emas! Boshlash tugmasini bosib, darhol kod yozishni boshlang.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 mx-auto cursor-pointer"
          >
            <Play className="w-5 h-5" />
            Boshlash
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          © 2024 INNOHUB IDE. Created by Otabekxoff Creator.
        </p>
      </footer>
    </div>
  );
};
