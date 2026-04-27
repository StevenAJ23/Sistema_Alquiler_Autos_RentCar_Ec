# Arquitectura del Backend — RentCar EC

Descripción técnica de la arquitectura implementada en el backend del sistema de alquiler de autos. Diseñada siguiendo los principios de **Arquitectura Modular** y **Clean Architecture**, lo que la hace escalable, mantenible y preparada para integración futura.

---

## 1. Stack Tecnológico

- **Lenguaje**: TypeScript (tipado fuerte para mayor confiabilidad en producción)
- **Runtime**: Node.js con Express 5
- **ORM**: Prisma (type-safe, migraciones automáticas)
- **Base de Datos**: PostgreSQL (Supabase / Neon / Render)
- **Seguridad**: JWT (JSON Web Tokens) + bcrypt para hashing de contraseñas
- **Validación**: Zod (validación de DTOs en tiempo de ejecución)
- **Documentación**: OpenAPI/Swagger (vía CDN, sin dependencia de swagger-ui-express)

---

## 2. Arquitectura de Módulos

El proyecto sigue el patrón **Module-per-Domain**. Cada módulo de negocio es autónomo y contiene sus propias capas internas.

### Módulos de negocio

| Módulo          | Responsabilidad                                              |
|-----------------|--------------------------------------------------------------|
| `auth`          | Registro, login, emisión de JWT, perfil de usuario          |
| `vehiculos`     | Catálogo, disponibilidad, búsqueda, CRUD con soft-delete    |
| `agencias`      | Sucursales de alquiler por ciudad y empresa                 |
| `empresas`      | Empresas propietarias de flotas                             |
| `catalogos`     | Marcas, modelos, categorías, combustibles, transmisiones, extras, seguros, tarifas |
| `reservas`      | Creación, consulta, cancelación con validación anti-solapamiento |
| `alquileres`    | Inicio de alquiler desde reserva confirmada                 |
| `devoluciones`  | Registro de devolución, cálculo de cargos extra             |
| `pagos`         | Registro de pago, validación de monto                       |
| `facturas`      | Generación de factura y detalle de factura                  |
| `clientes`      | Perfil del conductor (licencia, vigencia)                   |
| `usuarios`      | Gestión de usuarios y roles                                 |
| `mantenimientos`| Historial de mantenimiento de vehículos                     |
| `historial`     | Auditoría de acciones críticas del sistema                  |
| `kardex`        | Registro de cambios de estado de vehículos                  |
| `outbox`        | Eventos de negocio para integración futura                  |

### Capas dentro de cada módulo

```
modules/<nombre>/
├── <nombre>.dto.ts         Schemas Zod de entrada/salida
├── <nombre>.entity.ts      Tipo de dominio (opcional)
├── <nombre>.repository.ts  Acceso a datos vía Prisma
├── <nombre>.service.ts     Lógica de negocio
├── <nombre>.controller.ts  Manejo de requests HTTP
└── <nombre>.routes.ts      Definición de endpoints
```

---

## 3. Modelo de Datos

El schema Prisma representa el dominio completo del alquiler de autos:

1. **Geografía**: `Provincia` → `Ciudad`
2. **Operación**: `Empresa` → `Agencia` → `Vehiculo`
3. **Catálogos**: `Marca` → `Modelo`, `Categoria`, `TipoCombustible`, `TipoTransmision`, `ExtraEquipamiento`
4. **Precios**: `Tarifa`, `Seguro`, `CanalVenta`
5. **Reserva**: `Usuario` → `Reserva` → `ReservaExtra` → `Pago` → `Factura`
6. **Operación física**: `Alquiler` → `Devolucion`
7. **Auditoría**: `HistorialUsuario`, `Kardex`, `OutboxEvent`, `Mantenimiento`

### Regla de integridad crítica

Un mismo vehículo **no puede tener dos reservas activas, pendientes o confirmadas con rangos de fechas solapados**. Las reservas canceladas no bloquean disponibilidad. Esta restricción se valida en la capa de servicio antes de crear una reserva.

