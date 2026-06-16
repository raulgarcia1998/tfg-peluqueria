# AGENTS.md — Documentación de la Aplicación TFG Peluquería/Barbería

> Este archivo está pensado para que Claude lo lea al inicio de cada sesión y tenga contexto completo del proyecto sin necesidad de explorar el código desde cero.

---

## 1. Descripción del proyecto

Plataforma web de gestión de citas en tiempo real para una peluquería/barbería (Trabajo de Fin de Grado). Dos tipos de usuarios:

- **Clientes**: se registran, consultan servicios, eligen fecha y hora en un calendario interactivo y reservan citas.
- **Administradores / Empleados**: gestionan empleados (usuarios con rol EMPLEADO), servicios, horarios laborales y el estado de las citas.

---

## 2. Stack tecnológico (con versiones reales)

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Angular (standalone components, Angular Signals) | 21.2 |
| Frontend | Tailwind CSS | 3.4 |
| Frontend | jwt-decode | 4 |
| Frontend | Vitest | 4 |
| Backend | NestJS | 11 |
| Backend | TypeORM | 0.3.28 |
| Backend | @nestjs/jwt + Passport-JWT | — |
| Backend | bcrypt | 6 |
| Backend | class-validator + class-transformer | — |
| Backend | Swagger (@nestjs/swagger) | — |
| Backend | TypeScript | 5.7 |
| Base de datos | PostgreSQL | 16 |
| Orquestación | docker-compose | v3.9 |

---

## 3. Estructura de carpetas

```
TFG - copia/
├── backend/
│   └── src/
│       ├── auth/
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.module.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       ├── usuarios/
│       │   └── entities/
│       │       └── user.entity.ts
│       ├── citas/
│       │   ├── citas.controller.ts
│       │   ├── citas.service.ts
│       │   ├── citas.repository.ts
│       │   ├── dto/
│       │   └── entities/
│       │       └── cita.entity.ts
│       ├── servicios/
│       │   └── entities/
│       │       └── servicio.entity.ts
│       ├── horarios/
│       │   ├── entities/
│       │   │   ├── horario.entity.ts
│       │   │   └── franja-horaria.entity.ts
│       │   ├── horarios.controller.ts
│       │   ├── horarios.service.ts
│       │   └── horarios.module.ts
│       ├── common/
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── roles.guard.ts
│       │   └── decorators/
│       │       └── roles.decorator.ts
│       ├── app.module.ts
│       └── main.ts
├── frontend/
│   └── src/
│       └── app/
│           ├── core/
│           │   ├── config/
│           │   │   └── navigation.routes.ts   ← config centralizada de navegación
│           │   ├── guards/
│           │   │   ├── auth.guard.ts
│           │   │   └── role.guard.ts
│           │   ├── interceptors/
│           │   │   ├── auth.interceptor.ts
│           │   │   └── error.interceptor.ts
│           │   ├── models/
│           │   │   └── horario.model.ts        ← FranjaHoraria, BloqueDisponibilidad, etc.
│           │   └── services/
│           │       ├── auth.service.ts
│           │       ├── citas.service.ts
│           │       ├── horario.service.ts
│           │       └── servicios.service.ts
│           ├── features/
│           │   ├── auth/
│           │   │   ├── login/
│           │   │   └── register/
│           │   ├── dashboard-user/
│           │   │   ├── user-home/
│           │   │   ├── calendario-citas/
│           │   │   └── mis-citas/
│           │   └── dashboard-admin/
│           │       ├── admin-home/
│           │       ├── citas-crud/
│           │       ├── servicios-crud/
│           │       ├── empleados-crud/
│           │       └── horario/
│           ├── shared/
│           │   └── components/
│           │       ├── header/
│           │       └── access-denied/
│           ├── app.routes.ts
│           └── app.config.ts
├── src/
│   └── environments/
│       └── environment.ts          ← apiUrl: 'http://localhost:3000/api/v1'
├── docker-compose.yml
├── .env
└── README.md
```

---

## 4. Modelo de dominio (4 entidades TypeORM)

