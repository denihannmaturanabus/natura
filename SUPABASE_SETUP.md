# 🚀 Configuración de Supabase - GlowManager

## Pasos para Conectar con Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en **"New Project"**
3. Ingresa:
   - **Nombre**: GlowManager (o el que prefieras)
   - **Password**: (guarda esta contraseña)
   - **Region**: Elige la más cercana a ti

### 2. Ejecutar el SQL Schema

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `db_setup.sql`
3. Click en **"Run"** para crear las tablas

### 3. Obtener las Credenciales

1. En Supabase, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (clave larga)

### 4. Configurar Variables de Entorno

1. Abre el archivo `.env.local`
2. Reemplaza estos valores:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### 5. Reiniciar el Servidor

```bash
# Detén el servidor actual (Ctrl+C)
npm run dev
```

## ✅ Verificación

La app ahora:
- ✅ Se conecta automáticamente a Supabase si está configurado
- ✅ Usa localStorage como fallback si no está configurado
- ✅ Muestra advertencia en consola si falta configuración

## 🔄 Migrar Datos Locales (Opcional)

Si ya tienes datos en localStorage y quieres migrarlos a Supabase:

### Opción A: Copiar manualmente
1. Abre DevTools → Application → Local Storage
2. Copia los datos de `gm_planillas` y `gm_pedidos`
3. Inserta en Supabase vía SQL Editor

### Opción B: Script automático
Ejecuta este script en la consola del navegador:

```javascript
// Ver datos actuales
console.log("Planillas:", localStorage.getItem('gm_planillas'));
console.log("Pedidos:", localStorage.getItem('gm_pedidos'));

// Los datos se sincronizarán automáticamente
// al usar la app con Supabase configurado
```

## 🎯 Ventajas de Supabase

- ☁️ **Datos en la nube**: Accesible desde cualquier dispositivo
- 🔄 **Sincronización automática**: Tiempo real
- 🔐 **Respaldos automáticos**: No perderás datos
- 📊 **Base de datos SQL**: Más potente que localStorage
- 🚀 **Escalable**: Soporta miles de pedidos sin problemas

## ⚠️ Importante

- **NO COMPARTAS** tu `.env.local` en GitHub
- El archivo `.gitignore` ya excluye `.env.local`
- Cada desarrollador debe tener su propio `.env.local`

## 🆘 Problemas Comunes

### "Cannot find module @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

### "Supabase no configurado"
- Verifica que `.env.local` tenga las variables correctas
- Las variables deben empezar con `VITE_`
- Reinicia el servidor después de cambiar `.env.local`

### "Invalid API key"
- Asegúrate de usar la **anon key**, no la service_role key
- Copia la clave completa sin espacios

---

¿Necesitas ayuda? Verifica que el `db_setup.sql` se haya ejecutado correctamente en Supabase.
