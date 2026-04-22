import { useState } from 'react';
import CivicChat from './components/CivicChat';
import VotingJourney from './components/VotingJourney';

export default function App() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="min-h-screen bg-bg text-text font-sans p-4 md:p-8 flex flex-col relative border-[12px] dark:border-black border-white transition-colors duration-200">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border pb-4 mb-8 transition-colors duration-200">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60 mb-1">Civic Intelligence Unit</span>
          <h1 className="text-4xl sm:text-6xl font-serif italic font-light tracking-tighter leading-none mt-1">
            CivicGuide <span className="text-xl sm:text-2xl not-italic tracking-normal ml-1 sm:ml-2 font-sans font-bold">2026</span>
          </h1>
        </div>
        
        <div className="mt-4 sm:mt-0 text-left sm:text-right">
          <p className="text-[10px] sm:text-xs uppercase font-bold tracking-widest opacity-80">Midterm Cycle</p>
          <p className="text-lg sm:text-2xl font-serif italic mt-0.5">November 3, 2026</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full flex flex-col pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 flex-1 min-h-[600px] h-full">
          
          {/* Left Column: Interactive Voting Journey */}
          <div className="h-full lg:col-span-4 border-r-0 lg:border-r border-border/20 pr-0 lg:pr-8 transition-colors duration-200">
            <VotingJourney activeStep={activeStep} setActiveStep={setActiveStep} />
          </div>

          {/* Right Column: AI Assistant Chat */}
          <div className="h-[600px] lg:h-auto lg:col-span-8 flex flex-col">
            <CivicChat onCheckpointSelect={setActiveStep} />
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-12 bg-border text-bg p-6 flex flex-col sm:flex-row justify-between items-center gap-6 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-orange-600 rounded-full shrink-0"></div>
          <p className="text-sm md:text-lg font-serif italic max-w-lg leading-snug">
            CivicGuide is a non-partisan educational tool. Always consult your state's Secretary of State for official election information.
          </p>
        </div>
      </footer>
    </div>
  );
}