### `User` — tabla `usuarios`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | PK | autoincrement |
| nombre | string | |
| apellidos | string | |
| email | string | único |
| password | string | hash bcrypt; excluido del SELECT por defecto (`select: false`) |
| telefono | string? | opcional |
| rol | enum | `USER` (default) / `ADMIN` / `EMPLEADO` |
| createdAt | timestamp | |
| updatedAt | timestamp | |
| citas | Cita[] | relación OneToMany |

> **IMPORTANTE**: los empleados NO son una entidad aparte. Son `User` con `rol = 'EMPLEADO'`.

---

### `Cita` — tabla `citas`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | PK | |
| usuarioId | FK | cliente |
| empleadoId | FK | empleado; `SET NULL` si el empleado se borra |
| servicioId | FK | |
| usuario | ManyToOne | CASCADE |
| empleado | ManyToOne | SET NULL |
| servicio | ManyToOne | |
| fechaHora | timestamptz | |
| estado | enum | `PENDIENTE` (default) / `CONFIRMADA` / `CANCELADA` / `COMPLETADA` |
| notas | string? | opcional |
| precioFinal | decimal(10,2)? | opcional |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `Servicio` — tabla `servicios`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | PK | |
| nombre | string | |
| descripcion | string? | opcional |
| precio | decimal(10,2) | |
| duracionMin | number | en minutos |
| categoria | enum | `CORTE` / `COLOR` / `TRATAMIENTO` / `BARBA` / `OTROS` (default) |
| fotoUrl | string? | opcional |
| activo | boolean | `true` por defecto; borrado lógico |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `HorarioLaboral` — tabla `horarios_laborales`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | PK | |
| fecha | date | **`unique`** — un único registro por día |
| horaInicio | string? | `@deprecated`, legacy, solo para compatibilidad con datos antiguos |
| horaFin | string? | `@deprecated`, legacy, solo para compatibilidad con datos antiguos |
| duracionCorteMin | number | default 30 — duración de cada slot de cita |
| activo | boolean | default `true` |
| franjas | `FranjaHoraria[]` | `OneToMany`, `cascade: true`, `eager: true` |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### `FranjaHoraria` — tabla `franjas_horarias`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | PK | |
| horarioId | FK | `ManyToOne` → `HorarioLaboral`, `onDelete: CASCADE` |
| horaInicio | string | formato `"HH:mm"` |
| horaFin | string | formato `"HH:mm"` |
| orden | number | orden del bloque dentro del día (0 = primero) |
| createdAt | timestamp | |
| updatedAt | timestamp | |

> **Turnos partidos**: un único `HorarioLaboral` por fecha (constraint `unique` en `fecha`) puede tener **varias `FranjaHoraria`** (p.ej. `09:00-14:00` y `16:00-19:00`), dejando libre la franja de descanso entre bloques. `CreateHorarioDto`/`FranjaDto` están validados con `class-validator` (`@Matches` para formato `HH:mm`, `@ValidateNested` + `@Type` para el array anidado) — **necesario** porque el `ValidationPipe` global usa `forbidNonWhitelisted: true` y rechaza cualquier DTO sin decoradores.

---

## 5. API REST

