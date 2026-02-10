
-- SQL Script for Supabase setup

-- Table for Sales Cycles (Planillas)
CREATE TABLE planillas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  comision_porcentaje NUMERIC DEFAULT 30.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for Orders/Clients (Pedidos)
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planilla_id UUID REFERENCES planillas(id) ON DELETE CASCADE,
  cliente_nombre TEXT NOT NULL,
  monto_deuda NUMERIC DEFAULT 0.0,
  pagado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for performance
CREATE INDEX idx_pedidos_planilla_id ON pedidos(planilla_id);
