<template>
  <div class="max-w-6xl mx-auto px-4 py-8">

    <!-- Search bar -->
    <form
      @submit.prevent="handleSearch"
      class="card p-3 flex flex-col sm:flex-row gap-2 items-end mb-8 shadow-xl shadow-black/30 border border-zinc-800"
    >
      <div class="flex-1 px-3 py-2">
        <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Fecha inicio (Opcional)</label>
        <input v-model="fechaInicio" type="date" class="w-full bg-transparent text-white text-sm outline-none cursor-pointer" />
      </div>
      <div class="w-px bg-zinc-800 hidden sm:block self-stretch" />
      <div class="flex-1 px-3 py-2">
        <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Fecha fin (Opcional)</label>
        <input v-model="fechaFin" type="date" :min="fechaInicio" class="w-full bg-transparent text-white text-sm outline-none cursor-pointer" />
      </div>
      <button type="submit" class="btn-primary flex items-center justify-center gap-2 text-sm shrink-0 mx-1 min-w-[120px]">
        <Search class="w-4 h-4" /> Buscar
      </button>
    </form>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
      <Loader2 class="w-10 h-10 animate-spin text-orange-500 mb-4" />
      <p class="text-zinc-500 animate-pulse">Cargando flota...</p>
    </div>

    <!-- No results -->
    <div v-else-if="vehiculos.length === 0" class="text-center py-24 bg-zinc-900/50 rounded-3xl border border-zinc-800">
      <div class="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Car class="w-10 h-10 text-zinc-600" />
      </div>
      <p class="text-zinc-400 font-medium mb-2">No hay vehículos disponibles</p>
      <p class="text-zinc-600 text-sm mb-6">Prueba con otras fechas o contacta con nosotros.</p>
      <button @click="router.push('/')" class="btn-outline text-sm">Volver al inicio</button>
    </div>

    <!-- Results -->
    <div v-else>
      <p class="text-sm text-zinc-500 mb-6">
        <span class="text-orange-400 font-bold">{{ vehiculos.length }}</span>
        vehículo{{ vehiculos.length !== 1 ? 's' : '' }} disponible{{ vehiculos.length !== 1 ? 's' : '' }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="v in vehiculos"
          :key="v.id"
          class="card overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-200 group"
        >
          <div class="h-40 bg-zinc-800 flex items-center justify-center">
            <img v-if="v.imagenUrl" :src="getImageUrl(v.imagenUrl)" :alt="v.placa" class="w-full h-full object-cover" />
            <Car v-else class="w-14 h-14 text-zinc-700" />
          </div>
          <div class="p-4">
            <h3 class="font-bold text-white text-sm">{{ v.modelo?.marca?.nombre }} {{ v.modelo?.nombre }} {{ v.anio }}</h3>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span v-if="v.categoria"        class="badge bg-zinc-800 text-zinc-400 border border-zinc-700">{{ v.categoria.nombre }}</span>
              <span v-if="v.tipoCombustible"  class="badge bg-zinc-800 text-zinc-400 border border-zinc-700">{{ v.tipoCombustible.nombre }}</span>
              <span v-if="v.tipoTransmision"  class="badge bg-zinc-800 text-zinc-400 border border-zinc-700">{{ v.tipoTransmision.nombre }}</span>
            </div>
            <div class="flex items-end justify-between mt-4">
              <div>
                <span class="text-xl font-black text-orange-500">${{ Number(v.precioDia).toFixed(2) }}</span>
                <span class="text-xs text-zinc-600 ml-1">/día</span>
                <p v-if="dias > 1" class="text-xs text-zinc-500 mt-0.5">Total: ${{ (Number(v.precioDia) * dias).toFixed(2) }}</p>
              </div>
              <RouterLink
                :to="`/vehiculos/${v.id}?fechaInicio=${qFechaInicio}&fechaFin=${qFechaFin}`"
                class="text-xs font-bold bg-orange-500 hover:bg-orange-400 text-black px-4 py-1.5 rounded-lg transition-colors"
              >
                Reservar
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Car, Search, Loader2 } from 'lucide-vue-next';
import { useVehiculosSearch } from '@/composables/useVehiculos';
import { getImageUrl } from '@/lib/utils';
import type { Vehiculo } from '@/types/domain';

const route = useRoute();
const router = useRouter();

const qFechaInicio = computed(() => route.query.fechaInicio as string ?? '');
const qFechaFin    = computed(() => route.query.fechaFin    as string ?? '');
const fechaInicio  = ref(qFechaInicio.value);
const fechaFin     = ref(qFechaFin.value);
const hasSearched  = computed(() => !!qFechaInicio.value && !!qFechaFin.value);

const dias = computed(() => {
  if (!qFechaInicio.value || !qFechaFin.value) return 1;
  return Math.max(1, Math.ceil((new Date(qFechaFin.value).getTime() - new Date(qFechaInicio.value).getTime()) / 86_400_000));
});

const { data, isLoading } = useVehiculosSearch({ fechaInicio: qFechaInicio.value || undefined, fechaFin: qFechaFin.value || undefined });
const vehiculos = ref<Vehiculo[]>([]);
watch(data, (d) => { vehiculos.value = (d as { data?: Vehiculo[] })?.data ?? []; }, { immediate: true });

function handleSearch() {
  router.push({ path: '/buscar', query: { fechaInicio: fechaInicio.value, fechaFin: fechaFin.value } });
}
</script>
