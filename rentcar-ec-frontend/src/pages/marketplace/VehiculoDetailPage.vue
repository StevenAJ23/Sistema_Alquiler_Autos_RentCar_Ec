<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <button @click="router.go(-1)" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white mb-6 transition-colors">
      <ChevronLeft class="w-4 h-4" /> Volver
    </button>

    <div v-if="isLoading" class="flex items-center justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-orange-500" />
    </div>
    <div v-else-if="!v" class="text-center py-24 text-zinc-500">Vehículo no encontrado</div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Info -->
      <div class="lg:col-span-2 space-y-5">
        <div class="card overflow-hidden">
          <!-- Image -->
          <div class="h-64 bg-zinc-800 flex items-center justify-center relative">
            <img v-if="v.imagenUrl" :src="getImageUrl(v.imagenUrl)" :alt="v.placa" class="w-full h-full object-cover" />
            <div v-else class="flex flex-col items-center gap-3">
              <Car class="w-20 h-20 text-zinc-700" />
              <p class="text-xs text-zinc-600">Sin imagen disponible</p>
            </div>
            <div class="absolute top-4 right-4">
              <span class="badge" :class="v.status === 'DISPONIBLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-700 text-zinc-400'">
                {{ v.status }}
              </span>
            </div>
          </div>

          <div class="p-6">
            <div class="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 class="text-2xl font-black text-white">
                  {{ v.modelo?.marca?.nombre }} {{ v.modelo?.nombre }} {{ v.anio }}
                </h1>
                <p class="text-zinc-500 mt-1">{{ v.placa }} · {{ v.color }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div v-for="spec in specs" :key="spec.label" class="card-light p-3">
                <p class="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">{{ spec.label }}</p>
                <p class="text-sm font-bold text-white">{{ spec.value }}</p>
              </div>
            </div>

            <p v-if="v.descripcion" class="mt-5 text-sm text-zinc-400 leading-relaxed">{{ v.descripcion }}</p>

            <div v-if="v.agencia" class="mt-5 flex items-start gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
              <MapPin class="w-4 h-4 mt-0.5 shrink-0 text-orange-400" />
              <span class="text-sm text-zinc-300">
                <strong class="text-white">{{ v.agencia.nombre }}</strong>
                <template v-if="v.agencia.ciudad"> · {{ v.agencia.ciudad.nombre }}</template>
                <template v-if="v.agencia.direccion"> — {{ v.agencia.direccion }}</template>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking panel -->
      <div>
        <div class="card p-6 sticky top-24">
          <div class="text-center mb-5">
            <span class="text-4xl font-black text-orange-500">${{ Number(v.precioDia).toFixed(2) }}</span>
            <span class="text-zinc-500 text-sm ml-1">/día</span>
          </div>

          <div v-if="fechaInicio && fechaFin" class="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <div class="flex justify-between text-zinc-400">
              <span>Desde</span><span class="text-white font-medium">{{ fechaInicio }}</span>
            </div>
            <div class="flex justify-between text-zinc-400">
              <span>Hasta</span><span class="text-white font-medium">{{ fechaFin }}</span>
            </div>
            <div v-if="dias > 0" class="flex justify-between font-bold border-t border-zinc-700 pt-2 mt-1">
              <span class="text-zinc-300">Subtotal ({{ dias }}d)</span>
              <span class="text-orange-500">${{ (Number(v.precioDia) * dias).toFixed(2) }}</span>
            </div>
          </div>
          <p v-else class="text-xs text-center text-zinc-600 mb-4">Selecciona fechas al buscar para ver el total</p>

          <button @click="handleReservar" class="btn-primary w-full text-sm">
            {{ auth.isAuthenticated ? 'Reservar ahora' : 'Inicia sesión para reservar' }}
          </button>
          <p class="text-center text-xs text-zinc-600 mt-3">Sin cargos hasta confirmar</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Car, MapPin, Loader2, ChevronLeft } from 'lucide-vue-next';
import { useVehiculo } from '@/composables/useVehiculos';
import { useAuthStore } from '@/stores/auth';
import { getImageUrl } from '@/lib/utils';
import type { Vehiculo } from '@/types/domain';

const route  = useRoute();
const router = useRouter();
const auth   = useAuthStore();
const id     = route.params.id as string;

const fechaInicio = computed(() => route.query.fechaInicio as string ?? '');
const fechaFin    = computed(() => route.query.fechaFin    as string ?? '');
const dias        = computed(() => {
  if (!fechaInicio.value || !fechaFin.value) return 0;
  return Math.max(1, Math.ceil((new Date(fechaFin.value).getTime() - new Date(fechaInicio.value).getTime()) / 86_400_000));
});

const { data, isLoading } = useVehiculo(id);
const v = computed<Vehiculo | undefined>(() => data.value?.data);

const specs = computed(() => v.value ? [
  { label: 'Categoría',    value: v.value.categoria?.nombre        ?? '—' },
  { label: 'Combustible',  value: v.value.tipoCombustible?.nombre  ?? '—' },
  { label: 'Transmisión',  value: v.value.tipoTransmision?.nombre  ?? '—' },
  { label: 'Capacidad',    value: `${v.value.numeroPasajeros ?? '—'} plazas` },
  { label: 'Año',          value: String(v.value.anio)                     },
  { label: 'Kilometraje',  value: `${v.value.kilometraje?.toLocaleString() ?? '—'} km` },
] : []);

function handleReservar() {
  if (!auth.isAuthenticated) { router.push('/login'); return; }
  const qs = new URLSearchParams();
  if (fechaInicio.value) qs.set('fechaInicio', fechaInicio.value);
  if (fechaFin.value)    qs.set('fechaFin', fechaFin.value);
  router.push(`/reservar/${id}?${qs.toString()}`);
}
</script>