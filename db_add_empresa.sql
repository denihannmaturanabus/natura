-- Añadir columna empresa a la tabla planillas
ALTER TABLE planillas 
ADD COLUMN empresa TEXT NOT NULL DEFAULT 'natura';

-- Crear índice para mejorar rendimiento en consultas por empresa
CREATE INDEX idx_planillas_empresa ON planillas(empresa);

-- Comentario: Los valores posibles son 'natura' y 'esika'
COMMENT ON COLUMN planillas.empresa IS 'Empresa asociada: natura o esika';
