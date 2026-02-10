
export interface Planilla {
  id: string;
  nombre: string;
  comision_porcentaje: number;
  created_at: string;
}

export interface Pedido {
  id: string;
  planilla_id: string;
  cliente_nombre: string;
  monto_deuda: number;
  pagado: boolean;
  created_at: string;
}

export interface PlanillaSummary {
  totalVendido: number;
  gananciaNeta: number;
  totalPagado: number;
  clientesPendientes: number;
}
