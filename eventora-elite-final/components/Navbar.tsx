
import React from 'react';
import { isHumanName } from '../services/humanService';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onNavigate: (v: 'home' | 'dashboard' | 'admin') => void;
  activeView: string;
  onLogout: () => void;
  notificationsCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, activeView, onLogout, notificationsCount = 0 }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 glass flex items-center no-print">
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg">E</div>
            <span className="text-xl font-black tracking-tighter text-white">Eventora<span className="text-blue-500">Elite</span></span>
          </div>
          <div className="hidden md:flex space-x-8">
            <button onClick={() => onNavigate('home')} className={`text-[11px] font-black uppercase tracking-widest ${activeView === 'home' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>Global Hub</button>
            <button onClick={() => onNavigate('dashboard')} className={`text-[11px] font-black uppercase tracking-widest ${activeView === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>Itineraries</button>
            {user.role === 'ADMIN' && (
              <button onClick={() => onNavigate('admin')} className={`text-[11px] font-black uppercase tracking-widest ${activeView === 'admin' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>Admin</button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden sm:flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase ${isHumanName(user.name) ? 'text-green-400' : 'text-yellow-400'}`}>{isHumanName(user.name) ? 'Human' : 'AI'}</span>
            <div className={`w-2 h-2 rounded-full ${isHumanName(user.name) ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          </div>
          <div className="relative">
            <button className="p-3 bg-white/5 rounded-full border border-white/5">
              <span className="text-lg">🔔</span>
            </button>
            {notificationsCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{notificationsCount}</div>
            )}
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Elite Credits</span>
            <span className="text-xs font-bold text-green-400">${user.walletBalance.toLocaleString()}</span>
          </div>
          <button onClick={onLogout} className="group flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 hover:bg-red-500/10 transition-all">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-500/30">
              <img src={user.avatar} className="w-full h-full" alt="" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-400">Exit Terminal</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
