
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/geminiService';
import { ChatMessage, FreelancerProfile } from '../types';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FreelancerProfile | null;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: `Hello ${profile?.name || 'there'}! I am your FreeHire Career Advisor. I'm here to solve any doubts you have about your profile, qualifications, or how to get selected by recruiters. How can I help you today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const systemContext = profile ? `Freelancer Context: ${profile.name}, Headline: ${profile.headline}, Education: ${JSON.stringify(profile.education)}.` : "";
      const aiResponse = await chatWithAI(`${systemContext} User doubt: ${userMsg}`, []); 
      setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a slight connection issue. Please try again so I can help you with your doubt!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 w-full sm:w-[420px] h-full sm:h-[550px] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-in slide-in-from-bottom-8 duration-300">
      {/* Header */}
      <div className="p-4 bg-[#0a66c2] text-white flex justify-between items-center sm:rounded-t-2xl shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Career Doubt Resolver</h3>
            <div className="flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
              <span className="text-[10px] text-blue-100 font-medium uppercase tracking-widest">Active Assistant</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#f8f9fb]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-[#0a66c2] text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 rounded-tl-none flex space-x-1.5">
              <div className="w-1.5 h-1.5 bg-[#0a66c2]/40 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#0a66c2]/40 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-[#0a66c2]/40 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center bg-gray-100 rounded-xl overflow-hidden px-1">
          <input 
            type="text" 
            placeholder="Type your career doubt here..."
            className="w-full pl-4 pr-12 py-3 bg-transparent border-none text-sm focus:ring-0 outline-none placeholder-gray-400"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 text-[#0a66c2] disabled:text-gray-300 hover:scale-110 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
