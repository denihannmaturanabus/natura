
import React, { useEffect, useState } from 'react';
import { Plus, ChevronRight, BarChart3, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Planilla } from '../types';
import { db } from '../services/supabaseMock';

interface HomeProps {
  onSelectPlanilla: (id: string) => void;
  onGoStats: () => void;
}

const Home: React.FC<HomeProps> = ({ onSelectPlanilla, onGoStats }) => {
  const [planillas, setPlanillas] = useState<Planilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getPlanillas();
    setPlanillas(data);
    setLoading(false);
  };

  const createPlanilla = async (clone: boolean) => {
    const newPlanilla: Planilla = {
      id: crypto.randomUUID(),
      nombre: newName || `Ciclo ${new Date().toLocaleDateString('es-ES', { month: 'long' })}`,
      comision_porcentaje: 30,
      created_at: new Date().toISOString(),
    };

    await db.savePlanilla(newPlanilla);

    if (clone && planillas.length > 0) {
      const lastPlanilla = planillas[0];
      const oldPedidos = await db.getPedidos(lastPlanilla.id);
      for (const p of oldPedidos) {
        await db.savePedido({
          ...p,
          id: crypto.randomUUID(),
          planilla_id: newPlanilla.id,
          pagado: false // Reset payment status for new cycle
        });
      }
    }

    setShowModal(false);
    setNewName('');
    onSelectPlanilla(newPlanilla.id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta planilla y todos sus registros?')) {
      await db.deletePlanilla(id);
      loadData();
    }
  };

  return (
    <Layout 
      title="Mis Ciclos"
      headerAction={
        <button 
          onClick={onGoStats}
          className="p-2 bg-pink-50 text-pink-500 rounded-xl"
        >
          <BarChart3 size={24} />
        </button>
      }
    >
      <div className="space-y-4 pb-24">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : planillas.length === 0 ? (
          <div className="text-center py-20 px-10">
            <div className="text-6xl mb-4">🌸</div>
            <h3 className="text-xl font-bold text-gray-800">No hay planillas</h3>
            <p className="text-gray-500">Crea tu primer ciclo de ventas para comenzar.</p>
          </div>
        ) : (
          planillas.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPlanilla(p.id)}
              className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-pink-50 shadow-sm active:scale-[0.97] transition-all flex items-center justify-between group"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800">{p.nombre}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(p.created_at).toLocaleDateString()} • {p.comision_porcentaje}% comisión
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDelete(e, p.id)}
                  className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight className="text-pink-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 right-6 w-16 h-16 bg-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      {/* New Cycle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-800">Nueva Planilla</h2>
              <p className="text-gray-500">Configura tu próximo ciclo de ventas.</p>
            </div>
            
            <input
              type="text"
              placeholder="Ej: Ciclo Marzo - Natura"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full h-14 px-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-100 outline-none text-lg"
            />

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                onClick={() => createPlanilla(true)}
                className="h-14 bg-pink-100 text-pink-600 font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                📋 Clonar Clientes
              </button>
              <button
                onClick={() => createPlanilla(false)}
                className="h-14 bg-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                ✨ Empezar de Cero
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="h-14 text-gray-400 font-medium rounded-2xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Home;
