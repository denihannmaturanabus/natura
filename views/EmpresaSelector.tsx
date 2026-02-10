import React from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';

interface EmpresaSelectorProps {
  onSelectEmpresa: (empresa: 'natura' | 'esika') => void;
  onBack: () => void;
}

const EmpresaSelector: React.FC<EmpresaSelectorProps> = ({ onSelectEmpresa, onBack }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFF5F7] relative overflow-hidden">
      {/* Círculos decorativos de fondo estilo iOS */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" />

      {/* Botón Volver estilizado */}
      <button
        onClick={onBack}
        className="absolute top-10 left-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-pink-100 transition-all active:scale-90 z-50"
      >
        <ChevronLeft size={24} className="text-pink-500" />
      </button>

      <div className="w-full max-w-sm lg:max-w-md space-y-10 z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-32 h-32 lg:w-40 lg:h-40 mb-2">
            {/* Usamos a Rene en lugar del maletín para que sea tierno y personal */}
            <img src="/img/rene.png" alt="Rene" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl lg:text-5xl font-black text-gray-800 tracking-tight">
              ¿Qué haremos hoy?
            </h1>
            <p className="text-gray-500 font-semibold lg:text-xl">
              Elige una empresa para empezar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-4">
          {/* Botón Natura - Estilo Tarjeta Premium */}
          <button
            onClick={() => onSelectEmpresa('natura')}
            className="group relative overflow-hidden bg-white p-1 rounded-[2.5rem] shadow-xl shadow-pink-200/50 transition-all active:scale-95 border-2 border-transparent hover:border-pink-400"
          >
            <div className="bg-gradient-to-br from-white to-pink-50 rounded-[2.3rem] p-6 flex flex-col items-center gap-4">
              <div className="h-16 lg:h-20 flex items-center justify-center">
                <img 
                  src="/img/logo_natura.png" 
                  alt="Natura" 
                  className="h-full object-contain"
                />
              </div>
            </div>
          </button>

          {/* Botón Ésika - Estilo Tarjeta Premium */}
          <button
            onClick={() => onSelectEmpresa('esika')}
            className="group relative overflow-hidden bg-white p-1 rounded-[2.5rem] shadow-xl shadow-blue-200/50 transition-all active:scale-95 border-2 border-transparent hover:border-blue-400"
          >
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-[2.3rem] p-6 flex flex-col items-center gap-4">
              <div className="h-16 lg:h-20 flex items-center justify-center">
                <img 
                  src="/img/logo_esika.png" 
                  alt="Ésika" 
                  className="h-full object-contain"
                />
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-gray-400 font-medium text-sm lg:text-base">
          Creado con ❤️ por tu hijo
        </p>
      </div>
    </div>
  );
};

export default EmpresaSelector;