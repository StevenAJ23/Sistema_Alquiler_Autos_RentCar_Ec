# RentCar Ecuador — Sistema de Alquiler de Autos

Sistema de alquiler de autos construido con arquitectura monolítica modular API-first.
Reto 1: construcción base sin integración.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js · Express · TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL (Supabase / Neon / Render) |
| Autenticación | JWT + bcryptjs |
| Frontend | Vue 3 · Vite · TypeScript |
| Estado | Pinia |
| Queries | TanStack Vue Query |
| Estilos | Tailwind CSS v3 |
| Docs API | Swagger (OpenAPI 3.0) |

---

## Estructura del proyecto

```
SISTEMA_ALQUILER_AUTOS_V0.1/
├── rentcar-ec-backend/       # API REST Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma     # Esquema completo de la BD
│   │   ├── seed.ts           # Datos iniciales de prueba
│   │   └── migrations/
│   │       └── 001_extensions_and_constraints.sql
│   └── src/
│       ├── modules/          # auth · vehiculos · reservas · alquileres
│       │                     # devoluciones · pagos · facturas · clientes
│       │                     # usuarios · agencias · empresas · catalogos
│       │                     # mantenimientos · historial · kardex · outbox
│       ├── shared/           # prisma · middlewares · errores · container DI
│       ├── docs/             # swagger.ts
│       ├── app.ts            # Express + rutas
│       └── server.ts         # Punto de entrada
└── rentcar-ec-frontend/      # SPA Vue 3
    └── src/
        ├── pages/
        │   ├── auth/         # Login · Registro
        │   ├── marketplace/  # Home · Búsqueda · Detalle · Reserva
        │   ├── cliente/      # Mis reservas · Detalle reserva · Perfil
        │   └── admin/        # Dashboard · Vehículos · Agencias · Empresas
        │                     # Reservas · Alquileres · Devoluciones · Pagos
        │                     # Facturas · Mantenimientos · Kardex · Historial
        ├── composables/      # useAdmin · useVehiculos · useReservas
        ├── stores/           # auth (Pinia)
        ├── services/         # auth · vehiculos · reservas · admin
        ├── types/            # domain.ts (tipos espejo del schema Prisma)
        └── router/           # index.ts con guards de autenticación
```

---

## Requisitos previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- Una base de datos **PostgreSQL** (Supabase, Neon, Render o local)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd SISTEMA_ALQUILER_AUTOS_V0.1
```

### 2. Instalar dependencias del backend

```bash
cd rentcar-ec-backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../rentcar-ec-frontend
npm install
```

---

## Configuración de variables de entorno

### Backend

```bash
cd rentcar-ec-backend
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
PORT=3000
NODE_ENV=development
JWT_SECRET=genera_un_secreto_fuerte_aqui
CORS_ORIGIN=http://localhost:5173
```

> **Generar JWT_SECRET:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Frontend

El frontend ya incluye `.env.example`. En desarrollo no necesitas cambiarlo:

```bash
cd rentcar-ec-frontend
# El .env.example ya apunta a http://localhost:3000/api/v1
# Solo cópialo si necesitas sobreescribir algo:
cp .env.example .env
```

---

## Base de datos

### Paso 1 — Generar el cliente Prisma

```bash
cd rentcar-ec-backend
npm run db:generate
```

### Paso 2 — Aplicar el esquema a la base de datos

```bash
# Opción A (desarrollo con historial de migraciones):
npm run db:migrate

# Opción B (push directo sin historial, ideal para Supabase/Neon):
npm run db:push
```

### Paso 3 — Ejecutar la migración SQL complementaria

Esta migración agrega restricciones que Prisma no puede expresar directamente:
- Extensiones `uuid-ossp` y `btree_gist`
- Constraint anti-solapamiento de reservas (`EXCLUDE USING gist`)
- Triggers para generar código de reserva y número de factura
- Índices de performance
- Vista `v_vehiculos_disponibles`

```bash
# Conéctate a tu base de datos PostgreSQL y ejecuta:
psql $DATABASE_URL -f prisma/migrations/001_extensions_and_constraints.sql

# O desde Supabase: SQL Editor → pegar y ejecutar el contenido del archivo
```

### Paso 4 — Cargar datos semilla

```bash
npm run db:seed
```

El seed crea:
- Provincias: Pichincha, Guayas, Azuay
- Ciudades: Quito, Guayaquil, Cuenca
- Empresas: RentCar Ecuador, AutoFast
- Agencias: Quito Norte, Guayaquil Centro, Cuenca Centro
- Marcas y modelos: Toyota, Chevrolet, Kia, Hyundai / Corolla, D-Max, Sportage, Tucson, Picanto
- Categorías, combustibles, transmisiones, extras, seguros, tarifas
- **Usuario admin:** `admin@rentcar.ec` / `Admin2025!`
- **Usuario cliente:** `cliente@test.ec` / `Cliente2025!`
- 6 vehículos de prueba con imágenes

---

## Ejecutar en desarrollo

### Backend (puerto 3000)

```bash
cd rentcar-ec-backend
npm run dev
```

El servidor se recarga automáticamente con `tsx watch`.

### Frontend (puerto 5173)

```bash
cd rentcar-ec-frontend
npm run dev
```

Abre `http://localhost:5173` en el navegador.

### Documentación Swagger

