
import React, { useState, useRef, useEffect } from 'react';
import { getTravelAdvice } from '../services/geminiService';
import { ChatMessage, User } from '../types';

interface AITravelAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const AITravelAssistant: React.FC<AITravelAssistantProps> = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hello ${user.name.split(' ')[0]}! I'm your SkyLink personal travel assistant. Ready to plan your next escape?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const advice = await getTravelAdvice(userText, `User: ${user.name}, Points: ${user.loyaltyPoints}`);
      setMessages(prev => [...prev, { role: 'model', text: advice }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I'm having trouble connecting to the travel grid. Try again in a second!" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-8 w-full sm:w-[450px] h-full sm:h-[600px] bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col z-50 border border-slate-100 animate-in slide-in-from-bottom-8 duration-300">
      <div className="p-6 bg-[#0064E0] text-white flex justify-between items-center sm:rounded-t-[2.5rem]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">SkyConcierge AI</h3>
            <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Professional Assistant</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-3xl text-[13px] leading-relaxed shadow-sm ${
              m.role === 'user' ? 'bg-[#0064E0] text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 rounded-tl-none flex space-x-1.5">
              <div className="w-1.5 h-1.5 bg-[#0064E0]/40 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#0064E0]/40 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-[#0064E0]/40 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="relative flex items-center bg-slate-100 rounded-[1.5rem] overflow-hidden px-1">
          <input 
            type="text" 
            placeholder="Ask about destinations, flights..."
            className="w-full pl-4 pr-12 py-4 bg-transparent border-none text-sm font-medium focus:ring-0 outline-none placeholder-slate-400"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 text-[#0064E0] disabled:text-slate-300 transition-all hover:scale-110"
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

export default AITravelAssistant;
