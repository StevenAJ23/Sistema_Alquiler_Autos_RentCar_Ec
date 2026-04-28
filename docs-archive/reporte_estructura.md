# Arquitectura del Frontend — RentCar EC

Descripción técnica de la arquitectura y organización del frontend del sistema de alquiler de autos.

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Vue 3** | ^3.4 | Framework progresivo con Composition API |
| **TypeScript** | ^5.5 | Tipado estático — menos errores en producción |
| **Vite** | ^5.3 | Bundler y servidor de desarrollo con HMR |
| **Vue Router** | ^4.4 | Enrutamiento con guards por rol |
| **Pinia** | ^2.1 | Estado global (auth, token JWT) |
| **TanStack Vue Query** | ^5.51 | Caché de queries y mutaciones a la API |
| **Axios** | ^1.7 | Cliente HTTP con interceptores de auth |
| **Tailwind CSS** | ^3.4 | Estilos utilitarios |
| **Lucide Vue Next** | ^0.414 | Librería de íconos |

---

## Estructura de Carpetas

```
rentcar-ec-frontend/src/
├── App.vue               Punto de entrada de la SPA
├── main.ts               Inicialización: Vue, Pinia, Router, Query
├── index.css             Variables CSS globales y clases utilitarias
├── vite-env.d.ts         Tipos de variables de entorno Vite
│
├── pages/                Vistas agrupadas por contexto de usuario
│   ├── auth/
│   │   ├── LoginPage.vue
│   │   └── RegisterPage.vue
│   ├── marketplace/
│   │   ├── HomePage.vue          Buscador principal + catálogo
│   │   ├── SearchPage.vue        Listado filtrado por fechas
│   │   ├── VehiculoDetailPage.vue
│   │   └── ReservaPage.vue       Formulario de reserva con extras y seguro
│   ├── cliente/
│   │   ├── MyReservasPage.vue    Mis reservas con estados
│   │   ├── ReservaDetailPage.vue Detalle + pago + cancelación
│   │   └── ProfilePage.vue       Perfil del usuario autenticado
│   ├── admin/
│   │   ├── AdminDashboardPage.vue
│   │   ├── AdminVehiculosPage.vue
│   │   ├── AdminAgenciasPage.vue
│   │   ├── AdminEmpresasPage.vue
│   │   ├── AdminReservasPage.vue
│   │   ├── AdminAlquileresPage.vue
│   │   ├── AdminDevolucionesPage.vue
│   │   ├── AdminPagosPage.vue
│   │   ├── AdminFacturasPage.vue
│   │   ├── AdminMantenimientosPage.vue
│   │   ├── AdminKardexPage.vue
│   │   ├── AdminHistorialPage.vue
│   │   └── AdminUsersPage.vue
│   └── errors/
│       └── AccessDeniedPage.vue
│
├── components/
│   └── layout/
│       ├── MainLayout.vue        Header público + navegación
│       └── AdminLayout.vue       Sidebar admin + área de contenido
│
├── composables/          Lógica de queries/mutaciones (TanStack Vue Query)
│   ├── useVehiculos.ts
│   ├── useReservas.ts
│   └── useAdmin.ts
│
├── stores/               Estado global (Pinia)
│   └── auth.ts           Usuario autenticado, token JWT, roles
│
├── services/             Capa de acceso a la API (Axios)
│   ├── auth.service.ts
│   ├── vehiculos.service.ts
│   ├── reservas.service.ts
│   └── admin.service.ts
│
├── router/
│   └── index.ts          Rutas con navigation guards por rol
│
├── types/
│   └── domain.ts         Interfaces TypeScript espejo del schema Prisma
│
├── utils/
│   └── validators.ts     15+ funciones de validación de campos
│
└── lib/
    └── api-client.ts     Configuración de Axios con interceptores
```

---

## Flujo de Datos — Buscar y Reservar un Vehículo