---

## 4. Flujo de una Reserva (Ejemplo completo)

```
Cliente → POST /api/v1/reservas
           ↓
ReservaController → valida DTO con Zod
           ↓
ReservaService → verifica disponibilidad del vehículo
               → calcula precio (días × tarifa + extras + seguro)
               → crea registro en `reservas`
               → crea registros en `reserva_extras`
               → registra evento en `outbox_events` (RESERVA_CREADA)
               → registra acción en `historial_usuarios`
           ↓
Response → { success: true, data: { reserva } }
```

---

## 5. Seguridad y Autorización

### Roles disponibles

| Rol       | Permisos                                                        |
|-----------|-----------------------------------------------------------------|
| `ADMIN`   | Acceso total: vehículos, agencias, alquileres, auditoría        |
| `OPERADOR`| Puede gestionar reservas, alquileres y devoluciones             |
| `CLIENTE` | Solo sus propias reservas y perfil                             |

### Middlewares

- `authenticate` — Verifica JWT en header `Authorization: Bearer <token>`
- `authorizeAdmin` — Restringe a rol ADMIN
- `validateRequest(schema)` — Valida body con Zod, retorna 422 si falla

---

## 6. Infraestructura compartida

```
shared/
├── container.ts          Ensamblaje de dependencias (DI manual)
├── database/
│   └── prisma.ts         Cliente Prisma singleton
├── errors/
│   ├── BusinessException.ts  Error de negocio tipado con código HTTP
│   └── error.middleware.ts   Handler global de errores Express
├── middlewares/
│   ├── auth.middleware.ts    JWT + guards de rol
│   └── validate.middleware.ts Validación Zod
└── utils/
    ├── ApiResponse.ts        Formato de respuesta estándar
    └── response.ts           Helpers HTTP
```

---

## 7. API y Documentación

- Versionamiento: `/api/v1`
- Swagger UI disponible en: `GET /api/v1/docs`
- Spec JSON disponible en: `GET /api/v1/docs/spec`
- Correlation ID propagado en header `X-Correlation-Id` para trazabilidad

---

## 8. Preparado para Reto 2 — Integración

### Endpoints para Booking Prototipo

```
GET  /api/v1/vehiculos/search   Búsqueda de disponibilidad
GET  /api/v1/vehiculos/:id      Detalle de vehículo
POST /api/v1/reservas           Crear reserva
GET  /api/v1/reservas/:id       Consultar reserva
PATCH /api/v1/reservas/:id/cancel  Cancelar reserva
POST /api/v1/pagos              Registrar pago
```

### Eventos outbox modelados

| Evento              | Cuándo se dispara                         |
|---------------------|-------------------------------------------|
| `RESERVA_CREADA`    | Al crear una nueva reserva                |
| `RESERVA_CANCELADA` | Al cancelar una reserva                   |
| `PAGO_REGISTRADO`   | Al registrar un pago exitoso              |
| `ALQUILER_INICIADO` | Al iniciar el alquiler físico             |
| `VEHICULO_DEVUELTO` | Al completar la devolución               |
| `FACTURA_GENERADA`  | Al generar la factura del alquiler        |

Estos eventos están listos para ser publicados en RabbitMQ, Kafka o Azure Service Bus en el Reto 2.

---

## 9. Evolución hacia microservicios (Reto 2)

Cada carpeta dentro de `modules/` está diseñada para convertirse en un microservicio independiente:

- `Servicio de Vehículos` → módulo `vehiculos`
- `Servicio de Reservas` → módulo `reservas`
- `Servicio de Pagos` → módulo `pagos`
- `Servicio de Facturación` → módulo `facturas`
- `Servicio de Notificaciones` → consumidor de `outbox_events`

El contrato de la API (endpoints y formato de respuesta) **no cambia en el Reto 2** — solo cambia la infraestructura que lo atiende.
