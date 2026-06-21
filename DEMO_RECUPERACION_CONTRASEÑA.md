# 📋 Guía de Demostración — Recuperación de Contraseña

**Proyecto:** BarberPro TFG  
**Fecha:** Junio 2026  
**Requisito:** Point 3 (Autenticación y autorización — incluye recuperación de contraseña)

---

## 1️⃣ Requisitos Previos

Asegúrate de tener:
- **Node.js** v20+ instalado (`node --version`)
- **Docker Desktop** ejecutándose (para la BD Postgres)
- **Git** configurado
- El proyecto clonado en `C:\Users\gnomo\Desktop\TFG\`

---

## 2️⃣ Paso 1: Inicia la Base de Datos PostgreSQL

Abre una **primera terminal**:

```bash
cd C:\Users\gnomo\Desktop\TFG
docker-compose up -d
```

**Espera 3-5 segundos** (para que Postgres esté listo), luego verifica:

```bash
docker ps | grep tfg_peluqueria_db
```

Deberías ver:
```
119904fc4fa3   postgres:16-alpine   "docker-entrypoint.s…"   X seconds ago   Up Y seconds   0.0.0.0:5432->5432/tcp
```

**✅ PostgreSQL está listo** cuando el estado dice `Up` (verde).

---

## 3️⃣ Paso 2: Inicia el Backend (NestJS)

Abre una **nueva terminal (NO la misma)**:

```bash
cd C:\Users\gnomo\Desktop\TFG\backend
npm install  # Solo si es la primera vez
npm run start:dev
```

**Espera a ver estos logs** (2-5 segundos):

```
[NestApplication] Nest application successfully started
🚀 API corriendo en: http://localhost:3000/api/v1
📚 Swagger docs: http://localhost:3000/api/docs
```

**Si falla con "EADDRINUSE":** algún proceso ocupa el puerto 3000. En PowerShell:
```bash
netstat -ano | findstr ":3000"
# Anota el PID (número de la última columna)
taskkill /PID <PID> /F
```

Luego reintenta `npm run start:dev`.

---

## 4️⃣ Paso 3: Inicia el Frontend (Angular)

Abre una **tercera terminal**:

```bash
cd C:\Users\gnomo\Desktop\TFG\frontend
npm install  # Solo si es la primera vez
npm start
```

**Espera a ver** (5-10 segundos):

```
✔ Building...
Angular development server running on http://localhost:4200/
```

---

## 5️⃣ Paso 4: Abre el Navegador

En **Firefox** o **Chrome** (no Edge, que es problemático con los tipos de datos):

```
http://localhost:4200/login
```

Deberías ver la pantalla de login con:
- Logo de BarberPro (tijeras doradas)
- Campos de email y contraseña
- **Enlace "¿Olvidaste tu contraseña?"** (es lo nuevo)

---

## 6️⃣ Paso 5: Flujo de Recuperación — Parte 1 (Solicitud)

### Haz clic en "¿Olvidaste tu contraseña?"

**Deberías ver:**
- URL cambiada a `http://localhost:4200/forgot-password`
- Pantalla con título **"¿Olvidaste tu contraseña?"**
- Campo para introducir email
- Botón **"Enviar enlace de recuperación"**

### Introduce un email

