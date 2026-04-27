<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-black text-white tracking-tight">Dashboard</h1>
      <p class="text-zinc-500 text-sm mt-1">Resumen general del sistema</p>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-orange-500" />
    </div>
    <div v-else>
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <RouterLink
          v-for="stat in stats"
          :key="stat.label"
          :to="stat.to"
          class="card p-5 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="stat.iconBg">
              <component :is="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
            </div>
            <TrendingUp class="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
          </div>
          <p class="text-2xl font-black text-white">{{ stat.value }}</p>
          <p class="text-xs text-zinc-500 mt-1 font-medium">{{ stat.label }}</p>
        </RouterLink>
      </div>

      <!-- Últimas reservas -->
      <div v-if="reservas.length > 0" class="card overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 class="font-bold text-white text-sm">Últimas reservas</h2>
          <RouterLink to="/admin/reservas" class="text-xs text-orange-400 hover:text-orange-300 font-medium">Ver todas →</RouterLink>
        </div>
        <div class="divide-y divide-zinc-800/60">
          <div v-for="r in reservas.slice(0, 5)" :key="r.id" class="px-5 py-3.5 flex items-center justify-between text-sm hover:bg-zinc-800/30 transition-colors">
            <div class="min-w-0">
              <span class="font-mono text-xs text-zinc-500">#{{ r.codigoReserva }}</span>
              <span class="mx-2 text-zinc-700">·</span>
              <span class="text-zinc-300 font-medium">{{ r.vehiculo?.modelo?.marca?.nombre }} {{ r.vehiculo?.modelo?.nombre }}</span>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="font-bold text-white">${{ Number(r.totalAmount).toFixed(2) }}</span>
              <span class="badge" :class="STATUS_MAP[r.status]?.cls ?? 'bg-zinc-800 text-zinc-400'">
                {{ STATUS_MAP[r.status]?.label ?? r.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Car, BookOpen, Users, TrendingUp, Loader2 } from 'lucide-vue-next';
import { useAdminDashboard, useAdminReservas, useAdminUsers } from '@/composables/useAdmin';
import type { Reserva, ReservaStatus } from '@/types/domain';

const STATUS_MAP: Record<ReservaStatus, { label: string; cls: string }> = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'bg-amber-500/20  text-amber-400  border border-amber-500/30'  },
  CONFIRMADA: { label: 'Confirmada', cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  ACTIVA:     { label: 'Activa',     cls: 'bg-blue-500/20   text-blue-400   border border-blue-500/30'   },
  COMPLETADA: { label: 'Completada', cls: 'bg-zinc-700      text-zinc-400'                               },
  CANCELADA:  { label: 'Cancelada',  cls: 'bg-red-500/20    text-red-400    border border-red-500/30'    },
};

const { data: dashboard, isLoading: ld } = useAdminDashboard();
const { data: reservasRaw, isLoading: lr } = useAdminReservas();
const { data: usuariosRaw, isLoading: lu } = useAdminUsers();

const isLoading = computed(() => ld.value || lr.value || lu.value);
const reservas  = computed<Reserva[]>(() => Array.isArray(reservasRaw.value) ? reservasRaw.value as Reserva[] : []);
const usuarios  = computed<unknown[]>(() => Array.isArray(usuariosRaw.value) ? usuariosRaw.value as unknown[] : []);
const revenue   = computed(() => reservas.value.filter(r => r.status === 'CONFIRMADA' || r.status === 'COMPLETADA').reduce((acc, r) => acc + Number(r.totalAmount ?? 0), 0));

const stats = computed(() => [
  { label: 'Vehículos',            value: (dashboard.value as { totalVehiculos?: number })?.totalVehiculos ?? '—', icon: Car,        iconBg: 'bg-orange-500/10', iconColor: 'text-orange-400', to: '/admin/vehiculos' },
  { label: 'Reservas totales',     value: reservas.value.length,                                          icon: BookOpen,   iconBg: 'bg-blue-500/10',   iconColor: 'text-blue-400',   to: '/admin/reservas'  },
  { label: 'Usuarios registrados', value: usuarios.value.length,                                          icon: Users,      iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400', to: '/admin/users'     },
  { label: 'Ingresos confirmados', value: `$${revenue.value.toFixed(2)}`,                                 icon: TrendingUp, iconBg: 'bg-emerald-500/10',iconColor: 'text-emerald-400',to: '/admin/reservas'  },
]);
</script>
