
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
    <div className="max-w-[428px] lg:max-w-full mx-auto bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen relative shadow-2xl lg:shadow-none overflow-hidden">
      <div className="lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
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
    </div>
  );
};

export default App;