Cualquiera de estos usuarios ya existe en la BD (seeded):

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@peluqueria.com` | `admin123` | ADMIN |
| `usuario@peluqueria.com` | `usuario123` | USER |
| `empleado@peluqueria.com` | `empleado123` | EMPLEADO |

**Recomendación:** usa `admin@peluqueria.com` (es el más seguro para una defensa).

Introduce: `admin@peluqueria.com`  
Haz clic en **"Enviar enlace de recuperación"**

### Mira la Respuesta

**Pantalla del Frontend:**
- El botón muestra spinner y dice **"Enviando..."**
- Después de 1-2 segundos aparece un mensaje de éxito:
  - ✅ Icono de visto
  - "Revisa tu correo"
  - "Si el email introducido existe en nuestro sistema, recibirás un enlace de recuperación válido durante 15 minutos."

**Logs del Backend (terminal 2):**

Busca esta sección (al final):

```
========================================
📧 Simulación de email — Recuperación de contraseña
Para: admin@peluqueria.com
Enlace (válido 15 min): http://localhost:4200/reset-password?token=abc123def456...
========================================
```

**⚠️ IMPORTANTE:** copia el **token largo** (la cadena hexadecimal de 64 caracteres).

---

## 7️⃣ Paso 6: Flujo de Recuperación — Parte 2 (Reset)

### Abre la URL con el Token

En la misma pestaña del navegador, **pega manualmente** o navega a:

```
http://localhost:4200/reset-password?token=<PEGA_EL_TOKEN_AQUI>
```

**Ejemplo completo:**
```
http://localhost:4200/reset-password?token=c4a839fdd0fd6761fb6e343920b9a23014b5ba1390597cb1999b23488efcef71
```

### Deberías ver

- URL con el token en la barra de direcciones
- Pantalla con título **"Restablece tu contraseña"**
- Dos campos:
  - **"Nueva contraseña"** (con icono de ojo para mostrar)
  - **"Confirma la contraseña"**
- Botón **"Restablecer contraseña"**

### Introduce una Nueva Contraseña

Introduce cualquier contraseña con **mínimo 6 caracteres**:

- Campo 1: `prueba123`
- Campo 2: `prueba123` (igual)

**Validación en vivo:**
- Si las contraseñas no coinciden → texto rojo: "Las contraseñas no coinciden"
- Si < 6 caracteres → texto rojo: "La contraseña debe tener al menos 6 caracteres"

Una vez ambos campos sean válidos, el botón se activa.

### Haz clic en "Restablecer contraseña"

**Pantalla del Frontend:**
- Botón muestra spinner: **"Guardando..."**
- Después de 1-2 segundos aparece:
  - ✅ Checkmark verde grande
  - Título: **"¡Contraseña actualizada!"**
  - Subtítulo: "Te redirigimos al inicio de sesión..."
  - Automáticamente te redirige a `/login` después de 2.5 segundos

---

## 8️⃣ Paso 7: Verifica que Funciona

### Intenta Login con la Nueva Contraseña

**Email:** `admin@peluqueria.com`  
**Contraseña:** `prueba123` (la que acabas de establecer)

**Resultado esperado:**
- ✅ Login exitoso
- Redirección al dashboard admin
- Ves el sidebar con opciones (Inicio, Horarios, Citas, Servicios, Empleados)

**En los logs del backend deberías ver:**
```
[RouterExplorer] Mapped {/api/v1/auth/login, POST} route
[RouterExplorer] Mapped {/api/v1/auth/forgot-password, POST} route
[RouterExplorer] Mapped {/api/v1/auth/reset-password, POST} route
```

---

## 9️⃣ Paso 8: Seguridad — Token de Un Solo Uso

Para demostrar que el token **se consume** (no se puede reutilizar):

### En la consola/terminal del backend (donde ves los logs):

Busca la línea anterior con el token. Cópialo de nuevo.

### En el navegador (Developer Tools → Console)

Abre la consola del navegador (F12) y ejecuta:

```javascript
fetch('http://localhost:3000/api/v1/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'c4a839fdd0fd6761fb6e343920b9a23014b5ba1390597cb1999b23488efcef71',  // el token anterior
    newPassword: 'otraClave456'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

**Resultado esperado:**
```json
{
  "message": "El enlace de recuperación no es válido o ha expirado",
  "error": "Bad Request",
  "statusCode": 400
}
```

**¿Qué significa?** El token ya fue consumido en el paso anterior. No se puede reutilizar. ✅ (Feature de seguridad)

---

## 🔟 Paso 9: Valida en la Base de Datos (Opcional, pero impresionante)

Abre otra terminal y conecta a Postgres directamente:

```bash
docker exec tfg_peluqueria_db psql -U postgres -d peluqueria -c "SELECT id, email, reset_password_token, reset_password_expires FROM usuarios WHERE email='admin@peluqueria.com';"
```

**Resultado esperado:**

```
 id |         email         | reset_password_token | reset_password_expires
----+-----------------------+----------------------+------------------------
  1 | admin@peluqueria.com  | null                 | null
```

**¿Por qué `null`?** Porque se consumió el token. En una defensa, esto **demuestra que la BD se limpió correctamente** después del reset. ✅

---

## ⚠️ Troubleshooting

### "Network Error" / "Cannot GET /reset-password"

**Causa:** El frontend no está corriendo o no compiló bien.

**Solución:**
1. Terminal del frontend (`npm start`) debe decir "Angular development server running"
2. Si viste errores de compilación, arregla el TypeScript y recarga la página

### "Bad Request" al hacer forget-password

**Causa:** Email vacío o formato inválido.

**Solución:** Introduce un email válido (ej. `admin@peluqueria.com`)

### No ves el enlace en los logs del backend

**Causa:** Terminal del backend no está abierta o se cerró.

**Solución:** 
1. Abre una nueva terminal
2. `cd backend && npm run start:dev`
3. Vuelve a hacer forget-password desde el frontend

### "EADDRINUSE" al iniciar backend

**Causa:** Puerto 3000 ya está en uso.

**Solución:**
```bash
netstat -ano | grep ":3000"
taskkill /PID <el_numero> /F
# Intenta de nuevo
```

### Contraseña "no valida" tras reset

**Causa:** Login usando credencial vieja (antes del reset).

**Solución:** Recuerda que cambiaste la contraseña. Usa la nueva. Si olvidaste cuál fue, repite el flujo desde el paso 5 con otra contraseña.

---

## 📝 Notas para la Defensa

1. **Empieza con Docker y espera a que esté ready** — tómate 30 segundos
2. **Abre las 3 terminales lado a lado** para que se vea que todo está corriendo
3. **Ten la guía a mano** — imprime este archivo o ten un segundo monitor
4. **Práctica previa** — haz este flujo 2-3 veces antes de la defensa para no titubear
5. **Explica while you demo:**
   - "El backend genera un token SHA-256 y lo almacena hasheado en BD"
   - "El enlace que se imprime en consola simula un email real"
   - "El frontend valida el token y la coincidencia de contraseñas antes de permitir el reset"
   - "El token se consume (un solo uso) para seguridad"
6. **Muestra la BD** si el tribunal pregunta — conecta a Postgres al final para verificar que los datos se guardaron correctamente

---

## 🎯 Checklist Final (antes de defender)

- [ ] Docker corriendo
- [ ] Backend en `npm run start:dev` sin errores
- [ ] Frontend en `npm start` sin errores de compilación
- [ ] Navegador abre `http://localhost:4200/login` sin problemas
- [ ] Ves el enlace "¿Olvidaste tu contraseña?" en el login
- [ ] Flujo completo (forgot → reset → login) funciona
- [ ] Token de un solo uso rechaza reutilización
- [ ] Has practicado 2-3 veces sin mirar la guía

---

**¡Listo! Ahora tienes un flujo completo y seguro de recuperación de contraseña para demostrar en la defensa. 🚀**