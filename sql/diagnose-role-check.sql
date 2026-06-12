-- ========================================
-- DIAGNOSTICAR RESTRICCIÓN CHECK
-- Ejecuta esto en Supabase SQL Editor
-- ========================================

-- Ver todas las restricciones de la tabla profiles
SELECT constraint_name, constraint_type, table_name
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

-- Ver los detalles de la restricción CHECK
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%role%';

-- Ver los valores actuales de role en la tabla
SELECT DISTINCT role FROM profiles ORDER BY role;

-- Ver la definición de la columna role
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';
