# RentCar EC — Frontend

SPA del sistema de alquiler de autos. Construida con **React 18 + Vite + TypeScript + Tailwind CSS + React Query**.

---

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173`

---

## Stack tecnológico

- **Framework**: React 18 + Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + Radix UI
- **Estado global**: Zustand
- **Datos (API)**: TanStack Query (React Query) + Axios
- **Formularios**: React Hook Form
- **Enrutamiento**: React Router DOM v6

---

## Páginas disponibles

| Ruta                        | Descripción                         | Acceso      |
|-----------------------------|-------------------------------------|-------------|
| `/`                         | Home con buscador de autos          | Público     |
| `/search`                   | Búsqueda y filtros de vehículos     | Público     |
| `/vehiculos/:id`            | Detalle del vehículo                | Público     |
| `/reserva/:vehiculoId`      | Formulario de reserva               | Autenticado |
| `/mis-reservas`             | Mis reservas activas e historial    | Autenticado |
| `/mis-reservas/:id`         | Detalle de reserva                  | Autenticado |
| `/admin`                    | Dashboard administrador             | ADMIN       |
| `/admin/vehiculos`          | CRUD vehículos                      | ADMIN       |
| `/admin/agencias`           | CRUD agencias                       | ADMIN       |
| `/admin/empresas`           | CRUD empresas                       | ADMIN       |
| `/admin/reservas`           | Gestión de reservas                 | ADMIN       |
| `/admin/alquileres`         | Gestión de alquileres               | ADMIN       |
| `/admin/users`              | Gestión de usuarios                 | ADMIN       |
| `/login`                    | Inicio de sesión                    | Público     |
| `/register`                 | Registro de cliente                 | Público     |

---

## Credenciales de prueba

| Rol     | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@rentcar.ec         | Admin2025!  |
| Cliente | cliente@test.ec          | Cliente2025! |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── admin/        # AdminTable, AdminFormModal — CRUD genérico
│   └── layout/       # MainLayout (público) y AdminLayout (panel admin)
├── hooks/
│   ├── useAuth.ts    # Autenticación y perfil
│   ├── useVehiculos.ts  # Catálogo y disponibilidad
│   ├── useReservas.ts   # Reservas del cliente
│   └── useAdmin.ts   # Operaciones de administración
├── lib/
│   ├── api-client.ts # Axios configurado con interceptores JWT
│   └── utils.ts      # Utilidades compartidas
├── pages/
│   ├── marketplace/  # Home, Search, VehiculoDetail, Reserva
│   ├── cliente/      # MyReservas, ReservaDetail
│   ├── admin/        # Dashboard y CRUD de entidades
│   └── auth/         # Login, Register
├── router/
│   └── AppRouter.tsx # Rutas protegidas por rol
├── services/
│   ├── auth.service.ts      # Login, registro, perfil
│   ├── vehiculos.service.ts # Búsqueda y detalle
│   ├── reservas.service.ts  # Crear, listar, cancelar
│   └── admin.service.ts     # Operaciones de admin
├── store/
│   └── auth.store.ts        # Estado global de autenticación (Zustand)
└── types/
    └── domain.ts            # Interfaces TypeScript del dominio
```

---

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000/api/v1
```

En producción apunta al backend desplegado:
```env
VITE_API_URL=https://rentcar-api.render.com/api/v1
```

---

## Scripts disponibles

```bash
npm run dev       # Desarrollo con HMR
npm run build     # Compilar para producción
npm run preview   # Vista previa del build
```

---

## Arquitectura preparada para escalado

Cada capa está desacoplada para facilitar la migración futura:

- `services/` — Única capa que conoce la URL del backend. En Reto 2 solo cambia la URL base.
- `hooks/` — Lógica React Query reutilizable. Compatible con React Native (Reto 3).
- `store/` — Estado global Zustand. Compatible con React Native (Reto 3).
- `types/` — Interfaces compartidas con el backend TypeScript.
- `router/` — En Reto 3 se reemplaza por React Navigation.
- `pages/` — En Reto 3 se convierten en `screens/`.
