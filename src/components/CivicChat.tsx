import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Loader2, Image as ImageIcon, X, Info, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SYSTEM_PROMPT = `
### ROLE
You are "CivicGuide," a helpful, non-partisan, and encouraging digital assistant designed to help voters navigate the election process, timelines, and steps in an interactive and easy-to-follow way.

### SCOPE STRICTNESS
IMPORTANT: You MUST ONLY answer questions related to the election process, timelines, voter registration, and general steps to vote. 
If a user asks about political opinions, candidates' views, specific politicians, or ANY OTHER TOPIC outside of the civic voting process, you MUST respectfully decline to answer and remind them of your purpose.

### INTERACTION PRINCIPLES
1. GUIDED STEPPER: Do not overwhelm the user. Use a "checkpoint" system:
   - Checkpoint 1: Registration & Eligibility
   - Checkpoint 2: The Primary Stage
   - Checkpoint 3: Researching the Ballot
   - Checkpoint 4: Casting the Vote
2. DATA INTEGRITY: Always remind users that rules vary by state. Direct them to "Vote.org" or their Secretary of State's website for official documents.
3. NON-PARTISANSHIP: Never endorse a candidate or party. Focus strictly on the *process*.
4. JARGON BUSTER: Use simple analogies.
5. LANGUAGE SUPPORT: You must perfectly support and respond in any language of India if the user asks in that language. 

### FORMATTING RULES
- Use **Bold** for dates and deadlines.
- Use \`### Headings\` to separate phases.
- Always end with a specific "Next Step" question to keep the user engaged.
- If the user sends an image, analyze it only in the context of voter registration forms, IDs, polling locations, or voting documentation.
`;

// Initialize the API outside component to avoid recreation
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// We manage the chat instance in a ref to keep history.

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string;
};

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 5 L10 25 L10 50 C10 70 30 90 50 95 C70 90 90 70 90 50 L90 25 L50 5 Z" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M50 25 L65 45 L50 65 L35 45 Z" fill="orange" />
    <circle cx="50" cy="45" r="5" fill="white" />
    <rect x="40" y="70" width="20" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M45 77 L48 80 L55 73" fill="none" stroke="orange" strokeWidth="3" />
  </svg>
);

