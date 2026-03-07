
import { Planilla, Pedido } from '../types';

const STORAGE_KEYS = {
  PLANILLAS: 'gm_planillas',
  PEDIDOS: 'gm_pedidos',
};

// Simulated latency to mimic real network
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  getPlanillas: async (): Promise<Planilla[]> => {
    await sleep(300);
    const data = localStorage.getItem(STORAGE_KEYS.PLANILLAS);
    return data ? JSON.parse(data) : [];
  },

  savePlanilla: async (planilla: Planilla): Promise<Planilla> => {
    await sleep(200);
    const planillas = await db.getPlanillas();
    const index = planillas.findIndex(p => p.id === planilla.id);
    if (index > -1) {
      planillas[index] = planilla;
    } else {
      planillas.unshift(planilla);
    }
    localStorage.setItem(STORAGE_KEYS.PLANILLAS, JSON.stringify(planillas));
    return planilla;
  },

  deletePlanilla: async (id: string): Promise<void> => {
    const planillas = await db.getPlanillas();
    const filtered = planillas.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLANILLAS, JSON.stringify(filtered));
    
    const pedidos = await db.getPedidos(id);
    const allPedidos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PEDIDOS) || '[]');
    const keptPedidos = allPedidos.filter((p: Pedido) => p.planilla_id !== id);
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(keptPedidos));
  },

  getPedidos: async (planillaId: string): Promise<Pedido[]> => {
    await sleep(300);
    const data = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
    const all: Pedido[] = data ? JSON.parse(data) : [];
    return all.filter(p => p.planilla_id === planillaId);
  },

  savePedido: async (pedido: Pedido): Promise<Pedido> => {
    const data = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
    let all: Pedido[] = data ? JSON.parse(data) : [];
    const index = all.findIndex(p => p.id === pedido.id);
    if (index > -1) {
      all[index] = pedido;
    } else {
      all.push(pedido);
    }
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(all));
    return pedido;
  },

  deletePedido: async (id: string): Promise<void> => {
    const data = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
    let all: Pedido[] = data ? JSON.parse(data) : [];
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(filtered));
  }
};
