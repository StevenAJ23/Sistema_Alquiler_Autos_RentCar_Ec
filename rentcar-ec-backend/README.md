# RentCar EC — Backend

API REST del sistema de alquiler de autos. Construida con **Node.js + Express + TypeScript + Prisma + PostgreSQL**.

---

## Instalación y arranque

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```
Edita `.env` y completa `DATABASE_URL` con tu string de conexión de PostgreSQL (Supabase, Neon, Render, etc.).

### 3. Generar el cliente Prisma
```bash
npm run db:generate
```

### 4. Ejecutar migraciones
```bash
npm run db:migrate
```
> Si prefieres sincronizar el schema sin migraciones:
> ```bash
> npm run db:push
> ```

### 5. Cargar datos de prueba
```bash
npm run db:seed
```
Carga provincias, ciudades, empresas, agencias, marcas, modelos, categorías, vehículos, extras, seguros, tarifas y usuarios de prueba.

**Credenciales de prueba:**
| Rol     | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@rentcar.ec         | Admin2025!  |
| Cliente | cliente@test.ec          | Cliente2025! |

### 6. Iniciar en desarrollo
```bash
npm run dev
```
El servidor corre en `http://localhost:3000`.

---

## Documentación API (Swagger)

```
http://localhost:3000/api/v1/docs
```

Para importar en Postman:
1. Postman → Import → Link
2. Pega: `http://localhost:3000/api/v1/docs/spec`

---

## Endpoints principales (`/api/v1/`)

### Autenticación
```
POST   /api/v1/auth/register        Registrar nuevo usuario
POST   /api/v1/auth/login           Iniciar sesión → devuelve JWT
GET    /api/v1/auth/me              Perfil del usuario autenticado
```

### Vehículos
```
GET    /api/v1/vehiculos                 Listar vehículos
GET    /api/v1/vehiculos/marketplace     Catálogo público
GET    /api/v1/vehiculos/search          Buscar disponibles por fechas/categoría
GET    /api/v1/vehiculos/:id             Detalle de vehículo
POST   /api/v1/vehiculos                 Crear vehículo (admin)
PATCH  /api/v1/vehiculos/:id             Actualizar vehículo (admin)
DELETE /api/v1/vehiculos/:id             Eliminar vehículo (admin)
```

### Agencias
```
GET    /api/v1/agencias                  Listar agencias
GET    /api/v1/agencias/:id              Detalle de agencia
POST   /api/v1/agencias                  Crear agencia (admin)
PATCH  /api/v1/agencias/:id              Actualizar agencia (admin)
DELETE /api/v1/agencias/:id              Eliminar agencia (admin)
```

### Empresas
```
GET    /api/v1/empresas                  Listar empresas
GET    /api/v1/empresas/:id              Detalle de empresa
POST   /api/v1/empresas                  Crear empresa (admin)
PATCH  /api/v1/empresas/:id              Actualizar empresa (admin)
DELETE /api/v1/empresas/:id              Eliminar empresa (admin)
```

### Reservas
```
POST   /api/v1/reservas                  Crear reserva (cliente autenticado)
GET    /api/v1/reservas/my               Mis reservas (cliente autenticado)
GET    /api/v1/reservas/:id              Detalle de reserva
PATCH  /api/v1/reservas/:id/cancel       Cancelar reserva
GET    /api/v1/reservas                  Todas las reservas (admin)
```

### Alquileres
```
POST   /api/v1/alquileres                Iniciar alquiler desde reserva confirmada (admin)
GET    /api/v1/alquileres                Listar alquileres (admin)
GET    /api/v1/alquileres/:id            Detalle de alquiler
```

### Devoluciones
```
POST   /api/v1/devoluciones              Registrar devolución (admin)
GET    /api/v1/devoluciones              Listar devoluciones (admin)
GET    /api/v1/devoluciones/:id          Detalle de devolución
```

### Pagos
```
POST   /api/v1/pagos                     Registrar pago
GET    /api/v1/pagos                     Listar pagos (admin)
GET    /api/v1/pagos/:id                 Detalle de pago
```