- **Prefijo global**: `/api/v1`
- **Swagger UI**: `http://localhost:3000/api/docs`
- **CORS**: habilitado desde `FRONTEND_URL`
- **ValidationPipe global**: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`

### Auth (rutas públicas)

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| POST | `/auth/login` | — | `{ access_token, user }` |
| POST | `/auth/register` | — | `{ access_token, user }` |

### Usuarios

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| GET | `/usuarios/:id` | JWT | autenticado |

### Citas (todas requieren JWT)

| Método | Ruta | Auth | Rol / Notas |
|--------|------|------|-------------|
| GET | `/citas` | JWT | Solo `ADMIN`; filtros query: `estado`, `fechaDesde`, `fechaHasta`, `servicioId`, `search` |
| GET | `/citas/mis-citas` | JWT | Autenticado (devuelve las propias) |
| GET | `/citas/:id` | JWT | Autenticado |
| POST | `/citas` | JWT | Autenticado |
| PATCH | `/citas/:id` | JWT | Dueño de la cita o `ADMIN` |
| PATCH | `/citas/:id/estado` | JWT | `ADMIN` o `EMPLEADO` |
| DELETE | `/citas/:id` | JWT | Solo `ADMIN` |

### Servicios

| Método | Ruta | Auth | Rol |
|--------|------|------|-----|
| GET | `/servicios` | — | Público |
| GET | `/servicios/:id` | — | Público |
| POST | `/servicios` | JWT | `ADMIN` |
| PATCH | `/servicios/:id` | JWT | `ADMIN` |
| DELETE | `/servicios/:id` | JWT | `ADMIN` |

### Horarios

| Método | Ruta | Auth | Rol / Notas |
|--------|------|------|-------------|
| GET | `/horarios` | JWT | `ADMIN`; query: `anio`, `mes` |
| POST | `/horarios` | JWT | `ADMIN` |
| PUT | `/horarios/:id` | JWT | `ADMIN` |
| DELETE | `/horarios/:id` | JWT | `ADMIN` |
| GET | `/horarios/disponibilidad/dia/:fecha` | — | Público; query: `duracion` |
| GET | `/horarios/disponibilidad/mes` | — | Público; query: `anio`, `mes` |

---

## 6. Autenticación y autorización

### Backend

- **JWT Bearer** con secret `JWT_SECRET` y expiración `JWT_EXPIRES_IN` (default: `7d`).
- **Payload JWT**: `{ sub, email, rol }`.
- `JwtStrategy` (Passport) valida el token en cada petición protegida.
- Guards: `JwtAuthGuard` (verifica JWT) + `RolesGuard` (verifica rol con decorador `@Roles(...roles)`).
- Roles disponibles: `USER`, `ADMIN`, `EMPLEADO`.
- Contraseñas con **bcrypt** (10 rondas de sal).

### Frontend

- Token almacenado en `localStorage` bajo la clave `tfg_peluqueria_token`.
- Decodificado con `jwt-decode` (v4).
- `authInterceptor` (`core/interceptors/auth.interceptor.ts`): añade `Authorization: Bearer {token}` a cada petición.
- `errorInterceptor` (`core/interceptors/error.interceptor.ts`):
  - `401` → logout automático
  - `403` → redirige a `/acceso-denegado`
  - `404` / `5xx` → log de error
- `authGuard` (`core/guards/auth.guard.ts`): verifica que el usuario esté autenticado y el token no haya expirado.
- `roleGuard` (`core/guards/role.guard.ts`): compara el rol del usuario con `data.roles` de la ruta.
- `AuthService` (`core/services/auth.service.ts`) usa **Angular Signals**: `currentUser`, `isAuthenticated`, `isAdmin`.
- `restoreSession()`: al iniciar la app, recupera el perfil completo con `GET /usuarios/{id}`.

---

## 7. Reglas de negocio del calendario

### Disponibilidad por día

Función `getDisponibilidadDia(fecha, duracionSolicitada)` en `horarios.service.ts`:

1. Busca el único `HorarioLaboral` activo para el día (constraint `unique` en `fecha`) con sus `franjas` (eager).
2. Para cada `FranjaHoraria` (bloque), genera slots en intervalos de **15 minutos**, respetando el hueco de descanso entre bloques.
3. Para cada slot de inicio, comprueba que la duración solicitada **cabe completa** sin solaparse con citas existentes.
4. Regla de solapamiento: `A < D && C < B` (donde `[A,B]` es el slot propuesto y `[C,D]` es la cita existente).
5. Devuelve `{ bloques: [{ horaInicio, horaFin, slots[] }], slots: [...] }` — `bloques` agrupa por franja (para que el frontend pinte separadores entre turnos), `slots` es la lista plana (retrocompatibilidad).
6. `getFranjasEfectivas()`: si el horario no tiene `franjas` pero sí los campos legacy `horaInicio`/`horaFin`, construye una franja virtual para compatibilidad con datos antiguos.

### Disponibilidad mensual

Función `getDiasDisponiblesMes(anio, mes)` en `horarios.service.ts`:

- Para cada día con horario activo, suma los slots totales de **todas** sus franjas (`Math.floor(minutos / duracionCorteMin)` por franja).
- Cuenta las citas activas del día (excluye `CANCELADA`/`COMPLETADA`) y calcula `ratio = ocupados / totalSlots`.
- `ratio >= 1` → `lleno`; `ratio >= 0.75` → `parcial`; resto → `disponible`.
- Usa el helper privado `rangoMes(anio, mes)` para calcular el **último día real del mes** (28/29/30/31) en vez de asumir `"31"` fijo — la columna `fecha` es de tipo `date` en Postgres y rechaza fechas inexistentes como `"2026-06-31"` con un error 500 (`date/time field value out of range`). Este mismo helper se usa también en `findAll()`.

### Detección de conflictos en citas

Función `hasConflict(empleadoId, fechaHora, duracionMin, excludeId?)` en `citas.repository.ts`:

- Detecta solapamientos para un empleado dado.
- Ignora citas con estado `CANCELADA` o `COMPLETADA`.
- Se invoca desde:
  - `CitasService.create()` → siempre.
  - `CitasService.update()` → solo si cambia fecha o empleado.
- Duración por defecto: **30 minutos**.

### Estados del calendario en la UI

| Estado | Significado |
|--------|-------------|
| `disponible` | Hay huecos libres |
| `parcial` | Quedan pocos huecos |
| `lleno` | Sin huecos disponibles |
| `cerrado` | No hay horario para ese día |

---

## 8. Flujo de reserva del cliente

Componente: `frontend/src/app/features/dashboard-user/calendario-citas/calendario-citas.component.ts`

**4 pasos en un wizard**:

1. **Seleccionar servicios**: el cliente elige uno o varios servicios. Duración total y precio total se calculan con `computed` signals.
2. **Calendario mensual**: muestra el estado de cada día (disponible / parcial / lleno / cerrado) consultando `GET /horarios/disponibilidad/mes`.
3. **Seleccionar hora**: modal con los slots horarios del día según la duración total calculada, vía `GET /horarios/disponibilidad/dia/:fecha?duracion=N`.
4. **Confirmar reserva**: modal con campo de notas opcionales y botón de confirmación; llama a `POST /citas`.

> Si el usuario no ha iniciado sesión al intentar reservar, se redirige a `/login?returnUrl=/reservar`.

---

## 9. Cómo ejecutar el proyecto

### Variables de entorno (solo nombres, nunca valores)

```
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
JWT_SECRET
JWT_EXPIRES_IN
PORT
FRONTEND_URL
NODE_ENV
```

Definir en el archivo `.env` en la raíz del proyecto.

### Con Docker Compose

```bash
docker compose up --build
```

| Servicio | URL / Puerto |
|----------|-------------|
| Frontend | http://localhost:4200 |
| API | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/api/docs |
| PostgreSQL | host `5433` → contenedor `5432` |
| Volumen BD | `pgdata` |

> **Advertencia**: actualmente no existen `Dockerfile` propios en `backend/` ni `frontend/` (ver sección 11). El comando `docker compose up --build` fallará hasta crearlos.

### Sin Docker (desarrollo local)

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend (en otra terminal)
cd frontend
npm install
npm start
```

