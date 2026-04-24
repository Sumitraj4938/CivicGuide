import { CheckCircle2, Circle, AlertCircle, FileText, Search, Vote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CHECKPOINTS = [
  {
    id: 1,
    title: "Registration",
    date: "Deadline: ~Oct 5, 2026",
    icon: FileText,
    description: "Eligibility & state-specific requirements. Before you can cast a ballot, you must ensure you are registered to vote at your current address.",
    details: [
      "Check your status on **Vote.org**.",
      "Update your address if you've recently moved.",
      "Check your state's specific ID requirements."
    ],
  },
  {
    id: 2,
    title: "The Primaries",
    date: "Mar 3 - Sep 15, 2026",
    icon: AlertCircle,
    description: "The primary is the semi-final. It determines which candidates will represent their parties in the general election.",
    details: [
      "Find out if your state has an Open or Closed primary.",
      "Research primary candidates for the House & Senate.",
      "Many local offices are decided during the Primary!"
    ],
  },
  {
    id: 3,
    title: "Research",
    date: "September & October 2026",
    icon: Search,
    description: "An informed vote is a powerful vote. Take time to research the candidates and propositions that will appear on your ballot.",
    details: [
      "Use **Ballotpedia** to look up your sample ballot.",
      "Read non-partisan summaries of ballot measures.",
      "Identify your core issues and see how candidates align."
    ],
  },
  {
    id: 4,
    title: "Casting the Vote",
    date: "Before & On Nov 3, 2026",
    icon: Vote,
    description: "Make a concrete plan to vote. Will you vote early, by mail, or on Election Day?",
    details: [
      "**Early Voting:** Avoid the lines and vote on your schedule.",
      "**Mail-in Voting:** Request your absentee ballot early.",
      "**Election Day (Nov 3):** Find your polling location and know the hours. [Find on Google Maps](https://www.google.com/maps/search/polling+places+near+me)"
    ],
  }
];

interface VotingJourneyProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

export default function VotingJourney({ activeStep, setActiveStep }: VotingJourneyProps) {
  return (
    <div className="flex flex-col justify-between h-full space-y-8 pr-2">
      <div className="space-y-6">
        {CHECKPOINTS.map((checkpoint) => {
          const isActive = activeStep === checkpoint.id;
          const isPast = activeStep > checkpoint.id;

          return (
            <motion.div 
              layout
              key={checkpoint.id} 
              className={`group cursor-pointer transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
              onClick={() => setActiveStep(checkpoint.id)}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className={`block text-[10px] font-bold tracking-[0.2em] uppercase ${isActive ? 'text-orange-600' : ''}`}>
                  0{checkpoint.id}
                </span>
                {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                <div className={`flex-1 h-[1px] bg-border transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-20'}`}></div>
              </div>
              <h3 className={`text-2xl sm:text-3xl font-serif italic pb-1 transition-all duration-300 ${isActive ? 'text-text scale-[1.02] origin-left' : 'text-text/70'}`}>
                {checkpoint.title}
              </h3>
              
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 text-sm leading-relaxed border-l-2 border-orange-600 pl-6 py-2">
                      <p className="text-text/70 mb-5 font-sans italic">{checkpoint.description}</p>
                      
                      <div className="bg-border/5 border border-border p-5 shadow-[4px_4px_0px_0px_var(--color-border)]">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-2">Key Timeline</h4>
                        <span className="font-serif text-2xl italic text-text">{checkpoint.date}</span>
                        <ul className="space-y-4 mt-6">
                          {checkpoint.details.map((detail, i) => {
                            const parts = detail.split(/\*\*(.*?)\*\*/g);
                            return (
                              <li key={i} className="flex items-start gap-3 text-text transition-colors duration-200">
                                <span className="text-orange-600 mt-1 shrink-0 opacity-80 text-lg">›</span>
                                <span className="leading-relaxed text-xs opacity-90">
                                  {parts.map((part, index) => index % 2 === 1 ? <strong key={index} className="font-bold underline decoration-orange-600/30">{part}</strong> : part)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-border p-5 text-bg mt-8 shrink-0 transition-colors duration-200">
        <p className="text-[10px] uppercase tracking-widest font-bold mb-2 text-orange-600 dark:text-orange-400">Jargon Buster</p>
        <p className="text-sm font-serif italic leading-relaxed opacity-90">"The Primary is like a semi-final match to see who makes the championship in November."</p>
      </div>
    </div>
  );
}
