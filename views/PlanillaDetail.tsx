
import React, { useEffect, useState, useCallback } from 'react';
import { Send, Share2, Plus, UserPlus, Trash2, ShoppingBag, Save, X } from 'lucide-react';
import Layout from '../components/Layout';
import { Planilla, Pedido, Producto } from '../types';
import { db } from '../services/supabase';

interface PlanillaDetailProps {
  planillaId: string;
  onBack: () => void;
}

const PlanillaDetail: React.FC<PlanillaDetailProps> = ({ planillaId, onBack }) => {
  const [planilla, setPlanilla] = useState<Planilla | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [originalPedidos, setOriginalPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [planillaId]);

  const loadData = async () => {
    const planillas = await db.getPlanillas();
    const current = planillas.find(p => p.id === planillaId);
    if (current) setPlanilla(current);
    
    const clientList = await db.getPedidos(planillaId);
    setPedidos(clientList);
    setOriginalPedidos(JSON.parse(JSON.stringify(clientList))); // Deep copy
    setLoading(false);
    setHasChanges(false);
  };

  const updateCommission = async (val: string) => {
    if (!planilla) return;
    const num = parseFloat(val) || 0;
    const updated = { ...planilla, comision_porcentaje: num };
    setPlanilla(updated);
    setHasChanges(true);
  };

  const addClient = () => {
    const newPedido: Pedido = {
      id: crypto.randomUUID(),
      planilla_id: planillaId,
      cliente_nombre: '',
      productos: [],
      created_at: new Date().toISOString()
    };
    setPedidos([newPedido, ...pedidos]);
    setHasChanges(true);
  };

  const updatePedido = useCallback((id: string, updates: Partial<Pedido>) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setHasChanges(true);
  }, []);

  const deletePedido = (id: string) => {
    if (confirm('¿Eliminar cliente?')) {
      setPedidos(prev => prev.filter(p => p.id !== id));
      setHasChanges(true);
    }
  };

  const totalVendido = pedidos.reduce((acc, curr) => {
    const totalPedido = curr.productos.reduce((sum, prod) => sum + (prod.monto || 0), 0);
    return acc + totalPedido;
  }, 0);
  
  const totalPagadoGeneral = pedidos.reduce((acc, curr) => {
    const totalPagadoPedido = curr.productos.filter(p => p.pagado).reduce((sum, prod) => sum + (prod.monto || 0), 0);
    return acc + totalPagadoPedido;
  }, 0);
  
  const totalPendienteGeneral = totalVendido - totalPagadoGeneral;
  
  const comision = planilla?.comision_porcentaje || 0;
  const gananciaNeta = (totalVendido * comision) / 100;

  const addProducto = (pedidoId: string) => {
    const nuevoProducto: Producto = {
      id: crypto.randomUUID(),
      descripcion: '',
      monto: 0,
      pagado: false
    };
    
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      const updated = { ...pedido, productos: [...pedido.productos, nuevoProducto] };
      setPedidos(prev => prev.map(p => p.id === pedidoId ? updated : p));
      setHasChanges(true);
    }
  };

  const updateProducto = (pedidoId: string, productoId: string, updates: Partial<Producto>) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      const updated = {
        ...pedido,
        productos: pedido.productos.map(prod =>
          prod.id === productoId ? { ...prod, ...updates } : prod
        )
      };
      setPedidos(prev => prev.map(p => p.id === pedidoId ? updated : p));
      setHasChanges(true);
    }
  };

  const deleteProducto = (pedidoId: string, productoId: string) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      const updated = {
        ...pedido,
        productos: pedido.productos.filter(prod => prod.id !== productoId)
      };
      setPedidos(prev => prev.map(p => p.id === pedidoId ? updated : p));
      setHasChanges(true);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Guardar planilla si cambió
      if (planilla) {
        await db.savePlanilla(planilla);
      }

      // Guardar todos los pedidos
      for (const pedido of pedidos) {
        await db.savePedido(pedido);
      }

      // Eliminar pedidos que fueron borrados
      const deletedIds = originalPedidos
        .filter(orig => !pedidos.find(p => p.id === orig.id))
        .map(p => p.id);
      
      for (const id of deletedIds) {
        await db.deletePedido(id);
      }

      // Actualizar estado original
      setOriginalPedidos(JSON.parse(JSON.stringify(pedidos)));
      setHasChanges(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Hubo un error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    if (confirm('¿Descartar todos los cambios no guardados?')) {
      setPedidos(JSON.parse(JSON.stringify(originalPedidos)));
      setHasChanges(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (confirm('Tienes cambios sin guardar. ¿Descartar y volver?')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  const handleWhatsApp = (pedido: Pedido) => {
    const pendiente = pedido.productos.filter(p => !p.pagado).reduce((sum, prod) => sum + prod.monto, 0);
    if (pendiente === 0 || pedido.productos.length === 0) return;
    const message = encodeURIComponent(`¡Hola ${pedido.cliente_nombre}! Te escribo de Cuentas Claras Mamá ✨ Te comento que tienes un saldo pendiente de $${pendiente.toLocaleString()} de tu pedido de cosméticos. ¿Podrás realizar el pago hoy? 🌸`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Layout 
      showBack 
      onBack={handleBack} 
      title={planilla?.nombre || 'Detalle'}
      headerAction={
        <button className="p-2 text-white hover:bg-white/20 rounded-xl transition-all">
          <Share2 size={22} />
        </button>
      }
    >
      {/* Real-time Dashboard Header */}
      <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl border-2 border-pink-200 sticky top-[68px] sm:top-[80px] z-30">
        {/* Fila 1: Flujo de dinero */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center mb-4 pb-4 border-b-2 border-pink-100">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-base sm:text-xl font-black text-blue-600">${totalVendido.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">Pagado</p>
            <p className="text-base sm:text-xl font-black text-green-600">${totalPagadoGeneral.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Pendiente</p>
            <p className="text-base sm:text-xl font-black text-orange-600">${totalPendienteGeneral.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Fila 2: Comisión y Ganancia */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
          <div className="relative">
            <p className="text-[9px] sm:text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Comisión</p>
            <div className="flex items-center justify-center gap-0.5 sm:gap-1">
              <input
                type="number"
                value={comision}
                onChange={(e) => updateCommission(e.target.value)}
                className="w-10 sm:w-12 text-base sm:text-xl font-black text-pink-500 bg-transparent text-center focus:outline-none"
              />
              <span className="text-base sm:text-lg font-bold text-pink-500">%</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">Ganancia</p>
            <p className="text-base sm:text-xl font-black text-pink-600">${gananciaNeta.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 px-1 sm:px-2">Clientes ({pedidos.length})</h2>
          <button 
            onClick={addClient}
            className="flex items-center gap-1 px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-pink-300/50 hover:shadow-xl active:scale-95 transition-all"
          >
            <UserPlus size={14} className="sm:w-4 sm:h-4" /> Agregar
          </button>
        </div>

        {pedidos.map((p) => {
          const totalCliente = p.productos.reduce((sum, prod) => sum + (prod.monto || 0), 0);
          const totalPagado = p.productos.filter(prod => prod.pagado).reduce((sum, prod) => sum + (prod.monto || 0), 0);
          const totalPendiente = totalCliente - totalPagado;
          
          return (
            <div 
              key={p.id}
              className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl p-3 sm:p-5 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-2 sm:gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={p.cliente_nombre}
                    placeholder="Nombre del Cliente"
                    onChange={(e) => updatePedido(p.id, { cliente_nombre: e.target.value })}
                    className="w-full font-bold text-gray-800 outline-none text-lg sm:text-xl bg-transparent mb-3 placeholder-gray-300"
                  />
                  
                  {/* Productos con Checkbox Individual */}
                  <div className="space-y-2 mb-3">
                    {p.productos.map((prod) => (
                      <div key={prod.id} className={`flex items-center gap-2 rounded-2xl p-2.5 border-2 transition-all ${prod.pagado ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                        {/* Checkbox del Producto */}
                        <button 
                          onClick={() => updateProducto(p.id, prod.id, { pagado: !prod.pagado })}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${prod.pagado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}
                        >
                          {prod.pagado && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </button>
                        
                        <input
                          type="text"
                          value={prod.descripcion}
                          placeholder="Producto"
                          onChange={(e) => updateProducto(p.id, prod.id, { descripcion: e.target.value })}
                          className={`flex-1 min-w-0 text-sm font-medium outline-none bg-transparent ${prod.pagado ? 'text-gray-500 line-through' : 'text-gray-700'} placeholder-gray-300`}
                        />
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <span className="text-gray-400 text-xs font-bold">$</span>
                          <input
                            type="number"
                            value={prod.monto || ''}
                            placeholder="0"
                            onChange={(e) => updateProducto(p.id, prod.id, { monto: parseFloat(e.target.value) || 0 })}
                            className={`w-16 text-sm font-bold outline-none bg-transparent text-right ${prod.pagado ? 'text-green-600' : 'text-gray-800'}`}
                          />
                        </div>
                        <button
                          onClick={() => deleteProducto(p.id, prod.id)}
                          className="w-6 h-6 flex-shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Agregar Producto */}
                  <button
                    onClick={() => addProducto(p.id)}
                    className="w-full py-2 sm:py-2.5 text-pink-600 bg-pink-50 hover:bg-pink-100 text-xs sm:text-sm font-bold flex items-center justify-center gap-1 rounded-xl transition-colors border-2 border-dashed border-pink-200"
                  >
                    <Plus size={14} className="sm:w-4 sm:h-4" /> Agregar producto
                  </button>

                  {/* Totales del cliente con colores */}
                  {p.productos.length > 0 && (
                    <div className="mt-3 pt-3 border-t-2 border-purple-200 space-y-1.5">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-bold text-blue-500">TOTAL CLIENTE</span>
                        <span className="text-base sm:text-lg font-black text-blue-600">${totalCliente.toLocaleString()}</span>
                      </div>
                      {totalPagado > 0 && (
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] sm:text-xs font-bold text-green-500">PAGADO</span>
                          <span className="text-sm sm:text-base font-black text-green-600">${totalPagado.toLocaleString()}</span>
                        </div>
                      )}
                      {totalPendiente > 0 && (
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] sm:text-xs font-bold text-orange-500">PENDIENTE</span>
                          <span className="text-sm sm:text-base font-black text-orange-600">${totalPendiente.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  {totalPendiente > 0 && (
                    <button 
                      onClick={() => handleWhatsApp(p)}
                      className="w-9 h-9 sm:w-11 sm:h-11 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-md"
                      title="Enviar recordatorio de pago"
                    >
                      <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  )}
                  <button 
                    onClick={() => deletePedido(p.id)}
                    className="w-9 h-9 sm:w-11 sm:h-11 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
                    title="Eliminar cliente"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {pedidos.length === 0 && (
          <div className="text-center py-16 px-8 bg-gradient-to-br from-white to-pink-50 rounded-3xl border-2 border-dashed border-pink-200">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hay clientes aún</h3>
            <p className="text-pink-400 font-medium">Agrega tu primer cliente para comenzar.</p>
          </div>
        )}
      </div>

      {/* Floating Save/Discard Buttons */}
      {hasChanges && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300 w-[calc(100%-2rem)] sm:w-auto max-w-md">
          <div className="bg-gradient-to-r from-white via-pink-50 to-white rounded-full shadow-2xl border-2 border-pink-300 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-3">
            <button
              onClick={discardChanges}
              disabled={saving}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-600 hover:bg-gray-100 rounded-full font-semibold text-sm transition-colors disabled:opacity-50"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Descartar</span>
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-bold text-sm shadow-lg shadow-pink-300/50 transition-all disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-xs sm:text-sm">Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs sm:text-sm">Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PlanillaDetail;