```
1. HomePage.vue
   → El cliente ingresa fechas de inicio y fin
   → Redirige a /buscar?fechaInicio=...&fechaFin=...

2. SearchPage.vue
   → useVehiculos (TanStack Vue Query) llama a vehiculos.service.ts
   → GET /api/v1/vehiculos/search?fechaInicio=...&fechaFin=...
   → Muestra tarjetas de vehículos disponibles

3. VehiculoDetailPage.vue
   → useVehiculo(id) carga detalles del vehículo
   → GET /api/v1/vehiculos/:id
   → Botón "Reservar" → navega a /reservar/:vehiculoId

4. ReservaPage.vue
   → Carga extras (GET /api/v1/extras) y seguros (GET /api/v1/seguros)
   → Cliente selecciona fechas, seguro, extras y notas
   → useCreateReserva().mutateAsync() → POST /api/v1/reservas
   → En éxito redirige a /mis-reservas/:id

5. ReservaDetailPage.vue
   → Muestra código de reserva, total, estado
   → Permite registrar pago → POST /api/v1/pagos
   → Permite cancelar → PATCH /api/v1/reservas/:id/cancel
```

---

## Módulo Marketplace (Público — sin autenticación)

| Página | Ruta | Descripción |
|---|---|---|
| `HomePage.vue` | `/` | Hero con formulario de búsqueda por fechas + catálogo público |
| `SearchPage.vue` | `/buscar` | Listado de vehículos con filtros avanzados |
| `VehiculoDetailPage.vue` | `/vehiculos/:id` | Specs, precio/día, agencia, categoría |
| `ReservaPage.vue` | `/reservar/:vehiculoId` | Formulario de reserva — requiere autenticación |

## Módulo Cliente (Autenticado — rol CLIENTE)

| Página | Ruta | Descripción |
|---|---|---|
| `MyReservasPage.vue` | `/mis-reservas` | Lista de reservas propias con estados |
| `ReservaDetailPage.vue` | `/mis-reservas/:id` | Detalle con pago y opción de cancelación |
| `ProfilePage.vue` | `/perfil` | Actualización de datos del perfil |

## Módulo Admin (Autenticado — rol ADMIN)

| Página | Ruta | Descripción |
|---|---|---|
| `AdminDashboardPage.vue` | `/admin` | Métricas generales: vehículos, reservas, usuarios |
| `AdminVehiculosPage.vue` | `/admin/vehiculos` | CRUD completo de vehículos |
| `AdminAgenciasPage.vue` | `/admin/agencias` | CRUD de agencias |
| `AdminEmpresasPage.vue` | `/admin/empresas` | CRUD de empresas |
| `AdminReservasPage.vue` | `/admin/reservas` | Gestión y cambio de estado de reservas |
| `AdminAlquileresPage.vue` | `/admin/alquileres` | Inicio de alquileres |
| `AdminDevolucionesPage.vue` | `/admin/devoluciones` | Registro de devoluciones |
| `AdminPagosPage.vue` | `/admin/pagos` | Consulta de pagos |
| `AdminFacturasPage.vue` | `/admin/facturas` | Generación y consulta de facturas |
| `AdminMantenimientosPage.vue` | `/admin/mantenimientos` | Historial de mantenimiento de vehículos |
| `AdminKardexPage.vue` | `/admin/kardex` | Kardex de estados de vehículos |
| `AdminHistorialPage.vue` | `/admin/historial` | Auditoría de acciones del sistema |
| `AdminUsersPage.vue` | `/admin/users` | Gestión de usuarios (activar/desactivar) |

---

## Estado Global — Pinia (`stores/auth.ts`)

```typescript
// Estado gestionado por el store de autenticación
{
  user: {
    id: string;
    email: string;
    nombres: string;
    apellidos: string;
    role: 'ADMIN' | 'OPERADOR' | 'CLIENTE';
  } | null;
  token: string | null;  // JWT persistido en localStorage
}

// Acciones disponibles
login(email, password)  → llama POST /api/v1/auth/login, guarda token
logout()                → limpia estado y localStorage
isAuthenticated()       → boolean
isAdmin()               → role === 'ADMIN'
```

---

## Router — Navigation Guards (`router/index.ts`)

| Guard | Comportamiento |
|---|---|
| `requiresGuest` | Si ya está autenticado, redirige a `/admin` o `/` |
| `requiresAuth` | Si no está autenticado, redirige a `/login` |
| `requiresAdmin` | Si no es ADMIN, redirige a `/acceso-denegado` |

---

## Servicios API (`services/`)

Todos los servicios utilizan `api-client.ts`, que configura Axios con:
- **Base URL** desde `import.meta.env.VITE_API_URL`
- **Interceptor de request**: agrega `Authorization: Bearer <token>` automáticamente
- **Interceptor de response**: captura errores 401 y redirige al login

