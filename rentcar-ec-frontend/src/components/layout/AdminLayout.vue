<template>
  <div class="min-h-screen flex bg-zinc-950">

    <!-- Sidebar -->
    <aside class="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      <!-- Logo -->
      <div class="h-16 flex items-center px-5 border-b border-zinc-800">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <Car class="w-4 h-4 text-black" />
          </div>
          <span class="font-black text-white text-sm tracking-tight">RENT<span class="text-orange-500">CAR</span></span>
          <span class="ml-1 text-xs text-zinc-500 font-medium">Admin</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <RouterLink
          v-for="item in NAV"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          :class="[
            $route.path === item.to || (!item.end && $route.path.startsWith(item.to))
              ? 'bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          ]"
        >
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="border-t border-zinc-800 p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-black font-black text-sm">
            {{ auth.user?.nombres?.charAt(0) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-white truncate">
              {{ auth.user?.nombres }} {{ auth.user?.apellidos }}
            </p>
            <p class="text-xs text-zinc-500 truncate">{{ auth.user?.email }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 hover:bg-zinc-800 px-3 py-2 rounded-lg transition-all"
        >
          <LogOut class="w-3.5 h-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Content -->
    <div class="flex-1 flex flex-col overflow-auto">
      <main class="flex-1 p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Car, Building2, Building, BookOpen, Users, LayoutDashboard, LogOut, Key, CreditCard, FileText, RotateCcw, History, Activity, Wrench } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const $route = useRoute();

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',  end: true  },
  { to: '/admin/vehiculos',  icon: Car,             label: 'Vehículos',  end: false },
  { to: '/admin/agencias',   icon: Building,        label: 'Agencias',   end: false },
  { to: '/admin/empresas',   icon: Building2,       label: 'Empresas',   end: false },
  { to: '/admin/reservas',   icon: BookOpen,        label: 'Reservas',   end: false },
  { to: '/admin/alquileres', icon: Key,             label: 'Alquileres', end: false },
  { to: '/admin/pagos',          icon: CreditCard,  label: 'Pagos',          end: false },
  { to: '/admin/facturas',       icon: FileText,    label: 'Facturas',       end: false },
  { to: '/admin/devoluciones',   icon: RotateCcw,   label: 'Devoluciones',   end: false },
  { to: '/admin/mantenimientos', icon: Wrench,       label: 'Mantenimientos', end: false },
  { to: '/admin/kardex',         icon: Activity,    label: 'Kardex',         end: false },
  { to: '/admin/historial',      icon: History,     label: 'Historial',      end: false },
  { to: '/admin/users',          icon: Users,       label: 'Usuarios',       end: false },
];

function handleLogout() {
  auth.clearAuth();
  router.push('/login');
}
</script>
