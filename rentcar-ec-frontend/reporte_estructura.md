# Arquitectura del Frontend — RentCar EC

Descripción técnica de la arquitectura y organización del frontend del sistema de alquiler de autos.

---

## Stack Tecnológico

- **Framework**: React 18 con Vite (compilación rápida, HMR)
- **Lenguaje**: TypeScript (tipado fuerte y menos errores en producción)
- **Estilos**: Tailwind CSS + Radix UI (componentes accesibles, diseño moderno)
- **Estado global**: Zustand (ligero y composable)
- **Datos (API)**: TanStack Query (React Query) + Axios
- **Formularios**: React Hook Form
- **Enrutamiento**: React Router DOM v6

---

## Estructura de Carpetas

La organización de `src/` sigue un patrón modular orientado al dominio:

| Carpeta        | Propósito                                                              |
|----------------|------------------------------------------------------------------------|
| `components/`  | Componentes reutilizables: tarjetas de vehículos, formularios, layouts |
| `pages/`       | Vistas principales agrupadas por contexto: marketplace, cliente, admin  |
| `services/`    | Única capa que conoce la API — Reto 2: solo cambia la URL base         |
| `store/`       | Estado global de autenticación y sesión (Zustand)                      |
| `router/`      | Configuración de rutas protegidas por rol                              |
| `hooks/`       | Lógica de carga y mutación extraída de los componentes (React Query)   |
| `types/`       | Interfaces TypeScript de las entidades del dominio (Vehiculo, Reserva, etc.) |
| `lib/`         | Configuración de Axios, utilidades de clases CSS                       |

---

## Flujo de Datos — Buscar y Reservar un Vehículo

1. **Búsqueda**: El cliente ingresa ciudad, categoría y fechas → parámetros en URL
2. **Listado**: `useVehiculos` (React Query) llama a `vehiculos.service.ts` con los filtros
3. **Detalle**: Se navega a `/vehiculos/:id` → `VehiculoDetailPage` muestra specs y precio
4. **Reserva**: `ReservaPage` usa React Hook Form → envía `POST /api/v1/reservas` vía `reservas.service.ts`
5. **Confirmación**: El estado global se actualiza y se muestra confirmación con código de reserva

---

## Módulo Marketplace (Público)

```
pages/marketplace/
├── HomePage.tsx          Buscador principal con filtros básicos
├── SearchPage.tsx         Listado de vehículos disponibles con filtros avanzados
├── VehiculoDetailPage.tsx  Detalle, specs, precio estimado
└── ReservaPage.tsx        Formulario de reserva con selección de extras y seguro
```

## Módulo Cliente (Autenticado)

```
pages/cliente/
├── MyReservasPage.tsx     Listado de reservas propias con estados
└── ReservaDetailPage.tsx  Detalle de reserva, estado de pago, opción de cancelación
```

## Módulo Admin

```
pages/admin/
├── AdminDashboardPage.tsx  Resumen de métricas
├── AdminVehiculosPage.tsx  CRUD de vehículos
├── AdminAgenciasPage.tsx   CRUD de agencias
├── AdminEmpresasPage.tsx   CRUD de empresas
├── AdminReservasPage.tsx   Gestión de reservas
├── AdminAlquileresPage.tsx Gestión de alquileres
└── AdminUsersPage.tsx      Gestión de usuarios
```

---

## Servicios API

```
services/
├── auth.service.ts       login(), register(), getProfile()
├── vehiculos.service.ts  getAll(), search(), getById()
├── reservas.service.ts   create(), getMyReservas(), getById(), cancel()
└── admin.service.ts      CRUD de vehículos, agencias, empresas, usuarios
```

Todos los servicios usan `api-client.ts`, que configura Axios con:
- Base URL desde `VITE_API_URL`
- Interceptor de request: agrega `Authorization: Bearer <token>`
- Interceptor de response: maneja errores 401 (redirige a login)

---

## Tipos de Dominio (`types/domain.ts`)

Interfaces principales del sistema:

```typescript
Vehiculo          // Datos del vehículo, agencia, categoría, precio/día
Reserva           // Vehículo, fechas, total, estado, extras
Alquiler          // Km salida, fecha inicio, estado
Devolucion        // Km entrada, cargo extra, estado vehículo
Pago              // Monto, método, estado
Factura           // Número, subtotal, IVA, total
Usuario / Cliente // Perfil, licencia, rol
```

---

## Componentes Reutilizables

```
components/
├── admin/
│   ├── AdminTable.tsx      Tabla genérica con acciones CRUD
│   └── AdminFormModal.tsx  Modal de formulario para crear/editar
└── layout/
    ├── MainLayout.tsx       Header público + navegación
    └── AdminLayout.tsx      Sidebar admin + área de contenido
```

---

## Estado Global (Zustand)

`store/auth.store.ts` gestiona:
- Usuario autenticado y su rol
- JWT token (persistido en localStorage)
- Acciones: `login()`, `logout()`, `setUser()`

---

## Preparado para Escalado

| Cambio futuro                   | Qué adaptar                                          |
|---------------------------------|------------------------------------------------------|
| Reto 2: microservicios          | Solo cambiar `VITE_API_URL` en `.env`                |
| Reto 3: React Native            | Reemplazar `pages/` por `screens/`, `router/` por React Navigation |
| Internacionalización (i18n)     | Centralizar textos en archivos de traducción         |
| Temas / Dark mode               | Variables CSS en Tailwind config                     |
