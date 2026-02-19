
import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  userRole: UserRole;
  onLogout: () => void;
  notifCount: number;
  onOpenChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, onLogout, notifCount, onOpenChat }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-[#0a66c2] text-white font-bold px-1.5 py-0.5 rounded text-xl">f</div>
          <span className="font-bold text-xl text-gray-800 hidden sm:inline">FreeHire AI</span>
        </div>

        <div className="flex items-center space-x-6">
          <button className="flex flex-col items-center text-gray-500 hover:text-black transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] group-hover:underline">Home</span>
          </button>
          
          <button 
            onClick={onOpenChat}
            className="flex flex-col items-center text-gray-500 hover:text-black transition-colors group relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[10px] group-hover:underline">AI Help</span>
          </button>

          <button className="flex flex-col items-center text-gray-500 hover:text-black transition-colors group relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-[10px] group-hover:underline">Notifications</span>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                {notifCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-gray-200"></div>

          <button 
            onClick={onLogout}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
