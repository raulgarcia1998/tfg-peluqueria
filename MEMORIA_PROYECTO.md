# Memoria del Proyecto – BarberPro
**Desarrollo de aplicaciones web**

**Autor:** Raúl García Segura  
**Profesor-coordinador:** Fernando Domingo Ruiz Meseguer  
**Centro:** IES José Planes, Espinardo – Murcia  
**Ciclo:** Técnico Superior en Desarrollo de Aplicaciones Web  
**Fecha:** Junio de 2026  

*Esta obra está bajo una licencia Creative Commons Reconocimiento-CompartirIgual 4.0 Internacional.*

---

## Agradecimientos

A Fernando, por la orientación continua durante el proyecto y por empujarnos a documentar el proceso tanto como el resultado. A los compañeros del ciclo, por el apoyo y por los muchos ratos de depuración compartidos.

---

## Índice

1. Resumen extendido  
2. Palabras clave  
3. Introducción  
4. Estado del arte / trabajos relacionados  
5. Análisis de objetivos y metodología  
6. Diseño y resolución del trabajo realizado  
7. Presupuesto  
8. Conclusiones y vías futuras  
9. Bibliografía / Webgrafía  

---

## 1. Resumen extendido

BarberPro es una aplicación web completa para la gestión integral de peluquerías y barberías. Permite a los clientes consultar servicios disponibles y reservar citas en tiempo real, mientras que los empleados disponen de una agenda visual semanal y los administradores cuentan con un panel de control desde el que gestionan citas, servicios, horarios laborales y usuarios del sistema.

La aplicación está construida con una arquitectura desacoplada: un backend REST desarrollado con **NestJS** y **PostgreSQL**, y un frontend Single Page Application (SPA) desarrollado con **Angular 21** y **Tailwind CSS**. Toda la API está documentada con **Swagger/OpenAPI 3.0** y el proyecto incluye un pipeline de integración continua con **GitHub Actions** que ejecuta los tests automatizados en cada push. La gestión de autenticación se realiza mediante **JWT** con roles diferenciados (cliente, empleado, administrador) y contraseñas almacenadas con **bcrypt**.

---

## 2. Palabras clave

peluquería · reservas · gestión de citas · Angular · NestJS · TypeORM · PostgreSQL · JWT · REST API · Tailwind CSS · Docker · CI/CD · GitHub Actions · roles · agenda

---

## 3. Introducción

El proyecto surgió al detectar que muchas peluquerías pequeñas y medianas siguen gestionando sus citas por teléfono o a través de aplicaciones de mensajería como WhatsApp, lo que genera pérdida de tiempo tanto para el negocio como para el cliente, errores de coordinación entre empleados y dificultad para llevar un control histórico de las reservas.

BarberPro nace como solución a este problema: una plataforma web accesible desde cualquier dispositivo que digitaliza el ciclo completo de una cita, desde la reserva por parte del cliente hasta su confirmación, realización y archivo por parte del equipo de la peluquería.

Los objetivos principales del proyecto son:

- Ofrecer al cliente un sistema de reserva online intuitivo, disponible 24/7.
- Proporcionar a los empleados una vista clara de su agenda diaria y semanal.
- Dar al administrador control total sobre usuarios, servicios, horarios y métricas del negocio.
- Implementar buenas prácticas de desarrollo web: API REST documentada, autenticación segura, pruebas automatizadas, despliegue dockerizado y accesibilidad WCAG 2.1.

---

## 4. Estado del arte / trabajos relacionados

Se analizaron las siguientes plataformas del sector antes de comenzar el desarrollo:

### 4.1 Fresha (anteriormente Shedul)
**Web:** fresha.com  
Fresha es uno de los sistemas de reservas más usados en salones de belleza a nivel mundial. Ofrece gestión de citas, punto de venta (TPV), nóminas y marketing. Su principal fortaleza es la integración con pagos online y una app móvil nativa.  
**Debilidad:** la versión gratuita limita funciones avanzadas y la personalización es escasa. Está orientada a grandes cadenas, no a negocios pequeños o independientes.  
**Oportunidad de BarberPro:** interfaz más sencilla, sin bloqueos de funciones, centrada en el flujo esencial.

