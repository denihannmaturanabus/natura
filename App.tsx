
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Home from './views/Home';
import PlanillaDetail from './views/PlanillaDetail';
import Stats from './views/Stats';

type View = 'login' | 'home' | 'detail' | 'stats';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlanillaId, setSelectedPlanillaId] = useState<string | null>(null);

  // Auto-login if previously authenticated (stored in session for demo)
  useEffect(() => {
    const auth = sessionStorage.getItem('gm_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setView('home');
    }
  }, []);

  const handleLogin = (pass: string) => {
    setIsAuthenticated(true);
    setView('home');
    sessionStorage.setItem('gm_auth', 'true');
  };

  const navigateToPlanilla = (id: string) => {
    setSelectedPlanillaId(id);
    setView('detail');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="max-w-[428px] mx-auto bg-[#FFF5F7] min-h-screen relative shadow-2xl overflow-hidden">
      {view === 'home' && (
        <Home 
          onSelectPlanilla={navigateToPlanilla} 
          onGoStats={() => setView('stats')} 
        />
      )}
      
      {view === 'detail' && selectedPlanillaId && (
        <PlanillaDetail 
          planillaId={selectedPlanillaId} 
          onBack={() => setView('home')} 
        />
      )}

      {view === 'stats' && (
        <Stats onBack={() => setView('home')} />
      )}
    </div>
  );
};

export default App;