export default function CivicChat({ onCheckpointSelect }: { onCheckpointSelect?: (checkpoint: number) => void }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('civic-chat-messages');
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: 'greeting',
        role: 'model',
        content: "Hello! I'm **CivicGuide**, a non-partisan digital assistant developed by **Sumit Raj**. \n\nI can help you navigate the entire voting journey in any Indian language. I can also analyze photos of election-related documents.\n\nWhich phase of the process would you like to explore first?"
      }
    ];
  });
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Save messages to local database (localStorage)
    localStorage.setItem('civic-chat-messages', JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your local chat history?")) {
      const greeting = [messages[0]];
      setMessages(greeting);
      localStorage.removeItem('civic-chat-messages');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    
    // Safety check: Input length validation
    if (trimmedInput.length > 2000) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "Your message is too long. Please keep it under 2000 characters."
      }]);
      return;
    }

    if ((!trimmedInput && !selectedImage) || isLoading) return;

    if (!process.env.GEMINI_API_KEY) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "Please provide a valid GEMINI_API_KEY in the environment secrets."
      }]);
      return;
    }

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input.trim() || 'Please analyze this image.',
      image: selectedImage || undefined
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      
      const parts: any[] = [];
      if (userMessage.image) {
        const base64Data = userMessage.image.split(',')[1];
        const mimeType = userMessage.image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType
          }
        });
      }
      parts.push({ text: userMessage.content });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }] // Enhanced with real-time election data
        }
      });

      const text = response.text;

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: text || "I'm having trouble retrieving that information right now. Please check vote.org in the meantime!"
      };
      setMessages((prev) => [...prev, modelMessage]);
      
      if (onCheckpointSelect) {
        const textLower = userMessage.content.toLowerCase();
        if (textLower.includes('register') || textLower.includes('eligibility')) onCheckpointSelect(1);
        else if (textLower.includes('primary') || textLower.includes('caucus')) onCheckpointSelect(2);
        else if (textLower.includes('research') || textLower.includes('ballot') || textLower.includes('candidate')) onCheckpointSelect(3);
        else if (textLower.includes('vote') || textLower.includes('early') || textLower.includes('polling')) onCheckpointSelect(4);
      }
    } catch (error: any) {
      console.error("Generative AI Error:", error);
      const errorMessage = error?.message || "Check your API key and connection";
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Oops, it seems I encountered an error: ${errorMessage}. Please ensure your GEMINI_API_KEY is correct.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg border border-border overflow-hidden relative transition-colors duration-200">
      <div className="border-b border-border p-4 shrink-0 flex items-center justify-between bg-bg transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="bg-text text-bg p-1 shrink-0 transition-colors duration-200 flex items-center justify-center">
            <Logo className="w-7 h-7 flex-shrink-0" />
          </div>
          <div className="min-w-0">
            <h2 className="text-text font-serif italic text-lg truncate flex items-center gap-2 transition-colors duration-200">
              CivicGuide Assistant
            </h2>
            <p className="text-text/60 text-[10px] uppercase font-bold tracking-widest truncate transition-colors duration-200">AI-powered non-partisan guidance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearHistory}
            className="p-2 text-text/40 hover:text-orange-600 transition-colors duration-200"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="p-2 text-text/40 hover:text-text transition-colors duration-200"
            title="About Privacy"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isAboutOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-bg/95 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm"
          >
            <div className="max-w-md space-y-6">
              <div className="bg-orange-600 text-bg p-4 w-fit mx-auto border border-border shadow-[4px_4px_0px_0px_var(--color-border)]">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif italic tracking-tight">Your Data is Secured</h3>
              <div className="space-y-4 text-sm leading-relaxed opacity-80 text-left bg-border/5 p-6 border border-border">
                <p>
                  <strong>100% Client-Side Persistence:</strong> Your entire chat history, uploaded images, and voting progress are stored locally in your browser's private database.
                </p>
                <p>
                  <strong>Zero Server Footprint:</strong> CivicGuide does not log or store your personal data on any server. Conversations are processed by the AI in real-time and saved only on your device.
                </p>
                <p>
                  <strong>Privacy at Your Fingertips:</strong> You can purge your entire session using the trash icon in the header at any time.
                </p>
              </div>
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setIsAboutOpen(false)}
                className="bg-text text-bg w-full py-4 uppercase tracking-widest text-xs font-bold hover:bg-orange-600 transition-colors duration-200 border border-border shadow-[4px_4px_0px_0px_var(--color-border)] cursor-pointer"
              >
                Close Security Panel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-border/5 relative transition-colors duration-200">
        <div className="absolute top-0 bottom-0 left-8 border-l border-border/10 z-0 hidden sm:block transition-colors duration-200"></div>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={msg.id} 
              className={`flex gap-4 relative z-10 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`shrink-0 w-9 h-9 flex items-center justify-center border border-border transition-colors duration-200 ${msg.role === 'user' ? 'bg-orange-600 text-white border-orange-600' : 'bg-text text-bg'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 flex-shrink-0" /> : <Logo className="w-7 h-7 flex-shrink-0" />}
              </div>
              <div className={`max-w-[85%] sm:max-w-[75%] p-5 border border-border flex flex-col gap-3 transition-colors duration-200 group ${
                msg.role === 'user' 
                  ? 'bg-orange-600/5' 
                  : 'bg-bg shadow-[6px_6px_0px_0px_var(--color-border)]'
              }`}>
                {msg.image && (
                  <div className="relative w-full max-w-[320px] aspect-auto border border-border/20 overflow-hidden">
                    <img src={msg.image} alt="Uploaded document" className="w-full h-auto grayscale-[0.5] hover:grayscale-0 transition-all duration-300" />
                  </div>
                )}
                {msg.content && (
                  <div className="prose prose-sm prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-normal max-w-none text-text">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-4 relative z-10">
            <div className="shrink-0 w-8 h-8 bg-text border border-border flex items-center justify-center transition-colors duration-200">
              <Logo className="w-6 h-6 flex-shrink-0" />
            </div>
            <div className="bg-bg border border-border shadow-[4px_4px_0px_0px_var(--color-border)] p-5 flex items-center gap-3 transition-colors duration-200">
              <Loader2 className="w-4 h-4 text-orange-600 animate-spin flex-shrink-0" />
              <span className="text-xs uppercase tracking-widest font-bold text-text/60">Retrieving data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-bg border-t border-border shrink-0 relative z-20 flex flex-col transition-colors duration-200">
        {selectedImage && (
          <div className="mb-3 relative w-20 h-20 border-2 border-orange-600 group transition-colors duration-200 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.2)]">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-text text-bg p-1 rounded-full hover:bg-orange-600 transition-colors duration-200 border border-border"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-stretch">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <div className="flex-1 flex gap-0 bg-bg/50 backdrop-blur-sm border border-border focus-within:ring-2 focus-within:ring-orange-600/50 transition-all duration-300">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="bg-transparent border-r border-border hover:bg-orange-600 hover:text-bg text-text/60 px-4 transition-all duration-300 flex items-center justify-center shrink-0"
              disabled={isLoading}
              aria-label="Upload document image"
              title="Upload document image for analysis"
            >
              <ImageIcon className="w-5 h-5 flex-shrink-0" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your civic question..."
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none transition-colors duration-200 placeholder:text-text/30 text-text font-serif italic min-w-0"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="bg-text hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-bg px-8 transition-all duration-300 flex items-center justify-center shrink-0 uppercase tracking-widest text-xs font-black border border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-none"
          >
            <Send className="w-4 h-4 mr-2 flex-shrink-0 hidden md:inline" />
            <span>Post</span>
          </button>
        </form>
        <p className="text-[9px] uppercase tracking-tighter opacity-40 mt-2 text-center">
          Powered by Gemini 3 Flash • Verified by Google Search Grounding
        </p>
      </div>
    </div>
  );
}