### 4.2 SimplyBook.me
**Web:** simplybook.me  
Plataforma de reservas online con soporte para múltiples servicios y proveedores. Permite personalización del widget de reservas.  
**Debilidad:** curva de aprendizaje elevada para el administrador. La interfaz de configuración resulta poco intuitiva para usuarios no técnicos.  
**Oportunidad de BarberPro:** panel de administración diseñado expresamente para peluquerías, con terminología del sector.

### 4.3 Reservio
**Web:** reservio.com  
Solución europea con énfasis en simplicidad. Permite reservas desde redes sociales y Google.  
**Debilidad:** las funcionalidades de gestión interna (control de empleados, horarios partidos, agenda semanal visual) son limitadas en el plan gratuito.  
**Oportunidad de BarberPro:** gestión de franjas horarias partidas (p. ej. turno de mañana y tarde), agenda semanal por empleado y control de conflictos de horario, todo incluido en la versión base.

### 4.4 Valor añadido de BarberPro

| Característica | Fresha | SimplyBook | Reservio | BarberPro |
|---|---|---|---|---|
| Reserva online sin registro | ✓ | ✓ | ✓ | ✓ |
| Agenda visual semanal | ✓ | ✓ | — | ✓ |
| Franjas horarias partidas | — | ✓ | — | ✓ |
| Citas para clientes sin cuenta | — | — | — | ✓ |
| API REST documentada (Swagger) | — | — | — | ✓ |
| Código abierto (CC-BY-SA) | — | — | — | ✓ |
| Despliegue propio (self-hosted) | — | — | — | ✓ |

---

## 5. Análisis de objetivos y metodología

### 5.1 Metodología

El desarrollo se organizó en iteraciones semanales siguiendo una metodología ágil ligera. Cada semana se planificaba un conjunto de funcionalidades, se desarrollaban y se validaban antes de pasar a la siguiente. Se usó **Git** con ramas temáticas (`feature/`, `fix/`) y pull requests hacia `master`.

El repositorio se dividió desde el inicio en dos carpetas raíz independientes:
- `backend/` — API REST con NestJS
- `frontend/` — SPA con Angular

Esta separación facilita el despliegue independiente de cada capa y sigue el principio de separación de responsabilidades.

### 5.2 Objetivos y su resolución

**OBJETIVO 1. Autenticación y autorización segura**
Registro, login y recuperación de contraseña con tokens SHA-256 de un solo uso (15 min de validez). Contraseñas hasheadas con **bcrypt** (coste 10) y autenticación mediante **JWT** con estrategia Passport-JWT. Tres roles — `USER`, `EMPLEADO`, `ADMIN` — protegidos con guards en cada endpoint. Cabe destacar que se valoró devolver siempre una respuesta genérica en la recuperación de contraseña (práctica anti-enumeración), pero finalmente se optó por notificar al usuario cuando el email no existe, priorizando la usabilidad.

**OBJETIVO 2. CRUD completo con validación en ambas capas**
Todas las entidades principales tienen alta, baja lógica, modificación y listado. El backend valida los datos de entrada mediante DTOs con **class-validator**; el frontend usa `ReactiveFormsModule` con validadores síncronos y mensajes accesibles. Las citas incorporan además una validación de negocio: `CitasRepository.hasConflict()` impide reservar un empleado ya ocupado en ese rango horario.

**OBJETIVO 3. Paneles diferenciados por rol**
`authGuard` y `roleGuard` protegen las rutas `/user/*` y `/admin/*`. Los componentes se cargan con lazy loading (`loadComponent`) para reducir el bundle inicial. Empleados y administradores ven módulos adicionales (agenda semanal, CRUD de servicios, gestión de usuarios) que no aparecen para los clientes.

**OBJETIVO 4. API REST documentada**
Todos los endpoints siguen la convención `/api/v1/<recurso>`. La documentación **Swagger/OpenAPI 3.0** se genera automáticamente con decoradores `@nestjs/swagger` y está disponible en `/api/docs`.

