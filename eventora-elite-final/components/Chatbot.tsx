
import React, { useState, useRef, useEffect } from 'react';
import { getTravelHelp } from '../services/geminiService';
import { ChatMessage, User } from '../types';

interface ChatbotProps {
  user: User;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Greetings, ${user.name.split(' ')[0]}. I'm your SkyConcierge. Ready to check flight status or find a new destination?` }
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
      const result = await getTravelHelp(userText, `User: ${user.name}, Wallet: ${user.walletBalance}, Points: ${user.loyaltyPoints}`);
      setMessages(prev => [...prev, { role: 'model', text: result.text, groundingLinks: result.links }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Apologies, my satellite link is weak. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-all border border-blue-400">
        <span className="text-2xl">✈️</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-8 w-full sm:w-[420px] h-full sm:h-[600px] bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col z-[100] border border-slate-100 animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
          <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="font-black text-sm tracking-tight">SkyConcierge AI</h3>
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Global Travel Expert</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">✕</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl text-[13px] leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  <p>{m.text}</p>
                  {m.groundingLinks && m.groundingLinks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Information Sources:</p>
                      {m.groundingLinks.map((link, idx) => (
                        <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:underline text-[11px] truncate">🔗 {link.title}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="text-slate-400 text-[10px] font-bold animate-pulse">Consulting global travel logs...</div>}
          </div>
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex items-center bg-slate-100 rounded-[1.5rem] px-4 py-1">
              <input type="text" placeholder="Baggage policy for Global Air?" className="w-full py-4 bg-transparent border-none text-slate-900 text-sm outline-none placeholder:text-slate-400 font-medium" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
              <button onClick={handleSend} disabled={!input.trim()} className="text-blue-600 p-2 disabled:text-slate-300">➔</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
