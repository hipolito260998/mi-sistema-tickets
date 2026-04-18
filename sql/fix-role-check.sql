-- ========================================
-- SOLUCIÓN: Actualizar restricción CHECK para incluir AREA_LEAD
-- Ejecuta esto en Supabase SQL Editor
-- ========================================

-- 1. PRIMERO: Ver la restricción actual (solo para diagnóstico)
-- SELECT constraint_name, check_clause
-- FROM information_schema.check_constraints
-- WHERE constraint_name LIKE '%role%';

-- 2. ELIMINAR la restricción CHECK antigua
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. CREAR nueva restricción CHECK con todos los valores permitidos
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('ADMIN', 'CUSTOMER', 'AREA_LEAD'));

-- 4. VERIFICAR que la restricción se creó correctamente
-- SELECT constraint_name, check_clause
-- FROM information_schema.check_constraints
-- WHERE constraint_name = 'profiles_role_check';

-- ========================================
-- OPCIONAL: Convertir a ENUM para mejor control de tipos
-- (descomenta si quieres una solución más robusta)
-- ========================================

-- Crear el tipo ENUM
-- CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'CUSTOMER', 'AREA_LEAD');

-- Cambiar la columna a ENUM
-- ALTER TABLE profiles ALTER COLUMN role TYPE user_role_enum USING role::user_role_enum;
