# 🔧 Guía de Troubleshooting - Panel de Administración de Usuarios

## ❌ Error: "violates check constraint 'profiles_role_check'"

Si ves este error:
```
Error al guardar: new row for relation "profiles" violates check constraint "profiles_role_check"
```

Significa que la tabla `profiles` tiene una **restricción CHECK** que no permite el valor `'AREA_LEAD'`.

---

## ✅ Solución: Actualizar la Restricción CHECK

### **Paso 1: Abre Supabase Console**
1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Ve a **SQL Editor**

### **Paso 2: Ejecuta ÉST SQL**
```sql
-- Eliminar la restricción CHECK antigua
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Crear nueva restricción CHECK con AREA_LEAD
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('ADMIN', 'CUSTOMER', 'AREA_LEAD'));
```

**Espera a que termine** (debería decir "Executed successfully") ✅

---

## 🧪 Probar ahora

1. **Recarga tu app** (`npm run dev`)
2. **Login como ADMIN**
3. **Ve a Dashboard → Usuarios**
4. **Edita un usuario y cambia el rol a "Líder de Área"**
5. **Click Guardar**
6. Debería funcionar sin errores ✅

---

## 📊 Explicación

La tabla `profiles` probablemente tenía esta restricción:
```sql
-- ❌ VIEJA: Solo permitía ADMIN y CUSTOMER
CHECK (role IN ('ADMIN', 'CUSTOMER'))
```

La nueva permite:
```sql
-- ✅ NUEVA: Permite los 3 roles
CHECK (role IN ('ADMIN', 'CUSTOMER', 'AREA_LEAD'))
```

---

## 💡 Alternativa (Más Robusta)

Si quieres una solución más segura, puedes usar un **ENUM** (tipo de dato especializado):

```sql
-- Crear tipo ENUM
CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'CUSTOMER', 'AREA_LEAD');

-- Cambiar la columna a usar ENUM
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_enum USING role::user_role_enum;

-- Eliminar la restricción CHECK antigua (ya no la necesitas)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
```

Esto es más fuerte pero solo si estás seguro de que no hay valores raros en la tabla.

---

## 🆘 Si sigue sin funcionar

1. Abre **Consola del Navegador** (F12 → Console)
2. Intenta guardar de nuevo
3. Copia el error exacto

---

## ✨ Próximos Pasos

Una vez que funcione:
1. ✅ Admin puede cambiar rol a AREA_LEAD
2. ✅ Los cambios se guardan sin errores
3. ✅ Usuario debe recargar para ver los cambios en su dashboard
