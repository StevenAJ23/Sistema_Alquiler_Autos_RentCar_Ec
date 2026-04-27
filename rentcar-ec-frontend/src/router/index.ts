import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth (solo si NO está logueado)
    {
      path: '/login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      component: () => import('@/pages/auth/RegisterPage.vue'),
      meta: { requiresGuest: true },
    },

    // Marketplace y cliente — con MainLayout
    {
      path: '/',
      component: () => import('@/components/layout/MainLayout.vue'),
      children: [
        { path: '', component: () => import('@/pages/marketplace/HomePage.vue') },
        { path: 'buscar', component: () => import('@/pages/marketplace/SearchPage.vue') },
        { path: 'vehiculos/:id', component: () => import('@/pages/marketplace/VehiculoDetailPage.vue') },
        {
          path: 'reservar/:vehiculoId',
          component: () => import('@/pages/marketplace/ReservaPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'mis-reservas',
          component: () => import('@/pages/cliente/MyReservasPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'mis-reservas/:id',
          component: () => import('@/pages/cliente/ReservaDetailPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'perfil',
          component: () => import('@/pages/cliente/ProfilePage.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },

    // Admin — con AdminLayout
    {
      path: '/admin',
      component: () => import('@/components/layout/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        { path: '', component: () => import('@/pages/admin/AdminDashboardPage.vue') },
        { path: 'vehiculos', component: () => import('@/pages/admin/AdminVehiculosPage.vue') },
        { path: 'agencias', component: () => import('@/pages/admin/AdminAgenciasPage.vue') },
        { path: 'empresas', component: () => import('@/pages/admin/AdminEmpresasPage.vue') },
        { path: 'reservas', component: () => import('@/pages/admin/AdminReservasPage.vue') },
        { path: 'alquileres', component: () => import('@/pages/admin/AdminAlquileresPage.vue') },
        { path: 'pagos',            component: () => import('@/pages/admin/AdminPagosPage.vue')          },
        { path: 'facturas',         component: () => import('@/pages/admin/AdminFacturasPage.vue')       },
        { path: 'devoluciones',     component: () => import('@/pages/admin/AdminDevolucionesPage.vue')   },
        { path: 'historial',        component: () => import('@/pages/admin/AdminHistorialPage.vue')      },
        { path: 'kardex',           component: () => import('@/pages/admin/AdminKardexPage.vue')         },
        { path: 'mantenimientos',   component: () => import('@/pages/admin/AdminMantenimientosPage.vue') },
        { path: 'users',            component: () => import('@/pages/admin/AdminUsersPage.vue')          },
      ],
    },

    { path: '/acceso-denegado', component: () => import('@/pages/errors/AccessDeniedPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return auth.isAdmin() ? '/admin' : '/';
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login';
  }

  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated) return '/login';
    if (!auth.isAdmin()) return '/acceso-denegado';
  }
});

export default router;