**OBJETIVO 5. Base de datos normalizada**
Cinco entidades en **PostgreSQL** (`usuarios`, `citas`, `servicios`, `horarios_laborales`, `franjas_horarias`) con relaciones 1:N, claves foráneas y estrategias de borrado en cascada gestionadas por TypeORM.

**OBJETIVO 6. Interfaz responsive y accesible**
Diseño mobile-first con **Tailwind CSS**. Accesibilidad WCAG 2.1 implementada con `<label for>`, `aria-label`, `aria-invalid`, `aria-describedby`, `role="alert"`, skip-to-content link y navegación completa por teclado.

**OBJETIVO 7. Pruebas automatizadas y CI/CD**
**34 tests unitarios** en el backend (Jest) y **8 tests** en el frontend (Vitest). Pipeline **GitHub Actions** que ejecuta lint, tests y build de ambas capas en cada push o pull request.

---

## 6. Diseño y resolución del trabajo realizado

### 6.1 Arquitectura general

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)               │
│          Angular 21 SPA — Tailwind CSS              │
│  /login  /reservar  /user/*  /admin/*               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST + JWT
                       ▼
┌─────────────────────────────────────────────────────┐
│               BACKEND  (NestJS 11)                  │
│   /api/v1/auth  /citas  /servicios  /usuarios       │
│   /horarios                                         │
│   Swagger UI → /api/docs                           │
│   Guards: JwtAuthGuard · RolesGuard                │
└──────────────────────┬──────────────────────────────┘
                       │ TypeORM
                       ▼
┌─────────────────────────────────────────────────────┐
│           PostgreSQL 16  (Docker)                   │
│   usuarios · citas · servicios                      │
│   horarios_laborales · franjas_horarias             │
└─────────────────────────────────────────────────────┘
```

### 6.2 Modelo de base de datos

**Tabla: usuarios**
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PK | Identificador único |
| nombre | VARCHAR | Nombre del usuario |
| apellidos | VARCHAR | Apellidos |
| email | VARCHAR UNIQUE | Email de acceso |
| password | VARCHAR | Hash bcrypt |
| telefono | VARCHAR NULL | Teléfono de contacto |
| rol | VARCHAR | 'USER', 'EMPLEADO' o 'ADMIN' |
| reset_password_token | VARCHAR NULL | Hash SHA-256 del token de recuperación |
| reset_password_expires | TIMESTAMPTZ NULL | Caducidad del token (15 min) |
| created_at / updated_at | TIMESTAMPTZ | Auditoría |

**Tabla: servicios**
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PK | — |
| nombre | VARCHAR | Ej: "Corte Caballero" |
| descripcion | TEXT NULL | Descripción larga |
| precio | DECIMAL(10,2) | Precio en euros |
| duracion_min | INTEGER | Duración estimada en minutos |
| categoria | ENUM | CORTE, COLOR, TRATAMIENTO, BARBA, OTROS |
| foto_url | VARCHAR NULL | URL de imagen representativa |
| activo | BOOLEAN | Baja lógica (no se borra físicamente) |

**Tabla: citas**
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PK | — |
| usuario_id | INTEGER FK → usuarios NULL | NULL si el cliente no tiene cuenta |
| empleado_id | INTEGER FK → usuarios | El empleado que atiende |
| servicio_id | INTEGER FK → servicios | Servicio reservado |
| fecha_hora | TIMESTAMPTZ | Fecha y hora de la cita |
| estado | ENUM | PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA |
| notas | TEXT NULL | Observaciones |
| precio_final | DECIMAL NULL | Precio cerrado al completar |
| cliente_invitado_nombre | VARCHAR NULL | Para reservas telefónicas sin cuenta |
| cliente_invitado_telefono | VARCHAR NULL | — |

**Tabla: horarios_laborales**
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PK | — |
| fecha | DATE UNIQUE | Jornada laboral |
| duracion_corte_min | INTEGER | Duración de cada slot de reserva |
| activo | BOOLEAN | Si ese día hay servicio |

**Tabla: franjas_horarias**
| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PK | — |
| horario_id | INTEGER FK → horarios_laborales | — |
| hora_inicio | VARCHAR | Formato 'HH:mm', ej. '09:00' |
| hora_fin | VARCHAR | Formato 'HH:mm', ej. '14:00' |
| orden | INTEGER | Para ordenar bloques en la vista |

**Relaciones:**
- `citas` → `usuarios` (N:1, el cliente; CASCADE DELETE)
- `citas` → `usuarios` (N:1, el empleado; SET NULL al borrar)
- `citas` → `servicios` (N:1)
- `franjas_horarias` → `horarios_laborales` (N:1, CASCADE DELETE)

### 6.3 Patrones de diseño aplicados

**Patrón Repository / DAO** — La clase `CitasRepository` encapsula toda la lógica de acceso a datos de citas, incluyendo la consulta de conflictos de horario. Los servicios no conocen la implementación interna de las queries; solo llaman al repositorio. Esto facilita el testing unitario con mocks y cumple el principio de separación de responsabilidades.

```typescript
// backend/src/citas/citas.repository.ts
@Injectable()
export class CitasRepository {
  async hasConflict(empleadoId, fechaHora, duracionMin, excludeId?) {
    const fin = new Date(fechaHora.getTime() + duracionMin * 60 * 1000);
    const qb = this.repo.createQueryBuilder('c')
      .where('c.empleadoId = :eId', { eId: empleadoId })
      .andWhere("c.estado NOT IN ('CANCELADA', 'COMPLETADA')")
      .andWhere('c.fechaHora < :fin AND c.fechaHora >= :inicio', { inicio: fechaHora, fin });
    return (await qb.getCount()) > 0;
  }
}
```

**Patrón MVC** — NestJS aplica MVC de forma explícita: los Controllers gestionan las peticiones HTTP y delegan en los Services (lógica de negocio), que a su vez usan los Repositories o TypeORM directamente. Las Entities (TypeORM) representan el modelo. Esta separación es visible en la estructura de carpetas: `auth.controller.ts` / `auth.service.ts` / `user.entity.ts`.

**Patrón Singleton** — Todos los servicios Angular se declaran con `providedIn: 'root'`, garantizando una única instancia en toda la aplicación. El `AuthService` gestiona el estado de sesión con Angular Signals, accesible desde cualquier componente sin pasar props.

```typescript
// frontend/src/app/core/services/auth.service.ts
// Patrón: Singleton — Angular garantiza instancia única en root
@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);
  public isAuthenticated = computed(() => this._currentUser() !== null);
  public isAdmin = computed(() => this._currentUser()?.rol === 'ADMIN');
}
```

**Patrón DTO (Data Transfer Object)** — Cada operación de creación o modificación usa un DTO decorado con `class-validator`. Esto garantiza que los datos inválidos se rechazan en la capa de transporte antes de llegar al servicio.

```typescript
// backend/src/citas/dto/create-cita.dto.ts
export class CreateCitaDto {
  @IsInt() empleadoId: number;
  @IsInt() servicioId: number;
  @IsDateString() fechaHora: string;
  @IsOptional() @IsString() notas?: string;
}
```

### 6.4 API REST — Endpoints principales

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| POST | /api/v1/auth/login | Público | Inicio de sesión, devuelve JWT |
| POST | /api/v1/auth/register | Público | Registro de nuevo usuario |
| POST | /api/v1/auth/forgot-password | Público | Solicitar enlace de recuperación |
| POST | /api/v1/auth/reset-password | Público | Restablecer contraseña con token |
| GET | /api/v1/citas | ADMIN | Listar todas las citas (con filtros) |
| GET | /api/v1/citas/mis-citas | Autenticado | Citas del usuario en sesión |
| POST | /api/v1/citas | Autenticado | Crear nueva cita |
| PATCH | /api/v1/citas/:id | Autenticado | Modificar datos de una cita |
| PATCH | /api/v1/citas/:id/estado | ADMIN, EMPLEADO | Cambiar estado de una cita |
| DELETE | /api/v1/citas/:id | ADMIN | Eliminar una cita |
| GET | /api/v1/servicios | Público | Listar servicios activos |
| POST | /api/v1/servicios | ADMIN | Crear servicio |
| PATCH | /api/v1/servicios/:id | ADMIN | Modificar servicio |
| DELETE | /api/v1/servicios/:id | ADMIN | Dar de baja servicio (baja lógica) |
| GET | /api/v1/usuarios | ADMIN, EMPLEADO | Buscar usuarios con filtros |
| GET | /api/v1/usuarios/:id | Autenticado | Perfil de usuario |
| PATCH | /api/v1/usuarios/:id | ADMIN | Actualizar rol de usuario |
| GET | /api/v1/horarios | Público | Horarios del mes |
| POST | /api/v1/horarios | ADMIN | Crear jornada laboral |
| GET | /api/v1/horarios/disponibilidad | Público | Slots libres para reservar |

La documentación completa está disponible en `http://localhost:3000/api/docs` (Swagger UI).

### 6.5 Flujo de reserva de cita

El flujo principal de la aplicación es el siguiente:

1. El cliente accede a `/reservar` (sin necesidad de estar autenticado para ver disponibilidad).
2. El frontend consulta `GET /api/v1/horarios/disponibilidad?fecha=YYYY-MM-DD` para obtener los slots libres.
3. El cliente selecciona servicio, empleado, fecha y hora.
4. Si no está autenticado, se le redirige a `/login` con `returnUrl=/reservar`.
5. Tras el login, se crea la cita con `POST /api/v1/citas`. El backend comprueba conflictos de horario antes de persistir.
6. El empleado ve la cita en su agenda semanal (`/admin/agenda-semanal`) y puede confirmarla o completarla.
7. Si el empleado comete un error al marcar como completada, puede revertir el estado a "Confirmada" con el botón de deshacer.

### 6.6 Autenticación y seguridad

- **JWT:** Los tokens se firman con HS256 y contienen `{ sub, email, rol }`. El backend valida la firma en cada petición protegida mediante `JwtAuthGuard` (Passport Strategy).
- **Contraseñas:** Hash bcrypt con factor de coste 10. Nunca se almacenan en texto plano ni se devuelven en las respuestas.
- **Recuperación de contraseña:** El token es un `crypto.randomBytes(32)` en hexadecimal; lo que se guarda en BD es su hash SHA-256, por lo que aunque la BD se comprometa, el token raw (el que va en el enlace) sigue siendo inútil sin conocer la semilla.
- **CORS:** Configurado para aceptar únicamente peticiones del origen del frontend.
- **ValidationPipe global:** Todas las peticiones pasan por el pipe de validación de NestJS que rechaza campos no declarados en los DTOs (`whitelist: true, forbidNonWhitelisted: true`).

### 6.7 Gestión de roles y permisos

```
PUBLIC → puede ver servicios y disponibilidad de horarios, y reservar (siendo redirigido al login)
USER → todo lo anterior + ver sus propias citas + panel de usuario
EMPLEADO → todo lo anterior + ver agenda semanal de admin + cambiar estado de citas
ADMIN → todo lo anterior + CRUD completo + gestión de usuarios + configuración de horarios
```

Los guards en NestJS (`RolesGuard`) comparan el campo `rol` del payload JWT con el decorador `@Roles()` en cada endpoint. En el frontend, el `roleGuard` de Angular hace la misma verificación en las rutas protegidas.

### 6.8 Testing

Se implementaron pruebas unitarias en ambas capas:

**Backend (Jest + ts-jest) — 34 tests:**
- `auth.service.spec.ts` (11 tests): validación de credenciales, registro, hashing de contraseña, flujo de recuperación con tokens expirados o inválidos, lanzamiento de NotFoundException cuando el email no existe.
- `citas.service.spec.ts` (8 tests): creación con detección de conflictos, restricción de edición por rol, actualización de estado, eliminación.
- `usuarios.service.spec.ts` (8 tests): búsqueda con filtros de texto y rol, actualización de token de recuperación.
- `app.controller.spec.ts` (1 test): health check del controlador raíz.

**Frontend (Vitest + Angular TestBed) — 8 tests:**
- Creación del componente raíz `AppComponent`.
- Tests del `AuthService`: comportamiento sin sesión activa, llamadas a endpoints de recuperación y reset de contraseña.

**Pipeline GitHub Actions (`.github/workflows/ci.yml`):**
```yaml
jobs:
  backend:   install → lint → test unitarios
  frontend:  install → test unitarios
  build-check: build backend + build frontend (tras pasar los tests)
```

Se ejecuta en cada push a cualquier rama y en cada pull request hacia `master`.

### 6.9 Despliegue y entorno

El entorno de desarrollo se levanta con un único comando:

```bash
docker compose up -d   # Arranca PostgreSQL en puerto 5433
cd backend && npm run start:dev
cd frontend && npm start
```

El `docker-compose.yml` define únicamente el servicio de base de datos (PostgreSQL 16-alpine) para no acoplar la base de datos al entorno local. Los servicios de backend y frontend se sirven directamente desde Node para facilitar el hot reload durante el desarrollo.

---

## 7. Presupuesto

### 7.1 Estimación de horas

| Tarea | Horas estimadas |
|---|---|
| Análisis de requisitos y diseño de la BD | 15 h |
| Configuración inicial (repos, Docker, CI) | 8 h |
| Módulo de autenticación (backend + frontend) | 18 h |
| CRUD de citas (backend + frontend) | 25 h |
| CRUD de servicios (backend + frontend) | 12 h |
| Gestión de horarios y franjas | 20 h |
| Agenda semanal visual | 10 h |
| Panel de usuario (mis citas, calendario) | 14 h |
| Panel de administración | 16 h |
| Gestión de usuarios (admin) | 8 h |
| Accesibilidad WCAG 2.1 | 6 h |
| Tests unitarios (backend y frontend) | 12 h |
| Pipeline GitHub Actions | 4 h |
| Documentación Swagger | 5 h |
| Corrección de bugs y ajustes finales | 15 h |
| **TOTAL** | **188 h** |

### 7.2 Cálculo económico

| Concepto | Unidades | Precio/h | Total |
|---|---|---|---|
| Desarrollo (junior full-stack) | 188 h | 22 €/h | 4.136 € |
| Infraestructura (VPS hosting/mes × 3) | 3 meses | 10 €/mes | 30 € |
| Dominio (.es, 1 año) | 1 | 10 € | 10 € |
| Herramientas y licencias | — | — | 0 € (todo OSS) |
| **TOTAL** | | | **4.176 €** |

*Nota: todas las herramientas usadas son de código abierto (NestJS, Angular, PostgreSQL, Docker, GitHub Actions). El coste de licencias es cero.*

---

## 8. Conclusiones y vías futuras

### 8.1 Conclusiones técnicas

El proyecto ha resultado en una aplicación funcional y desplegable que cubre el ciclo completo de gestión de una peluquería. Algunas decisiones técnicas destacadas:

- **NestJS sobre Express puro:** La estructura modular de NestJS (módulos, controladores, servicios, guards) impuso disciplina de diseño desde el inicio. La curva de aprendizaje inicial fue mayor, pero facilitó enormemente el mantenimiento y la escritura de tests unitarios con inyección de dependencias.
  
- **Angular Signals (Angular 17+):** El estado del `AuthService` se gestiona con Signals en lugar de BehaviorSubject (RxJS). Los Signals resultan más ergonómicos para estado síncrono reactivo y reducen el boilerplate. Sin embargo, la integración con formularios reactivos todavía requiere algunas adaptaciones que hubieran sido automáticas con RxJS clásico.

- **Tailwind CSS:** Permitió un desarrollo de UI rápido y consistente sin necesidad de un sistema de componentes externo. El modo dark-first fue sencillo de implementar gracias a las clases de opacidad. Se detectó un problema de compatibilidad: los elementos `<select>` del navegador no heredan las clases de Tailwind con fondos semi-transparentes en todos los sistemas operativos, lo que obligó a usar fondos sólidos en los desplegables.

- **TypeORM `synchronize: true` en desarrollo:** Agilizó mucho el inicio del proyecto, pero requiere atención especial al pasar a producción (se desactiva para usar migraciones explícitas).

- **Testing con mocks vs. integración:** Los tests unitarios con mocks del repositorio son rápidos y útiles para validar lógica de negocio. Sin embargo, el test e2e que carga el `AppModule` completo falla en CI si no hay base de datos disponible, lo que demostró la importancia de separar bien los tests unitarios (sin BD) de los de integración (con BD).

### 8.2 Conclusiones personales

Este proyecto ha supuesto el primer desarrollo completo de principio a fin con tecnologías modernas de producción. Lo más valioso no han sido las líneas de código, sino el aprendizaje de tomar decisiones: elegir entre dos librerías, entender por qué un patrón de diseño resuelve un problema real, o decidir cuándo la seguridad debe ceder ante la usabilidad.

También ha sido un ejercicio de gestión del tiempo: estimar cuánto cuesta una funcionalidad, priorizar lo esencial y documentar el proceso tanto como el resultado.

### 8.3 Vías futuras

- **Notificaciones por email reales:** Actualmente el sistema imprime el enlace de recuperación en la consola del servidor. Integrar un proveedor SMTP real (SendGrid, Resend, Mailgun) completaría el flujo de usuario.
- **Notificaciones push / recordatorios:** Enviar un recordatorio de cita 24 horas antes vía email o SMS.
- **Pagos online:** Integrar Stripe para cobro anticipado o señal en la reserva.
- **App móvil (Angular PWA):** Convertir el frontend en una Progressive Web App para ofrecer experiencia de aplicación nativa sin necesidad de publicar en tiendas.
- **Panel de estadísticas con gráficas:** Mostrar ingresos por mes, servicios más solicitados y empleados con mayor ocupación con gráficas (Chart.js o NgxCharts).
- **Valoraciones de clientes:** Sistema de reseñas post-cita para mejorar la confianza y la visibilidad.
- **Migraciones de BD explícitas:** Sustituir `synchronize: true` por un sistema de migraciones TypeORM para entornos de producción seguros.
- **Internacionalización (i18n):** Soporte multi-idioma con Angular i18n o ngx-translate.

---

## 9. Bibliografía / Webgrafía

*(Formato APA 7)*

- NestJS Ltd. (2024). *NestJS Documentation*. https://docs.nestjs.com/

- Google. (2024). *Angular Documentation*. https://angular.dev/

- Tailwind Labs. (2024). *Tailwind CSS Documentation*. https://tailwindcss.com/docs

- TypeORM Contributors. (2024). *TypeORM Documentation*. https://typeorm.io/

- Auth0. (2024). *JSON Web Tokens Introduction*. https://jwt.io/introduction

- OWASP Foundation. (2023). *OWASP Top Ten*. https://owasp.org/www-project-top-ten/

- W3C. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. https://www.w3.org/TR/WCAG21/

- npm. (2024). *bcrypt package*. https://www.npmjs.com/package/bcrypt

- Swagger. (2024). *OpenAPI Specification 3.0*. https://swagger.io/specification/

- GitHub. (2024). *GitHub Actions Documentation*. https://docs.github.com/en/actions

- Docker Inc. (2024). *Docker Documentation*. https://docs.docker.com/

- PostgreSQL Global Development Group. (2024). *PostgreSQL 16 Documentation*. https://www.postgresql.org/docs/16/

- Fresha. (2024). *Fresha — Software de gestión para salones de belleza*. https://www.fresha.com/

- SimplyBook.me. (2024). *SimplyBook.me — Sistema de reservas online*. https://simplybook.me/

- Reservio. (2024). *Reservio — Software de reservas*. https://www.reservio.com/
