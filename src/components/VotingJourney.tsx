import { CheckCircle2, Circle, AlertCircle, FileText, Search, Vote } from 'lucide-react';

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
      "**Election Day (Nov 3):** Find your polling location and know the hours."
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
      <div className="space-y-8">
        {CHECKPOINTS.map((checkpoint) => {
          const isActive = activeStep === checkpoint.id;
          const isPast = activeStep > checkpoint.id;

          return (
            <div 
              key={checkpoint.id} 
              className={`group cursor-pointer transition-opacity ${isActive ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
              onClick={() => setActiveStep(checkpoint.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`block text-[10px] font-bold tracking-widest uppercase ${isActive ? 'text-orange-600' : ''}`}>
                  Checkpoint {String(checkpoint.id).padStart(2, '0')}
                </span>
                {isPast && <CheckCircle2 className="w-3 h-3 text-border opacity-50" />}
              </div>
              <h3 className={`text-2xl font-serif italic pb-1 ${isActive ? 'border-b-2 border-orange-600' : ''}`}>
                {checkpoint.title}
              </h3>
              
              {isActive && (
                <div className="mt-3 text-sm leading-snug">
                  <p className="opacity-80 mb-4 font-sans">{checkpoint.description}</p>
                  
                  <div className="bg-orange-50/50 border border-orange-200 p-5 mt-4 transition-colors duration-200">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-800 mb-2">Key Timeline</h4>
                    <span className="font-serif text-xl font-bold text-orange-900">{checkpoint.date}</span>
                    <ul className="space-y-3 mt-4">
                      {checkpoint.details.map((detail, i) => {
                        const parts = detail.split(/\*\*(.*?)\*\*/g);
                        return (
                          <li key={i} className="flex items-start gap-2 text-orange-950 font-sans transition-colors duration-200">
                            <span className="text-orange-600 mt-0.5 shrink-0 opacity-70">→</span>
                            <span className="leading-relaxed text-xs">
                              {parts.map((part, index) => index % 2 === 1 ? <strong key={index} className="font-bold">{part}</strong> : part)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
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
