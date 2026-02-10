import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface EmpresaSelectorProps {
  onSelectEmpresa: (empresa: 'natura' | 'esika') => void;
  onBack: () => void;
}

const EmpresaSelector: React.FC<EmpresaSelectorProps> = ({ onSelectEmpresa, onBack }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Botón Volver */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 p-3 bg-white hover:bg-gray-100 rounded-2xl shadow-lg transition-all active:scale-95"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>
      <div className="w-full max-w-sm lg:max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-24 h-24 lg:w-28 lg:h-28 bg-white rounded-3xl shadow-xl mb-4 ring-1 ring-gray-200">
            <span className="text-5xl lg:text-6xl">💼</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight">
            Elige tu empresa
          </h1>
          <p className="text-gray-500 font-medium lg:text-lg">
            Selecciona con cuál empresa quieres trabajar
          </p>
        </div>

        <div className="space-y-4 pt-4">
          {/* Botón Natura */}
          <button
            onClick={() => onSelectEmpresa('natura')}
            className="w-full h-24 lg:h-28 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 hover:from-pink-500 hover:via-pink-600 hover:to-rose-600 active:scale-[0.98] text-white rounded-3xl font-bold text-xl lg:text-2xl shadow-2xl shadow-pink-300/50 transition-all flex items-center justify-center gap-4 border-2 border-pink-300/30 p-4"
          >
            <img src="/img/logo_natura.png" alt="Natura" className="h-12 lg:h-16 object-contain" />
          </button>

          {/* Botón Ésika */}
          <button
            onClick={() => onSelectEmpresa('esika')}
            className="w-full h-24 lg:h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 hover:from-cyan-500 hover:via-blue-600 hover:to-blue-700 active:scale-[0.98] text-white rounded-3xl font-bold text-xl lg:text-2xl shadow-2xl shadow-blue-300/50 transition-all flex items-center justify-center gap-4 border-2 border-blue-300/30 p-4"
          >
            <img src="/img/logo_esika.png" alt="Ésika" className="h-12 lg:h-16 object-contain" />
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm lg:text-base pt-6">
          Podrás cambiar entre empresas cuando lo necesites
        </p>
      </div>
    </div>
  );
};

export default EmpresaSelector;
