import React, { useEffect, useState } from 'react';
import { seedInitialData } from './db';
import { Dashboard } from './components/dashboard/Dashboard';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        await seedInitialData();
      } catch (err) {
        console.warn('Seed data initialization error:', err);
      } finally {
        setIsInitialized(true);
      }
    })();
  }, []);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="font-bold text-sm tracking-wide text-slate-300">
          Loading My Learning Studio...
        </p>
      </div>
    );
  }

  return <Dashboard />;
};

export default App;
