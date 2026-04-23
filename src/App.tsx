import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CivicChat from './components/CivicChat';
import VotingJourney from './components/VotingJourney';
import { Sun, Moon } from 'lucide-react';

export default function App() {
  const [activeStep, setActiveStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('civic-active-step');
      if (saved) return parseInt(saved, 10);
    }
    return 1;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('civic-theme');
      if (saved) return saved as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('civic-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('civic-active-step', activeStep.toString());
  }, [activeStep]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="min-h-screen bg-bg text-text font-sans p-4 md:p-8 flex flex-col relative border-[12px] border-border transition-colors duration-300">
      {/* Theme Toggle */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-50 p-3 bg-text text-bg border border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-none cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.button>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border pb-4 mb-8 transition-colors duration-200 w-full max-w-7xl mx-auto">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60 mb-1">Civic Intelligence Unit</span>
          <h1 className="text-4xl sm:text-6xl font-serif italic font-light tracking-tighter leading-none mt-1">
            CivicGuide <span className="text-xl sm:text-2xl not-italic tracking-normal ml-1 sm:ml-2 font-sans font-bold">2026</span>
          </h1>
          <span className="text-xs sm:text-sm font-bold tracking-widest mt-2 uppercase text-orange-600 whitespace-nowrap">Developed by Sumit Raj</span>
        </div>
        
        <div className="mt-6 sm:mt-0 text-left sm:text-right">
          <p className="text-[10px] sm:text-xs uppercase font-bold tracking-widest opacity-80">Midterm Cycle</p>
          <p className="text-xl sm:text-3xl font-serif italic mt-0.5">November 3, 2026</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col pt-2 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1 h-full min-h-0">
          
          {/* Left Column: Interactive Voting Journey */}
          <div className="lg:col-span-4 h-full overflow-y-auto lg:border-r border-border transition-colors duration-200 pb-8 lg:pb-0 scrollbar-hide">
            <VotingJourney activeStep={activeStep} setActiveStep={setActiveStep} />
          </div>

          {/* Right Column: AI Assistant Chat */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px] h-full lg:h-[calc(100vh-280px)]">
            <CivicChat onCheckpointSelect={setActiveStep} />
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-8 bg-border text-bg p-6 flex flex-col sm:flex-row justify-between items-center gap-6 transition-colors duration-200 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-orange-600 rounded-full shrink-0"></div>
          <p className="text-sm md:text-lg font-serif italic max-w-2xl leading-snug">
            CivicGuide is a non-partisan educational tool. Always consult your state's Secretary of State for official election information.
          </p>
        </div>
      </footer>
    </div>
  );
}