### Facturas
```
POST   /api/v1/facturas                  Generar factura
GET    /api/v1/facturas                  Listar facturas (admin)
GET    /api/v1/facturas/:id              Detalle de factura
```

### Catálogos
```
GET    /api/v1/catalogos/marcas
GET    /api/v1/catalogos/modelos
GET    /api/v1/catalogos/categorias
GET    /api/v1/catalogos/tipos-combustible
GET    /api/v1/catalogos/tipos-transmision
GET    /api/v1/catalogos/extras
GET    /api/v1/catalogos/seguros
GET    /api/v1/catalogos/tarifas
GET    /api/v1/catalogos/canales-venta
```

### Auditoría
```
GET    /api/v1/historial                 Historial de acciones (admin)
GET    /api/v1/kardex                    Kardex de vehículos (admin)
GET    /api/v1/outbox-events             Eventos outbox (admin)
```

---

## Formato de respuestas

**Éxito:**
```json
{
  "success": true,
  "data": { "..." : "..." }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Vehículo no encontrado"
  }
}
```

---

## Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/v1/auth/login`.

---

## Estructura del proyecto

```
src/
├── docs/
│   └── swagger.ts              Definición Swagger
├── modules/
│   ├── auth/                   Registro, login, perfil
│   ├── vehiculos/              Catálogo y disponibilidad
│   ├── agencias/               Sucursales de alquiler
│   ├── empresas/               Empresas propietarias
│   ├── catalogos/              Marcas, modelos, categorías, extras
│   ├── reservas/               Flujo de reservas
│   ├── alquileres/             Alquileres activos
│   ├── devoluciones/           Registro de devoluciones
│   ├── pagos/                  Pagos de reservas
│   ├── facturas/               Facturación
│   ├── clientes/               Perfil de conductor/cliente
│   ├── usuarios/               Gestión de usuarios
│   ├── mantenimientos/         Historial de mantenimiento
│   ├── historial/              Auditoría de acciones
│   ├── kardex/                 Kardex de estado de vehículos
│   └── outbox/                 Eventos outbox para integración
├── shared/
│   ├── container.ts            Inyección de dependencias
│   ├── database/
│   │   └── prisma.ts           Cliente Prisma singleton
│   ├── errors/
│   │   ├── BusinessException.ts Errores de negocio tipados
│   │   └── error.middleware.ts  Manejo global de errores
│   ├── middlewares/
│   │   ├── auth.middleware.ts   JWT + guards de rol
│   │   └── validate.middleware.ts Validación con Zod
│   └── utils/
│       ├── ApiResponse.ts       Formato de respuesta estándar
│       └── response.ts          Helpers de respuesta HTTP
├── app.ts                       Configuración Express
└── server.ts                    Punto de entrada
```

---

## Variables de entorno

```env
DATABASE_URL=        # URL de conexión PostgreSQL (pooler)
DIRECT_URL=          # URL directa PostgreSQL (migraciones)
PORT=3000
NODE_ENV=development
JWT_SECRET=          # Clave secreta para JWT
CORS_ORIGIN=         # Orígenes permitidos separados por coma
```

---

## Scripts disponibles

```bash
npm run dev          # Desarrollo con recarga automática
npm run build        # Compilar TypeScript
npm run start        # Iniciar versión compilada
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Ejecutar migraciones
npm run db:push      # Sincronizar schema sin migraciones
npm run db:seed      # Cargar datos iniciales
npm run db:studio    # Abrir Prisma Studio
npm run db:reset     # Resetear BD y ejecutar seed
```

---

## Preparado para integración futura (Reto 2)

Endpoints que usará Booking Prototipo:
- `GET  /api/v1/vehiculos/search`
- `GET  /api/v1/vehiculos/:id`
- `POST /api/v1/reservas`
- `GET  /api/v1/reservas/:id`
- `PATCH /api/v1/reservas/:id/cancel`
- `POST /api/v1/pagos`

Eventos outbox modelados para mensajería futura:
`RESERVA_CREADA`, `RESERVA_CANCELADA`, `PAGO_REGISTRADO`, `ALQUILER_INICIADO`, `VEHICULO_DEVUELTO`, `FACTURA_GENERADA`
