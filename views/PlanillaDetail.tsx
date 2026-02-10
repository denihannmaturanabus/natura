
import React, { useEffect, useState, useCallback } from 'react';
import { Send, Share2, Plus, UserPlus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Planilla, Pedido } from '../types';
import { db } from '../services/supabaseMock';

interface PlanillaDetailProps {
  planillaId: string;
  onBack: () => void;
}

const PlanillaDetail: React.FC<PlanillaDetailProps> = ({ planillaId, onBack }) => {
  const [planilla, setPlanilla] = useState<Planilla | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [planillaId]);

  const loadData = async () => {
    const planillas = await db.getPlanillas();
    const current = planillas.find(p => p.id === planillaId);
    if (current) setPlanilla(current);
    
    const clientList = await db.getPedidos(planillaId);
    setPedidos(clientList);
    setLoading(false);
  };

  const updateCommission = async (val: string) => {
    if (!planilla) return;
    const num = parseFloat(val) || 0;
    const updated = { ...planilla, comision_porcentaje: num };
    setPlanilla(updated);
    await db.savePlanilla(updated);
  };

  const addClient = async () => {
    const newPedido: Pedido = {
      id: crypto.randomUUID(),
      planilla_id: planillaId,
      cliente_nombre: '',
      monto_deuda: 0,
      pagado: false,
      created_at: new Date().toISOString()
    };
    setPedidos([newPedido, ...pedidos]);
    await db.savePedido(newPedido);
  };

  const updatePedido = useCallback(async (id: string, updates: Partial<Pedido>) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const current = pedidos.find(p => p.id === id);
    if (current) {
      await db.savePedido({ ...current, ...updates });
    }
  }, [pedidos]);

  const deletePedido = async (id: string) => {
    if (confirm('¿Eliminar cliente?')) {
      await db.deletePedido(id);
      setPedidos(prev => prev.filter(p => p.id !== id));
    }
  };

  const totalVendido = pedidos.reduce((acc, curr) => acc + (curr.monto_deuda || 0), 0);
  const comision = planilla?.comision_porcentaje || 0;
  const gananciaNeta = (totalVendido * comision) / 100;

  const handleWhatsApp = (pedido: Pedido) => {
    if (pedido.pagado || !pedido.monto_deuda) return;
    const message = encodeURIComponent(`¡Hola ${pedido.cliente_nombre}! Te escribo de GlowManager ✨ Te comento que tienes un saldo pendiente de $${pedido.monto_deuda} de tu pedido de cosméticos. ¿Podrás realizar el pago hoy? 🌸`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Layout 
      showBack 
      onBack={onBack} 
      title={planilla?.nombre || 'Detalle'}
      headerAction={
        <button className="p-2 text-pink-500 bg-pink-50 rounded-xl">
          <Share2 size={22} />
        </button>
      }
    >
      {/* Real-time Dashboard Header */}
      <div className="bg-white/90 backdrop-blur-lg rounded-[2rem] p-6 mb-6 shadow-sm border border-pink-50 sticky top-[80px] z-30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-xl font-black text-gray-800">${totalVendido.toLocaleString()}</p>
          </div>
          <div className="relative">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Comisión</p>
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                value={comision}
                onChange={(e) => updateCommission(e.target.value)}
                className="w-12 text-xl font-black text-pink-500 bg-transparent text-center focus:outline-none"
              />
              <span className="text-lg font-bold text-pink-500">%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ganancia</p>
            <p className="text-xl font-black text-green-500">${gananciaNeta.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 px-2">Clientes ({pedidos.length})</h2>
          <button 
            onClick={addClient}
            className="flex items-center gap-1 px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform"
          >
            <UserPlus size={16} /> Agregar
          </button>
        </div>

        {pedidos.map((p) => (
          <div 
            key={p.id}
            className={`bg-white rounded-3xl p-4 border border-gray-100 shadow-sm transition-all ${p.pagado ? 'opacity-60 grayscale-[0.5]' : ''}`}
          >
            <div className="flex items-center gap-4">
              {/* Paid Toggle */}
              <button 
                onClick={() => updatePedido(p.id, { pagado: !p.pagado })}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${p.pagado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200'}`}
              >
                {p.pagado && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={p.cliente_nombre}
                  placeholder="Nombre del Cliente"
                  onChange={(e) => updatePedido(p.id, { cliente_nombre: e.target.value })}
                  className="w-full font-bold text-gray-800 outline-none text-lg bg-transparent"
                />
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    value={p.monto_deuda || ''}
                    placeholder="0.00"
                    onChange={(e) => updatePedido(p.id, { monto_deuda: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm font-semibold text-gray-500 outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!p.pagado && (
                  <button 
                    onClick={() => handleWhatsApp(p)}
                    className="w-10 h-10 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Send size={18} />
                  </button>
                )}
                <button 
                  onClick={() => deletePedido(p.id)}
                  className="w-10 h-10 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {pedidos.length === 0 && (
          <div className="text-center py-10 opacity-40">
            <p>Aún no tienes pedidos registrados.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlanillaDetail;
