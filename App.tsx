
import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import EmpresaSelector from './views/EmpresaSelector';
import Home from './views/Home';
import PlanillaDetail from './views/PlanillaDetail';
import Stats from './views/Stats';

type View = 'login' | 'empresaSelector' | 'home' | 'detail' | 'stats';
type Empresa = 'natura' | 'esika';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [selectedPlanillaId, setSelectedPlanillaId] = useState<string | null>(null);

  // Auto-login if previously authenticated (stored in session for demo)
  useEffect(() => {
    const auth = sessionStorage.getItem('gm_auth');
    const empresa = sessionStorage.getItem('gm_empresa') as Empresa | null;
    if (auth === 'true') {
      setIsAuthenticated(true);
      if (empresa) {
        setSelectedEmpresa(empresa);
        setView('home');
      } else {
        setView('empresaSelector');
      }
    }
  }, []);

  const handleLogin = (pass: string) => {
    setIsAuthenticated(true);
    setView('empresaSelector');
    sessionStorage.setItem('gm_auth', 'true');
  };

  const handleSelectEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setView('home');
    sessionStorage.setItem('gm_empresa', empresa);
  };

  const navigateToPlanilla = (id: string) => {
    setSelectedPlanillaId(id);
    setView('detail');
  };

  const handleChangeEmpresa = () => {
    setSelectedEmpresa(null);
    sessionStorage.removeItem('gm_empresa');
    setView('empresaSelector');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedEmpresa(null);
    setView('login');
    sessionStorage.removeItem('gm_auth');
    sessionStorage.removeItem('gm_empresa');
  };

  if (!selectedEmpresa) {
    return <EmpresaSelector onSelectEmpresa={handleSelectEmpresa} onBack={handleLogout} />;
  }

  return (
    <div className="max-w-[428px] lg:max-w-full mx-auto bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen relative shadow-2xl lg:shadow-none overflow-hidden">
      <div className="lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
        {view === 'home' && (
          <Home 
            empresa={selectedEmpresa}
            onSelectPlanilla={navigateToPlanilla} 
            onGoStats={() => setView('stats')}
            onChangeEmpresa={handleChangeEmpresa}
          />
        )}
        
        {view === 'detail' && selectedPlanillaId && (
          <PlanillaDetail 
            empresa={selectedEmpresa}
            planillaId={selectedPlanillaId} 
            onBack={() => setView('home')} 
          />
        )}

        {view === 'stats' && (
          <Stats 
            empresa={selectedEmpresa}
            onBack={() => setView('home')} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
