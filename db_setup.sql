
-- SQL Script for Supabase setup

-- Table for Sales Cycles (Planillas)
CREATE TABLE planillas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  comision_porcentaje NUMERIC DEFAULT 30.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for Clients/Orders (Pedidos)
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planilla_id UUID REFERENCES planillas(id) ON DELETE CASCADE,
  cliente_nombre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for Products (Productos)
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  monto NUMERIC DEFAULT 0.0,
  pagado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_pedidos_planilla_id ON pedidos(planilla_id);
CREATE INDEX idx_productos_pedido_id ON productos(pedido_id);

-- View for easy querying of complete order information
CREATE VIEW pedidos_completos AS
SELECT 
  ped.id as pedido_id,
  ped.planilla_id,
  ped.cliente_nombre,
  ped.created_at as pedido_created_at,
  COALESCE(SUM(prod.monto), 0) as total_pedido,
  COALESCE(SUM(CASE WHEN prod.pagado THEN prod.monto ELSE 0 END), 0) as total_pagado,
  COALESCE(SUM(CASE WHEN NOT prod.pagado THEN prod.monto ELSE 0 END), 0) as total_pendiente
FROM pedidos ped
LEFT JOIN productos prod ON ped.id = prod.pedido_id
GROUP BY ped.id, ped.planilla_id, ped.cliente_nombre, ped.created_at;
