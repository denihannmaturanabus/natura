
export interface Planilla {
  id: string;
  nombre: string;
  comision_porcentaje: number;
  created_at: string;
}

export interface Producto {
  id: string;
  descripcion: string;
  monto: number;
  pagado: boolean;
}

export interface Pedido {
  id: string;
  planilla_id: string;
  cliente_nombre: string;
  productos: Producto[];
  created_at: string;
}

export interface PlanillaSummary {
  totalVendido: number;
  gananciaNeta: number;
  totalPagado: number;
  clientesPendientes: number;
}
