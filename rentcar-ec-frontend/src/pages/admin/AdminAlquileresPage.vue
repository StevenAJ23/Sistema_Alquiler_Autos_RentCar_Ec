<template>
  <div>
    <AdminTable
      title="Alquileres"
      :data="alquileres"
      :columns="columns"
      :is-loading="isLoading"
      :on-add="() => (iniciarModal.open = true)"
    >
      <template #cell-codigoReserva="{ row }">
        <span class="font-mono text-xs">{{ row.reserva?.codigoReserva ?? row.reservaId.slice(0, 8) }}</span>
      </template>
      <template #cell-vehiculo="{ row }">
        {{ row.reserva?.vehiculo
          ? `${row.reserva.vehiculo.modelo?.marca?.nombre ?? ''} ${row.reserva.vehiculo.modelo?.nombre ?? ''} · ${row.reserva.vehiculo.placa}`
          : '—' }}
      </template>
      <template #cell-fechaInicio="{ row }">
        {{ row.fechaInicio ? new Date(row.fechaInicio).toLocaleDateString('es-EC') : '—' }}
      </template>
      <template #cell-kmSalida="{ row }">{{ row.kmSalida?.toLocaleString() ?? '—' }}</template>
      <template #cell-kmEntrada="{ row }">{{ row.kmEntrada?.toLocaleString() ?? '—' }}</template>
      <template #cell-status="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="STATUS_CLS[row.status as AlquilerStatus] ?? 'bg-gray-100 text-gray-600'">
          {{ row.status }}
        </span>
      </template>
      <template #cell-actions="{ row }">
        <button
          v-if="row.status === 'ACTIVO'"
          @click.stop="openDevolucion(row)"
          class="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
        >
          Registrar devolución
        </button>
      </template>
    </AdminTable>

    <!-- Modal: Iniciar Alquiler -->
    <AdminFormModal
      title="Iniciar Alquiler"
      :open="iniciarModal.open"
      :is-loading="iniciar.isPending.value"
      :error="iniciarError"
      @close="closeIniciar"
      @submit="handleIniciar"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ID de Reserva <span class="text-red-500">*</span></label>
        <input v-model="iniciarModal.form.reservaId" placeholder="UUID de la reserva confirmada" required :class="inputCls" />
        <p class="text-xs text-gray-500 mt-1">La reserva debe estar en estado CONFIRMADA o PENDIENTE.</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraje de salida <span class="text-red-500">*</span></label>
        <input v-model.number="iniciarModal.form.kmSalida" type="number" min="0" required :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
        <input v-model="iniciarModal.form.observaciones" placeholder="Notas de entrega..." :class="inputCls" />
      </div>
    </AdminFormModal>

    <!-- Modal: Registrar Devolución -->
    <AdminFormModal
      title="Registrar Devolución"
      :open="devModal.open"
      :is-loading="devolucion.isPending.value"
      :error="devError"
      @close="closeDev"
      @submit="handleDevolucion"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraje de entrada <span class="text-red-500">*</span></label>
        <input v-model.number="devModal.form.kmEntrada" type="number" min="0" required :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Estado del vehículo <span class="text-red-500">*</span></label>
        <select v-model="devModal.form.estadoVehiculo" :class="inputCls">
          <option value="EXCELENTE">Excelente</option>
          <option value="BUENO">Bueno</option>
          <option value="REGULAR">Regular</option>
          <option value="DAÑADO">Dañado</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Cargo extra ($)</label>
        <input v-model.number="devModal.form.cargoExtra" type="number" min="0" step="0.01" :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
        <input v-model="devModal.form.observaciones" placeholder="Daños, notas de entrega..." :class="inputCls" />
      </div>
    </AdminFormModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import AdminFormModal from '@/components/admin/AdminFormModal.vue';
import { useAdminAlquileres, useIniciarAlquiler, useRegistrarDevolucion } from '@/composables/useAdmin';
import type { Alquiler, AlquilerStatus } from '@/types/domain';
import * as V from '@/utils/validators';

const inputCls = 'input-base';

const STATUS_CLS: Record<AlquilerStatus, string> = {
  ACTIVO:     'bg-blue-500/20   text-blue-400   border border-blue-500/30',
  FINALIZADO: 'bg-zinc-700      text-zinc-400',
  CANCELADO:  'bg-red-500/20    text-red-400    border border-red-500/30',
};

const columns = [
  { key: 'codigoReserva', label: 'Código Reserva' },
  { key: 'vehiculo',      label: 'Vehículo'       },
  { key: 'fechaInicio',   label: 'Inicio'         },
  { key: 'kmSalida',      label: 'Km salida'      },
  { key: 'kmEntrada',     label: 'Km entrada'     },
  { key: 'status',        label: 'Estado'         },
  { key: 'actions',       label: ''               },
];

const { data, isLoading } = useAdminAlquileres();
const iniciar    = useIniciarAlquiler();
const devolucion = useRegistrarDevolucion();

const alquileres = computed<Alquiler[]>(() => Array.isArray(data.value) ? data.value as Alquiler[] : []);

const iniciarError = ref<string | null>(null);
const devError     = ref<string | null>(null);

// ── Iniciar alquiler ──────────────────────────────────────────
function makeIniciarForm() {
  return { reservaId: '', kmSalida: 0, observaciones: '' };
}
const iniciarModal = reactive({ open: false, form: makeIniciarForm() });
function closeIniciar() { iniciarError.value = null; Object.assign(iniciarModal, { open: false, form: makeIniciarForm() }); }
async function handleIniciar() {
  iniciarError.value = null;
  const errId = V.uuid(iniciarModal.form.reservaId, 'El ID de reserva');
  if (errId) { iniciarError.value = errId; return; }
  const errKm = V.enteroNoNegativo(iniciarModal.form.kmSalida, 'Kilometraje de salida');
  if (errKm) { iniciarError.value = errKm; return; }
  try {
    const body: Record<string, unknown> = { reservaId: iniciarModal.form.reservaId, kmSalida: iniciarModal.form.kmSalida };
    if (iniciarModal.form.observaciones) body['observaciones'] = iniciarModal.form.observaciones;
    await iniciar.mutateAsync(body);
    closeIniciar();
  } catch (err: unknown) {
    iniciarError.value = (err as { message?: string }).message ?? 'Error al iniciar alquiler';
  }
}

// ── Devolucion ────────────────────────────────────────────────
function makeDevForm(alquilerId: string, kmBase: number) {
  return { alquilerId, kmEntrada: kmBase, estadoVehiculo: 'BUENO', cargoExtra: 0, observaciones: '' };
}
const devModal = reactive({ open: false, form: makeDevForm('', 0) });
function openDevolucion(a: Alquiler) { devError.value = null; Object.assign(devModal, { open: true, form: makeDevForm(a.id, a.kmSalida) }); }
function closeDev() { devError.value = null; Object.assign(devModal, { open: false, form: makeDevForm('', 0) }); }
async function handleDevolucion() {
  devError.value = null;
  const errKm = V.enteroNoNegativo(devModal.form.kmEntrada, 'Kilometraje de entrada');
  if (errKm) { devError.value = errKm; return; }
  const errCargo = V.numeroNoNegativo(devModal.form.cargoExtra, 'Cargo extra');
  if (errCargo) { devError.value = errCargo; return; }
  try { await devolucion.mutateAsync({ ...devModal.form }); closeDev(); }
  catch (err: unknown) {
    devError.value = (err as { message?: string }).message ?? 'Error al registrar devolución';
  }
}
</script>