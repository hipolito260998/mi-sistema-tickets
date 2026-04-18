# 🔧 Guía de Troubleshooting - Panel de Administración de Usuarios

## ❌ Problema: Los cambios de Rol y Área no se guardan en la BD

Si al intentar editar un usuario, los cambios no se guardan en la base de datos, es porque falta configurar las **Políticas RLS (Row Level Security)** de Supabase.

---

## ✅ Solución: Ejecutar Políticas SQL

### **Paso 1: Abre Supabase Console**
1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (en el menú izquierdo)

### **Paso 2: Copia el SQL**
Abre el archivo `sql/rls-policies.sql` en tu proyecto y copia TODO el contenido

### **Paso 3: Ejecuta en Supabase**
1. En el **SQL Editor**, crea una nueva query
2. Pega el contenido completo
3. Click en **"RUN"** (botón azul)

### **Paso 4: Verificación**
En el terminal, ejecuta:
```bash
npm run dev
```

Intenta editar un usuario como ADMIN:
- El cambio debería guardarse ✅
- En los logs del navegador deberías ver: `[UserManagement] Cambios guardados exitosamente`

---

## 🧪 Troubleshooting Adicional

Si sigue sin funcionar:

### **1. Verificar si las políticas existen**
En Supabase SQL Editor, ejecuta:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Deberías ver al menos 7 políticas. Si no hay, el SQL no se ejecutó correctamente.

### **2. Eliminar políticas conflictivas**
Si hay duplicadas, elimínalas primero:
```sql
DROP POLICY IF EXISTS "Users can see own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can see all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
```

Luego ejecuta el SQL completo de nuevo.

### **3. Verificar que RLS está habilitado**
En Supabase, ve a:
- **Authentication** → **Policies**
- Busca la tabla `profiles`
- Verifica que el toggle de "RLS" esté **encendido** (azul/verde)

---

## 📊 Políticas Explicadas

| Política | Qué hace |
|----------|----------|
| `Users can see own profile` | Cada usuario ve su propio perfil |
| `Admin can see all profiles` | Admins ven todos los perfiles |
| `Users can update own profile` | Usuarios pueden editar su perfil |
| **`Admin can update any profile`** | **⭐ IMPORTANTE: Admins pueden cambiar role y area** |
| `Admin can insert profiles` | Admins pueden crear perfiles |
| `Admin can delete profiles` | Admins pueden eliminar perfiles |

La política **`Admin can update any profile`** es la crucial para que el panel funcione.

---

## 💡 Tips

- **Los cambios requieren recarga**: El usuario debe recargar el navegador para ver los cambios
- **Solo ADMIN puede cambiar roles**: La política lo asegura
- **Los cambios se aplican inmediatamente en la tabla `profiles`**

---

## 🆘 Si AÚN no funciona

1. Abre la **Consola del Navegador** (F12 → Console)
2. Intenta editar un usuario
3. Busca los logs: `[UserManagement] Guardando cambios...`
4. Copia el error exacto y comparte

---

## 📝 Próximos Pasos

Una vez que funcione:
1. ✅ Admin puede ver tabla de usuarios
2. ✅ Admin puede editar rol de usuarios
3. ✅ Admin puede asignar área a usuarios
4. ✅ Los cambios se guardan en BD
5. ⏳ Usuario debe recargar para ver los cambios en su dashboard
