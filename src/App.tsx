import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Board from './components/Board';
import { Loader2 } from 'lucide-react';

function App() {
  const { loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-textSecondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-textPrimary">
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />
      <main className="flex-1 overflow-hidden flex flex-col p-6">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Kanban Board</h1>
            <p className="text-sm text-textSecondary mt-1">Manage your tasks by dragging them across statuses.</p>
          </div>
          <Board searchQuery={searchQuery} priorityFilter={priorityFilter} />
        </div>
      </main>
    </div>
  );
}

export default App;