```typescript
// services/auth.service.ts
login(dto)         → POST /api/v1/auth/login
register(dto)      → POST /api/v1/auth/register
getProfile()       → GET  /api/v1/auth/me
updateProfile(dto) → PATCH /api/v1/auth/me

// services/vehiculos.service.ts
getMarketplace()   → GET /api/v1/vehiculos/marketplace
search(params)     → GET /api/v1/vehiculos/search
getById(id)        → GET /api/v1/vehiculos/:id

// services/reservas.service.ts
create(dto)        → POST  /api/v1/reservas
getMyReservas()    → GET   /api/v1/reservas/my
getById(id)        → GET   /api/v1/reservas/:id
cancel(id)         → PATCH /api/v1/reservas/:id/cancel

// services/admin.service.ts
// Vehículos, agencias, empresas, usuarios, reservas, alquileres,
// devoluciones, pagos, facturas, mantenimientos, kardex, historial
```

---

## Composables — TanStack Vue Query (`composables/`)

Los composables encapsulan las queries y mutaciones para que los componentes no accedan directamente a los servicios:

```typescript
// composables/useVehiculos.ts
useMarketplace()             → useQuery (lista pública)
useVehiculo(id)              → useQuery (detalle)
useVehiculosSearch(params)   → useQuery (búsqueda filtrada)

// composables/useReservas.ts
useMyReservas()              → useQuery
useReserva(id)               → useQuery
useCreateReserva()           → useMutation → POST /reservas
useCancelReserva()           → useMutation → PATCH /reservas/:id/cancel

// composables/useAdmin.ts
useAdminDashboard()          → useQuery (estadísticas)
useAdminVehiculos()          → useQuery
useAdminReservas()           → useQuery
useAdminUsers()              → useQuery
```

---

## Tipos de Dominio (`types/domain.ts`)

Interfaces TypeScript que reflejan el schema Prisma del backend:

```typescript
Vehiculo          // placa, color, año, precioDia, modelo, marca, agencia, categoría
Reserva           // codigoReserva, fechaInicio, fechaFin, diasTotal, totalAmount, status
Alquiler          // kmSalida, kmEntrada, fechaInicio, fechaFin, status
Devolucion        // kmEntrada, estadoVehiculo, cargoExtra
Pago              // monto, metodoPago, status
Factura           // numeroFactura, subtotal, iva, total, detalles
Usuario           // email, nombres, apellidos, role
Cliente           // numeroLicencia, fechaVencLicencia
```

---

## Validaciones del Frontend (`utils/validators.ts`)

Módulo dedicado con validadores puros (sin dependencia de Vue):

| Función | Valida |
|---|---|
| `email(v)` | Formato de email |
| `password(v)` | Mínimo 6, máximo 100 caracteres |
| `confirmarPassword(p, c)` | Coincidencia de contraseñas |
| `cedulaEc(v)` | Cédula ecuatoriana — 10 dígitos + algoritmo de dígito verificador |
| `rucEc(v)` | RUC ecuatoriano — 13 dígitos |
| `placaEc(v)` | Formato de placa ecuatoriana (`ABC-1234`) |
| `anioVehiculo(v)` | Rango 1990 – año actual + 1 |
| `fechaHoyOFutura(v)` | Fecha no anterior a hoy |
| `rangoFechas(ini, fin)` | Fecha fin posterior a fecha inicio |
| `numeroPositivo(v)` | Precio/monto mayor a 0 |
| `enteroNoNegativo(v)` | Kilometraje sin negativos |
| `telefonoOpc(v)` | Teléfono opcional con formato |
| `numeroLicencia(v)` | Alfanumérico 4–20 caracteres |
| `soloLetras(v)` | Nombres y apellidos sin números |
| `minLen(v, n)` | Longitud mínima configurable |

---

## Preparado para Escalado

| Cambio futuro | Qué adaptar |
|---|---|
| **Reto 2 — microservicios** | Solo cambiar `VITE_API_URL` en `.env` — ningún componente tiene URLs fijas |
| **Nuevos módulos** | Agregar ruta en `router/index.ts` + página en `pages/admin/` |
| **App móvil** | Los composables y servicios son reutilizables en Ionic Vue o Quasar |
| **Internacionalización (i18n)** | Centralizar textos en archivos de traducción (vue-i18n) |