Ajustar `DB_PORT` a `5432` si PostgreSQL corre localmente.

### Scripts disponibles

**Backend** (`backend/package.json`):

```
build         → nest build
start:dev     → arranque con hot-reload
start:prod    → producción
test          → jest
test:e2e      → jest e2e
lint          → eslint
format        → prettier
```

**Frontend** (`frontend/package.json`):

```
start         → ng serve
build         → ng build
watch         → ng build --watch
test          → ng test / vitest
```

> TypeORM usa `synchronize: true` en entornos no-producción (crea/actualiza el esquema automáticamente). `autoLoadEntities: true` está habilitado.

---

## 10. Convenciones para el agente

- **Idioma del dominio**: el código usa español para entidades, DTOs y rutas (`cita`, `servicio`, `horario`, `usuario`). Mantener esa nomenclatura en cualquier adición.
- **Frontend**: usar exclusivamente **standalone components** y **Angular Signals**. No introducir NgModules ni NgRx. Los servicios son singletons en `core/services/`. Estilos con Tailwind CSS.
- **Backend**: arquitectura modular NestJS. DTOs siempre validados con `class-validator` / `class-transformer`. El módulo `citas` sigue el patrón repositorio (`citas.repository.ts`).
- **Secretos**: nunca introducir valores de secretos en el repositorio; usar siempre variables de entorno.
- **Empleados**: recordar que son `User` con `rol = 'EMPLEADO'`; no crear una entidad `Empleado` separada.

