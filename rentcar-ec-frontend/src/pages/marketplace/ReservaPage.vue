<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <button @click="router.go(-1)" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white mb-6 transition-colors">
      <ChevronLeft class="w-4 h-4" /> Volver
    </button>

    <div v-if="isLoading" class="flex items-center justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-orange-500" />
    </div>
    <div v-else-if="!v" class="text-center py-24 text-zinc-500">Vehículo no encontrado</div>
    <div v-else>
      <h1 class="text-2xl font-black text-white mb-6 tracking-tight">Confirmar reserva</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">

          <!-- Resumen vehículo -->
          <div class="card p-5 flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Car class="w-7 h-7 text-orange-400" />
            </div>
            <div>
              <p class="font-black text-white">{{ v.modelo?.marca?.nombre }} {{ v.modelo?.nombre }} {{ v.anio }}</p>
              <p class="text-sm text-zinc-500">{{ v.placa }} · {{ v.categoria?.nombre }}</p>
              <p class="text-orange-500 font-bold mt-1">${{ Number(v.precioDia).toFixed(2) }}/día</p>
            </div>
          </div>

          <!-- Fechas -->
          <div class="card p-5">
            <h2 class="font-bold text-white mb-4">Fechas de alquiler</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Fecha inicio</label>
                <input v-model="fechaInicio" type="date" required class="input-base" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Fecha fin</label>
                <input v-model="fechaFin" type="date" :min="fechaInicio" required class="input-base" />
              </div>
            </div>
            <p v-if="dias > 0" class="text-sm text-zinc-500 mt-3">
              <span class="text-orange-400 font-bold">{{ dias }}</span> día{{ dias !== 1 ? 's' : '' }} de alquiler
            </p>
          </div>

          <!-- Seguros -->
          <div v-if="seguros.length > 0" class="card p-5">
            <h2 class="font-bold text-white mb-4">Seguro de viaje</h2>
            <div class="space-y-2">
              <label class="flex items-center gap-3 p-3 border border-zinc-700 rounded-xl cursor-pointer hover:border-zinc-600 hover:bg-zinc-800/40 transition-all">
                <input type="radio" v-model="seguroId" value="" class="accent-orange-500" />
                <span class="text-sm text-zinc-400">Sin seguro adicional</span>
              </label>
              <label v-for="s in seguros" :key="s.id" class="flex items-center gap-3 p-3 border border-zinc-700 rounded-xl cursor-pointer hover:border-orange-500/40 hover:bg-zinc-800/40 transition-all">
                <input type="radio" v-model="seguroId" :value="s.id" class="accent-orange-500" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-white">{{ s.nombre }}</p>
                  <p v-if="s.descripcion" class="text-xs text-zinc-500 truncate">{{ s.descripcion }}</p>
                </div>
                <span class="text-sm font-bold text-orange-400 whitespace-nowrap">+${{ Number(s.precioDia).toFixed(2) }}/día</span>
              </label>
            </div>
          </div>

          <!-- Extras -->
          <div v-if="extras.length > 0" class="card p-5">
            <h2 class="font-bold text-white mb-4">Equipamiento adicional</h2>
            <div class="space-y-2">
              <label v-for="ex in extras" :key="ex.id" class="flex items-center gap-3 p-3 border border-zinc-700 rounded-xl cursor-pointer hover:border-orange-500/40 hover:bg-zinc-800/40 transition-all">
                <input type="checkbox" :value="ex.id" v-model="extrasSeleccionados" class="w-4 h-4 rounded accent-orange-500" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-white">{{ ex.nombre }}</p>
                  <p v-if="ex.descripcion" class="text-xs text-zinc-500 truncate">{{ ex.descripcion }}</p>
                </div>
                <span class="text-sm font-bold text-orange-400 whitespace-nowrap">+${{ Number(ex.precioDia).toFixed(2) }}/día</span>
              </label>
            </div>
          </div>

          <!-- Notas -->
          <div class="card p-5">
            <h2 class="font-bold text-white mb-3">Notas <span class="text-xs text-zinc-600 font-normal">(opcional)</span></h2>
            <textarea
              v-model="notas"
              rows="3"
              placeholder="Instrucciones especiales, preferencias de entrega..."
              class="input-base resize-none"
            />
          </div>
        </div>

        <!-- Resumen de pago -->
        <div>
          <div class="card p-5 sticky top-24">
            <h2 class="font-bold text-white mb-4">Resumen de pago</h2>
            <div class="space-y-2.5 text-sm">
              <div class="flex justify-between text-zinc-400">
                <span>Tarifa base ({{ dias > 0 ? dias : '?' }}d)</span>
                <span>${{ tarifaBaseTotal.toFixed(2) }}</span>
              </div>
              <div v-if="seguroActual" class="flex justify-between text-zinc-400">
                <span>{{ seguroActual.nombre }}</span>
                <span>${{ seguroTotal.toFixed(2) }}</span>
              </div>
              <div v-if="extrasSeleccionados.length > 0" class="flex justify-between text-zinc-400">
                <span>Extras ({{ dias }}d)</span>
                <span>${{ extrasTotal.toFixed(2) }}</span>
              </div>
              <div class="border-t border-zinc-800 pt-3 flex justify-between font-black text-base">
                <span class="text-white">Total estimado</span>
                <span class="text-orange-500">${{ totalEstimado.toFixed(2) }}</span>
              </div>
            </div>
            <p class="text-xs text-zinc-600 mt-2 text-center">El precio final es calculado por el servidor</p>

            <div v-if="submitError" class="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg p-2.5">
              <span>{{ submitError }}</span>
            </div>
            <button
              @click="handleSubmit"
              :disabled="!fechaInicio || !fechaFin || dias < 1 || createReserva.isPending.value"
              class="btn-primary w-full mt-5 text-sm flex items-center justify-center gap-2"
            >
              <Loader2 v-if="createReserva.isPending.value" class="w-4 h-4 animate-spin" />
              {{ createReserva.isPending.value ? 'Creando reserva...' : 'Confirmar reserva' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Loader2, ChevronLeft, Car } from 'lucide-vue-next';
import { useVehiculo } from '@/composables/useVehiculos';
import { useCreateReserva } from '@/composables/useReservas';
import type { ExtraEquipamiento, Seguro, CanalVenta, Vehiculo } from '@/types/domain';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
const route  = useRoute();
const router = useRouter();

const vehiculoId  = route.params.vehiculoId as string;
const fechaInicio = ref(route.query.fechaInicio as string ?? '');
const fechaFin    = ref(route.query.fechaFin    as string ?? '');
const seguroId    = ref('');
const canalVentaId = ref('');
const extrasSeleccionados = ref<string[]>([]);
const notas = ref('');
const extras  = ref<ExtraEquipamiento[]>([]);
const seguros = ref<Seguro[]>([]);

const { data, isLoading } = useVehiculo(vehiculoId);
const v = computed<Vehiculo | undefined>(() => data.value?.data);
const createReserva = useCreateReserva();
const submitError = ref<string | null>(null);

onMounted(async () => {
  try {
    const [resExtras, resSeguros, resCanales] = await Promise.all([
      fetch(`${API_URL}/extras`).then(r => r.json()),
      fetch(`${API_URL}/seguros`).then(r => r.json()),
      fetch(`${API_URL}/canales-venta`).then(r => r.json()),
    ]);
    extras.value  = (resExtras  as { data?: ExtraEquipamiento[] })?.data ?? [];
    seguros.value = (resSeguros as { data?: Seguro[] })?.data ?? [];
    const lista: CanalVenta[] = (resCanales as { data?: CanalVenta[] })?.data ?? [];
    const web = lista.find(c => c.codigo === 'WEB') ?? lista[0];
    if (web) canalVentaId.value = web.id;
  } catch { /* silent */ }
});

const dias = computed(() => {
  if (!fechaInicio.value || !fechaFin.value) return 0;
  return Math.max(1, Math.ceil((new Date(fechaFin.value).getTime() - new Date(fechaInicio.value).getTime()) / 86_400_000));
});

const seguroActual    = computed(() => seguros.value.find(s => s.id === seguroId.value));
const seguroTotal     = computed(() => Number(seguroActual.value?.precioDia ?? 0) * dias.value);
const extrasTotal     = computed(() => extrasSeleccionados.value.reduce((acc, xId) => {
  const ex = extras.value.find(e => e.id === xId);
  return acc + Number(ex?.precioDia ?? 0) * dias.value;
}, 0));
const tarifaBaseTotal = computed(() => Number(v.value?.precioDia ?? 0) * dias.value);
const totalEstimado   = computed(() => tarifaBaseTotal.value + seguroTotal.value + extrasTotal.value);

async function handleSubmit() {
  submitError.value = null;
  if (!v.value?.agencia?.id) {
    submitError.value = 'No se pudo obtener la agencia del vehículo. Recarga la página.';
    return;
  }
  try {
    const res = await createReserva.mutateAsync({
      vehiculoId,
      agenciaId: v.value!.agencia.id,
      fechaInicio: fechaInicio.value,
      fechaFin:    fechaFin.value,
      seguroId:    seguroId.value || undefined,
      canalVentaId: canalVentaId.value || undefined,
      extras: extrasSeleccionados.value.map(id => ({ extraId: id, cantidad: 1 })),
      notas: notas.value || undefined,
    });
    const reservaId = (res as { data?: { id?: string } })?.data?.id;
    router.push(reservaId ? `/mis-reservas/${reservaId}` : '/mis-reservas');
  } catch (err: unknown) {
    submitError.value = (err as { message?: string }).message ?? 'Error al crear la reserva';
  }
}
</script>