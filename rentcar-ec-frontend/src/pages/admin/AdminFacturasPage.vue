<template>
  <div>
    <AdminTable
      title="Facturas"
      :data="facturas"
      :columns="columns"
      :is-loading="isLoading"
      :search-keys="['numeroFactura', 'razonSocial', 'rucCliente']"
      :on-add="() => (modal.open = true)"
    >
      <template #cell-numeroFactura="{ row }">
        <span class="font-mono text-xs text-orange-400">{{ row.numeroFactura }}</span>
      </template>
      <template #cell-cliente="{ row }">
        <div>
          <p class="text-sm text-white">{{ row.razonSocial ?? '—' }}</p>
          <p class="text-xs text-zinc-500">{{ row.rucCliente ?? '' }}</p>
        </div>
      </template>
      <template #cell-subtotal="{ row }">
        <span class="text-zinc-300">${{ Number(row.subtotal).toFixed(2) }}</span>
      </template>
      <template #cell-iva="{ row }">
        <span class="text-zinc-400">${{ Number(row.iva).toFixed(2) }}</span>
      </template>
      <template #cell-total="{ row }">
        <span class="font-bold text-emerald-400">${{ Number(row.total).toFixed(2) }}</span>
      </template>
      <template #cell-fecha="{ row }">
        {{ row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-EC') : '—' }}
      </template>
      <template #cell-detalles="{ row }">
        <button
          @click.stop="verDetalles(row)"
          class="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
        >
          {{ row.detalles?.length ?? 0 }} ítem(s)
        </button>
      </template>
    </AdminTable>

    <!-- Modal generar factura -->
    <AdminFormModal
      title="Generar Factura"
      :open="modal.open"
      :is-loading="generar.isPending.value"
      :error="formError"
      @close="close"
      @submit="handleSubmit"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Reserva <span class="text-red-500">*</span></label>
        <select v-model="modal.form.reservaId" required :class="inputCls">
          <option value="">— Seleccione una reserva —</option>
          <option v-for="r in reservasDisponibles" :key="r.id" :value="r.id">
            {{ r.codigoReserva }} - {{ r.usuario?.nombres }} {{ r.usuario?.apellidos }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Pago (opcional)</label>
        <select v-model="modal.form.pagoId" :class="inputCls">
          <option value="">— Seleccione un pago (opcional) —</option>
          <option v-for="p in pagosDisponibles" :key="p.id" :value="p.id">
            ${{ Number(p.monto).toFixed(2) }} - {{ p.metodoPago }} ({{ p.createdAt.slice(0,10) }})
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">RUC del cliente</label>
        <input v-model="modal.form.rucCliente" placeholder="1234567890001" :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Razón social</label>
        <input v-model="modal.form.razonSocial" placeholder="Nombre o empresa" :class="inputCls" />
      </div>
    </AdminFormModal>

    <!-- Modal ver detalles -->
    <Teleport to="body">
      <div v-if="detailModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="detailModal.open = false" />
        <div class="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <h3 class="text-lg font-bold text-white mb-1">{{ detailModal.factura?.numeroFactura }}</h3>
          <p class="text-xs text-zinc-500 mb-4">Detalles de factura</p>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-zinc-500 text-left border-b border-zinc-800">
                <th class="pb-2 font-medium">Descripción</th>
                <th class="pb-2 font-medium text-right">Cant.</th>
                <th class="pb-2 font-medium text-right">P. Unit</th>
                <th class="pb-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in detailModal.factura?.detalles" :key="d.id" class="border-b border-zinc-800/50">
                <td class="py-2 text-zinc-300">{{ d.descripcion }}</td>
                <td class="py-2 text-right text-zinc-400">{{ d.cantidad }}</td>
                <td class="py-2 text-right text-zinc-400">${{ Number(d.precioUnit).toFixed(2) }}</td>
                <td class="py-2 text-right text-white font-medium">${{ Number(d.subtotal).toFixed(2) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="pt-3 text-right text-zinc-500 text-xs">Subtotal</td>
                <td class="pt-3 text-right text-zinc-300">${{ Number(detailModal.factura?.subtotal).toFixed(2) }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right text-zinc-500 text-xs">IVA 15%</td>
                <td class="text-right text-zinc-300">${{ Number(detailModal.factura?.iva).toFixed(2) }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right font-bold text-white">TOTAL</td>
                <td class="text-right font-bold text-emerald-400">${{ Number(detailModal.factura?.total).toFixed(2) }}</td>
              </tr>
            </tfoot>
          </table>
          <button
            @click="detailModal.open = false"
            class="mt-5 w-full py-2 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import AdminFormModal from '@/components/admin/AdminFormModal.vue';
import { useAdminFacturas, useGenerarFactura, useAdminReservas, useAdminPagos } from '@/composables/useAdmin';
import type { Factura, Reserva, Pago } from '@/types/domain';

const inputCls = 'input-base';

const columns = [
  { key: 'numeroFactura', label: 'N° Factura' },
  { key: 'cliente',       label: 'Cliente'    },
  { key: 'subtotal',      label: 'Subtotal'   },
  { key: 'iva',           label: 'IVA 15%'    },
  { key: 'total',         label: 'Total'      },
  { key: 'detalles',      label: 'Detalles'   },
  { key: 'fecha',         label: 'Fecha'      },
];

const { data, isLoading } = useAdminFacturas();
const { data: dataRes } = useAdminReservas();
const { data: dataPag } = useAdminPagos();
const generar = useGenerarFactura();

const facturas = computed<Factura[]>(() => Array.isArray(data.value) ? data.value as Factura[] : []);

const reservasDisponibles = computed<Reserva[]>(() => {
  const all = Array.isArray(dataRes.value) ? dataRes.value as Reserva[] : [];
  return all.filter(r => r.status !== 'CANCELADA');
});

const pagosDisponibles = computed<Pago[]>(() => {
  const all = Array.isArray(dataPag.value) ? dataPag.value as Pago[] : [];
  // Si hay una reserva seleccionada, filtramos solo los pagos de esa reserva
  if (modal.form.reservaId) {
    return all.filter(p => p.reservaId === modal.form.reservaId);
  }
  return all;
});

function makeForm() {
  return { reservaId: '', pagoId: '', rucCliente: '', razonSocial: '' };
}

const modal = reactive({ open: false, form: makeForm() });
const detailModal = reactive<{ open: boolean; factura: Factura | null }>({ open: false, factura: null });
const formError = ref<string | null>(null);

function close() { formError.value = null; Object.assign(modal, { open: false, form: makeForm() }); }

function verDetalles(factura: Factura) {
  detailModal.factura = factura;
  detailModal.open = true;
}

async function handleSubmit() {
  formError.value = null;
  try {
    const body: Record<string, unknown> = { reservaId: modal.form.reservaId };
    if (modal.form.pagoId)      body['pagoId']      = modal.form.pagoId;
    if (modal.form.rucCliente)  body['rucCliente']  = modal.form.rucCliente;
    if (modal.form.razonSocial) body['razonSocial'] = modal.form.razonSocial;
    await generar.mutateAsync(body);
    close();
  } catch (err: unknown) {
    formError.value = (err as { message?: string }).message ?? 'Error al generar factura';
  }
}
</script>