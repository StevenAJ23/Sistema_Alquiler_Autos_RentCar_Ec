<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-zinc-950 pt-20 pb-32">
      <!-- Background grid -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:64px_64px] opacity-60" />
      <!-- Orange glow -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full" />

      <div class="relative max-w-5xl mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <Zap class="w-3.5 h-3.5" /> Reserva en minutos, recoge en horas
        </div>
        <h1 class="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tight mb-4">
          Tu próximo<br/>
          <span class="text-orange-500">viaje comienza</span> aquí
        </h1>
        <p class="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">
          La mejor flota de vehículos en Ecuador. Económicos, SUVs y pickups disponibles ahora mismo.
        </p>

        <!-- Search form -->
        <form
          @submit.prevent="handleSearch"
          class="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto shadow-2xl shadow-black/50"
        >
          <div class="flex-1 text-left px-3 py-2">
            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Fecha inicio</label>
            <input v-model="fechaInicio" type="date" :min="today" required class="w-full bg-transparent text-white text-sm outline-none" />
          </div>
          <div class="w-px bg-zinc-800 hidden sm:block" />
          <div class="flex-1 text-left px-3 py-2">
            <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Fecha fin</label>
            <input v-model="fechaFin" type="date" :min="fechaInicio" required class="w-full bg-transparent text-white text-sm outline-none" />
          </div>
          <button type="submit" class="btn-primary flex items-center gap-2 text-sm shrink-0 mx-1">
            <Search class="w-4 h-4" /> Buscar autos
          </button>
        </form>
      </div>
    </section>

    <!-- Stats -->
    <section class="border-y border-zinc-800 bg-zinc-900/50">
      <div class="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 divide-x divide-zinc-800">
        <div v-for="s in stats" :key="s.label" class="text-center px-6">
          <p class="text-3xl font-black text-orange-500">{{ s.value }}</p>
          <p class="text-xs text-zinc-500 mt-1 font-medium">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="max-w-5xl mx-auto px-4 py-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div v-for="f in features" :key="f.title" class="card p-6 hover:border-orange-500/40 transition-colors group">
        <div class="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
          <component :is="f.icon" class="w-5 h-5 text-orange-400" />
        </div>
        <h3 class="font-bold text-white mb-1">{{ f.title }}</h3>
        <p class="text-sm text-zinc-500">{{ f.desc }}</p>
      </div>
    </section>

    <!-- Vehículos -->
    <section class="max-w-5xl mx-auto px-4 pb-24">
      <div class="flex items-center justify-between mb-8">
        <h2 class="section-title">Vehículos disponibles</h2>
        <RouterLink to="/buscar" class="text-sm text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1">
          Ver todos <ChevronRight class="w-4 h-4" />
        </RouterLink>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <Loader2 class="w-8 h-8 animate-spin text-orange-500" />
      </div>
      <div v-else-if="vehiculos.length === 0" class="card text-center py-20 text-zinc-500">
        No hay vehículos disponibles en este momento
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="v in vehiculos.slice(0, 6)"
          :key="v.id"
          class="card overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-200 group"
        >
          <!-- Image -->
          <div class="h-44 bg-zinc-800 flex items-center justify-center relative overflow-hidden">
            <img v-if="v.imagenUrl" :src="v.imagenUrl" :alt="v.placa" class="w-full h-full object-cover" />
            <div v-else class="flex flex-col items-center gap-2">
              <Car class="w-16 h-16 text-zinc-700" />
            </div>
            <div class="absolute top-3 right-3">
              <span class="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {{ v.status }}
              </span>
            </div>
          </div>
          <!-- Info -->
          <div class="p-5">
            <h3 class="font-bold text-white text-sm leading-tight">
              {{ v.modelo?.marca?.nombre }} {{ v.modelo?.nombre }} {{ v.anio }}
            </h3>
            <p class="text-xs text-zinc-500 mt-0.5">
              {{ v.categoria?.nombre }} · {{ v.tipoCombustible?.nombre }} · {{ v.tipoTransmision?.nombre }}
            </p>
            <div class="flex items-center justify-between mt-4">
              <div>
                <span class="text-xl font-black text-orange-500">${{ Number(v.precioDia).toFixed(2) }}</span>
                <span class="text-xs text-zinc-600 ml-1">/día</span>
              </div>
              <RouterLink
                :to="`/vehiculos/${v.id}`"
                class="text-xs font-bold bg-orange-500 hover:bg-orange-400 text-black px-4 py-1.5 rounded-lg transition-colors"
              >
                Ver detalle
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Car, Search, Shield, Clock, Zap, ChevronRight, Loader2 } from 'lucide-vue-next';
import { useVehiculosMarketplace } from '@/composables/useVehiculos';
import type { Vehiculo } from '@/types/domain';

const today    = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

const fechaInicio = ref(today);
const fechaFin    = ref(tomorrow);
const router      = useRouter();

const { data, isLoading } = useVehiculosMarketplace();
const vehiculos = ref<Vehiculo[]>([]);
watch(data, (d) => { vehiculos.value = (d as { data?: Vehiculo[] })?.data ?? []; }, { immediate: true });

const stats = [
  { value: '200+', label: 'Vehículos disponibles' },
  { value: '3',    label: 'Ciudades en Ecuador'   },
  { value: '24/7', label: 'Atención al cliente'   },
];

const features = [
  { icon: Car,    title: 'Amplia flota',       desc: 'Desde compactos hasta SUVs y pickups de última generación.' },
  { icon: Shield, title: 'Seguros incluidos',  desc: 'Viaja protegido con cobertura completa en todo el país.'    },
  { icon: Clock,  title: 'Reserva en minutos', desc: 'Proceso 100% digital, sin filas ni trámites presenciales.'  },
];

function handleSearch() {
  router.push(`/buscar?fechaInicio=${fechaInicio.value}&fechaFin=${fechaFin.value}`);
}
</script>
