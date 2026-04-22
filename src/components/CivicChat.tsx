import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Image as ImageIcon, X } from 'lucide-react';
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

export default function CivicChat({ onCheckpointSelect }: { onCheckpointSelect?: (checkpoint: number) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'model',
      content: "Hello! I'm **CivicGuide**, your non-partisan digital assistant. \n\nI can help you navigate the entire voting journey in any Indian language. I can also analyze photos of election-related documents.\n\nWhich phase of the process would you like to explore first?"
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // We use a ref to hold the actual genai chat object to persist history
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChat = () => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3.1-pro-preview', // Use pro model for complex instructions and multilingual support
        config: {
          systemInstruction: SYSTEM_PROMPT,
        }
      });
    }
    return chatSessionRef.current;
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
    if ((!input.trim() && !selectedImage) || isLoading) return;

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
      const chat = initChat();
      
      let contents: any = userMessage.content;
      
      if (userMessage.image) {
        // Extract base64 data correctly for the API
        const base64Data = userMessage.image.split(',')[1];
        const mimeType = userMessage.image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
        
        contents = [
           { inlineData: { data: base64Data, mimeType } },
           userMessage.content
        ];
      }

      const response = await chat.sendMessage({ message: contents });

      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "I'm having trouble retrieving that information right now. Please check vote.org in the meantime!"
      };
      setMessages((prev) => [...prev, modelMessage]);
      
      // Attempt to intelligently trigger the stepper if we see certain keywords
      if (onCheckpointSelect) {
        const textLower = userMessage.content.toLowerCase();
        if (textLower.includes('register') || textLower.includes('eligibility')) onCheckpointSelect(1);
        else if (textLower.includes('primary') || textLower.includes('caucus')) onCheckpointSelect(2);
        else if (textLower.includes('research') || textLower.includes('ballot') || textLower.includes('candidate')) onCheckpointSelect(3);
        else if (textLower.includes('vote') || textLower.includes('early') || textLower.includes('polling')) onCheckpointSelect(4);
      }
    } catch (error) {
      console.error("Generative AI Error:", error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Oops, it seems I encountered an error connecting to the civic database. Please try asking again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F7F3] border border-black overflow-hidden relative">
      <div className="border-b border-black p-4 shrink-0 flex items-center justify-between bg-[#F9F7F3]">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 shrink-0">
            <Bot className="w-5 h-5 flex-shrink-0" />
          </div>
          <div className="min-w-0">
            <h2 className="text-black font-serif italic text-lg truncate flex items-center gap-2">
              CivicGuide Assistant
            </h2>
            <p className="text-black/60 text-[10px] uppercase font-bold tracking-widest truncate">AI-powered non-partisan guidance</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50 relative">
        <div className="absolute top-0 bottom-0 left-8 border-l border-black/10 z-0 hidden sm:block"></div>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 relative z-10 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-8 h-8 flex items-center justify-center border border-black ${msg.role === 'user' ? 'bg-orange-600 text-white border-orange-600' : 'bg-black text-white'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 flex-shrink-0" /> : <Bot className="w-4 h-4 flex-shrink-0" />}
            </div>
            <div className={`max-w-[85%] sm:max-w-[75%] p-5 border border-black flex flex-col gap-3 ${
              msg.role === 'user' 
                ? 'bg-orange-50/50' 
                : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}>
              {msg.image && (
                <div className="relative w-full max-w-[240px] aspect-auto border border-black/20">
                  <img src={msg.image} alt="Uploaded document" className="w-full h-auto" />
                </div>
              )}
              {msg.content && (
                <div className="prose prose-sm prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-normal max-w-none text-black">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 relative z-10">
            <div className="shrink-0 w-8 h-8 bg-black border border-black flex items-center justify-center">
              <Bot className="w-4 h-4 text-white flex-shrink-0" />
            </div>
            <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-orange-600 animate-spin flex-shrink-0" />
              <span className="text-xs uppercase tracking-widest font-bold text-black/60">Retrieving data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#F9F7F3] border-t border-black shrink-0 relative z-20 flex flex-col">
        {selectedImage && (
          <div className="mb-3 relative w-16 h-16 border border-black group">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-black text-white p-0.5 rounded-full hover:bg-orange-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-black hover:bg-orange-50 text-black px-4 py-3 transition-colors flex items-center justify-center shrink-0"
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
            placeholder="Ask a question or upload a document..."
            className="flex-1 bg-white border border-black px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-black/30 font-serif italic"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="bg-black hover:bg-orange-600 disabled:bg-black/20 disabled:cursor-not-allowed disabled:text-black/40 text-white px-6 py-3 transition-colors flex items-center justify-center shrink-0 uppercase tracking-widest text-xs font-bold"
          >
            <Send className="w-4 h-4 mr-2 flex-shrink-0 hidden sm:inline" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
