
import React, { useEffect, useState } from 'react';
import { Plus, ChevronRight, BarChart3, Trash2, Building2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Planilla } from '../types';
import { db } from '../services/supabase';

interface HomeProps {
  empresa: 'natura' | 'esika';
  onSelectPlanilla: (id: string) => void;
  onGoStats: () => void;
  onChangeEmpresa: () => void;
}

const Home: React.FC<HomeProps> = ({ empresa, onSelectPlanilla, onGoStats, onChangeEmpresa }) => {
  const [planillas, setPlanillas] = useState<Planilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadData();
  }, [empresa]); // Reload when empresa changes

  const loadData = async () => {
    const allPlanillas = await db.getPlanillas();
    // Filtrar solo las planillas de la empresa seleccionada
    const filtered = allPlanillas.filter(p => p.empresa === empresa);
    setPlanillas(filtered);
    setLoading(false);
  };

  const createPlanilla = async (clone: boolean) => {
    try {
      const empresaCapitalized = empresa.charAt(0).toUpperCase() + empresa.slice(1);
      const newPlanilla: Planilla = {
        id: crypto.randomUUID(),
        nombre: newName || `Ciclo ${new Date().toLocaleDateString('es-ES', { month: 'long' })} - ${empresaCapitalized}`,
        comision_porcentaje: 30,
        empresa: empresa, // Asignar empresa activa
        created_at: new Date().toISOString(),
      };

      await db.savePlanilla(newPlanilla);

      if (clone && planillas.length > 0) {
        const lastPlanilla = planillas[0]; // Ya filtrada por empresa
        const oldPedidos = await db.getPedidos(lastPlanilla.id);
        for (const p of oldPedidos) {
          await db.savePedido({
            ...p,
            id: crypto.randomUUID(),
            planilla_id: newPlanilla.id,
            productos: p.productos.map(prod => ({ ...prod, id: crypto.randomUUID(), pagado: false })) // Reset payment status for all products
          });
        }
      }

      setShowModal(false);
      setNewName('');
      onSelectPlanilla(newPlanilla.id);
    } catch (error) {
      console.error('Error al crear planilla:', error);
      alert('Error al crear la planilla. Asegúrate de haber ejecutado el script SQL db_add_empresa.sql en Supabase para añadir la columna "empresa" a la tabla planillas.');
    }
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
      empresa={empresa}
      title="Mis Ciclos"
      headerAction={
        <div className="flex items-center gap-2">
          <button 
            onClick={onChangeEmpresa}
            className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all shadow-md"
            title="Cambiar empresa"
          >
            <Building2 size={24} />
          </button>
          <button 
            onClick={onGoStats}
            className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all shadow-md"
          >
            <BarChart3 size={24} />
          </button>
        </div>
      }
    >
      <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0 pb-24">
        {loading ? (
          <div className="flex justify-center p-12 lg:col-span-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : planillas.length === 0 ? (
          <div className="text-center py-20 px-10 lg:col-span-full">
            <div className="text-6xl mb-4">🌸</div>
            <h3 className="text-xl font-bold text-gray-800">No hay planillas</h3>
            <p className="text-gray-500">Crea tu primer ciclo de ventas para comenzar.</p>
          </div>
        ) : (
          planillas.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPlanilla(p.id)}
              className="bg-gradient-to-br from-white to-pink-50 backdrop-blur-md p-5 rounded-3xl border-2 border-pink-200 shadow-md hover:shadow-xl active:scale-[0.97] transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-800">{p.nombre}</h3>
                <p className="text-sm text-pink-400 font-semibold">
                  {new Date(p.created_at).toLocaleDateString()} • {p.comision_porcentaje}% comisión
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDelete(e, p.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight className="text-pink-400 group-hover:text-pink-600 transition-colors" size={24} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 right-6 w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-2xl shadow-pink-400/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
      >
        <Plus size={32} />
      </button>

      {/* New Cycle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-br from-white to-pink-50 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl border-2 border-pink-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-800">Nueva Planilla</h2>
              <p className="text-pink-500 font-semibold">Configura tu próximo ciclo de ventas.</p>
            </div>
            
            <input
              type="text"
              placeholder={`Ej: Ciclo Marzo - ${empresa.charAt(0).toUpperCase() + empresa.slice(1)}`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full h-14 px-5 bg-white border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 outline-none text-lg"
            />

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                onClick={() => createPlanilla(true)}
                className="h-14 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                📋 Clonar Clientes
              </button>
              <button
                onClick={() => createPlanilla(false)}
                className="h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                ✨ Empezar de Cero
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="h-14 text-gray-500 hover:bg-gray-100 font-medium rounded-2xl transition-all"
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
