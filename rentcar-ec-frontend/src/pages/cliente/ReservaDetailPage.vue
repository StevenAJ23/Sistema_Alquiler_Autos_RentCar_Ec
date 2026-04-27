<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <RouterLink to="/mis-reservas" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white mb-6 transition-colors">
      <ChevronLeft class="w-4 h-4" /> Mis reservas
    </RouterLink>

    <div v-if="isLoading" class="flex items-center justify-center py-24">
      <Loader2 class="w-8 h-8 animate-spin text-orange-500" />
    </div>
    <div v-else-if="!r" class="text-center py-24 text-zinc-500">Reserva no encontrada</div>
    <div v-else class="card overflow-hidden">

      <!-- Header -->
      <div class="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h1 class="font-black text-white text-lg">Detalle de reserva</h1>
          <p v-if="r.codigoReserva" class="text-xs font-mono text-zinc-500 mt-0.5">#{{ r.codigoReserva }}</p>
        </div>
        <span class="badge" :class="status.cls">{{ status.label }}</span>
      </div>

      <div class="p-6 space-y-5">
        <!-- Vehículo -->
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Car class="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <p class="font-bold text-white">
              {{ r.vehiculo?.modelo?.marca?.nombre }} {{ r.vehiculo?.modelo?.nombre }} {{ r.vehiculo?.anio }}
            </p>
            <p class="text-sm text-zinc-500">{{ r.vehiculo?.placa }} · {{ r.vehiculo?.color }}</p>
            <span v-if="r.vehiculo?.categoria" class="badge bg-orange-500/10 text-orange-400 border border-orange-500/20 mt-1 inline-block">
              {{ r.vehiculo.categoria.nombre }}
            </span>
          </div>
        </div>

        <!-- Agencia -->
        <div v-if="r.agencia" class="flex items-start gap-3 bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
          <MapPin class="w-4 h-4 mt-0.5 shrink-0 text-orange-400" />
          <span class="text-sm text-zinc-300">
            <strong class="text-white">{{ r.agencia.nombre }}</strong>
            <template v-if="r.agencia.ciudad"> · {{ r.agencia.ciudad.nombre }}</template>
            <template v-if="r.agencia.direccion"> — {{ r.agencia.direccion }}</template>
          </span>
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-3 gap-3">
          <div class="card-light p-4">
            <p class="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Inicio</p>
            <p class="font-bold text-white mt-1 text-sm">{{ r.fechaInicio }}</p>
          </div>
          <div class="card-light p-4">
            <p class="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Fin</p>
            <p class="font-bold text-white mt-1 text-sm">{{ r.fechaFin }}</p>
          </div>
          <div class="card-light p-4">
            <p class="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Duración</p>
            <p class="font-bold text-orange-400 mt-1 text-sm">{{ r.diasTotal }}d</p>
          </div>
        </div>

        <!-- Seguro -->
        <div v-if="r.seguro">
          <p class="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Seguro incluido</p>
          <span class="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{{ r.seguro.nombre }}</span>
        </div>

        <!-- Extras -->
        <div v-if="r.extras && r.extras.length > 0">
          <p class="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Extras</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="re in r.extras" :key="re.id" class="badge bg-zinc-800 text-zinc-300 border border-zinc-700">
              {{ re.extra?.nombre }}
            </span>
          </div>
        </div>

        <!-- Precio -->
        <div class="border-t border-zinc-800 pt-4 space-y-2 text-sm">
          <div class="flex justify-between text-zinc-400">
            <span>Tarifa base</span><span>${{ Number(r.precioBase).toFixed(2) }}</span>
          </div>
          <div v-if="Number(r.precioSeguro) > 0" class="flex justify-between text-zinc-400">
            <span>Seguro</span><span>${{ Number(r.precioSeguro).toFixed(2) }}</span>
          </div>
          <div v-if="Number(r.precioExtras) > 0" class="flex justify-between text-zinc-400">
            <span>Extras</span><span>${{ Number(r.precioExtras).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between font-black text-white border-t border-zinc-800 pt-3 mt-1 text-base">
            <span>Total</span>
            <span class="text-orange-500">${{ Number(r.totalAmount).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Notas -->
        <div v-if="r.notas" class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p class="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Notas</p>
          <p class="text-sm text-amber-200">{{ r.notas }}</p>
        </div>

        <!-- Pagar reserva -->
        <div v-if="payable" class="border border-zinc-700 rounded-xl p-4 space-y-3">
          <p class="text-sm font-bold text-white">Registrar pago</p>
          <div v-if="pagoError" class="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg p-2.5">
            <span>{{ pagoError }}</span>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Método de pago</label>
            <select v-model="pagoForm.metodoPago" class="input-base">
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
              <option value="TARJETA_DEBITO">Tarjeta de débito</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="PAYPAL">PayPal</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Referencia (opcional)</label>
            <input v-model="pagoForm.referencia" placeholder="Nro. transacción..." class="input-base" />
          </div>
          <button
            @click="handlePagar"
            :disabled="crearPago.isPending.value"
            class="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <CreditCard v-if="!crearPago.isPending.value" class="w-4 h-4" />
            <Loader2 v-else class="w-4 h-4 animate-spin" />
            {{ crearPago.isPending.value ? 'Procesando...' : `Pagar $${Number(r?.totalAmount).toFixed(2)}` }}
          </button>
        </div>

        <!-- Cancelar -->
        <div v-if="cancellable">
          <div v-if="cancelError" class="mb-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg p-2.5">
            <span>{{ cancelError }}</span>
          </div>
          <div v-if="showCancelConfirm" class="border border-red-500/30 bg-red-500/5 rounded-xl p-4 space-y-3">
            <p class="text-sm text-red-300 font-medium">¿Confirmas que quieres cancelar esta reserva? Esta acción no se puede deshacer.</p>
            <div class="flex gap-2">
              <button
                @click="showCancelConfirm = false"
                class="flex-1 py-2 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Volver
              </button>
              <button
                @click="confirmCancel"
                :disabled="cancelReserva.isPending.value"
                class="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl transition-all disabled:opacity-50 text-sm"
              >
                <Loader2 v-if="cancelReserva.isPending.value" class="w-3.5 h-3.5 animate-spin" />
                {{ cancelReserva.isPending.value ? 'Cancelando...' : 'Sí, cancelar' }}
              </button>
            </div>
          </div>
          <button
            v-else
            @click="showCancelConfirm = true"
            class="w-full flex items-center justify-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold py-2.5 rounded-xl transition-all"
          >
            <X class="w-4 h-4" />
            Cancelar reserva
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Loader2, ChevronLeft, Car, X, MapPin, CreditCard } from 'lucide-vue-next';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useReserva, useCancelReserva } from '@/composables/useReservas';
import type { Reserva, ReservaStatus } from '@/types/domain';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
function getToken() { return localStorage.getItem('rentcar_token'); }

const STATUS_MAP: Record<ReservaStatus, { label: string; cls: string }> = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'bg-amber-500/20  text-amber-400  border border-amber-500/30'  },
  CONFIRMADA: { label: 'Confirmada', cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  ACTIVA:     { label: 'Activa',     cls: 'bg-blue-500/20   text-blue-400   border border-blue-500/30'   },
  COMPLETADA: { label: 'Completada', cls: 'bg-zinc-700      text-zinc-400'                               },
  CANCELADA:  { label: 'Cancelada',  cls: 'bg-red-500/20    text-red-400    border border-red-500/30'    },
};

const route  = useRoute();
const router = useRouter();
const qc     = useQueryClient();
const id     = route.params.id as string;

const { data, isLoading } = useReserva(id);
const cancelReserva = useCancelReserva();

const r           = computed<Reserva | undefined>(() => (data.value as { data?: Reserva })?.data);
const status      = computed(() => STATUS_MAP[r.value?.status as ReservaStatus] ?? { label: r.value?.status ?? '', cls: 'bg-zinc-800 text-zinc-400' });
const cancellable = computed(() => r.value?.status === 'PENDIENTE' || r.value?.status === 'CONFIRMADA');
const payable     = computed(() => (r.value?.status === 'PENDIENTE' || r.value?.status === 'CONFIRMADA') && (!r.value?.pagos || r.value.pagos.length === 0));

const pagoForm          = reactive({ metodoPago: 'EFECTIVO', referencia: '' });
const pagoError         = ref<string | null>(null);
const cancelError       = ref<string | null>(null);
const showCancelConfirm = ref(false);

const crearPago = useMutation({
  mutationFn: async () => {
    const res = await fetch(`${API_URL}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        reservaId:  id,
        monto:      Number(r.value?.totalAmount),
        metodoPago: pagoForm.metodoPago,
        ...(pagoForm.referencia ? { referencia: pagoForm.referencia } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error((err?.error as Record<string, unknown>)?.message as string || 'Error al procesar pago');
    }
    return res.json();
  },
  onSuccess: () => qc.invalidateQueries({ queryKey: ['reservas', id] }),
});

async function handlePagar() {
  pagoError.value = null;
  try { await crearPago.mutateAsync(); }
  catch (err: unknown) {
    pagoError.value = (err as { message?: string }).message ?? 'Error al procesar pago';
  }
}

async function confirmCancel() {
  cancelError.value = null;
  try {
    await cancelReserva.mutateAsync(id);
    router.push('/mis-reservas');
  } catch (err: unknown) {
    showCancelConfirm.value = false;
    cancelError.value = (err as { message?: string }).message ?? 'Error al cancelar la reserva';
  }
}
</script>