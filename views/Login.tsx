
import React, { useState } from 'react';
import { Lock, Eye } from 'lucide-react';

interface LoginProps {
  onLogin: (pass: string, readOnly?: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showMamiInput, setShowMamiInput] = useState(false);
  const [mamiPassword, setMamiPassword] = useState('');
  const [mamiError, setMamiError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appPassword = import.meta.env.VITE_APP_PASSWORD || '1234';
    if (password === appPassword) {
      onLogin(password, false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleMamiClick = () => {
    setShowMamiInput(true);
    setMamiPassword('');
    setMamiError(false);
  };

  const handleMamiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const readOnlyPassword = import.meta.env.VITE_READONLY_PASSWORD || '240103';
    if (mamiPassword === readOnlyPassword) {
      onLogin('readonly', true);
    } else {
      setMamiError(true);
      setTimeout(() => setMamiError(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-pink-100">
      <div className="w-full max-w-sm lg:max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-64 h-64 lg:w-80 lg:h-80 rounded-3xl mb-4">
            <img src="/img/rene.png" alt="Rene" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight">Hola Maria!</h1>
          <p className="text-gray-500 font-medium lg:text-lg">Estoy aqui para ayudarte con tus cuentas </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`relative transition-transform ${error ? 'animate-bounce' : ''}`}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full h-16 lg:h-20 px-6 pt-2 bg-white/80 border border-pink-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-pink-200/50 focus:border-pink-300 outline-none text-center text-lg lg:text-xl tracking-[1em] transition-all"
              autoFocus
            />
            {error && <p className="text-center text-red-500 mt-2 font-medium">Intenta de nuevo</p>}
          </div>

          <button
            type="submit"
            className="w-full h-16 lg:h-20 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white rounded-2xl font-bold text-lg lg:text-xl shadow-lg shadow-pink-200 transition-all"
          >
            Entrar
          </button>
        </form>

        <div className="pt-4 border-t border-gray-200">
          {!showMamiInput ? (
            <button
              onClick={handleMamiClick}
              className="w-full h-16 lg:h-20 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] text-white rounded-2xl font-bold text-lg lg:text-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
            >
              <Eye size={24} />
              Entrar modo Mami 👵
            </button>
          ) : (
            <form onSubmit={handleMamiSubmit} className="space-y-4">
              <div className={`relative transition-transform ${mamiError ? 'animate-bounce' : ''}`}>
                <input
                  type="password"
                  value={mamiPassword}
                  onChange={(e) => setMamiPassword(e.target.value)}
                  placeholder="Contraseña Mami"
                  className="w-full h-16 lg:h-20 px-6 pt-2 bg-white/80 border border-purple-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-200/50 focus:border-purple-300 outline-none text-center text-lg lg:text-xl tracking-[1em] transition-all"
                  autoFocus
                />
                {mamiError && <p className="text-center text-red-500 mt-2 font-medium">Contraseña incorrecta</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMamiInput(false)}
                  className="flex-1 h-14 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold text-base transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-14 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-purple-200 transition-all"
                >
                  Entrar 👵
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm lg:text-base">
          Creado con ❤️ por tu hijo
        </p>
      </div>
    </div>
  );
};

export default Login;
