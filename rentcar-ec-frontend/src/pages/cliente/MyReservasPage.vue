<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight">Mis reservas</h1>
        <p class="text-zinc-500 text-sm mt-1">Historial de tus alquileres</p>
      </div>
      <RouterLink to="/buscar" class="btn-primary flex items-center gap-2 text-sm">
        <Search class="w-4 h-4" /> Buscar autos
      </RouterLink>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-orange-500" />
    </div>

    <div v-else-if="reservas.length === 0" class="card text-center py-20">
      <div class="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Calendar class="w-8 h-8 text-zinc-600" />
      </div>
      <p class="text-white font-bold mb-1">No tienes reservas todavía</p>
      <p class="text-sm text-zinc-500 mb-6">Busca un auto y realiza tu primera reserva</p>
      <RouterLink to="/buscar" class="btn-primary inline-flex items-center gap-2 text-sm">
        Buscar vehículos
      </RouterLink>
    </div>

    <div v-else class="space-y-3">
      <RouterLink
        v-for="r in reservas"
        :key="r.id"
        :to="`/mis-reservas/${r.id}`"
        class="card p-5 flex items-start justify-between gap-4 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200 block"
      >
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Car class="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p class="font-bold text-white">
              {{ r.vehiculo?.modelo?.marca?.nombre }} {{ r.vehiculo?.modelo?.nombre }} {{ r.vehiculo?.anio }}
            </p>
            <p class="text-sm text-zinc-500 mt-0.5">
              {{ r.fechaInicio }} → {{ r.fechaFin }}
              <span v-if="r.diasTotal > 0" class="ml-1">({{ r.diasTotal }}d)</span>
            </p>
            <p v-if="r.codigoReserva" class="text-xs text-zinc-600 font-mono mt-1">#{{ r.codigoReserva }}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="badge" :class="STATUS_MAP[r.status]?.cls ?? 'bg-zinc-800 text-zinc-400'">
            {{ STATUS_MAP[r.status]?.label ?? r.status }}
          </span>
          <p class="text-lg font-black text-white mt-2">${{ Number(r.totalAmount).toFixed(2) }}</p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, Loader2, Car, Search } from 'lucide-vue-next';
import { useMyReservas } from '@/composables/useReservas';
import type { Reserva, ReservaStatus } from '@/types/domain';

const STATUS_MAP: Record<ReservaStatus, { label: string; cls: string }> = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'bg-amber-500/20  text-amber-400  border border-amber-500/30'  },
  CONFIRMADA: { label: 'Confirmada', cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  ACTIVA:     { label: 'Activa',     cls: 'bg-blue-500/20   text-blue-400   border border-blue-500/30'   },
  COMPLETADA: { label: 'Completada', cls: 'bg-zinc-700      text-zinc-400'                               },
  CANCELADA:  { label: 'Cancelada',  cls: 'bg-red-500/20    text-red-400    border border-red-500/30'    },
};

const { data, isLoading } = useMyReservas();
const reservas = computed<Reserva[]>(() => (data.value as { data?: Reserva[] })?.data ?? []);
</script>