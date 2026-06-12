-- ========================================
-- POLÍTICAS RLS PARA TABLA PROFILES - VERSIÓN SIMPLIFICADA
-- Ejecuta esto en Supabase SQL Editor
-- ========================================

-- 1. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. PRIMERO: Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can see own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can see all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;

-- 3. PERMITIR LECTURA: El usuario autenticado ve su propio perfil
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- 4. PERMITIR ACTUALIZACIÓN: El usuario puede actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. PERMITIR INSERSIÓN: Los usuarios nuevos pueden crear su perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ========================================
-- IMPORTANTE: Para ADMIN, necesitamos permisos especiales
-- Estos se manejan desde el cliente verificando la tabla
-- ========================================

-- 6. Función auxiliar para verificar si el usuario es ADMIN
-- (sin recursión - se usa en el cliente)
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

-- 7. PERMITIR A ADMIN: Leer todos los perfiles
CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT 
  USING (is_admin_user());

-- 8. PERMITIR A ADMIN: Actualizar cualquier perfil
CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE 
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- 9. PERMITIR A ADMIN: Eliminar perfiles
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE 
  USING (is_admin_user());

-- ========================================
-- Verificar que todo está correcto
-- ========================================
-- SELECT * FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
