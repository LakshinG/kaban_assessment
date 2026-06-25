import React from 'react';
import { Search, Filter } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: string;
  setPriorityFilter: (filter: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter
}) => {
  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-zinc-900 rounded-sm" />
        </div>
        <span className="font-semibold text-lg tracking-tight">Next Play</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-surfaceHover border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-500 w-64 transition-all placeholder:text-textSecondary"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="pl-9 pr-8 py-2 bg-surfaceHover border border-border rounded-md text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-500 hover:bg-zinc-800/80 transition-colors cursor-pointer text-textPrimary"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
