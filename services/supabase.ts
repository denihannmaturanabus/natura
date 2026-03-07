import { createClient } from '@supabase/supabase-js';
import { Planilla, Pedido, Producto } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase no configurado. Usando localStorage como fallback.');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper para verificar si Supabase está disponible
export const isSupabaseConfigured = () => supabase !== null;

// Servicio de base de datos con fallback a localStorage
export const db = {
  // PLANILLAS
  getPlanillas: async (): Promise<Planilla[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('planillas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
    
    // Fallback: localStorage
    const data = localStorage.getItem('gm_planillas');
    return data ? JSON.parse(data) : [];
  },

  savePlanilla: async (planilla: Planilla): Promise<Planilla> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('planillas')
        .upsert(planilla)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    // Fallback: localStorage
    const planillas = await db.getPlanillas();
    const index = planillas.findIndex(p => p.id === planilla.id);
    if (index > -1) {
      planillas[index] = planilla;
    } else {
      planillas.unshift(planilla);
    }
    localStorage.setItem('gm_planillas', JSON.stringify(planillas));
    return planilla;
  },

  deletePlanilla: async (id: string): Promise<void> => {
    if (supabase) {
      // Supabase maneja el CASCADE automáticamente
      const { error } = await supabase
        .from('planillas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return;
    }
    
    // Fallback: localStorage
    const planillas = await db.getPlanillas();
    const filtered = planillas.filter(p => p.id !== id);
    localStorage.setItem('gm_planillas', JSON.stringify(filtered));
    
    // Eliminar pedidos relacionados
    const allPedidos = JSON.parse(localStorage.getItem('gm_pedidos') || '[]');
    const pedidosToDelete = allPedidos.filter((p: Pedido) => p.planilla_id === id);
    const keptPedidos = allPedidos.filter((p: Pedido) => p.planilla_id !== id);
    localStorage.setItem('gm_pedidos', JSON.stringify(keptPedidos));
  },

  // PEDIDOS (CLIENTES)
  getPedidos: async (planillaId: string): Promise<Pedido[]> => {
    if (supabase) {
      // Obtener pedidos con sus productos
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('planilla_id', planillaId)
        .order('created_at', { ascending: false });
      
      if (pedidosError) throw pedidosError;
      
      if (!pedidosData || pedidosData.length === 0) return [];
      
      // Obtener productos de todos los pedidos
      const pedidoIds = pedidosData.map(p => p.id);
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .in('pedido_id', pedidoIds)
        .order('created_at', { ascending: true });
      
      if (productosError) throw productosError;
      
      // Combinar pedidos con sus productos
      const pedidos: Pedido[] = pedidosData.map(pedido => ({
        ...pedido,
        productos: (productosData || []).filter(p => p.pedido_id === pedido.id)
      }));
      
      return pedidos;
    }
    
    // Fallback: localStorage
    const data = localStorage.getItem('gm_pedidos');
    const all: Pedido[] = data ? JSON.parse(data) : [];
    return all.filter(p => p.planilla_id === planillaId);
  },

  savePedido: async (pedido: Pedido): Promise<Pedido> => {
    if (supabase) {
      // Guardar pedido (sin productos en el objeto)
      const { productos, ...pedidoSinProductos } = pedido;
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .upsert(pedidoSinProductos)
        .select()
        .single();
      
      if (pedidoError) throw pedidoError;
      
      // Eliminar productos antiguos
      await supabase
        .from('productos')
        .delete()
        .eq('pedido_id', pedido.id);
      
      // Guardar productos nuevos
      if (productos && productos.length > 0) {
        const productosConPedidoId = productos.map(p => ({
          ...p,
          pedido_id: pedido.id
        }));
        
        const { error: productosError } = await supabase
          .from('productos')
          .insert(productosConPedidoId);
        
        if (productosError) throw productosError;
      }
      
      return { ...pedidoData, productos: productos || [] };
    }
    
    // Fallback: localStorage
    const data = localStorage.getItem('gm_pedidos');
    let all: Pedido[] = data ? JSON.parse(data) : [];
    const index = all.findIndex(p => p.id === pedido.id);
    if (index > -1) {
      all[index] = pedido;
    } else {
      all.push(pedido);
    }
    localStorage.setItem('gm_pedidos', JSON.stringify(all));
    return pedido;
  },

  deletePedido: async (id: string): Promise<void> => {
    if (supabase) {
      // Supabase maneja el CASCADE automáticamente para productos
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return;
    }
    
    // Fallback: localStorage
    const data = localStorage.getItem('gm_pedidos');
    let all: Pedido[] = data ? JSON.parse(data) : [];
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem('gm_pedidos', JSON.stringify(filtered));
  }
};