---

## 11. Estado actual y limitaciones conocidas

| # | Limitación | Detalle |
|---|-----------|---------|
| 1 | **Sin Dockerfiles propios** | No existen `Dockerfile` en `backend/` ni `frontend/`. `docker compose up --build` fallará; hay que crearlos antes de usar Docker. |
| 2 | **`empleadoId` hardcoded** | En `calendario-citas.component.ts` (~línea 212) el `empleadoId` está fijado a `1`. La selección de peluquero no está conectada de extremo a extremo en la reserva. |
| 3 | **Sin migraciones formales** | El esquema se gestiona con `synchronize: true` (riesgo en producción). Sí existen **seeds** en `app.service.ts` (`onModuleInit`): crea admin (`admin@peluqueria.com` / `admin123`), servicios iniciales y horarios de los próximos 7 días si no existen. |
| 4 | **Sin repositorio git ni CI** | El proyecto no está inicializado como repositorio git y no tiene pipeline de integración continua. |
| 5 | **Backend en modo watch puede desincronizarse** | Tras varias ediciones rápidas en `horarios.service.ts` se observó que el proceso de `nest start --watch` dejó de recompilar (servía código de `dist/` desactualizado). Si los cambios en el backend no surten efecto, reiniciar el proceso manualmente. |

### Bugs corregidos recientemente (sistema de turnos partidos)

| Bug | Causa | Fix |
|-----|-------|-----|
| `Error al guardar` al crear/editar horarios | `CreateHorarioDto`/`FranjaDto` sin decoradores de `class-validator`; el `ValidationPipe` global (`forbidNonWhitelisted: true`) rechazaba **todas** las propiedades del body. | Se añadieron decoradores (`@IsString`, `@Matches(/^([01]\d\|2[0-3]):([0-5]\d)$/)`, `@ValidateNested`, `@Type(() => FranjaDto)`, etc.) a ambos DTOs en `horarios.service.ts`. |
| 500 Internal Server Error en `GET /horarios/disponibilidad/mes` para meses sin día 31 (junio, abril, septiembre, noviembre, febrero) | El código construía el fin de mes como `` `${anio}-${mes}-31` `` fijo; Postgres rechaza fechas inválidas como `"2026-06-31"` en una columna `date`. | Helper `rangoMes(anio, mes)` que calcula el último día real del mes con `new Date(anio, mes, 0).getDate()`. Usado en `findAll()` y `getDiasDisponiblesMes()`. |
| Horarios duplicados para la misma fecha (varios `HorarioLaboral` con igual `fecha`) | `seedHorarios()` en `app.service.ts` calculaba `mes = new Date().getMonth()` (índice 0) pero lo pasaba a `findAll(anio, mes)`, que espera el mes 1-indexado. Cada reinicio del backend creía que no había horarios ese mes y volvía a sembrarlos. | Corregido a `mes = new Date().getMonth() + 1`. Se depuraron las filas duplicadas existentes en BD y se añadió `unique: true` a la columna `fecha` de `HorarioLaboral` para impedir que vuelva a ocurrir. |

### Refactorización de navegación (Header / Sidebars)

- Configuración centralizada en `frontend/src/app/core/config/navigation.routes.ts`: arrays `USER_ROUTES`, `ADMIN_ROUTES`, `HEADER_ROUTES`, cada ruta con `path`, `label`, `iconType` (string identificador del icono, no SVG embebido) y `roles`.
- `HeaderComponent`, `DashboardUserComponent` (sidebar de usuario) y `DashboardAdminComponent` (sidebar de admin) consumen estos arrays con `@for` en vez de enlaces `<a routerLink>` hardcodeados y repetidos.
- Los iconos SVG siguen definidos inline en los templates (vía `ngSwitch` sobre `iconType`) para evitar `[innerHTML]` sin sanitizar.
- `HeaderComponent.visibleRoutes` (computed) filtra `HEADER_ROUTES` según `isAdmin()` / `isAuthenticated()`.
