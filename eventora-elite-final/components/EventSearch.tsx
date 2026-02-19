
import React from 'react';
import { EventCategory } from '../types';

interface EventSearchProps {
  query: string;
  setQuery: (q: string) => void;
  category: EventCategory | 'All';
  setCategory: (c: EventCategory | 'All') => void;
}

const EventSearch: React.FC<EventSearchProps> = ({ query, setQuery, category, setCategory }) => {
  return (
    <div className="max-w-3xl mx-auto glass p-2 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-2">
      <div className="flex-1 flex items-center px-4 py-3 bg-white/5 rounded-xl">
        <span className="text-xl mr-3">🔍</span>
        <input 
          type="text" 
          placeholder="Search artists, venues, or cities..." 
          className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-500 font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="md:w-48 px-4 py-3 bg-white/5 rounded-xl flex items-center">
        <select 
          className="bg-transparent border-none outline-none w-full text-slate-400 text-sm font-bold cursor-pointer"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          <option value="All">All Categories</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Tech">Tech</option>
          <option value="Theatre">Theatre</option>
        </select>
      </div>
      <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
        Search
      </button>
    </div>
  );
};

export default EventSearch;
