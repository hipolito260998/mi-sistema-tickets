# 🔧 Guía de Troubleshooting - Panel de Administración de Usuarios

## ❌ Problema: Error 500 o "Failed to load resource"

Si ves un error HTTP 500 o "Failed to load resource: the server responded with a status of 500", significa que **las políticas RLS anteriores tienen un problema de recursión**.

---

## ✅ Solución: Ejecutar las Políticas Corregidas

### **Paso 1: Abre Supabase Console**
1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (en el menú izquierdo)

### **Paso 2: PRIMERO - Elimina políticas viejas**
Ejecuta ÉST SQL para limpiar:

```sql
DROP POLICY IF EXISTS "Users can see own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can see all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
```

**Espera a que termine** (debería decir "Executed successfully")

### **Paso 3: SEGUNDO - Crea las políticas nuevas**
Copia TODO esto y ejecútalo:

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- LECTURA: Usuario ve su propio perfil
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- ACTUALIZACIÓN: Usuario actualiza su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERCIÓN: Usuario crea su perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- FUNCIÓN: Sin recursión - verifica si es admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
$$;

-- LECTURA: Admin ve todos los perfiles
CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT 
  USING (is_admin_user());

-- ACTUALIZACIÓN: Admin actualiza cualquier perfil
CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE 
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ELIMINACIÓN: Admin elimina perfiles
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE 
  USING (is_admin_user());
```

**Espera a que termine** (ambas queries deberían ejecutarse correctamente)

### **Paso 4: Verificar en el SQL Editor**
Ejecuta esto para confirmar:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
```

Deberías ver **6 políticas** listadas. Si sí? ¡Perfecto! ✅

---

## 🧪 Testear que funciona

1. **Recarga la app** (`npm run dev`)
2. **Login como ADMIN**
3. **Ve a Dashboard → Usuarios**
4. **Intenta editar un usuario**
5. **Los cambios deberían guardarse** ✅

---

## 🔍 Explicación de las Políticas

| Política | Qué permite |
|----------|-----------|
| `Users can read own profile` | Cada usuario ve su propio perfil |
| `Users can update own profile` | Cada usuario edita su propio perfil |
| `Users can insert own profile` | Usuarios nuevos crean su perfil |
| `is_admin_user()` | **Función sin recursión** que verifica admin |
| `Admin can read all profiles` | Admin ve TODOS los perfiles |
| `Admin can update any profile` | **⭐ Admin puede editar role y area** |
| `Admin can delete profiles` | Admin puede eliminar perfiles |

---

## 💡 Por qué el anterior no funcionaba

El problema anterior era una **recursión infinita**:
```sql
-- ❌ MALO: Intenta hacer SELECT dentro de la política
FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN')
```

La solución es usar una **función SQL con `SECURITY DEFINER`**:
```sql
-- ✅ BUENO: Usa función sin recursión
CREATE FUNCTION is_admin_user() ...
FOR UPDATE USING (is_admin_user())
```

---

## 🆘 Si AÚN no funciona

1. **Abre Consola del Navegador** (F12 → Console)
2. **Intenta editar un usuario**
3. **Busca los logs** `[UserManagement]`
4. Copia el **error exacto** y comparte

---

## 📝 Próximos Pasos

Una vez que funcione:
1. ✅ Admin puede ver tabla de usuarios
2. ✅ Admin puede editar rol de usuarios (**Cambio IMPORTANTE**)
3. ✅ Admin puede asignar área a usuarios
4. ✅ Los cambios se guardan en BD **sin errores 500**
5. ✅ Usuario debe recargar para ver los cambios en su dashboard