Con el backend corriendo, visita:
```
http://localhost:3000/api/v1/docs
```

---

## Build de producción

### Backend

```bash
cd rentcar-ec-backend
npm run build        # compila TypeScript → dist/
npm run start        # ejecuta dist/server.js
```

### Frontend

```bash
cd rentcar-ec-frontend
npm run build        # genera dist/
npm run preview      # previsualiza el build (puerto 4173)
```

---

## Despliegue

### Backend — Render Web Service

1. Crear un **Web Service** en [render.com](https://render.com)
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm run start`
4. **Environment Variables:** copiar las del `.env.example` con valores reales
5. Agregar una base de datos PostgreSQL en Render (o usar Supabase/Neon)

### Frontend — Vercel / Netlify

```bash
# Vercel (desde la raíz del frontend)
cd rentcar-ec-frontend
npx vercel --prod

# Netlify
# Build command: npm run build
# Publish directory: dist
# Variables de entorno: VITE_API_URL=https://tu-backend.render.com/api/v1
```

> **Importante:** actualiza `VITE_API_URL` en el frontend y `CORS_ORIGIN` en el backend con las URLs de producción.

### Base de datos — Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar las URLs de conexión en el `.env` del backend
3. Ejecutar `npm run db:push` para aplicar el esquema
4. Ejecutar la migración SQL complementaria desde el SQL Editor de Supabase
5. Ejecutar `npm run db:seed`

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@rentcar.ec` | `Admin2025!` |
| Cliente | `cliente@test.ec` | `Cliente2025!` |

---

## Flujo principal del sistema

```
Registro/Login
    ↓
Buscar vehículo (fechas, categoría, agencia)
    ↓
Ver detalle → Confirmar reserva (con extras y seguro)
    ↓
Pagar reserva (POST /pagos)   ← el cliente paga desde su detalle de reserva
    ↓
Admin: Iniciar alquiler (POST /alquileres) — registra km de salida
    ↓
Admin: Registrar devolución (POST /devoluciones) — registra km entrada + estado
    ↓
Admin: Generar factura (POST /facturas)
```

---

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Registro de usuario |
| POST | `/api/v1/auth/login` | — | Login, devuelve JWT |
| GET | `/api/v1/auth/me` | ✓ | Perfil del usuario autenticado |
| PATCH | `/api/v1/auth/me` | ✓ | Actualizar perfil |
| GET | `/api/v1/vehiculos/marketplace` | — | Vehículos disponibles (público) |
| GET | `/api/v1/vehiculos/search` | — | Búsqueda por fechas y filtros |
| GET | `/api/v1/vehiculos/:id` | — | Detalle de vehículo |
| POST | `/api/v1/reservas` | ✓ | Crear reserva |
| GET | `/api/v1/reservas/my` | ✓ | Mis reservas |
| PATCH | `/api/v1/reservas/:id/cancel` | ✓ | Cancelar reserva |
| POST | `/api/v1/pagos` | ✓ | Registrar pago |
| POST | `/api/v1/alquileres` | Admin | Iniciar alquiler |
| POST | `/api/v1/devoluciones` | Admin | Registrar devolución |
| POST | `/api/v1/facturas` | ✓ | Generar factura |
| GET | `/api/v1/historial` | Admin | Auditoría de acciones |
| GET | `/api/v1/kardex` | Admin | Kardex de vehículos |
| GET | `/api/v1/outbox-events` | Admin | Eventos de integración futura |

Documentación completa: `http://localhost:3000/api/v1/docs`

---

## Scripts de utilidad

```bash
# Backend
npm run dev          # Servidor de desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Ejecutar en producción
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Migrar base de datos (dev)
npm run db:push      # Push directo del schema
npm run db:seed      # Cargar datos semilla
npm run db:studio    # Prisma Studio (visualizar BD)
npm run db:reset     # Reset total + seed (¡borra todo!)

# Frontend
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Previsualizar build
npm run type-check   # Verificar TypeScript
```

---

## Preparación para integración futura (Reto 2)

El sistema ya tiene la base para integrarse con otros servicios:

- **`outbox_events`** — tabla de eventos listos para publicar a RabbitMQ, Kafka o Azure Service Bus
- **`sistemas_externos`** — catálogo de sistemas que consumirán la API (Booking Prototipo, apps móviles)
- **`x-correlation-id`** — header de trazabilidad en todas las respuestas
- **Versionamiento `/api/v1`** — preparado para `/api/v2` sin romper contratos
- **Contratos documentados en Swagger** — listos para generar clientes gRPC o GraphQL

Eventos modelados: `RESERVA_CREADA`, `RESERVA_CANCELADA`, `PAGO_REGISTRADO`, `ALQUILER_INICIADO`, `VEHICULO_DEVUELTO`, `FACTURA_GENERADA`

---

## Reglas de negocio críticas

- Un vehículo **no puede tener dos reservas activas con fechas solapadas** (constraint en BD con `EXCLUDE USING gist`)
- El **precio total siempre lo calcula el backend** — nunca se confía en el precio enviado desde el frontend
- Los clientes **solo ven sus propias reservas** — validación en el servicio
- Las reservas en estado `CANCELADA` o `COMPLETADA` **no bloquean disponibilidad**
- El `JWT_SECRET` debe tener al menos 64 caracteres en producción