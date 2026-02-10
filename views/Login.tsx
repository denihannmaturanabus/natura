
import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (pass: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appPassword = import.meta.env.VITE_APP_PASSWORD || '1234';
    if (password === appPassword) {
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-pink-100">
      <div className="w-full max-w-sm lg:max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-3xl shadow-xl shadow-pink-200/50 mb-4 ring-1 ring-pink-100">
            <span className="text-4xl lg:text-5xl">✨</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight">GlowManager</h1>
          <p className="text-gray-500 font-medium lg:text-lg">Gestión de Ventas Elegante</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`relative transition-transform ${error ? 'animate-bounce' : ''}`}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full h-16 lg:h-20 px-6 pt-2 bg-white/80 border border-pink-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-pink-200/50 focus:border-pink-300 outline-none text-center text-2xl lg:text-3xl tracking-[1em] transition-all"
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

        <p className="text-center text-gray-400 text-sm lg:text-base">
          Optimizado para iPhone y Desktop
        </p>
      </div>
    </div>
  );
};

export default Login;
