<template>
  <div>
    <AdminTable
      title="Pagos"
      :data="pagos"
      :columns="columns"
      :is-loading="isLoading"
      :search-keys="['metodoPago', 'referencia']"
      :on-add="() => (modal.open = true)"
    >
      <template #cell-reserva="{ row }">
        <span class="font-mono text-xs text-zinc-400">{{ row.reserva?.codigoReserva ?? row.reservaId.slice(0, 8) }}</span>
      </template>
      <template #cell-cliente="{ row }">
        {{ row.reserva?.usuario ? `${row.reserva.usuario.nombres} ${row.reserva.usuario.apellidos}` : '—' }}
      </template>
      <template #cell-monto="{ row }">
        <span class="font-semibold text-emerald-400">${{ Number(row.monto).toFixed(2) }}</span>
      </template>
      <template #cell-metodoPago="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          {{ METODO_LABEL[row.metodoPago] ?? row.metodoPago }}
        </span>
      </template>
      <template #cell-status="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="STATUS_CLS[row.status as PagoStatus] ?? 'bg-zinc-700 text-zinc-400'">
          {{ STATUS_LABEL[row.status as PagoStatus] ?? row.status }}
        </span>
      </template>
      <template #cell-fecha="{ row }">
        {{ row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-EC') : '—' }}
      </template>
    </AdminTable>

    <AdminFormModal
      title="Registrar Pago"
      :open="modal.open"
      :is-loading="crear.isPending.value"
      :error="formError"
      @close="close"
      @submit="handleSubmit"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ID de Reserva <span class="text-red-500">*</span></label>
        <input v-model="modal.form.reservaId" placeholder="UUID de la reserva" required :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Monto ($) <span class="text-red-500">*</span></label>
        <input v-model.number="modal.form.monto" type="number" min="0.01" step="0.01" required :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Método de pago <span class="text-red-500">*</span></label>
        <select v-model="modal.form.metodoPago" :class="inputCls">
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
          <option value="TARJETA_DEBITO">Tarjeta de débito</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="PAYPAL">PayPal</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
        <input v-model="modal.form.referencia" placeholder="Nro. transacción, recibo..." :class="inputCls" />
      </div>
    </AdminFormModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import AdminFormModal from '@/components/admin/AdminFormModal.vue';
import { useAdminPagos, useCrearPago } from '@/composables/useAdmin';
import type { Pago, PagoStatus } from '@/types/domain';

const inputCls = 'input-base';

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA_CREDITO: 'T. Crédito',
  TARJETA_DEBITO: 'T. Débito',
  TRANSFERENCIA: 'Transferencia',
  PAYPAL: 'PayPal',
  OTRO: 'Otro',
};

const STATUS_LABEL: Record<PagoStatus, string> = {
  PENDIENTE:   'Pendiente',
  COMPLETADO:  'Completado',
  FALLIDO:     'Fallido',
  REEMBOLSADO: 'Reembolsado',
};

const STATUS_CLS: Record<PagoStatus, string> = {
  PENDIENTE:   'bg-amber-500/20  text-amber-400  border border-amber-500/30',
  COMPLETADO:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  FALLIDO:     'bg-red-500/20    text-red-400    border border-red-500/30',
  REEMBOLSADO: 'bg-zinc-700      text-zinc-400',
};

const columns = [
  { key: 'reserva',    label: 'Reserva'  },
  { key: 'cliente',    label: 'Cliente'  },
  { key: 'monto',      label: 'Monto'    },
  { key: 'metodoPago', label: 'Método'   },
  { key: 'referencia', label: 'Ref.'     },
  { key: 'status',     label: 'Estado'   },
  { key: 'fecha',      label: 'Fecha'    },
];

const { data, isLoading } = useAdminPagos();
const crear = useCrearPago();

const pagos = computed<Pago[]>(() => Array.isArray(data.value) ? data.value as Pago[] : []);

function makeForm() {
  return { reservaId: '', monto: 0, metodoPago: 'EFECTIVO', referencia: '' };
}

const modal = reactive({ open: false, form: makeForm() });
const formError = ref<string | null>(null);

function close() { formError.value = null; Object.assign(modal, { open: false, form: makeForm() }); }

async function handleSubmit() {
  formError.value = null;
  try {
    const body: Record<string, unknown> = {
      reservaId: modal.form.reservaId,
      monto: modal.form.monto,
      metodoPago: modal.form.metodoPago,
    };
    if (modal.form.referencia) body['referencia'] = modal.form.referencia;
    await crear.mutateAsync(body);
    close();
  } catch (err: unknown) {
    formError.value = (err as { message?: string }).message ?? 'Error al registrar pago';
  }
}
</script>