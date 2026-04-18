-- ========================================
-- POLÍTICAS RLS PARA TABLA PROFILES
-- Ejecuta esto en Supabase SQL Editor
-- ========================================

-- 1. Habilitar RLS (si no está habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Permitir que el usuario actual vea su propio perfil
CREATE POLICY "Users can see own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id
  );

-- 3. Permitir que ADMIN vea todos los perfiles
CREATE POLICY "Admin can see all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- 4. Permitir que el usuario actualice su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
  );

-- 5. IMPORTANTE: Permitir que ADMIN actualice cualquier perfil (incluyendo role y area)
CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- 6. Permitir que ADMIN inserte perfiles (para signup/onboarding)
CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
      OR auth.uid() = id
  );

-- 7. Permitir que ADMIN elimine perfiles
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN'
  );

-- ========================================
-- Verificar que las políticas se crearon
-- ========================================
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
