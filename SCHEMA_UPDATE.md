# 🔄 Actualización de Schema - GlowManager

## Cambios en la Base de Datos

### ⚠️ IMPORTANTE: Nueva Estructura de Productos

La base de datos ha sido actualizada para soportar **múltiples productos por cliente** con **pagos individuales**.

### Estructura Anterior ❌
```
pedidos
  - cliente_nombre
  - monto_deuda (único monto)
  - pagado (checkbox único para todo el pedido)
```

### Nueva Estructura ✅
```
pedidos
  - cliente_nombre

productos (nueva tabla)
  - pedido_id
  - descripcion
  - monto
  - pagado (checkbox individual por producto)
```

## Cómo Actualizar tu Base de Datos

### Si usas Supabase:

1. Ejecuta el script `db_setup.sql` en el SQL Editor de Supabase
2. Esto creará:
   - Tabla `productos` con relación a `pedidos`
   - Índices para mejor performance
   - Vista `pedidos_completos` para consultas optimizadas

### Migración de Datos Existentes

Si tienes datos antiguos, ejecuta este script de migración:

```sql
-- Crear productos a partir de pedidos antiguos
INSERT INTO productos (pedido_id, descripcion, monto, pagado)
SELECT 
  id as pedido_id,
  'Producto importado' as descripcion,
  monto_deuda as monto,
  pagado
FROM pedidos
WHERE monto_deuda > 0;

-- Eliminar columnas antiguas (opcional)
ALTER TABLE pedidos DROP COLUMN monto_deuda;
ALTER TABLE pedidos DROP COLUMN pagado;
```

## Nuevas Funcionalidades

### Dashboard Actualizado 📊
Ahora muestra:
- **Total**: Suma de todos los productos
- **Pagado**: Solo productos marcados como pagados ✅
- **Pendiente**: Total - Pagado
- **Comisión**: % configurable
- **Ganancia**: Total × Comisión %

### Productos con Estado Individual
- Cada producto tiene su propio checkbox de pago
- Los productos pagados se muestran en verde con línea tachada
- Los pendientes se ven normales

### Cálculos Automáticos por Cliente
- **TOTAL CLIENTE**: Suma de todos sus productos
- **PAGADO**: Productos con checkbox marcado
- **PENDIENTE**: Lo que falta por pagar

## Ejemplo de Uso

**Cliente: Bárbara**
- Crema facial - $3.400 ✅ (pagado)
- Perfume - $5.500 ❌ (pendiente)
- Labial - $2.000 ✅ (pagado)

**Resultado:**
- Total Cliente: $10.900
- Pagado: $5.400
- Pendiente: $5.500

---

Fecha de actualización: 10 de febrero de 2026
