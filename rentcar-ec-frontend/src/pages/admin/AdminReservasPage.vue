<template>
  <div>
    <div v-if="statusError" class="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
      <span class="flex-1">{{ statusError }}</span>
      <button @click="statusError = null" class="text-red-400 hover:text-red-200 transition-colors text-lg leading-none">&times;</button>
    </div>
    <AdminTable
      title="Reservas"
      :data="reservas"
      :columns="columns"
      :is-loading="isLoading"
      :search-keys="['codigoReserva']"
    >
      <template #cell-codigoReserva="{ row }">
        <span class="font-mono text-xs text-gray-600">{{ row.codigoReserva ?? row.id.slice(0, 8) }}</span>
      </template>
      <template #cell-vehiculo="{ row }">
        {{ row.vehiculo?.modelo?.marca?.nombre ?? '' }} {{ row.vehiculo?.modelo?.nombre ?? '' }} · {{ row.vehiculo?.placa ?? '' }}
      </template>
      <template #cell-usuario="{ row }">
        {{ row.usuario ? `${row.usuario.nombres} ${row.usuario.apellidos}` : '—' }}
      </template>
      <template #cell-fechas="{ row }">{{ row.fechaInicio }} → {{ row.fechaFin }}</template>
      <template #cell-totalAmount="{ row }">
        <span class="font-semibold">${{ Number(row.totalAmount).toFixed(2) }}</span>
      </template>
      <template #cell-status="{ row }">
        <select
          :value="row.status"
          @change="handleStatusChange(row.id, ($event.target as HTMLSelectElement).value)"
          @click.stop
          class="badge border-0 cursor-pointer focus:outline-none bg-transparent"
          :class="STATUS_MAP[row.status as ReservaStatus]?.cls ?? 'bg-zinc-800 text-zinc-400'"
        >
          <option v-for="[val, { label }] in Object.entries(STATUS_MAP)" :key="val" :value="val">{{ label }}</option>
        </select>
      </template>
    </AdminTable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { useAdminReservas, useAdminUpdateReservaStatus } from '@/composables/useAdmin';
import type { Reserva, ReservaStatus } from '@/types/domain';

const STATUS_MAP: Record<ReservaStatus, { label: string; cls: string }> = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'bg-amber-500/20  text-amber-400  border border-amber-500/30'   },
  CONFIRMADA: { label: 'Confirmada', cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  ACTIVA:     { label: 'Activa',     cls: 'bg-blue-500/20   text-blue-400   border border-blue-500/30'    },
  COMPLETADA: { label: 'Completada', cls: 'bg-zinc-700      text-zinc-400'                                },
  CANCELADA:  { label: 'Cancelada',  cls: 'bg-red-500/20    text-red-400    border border-red-500/30'     },
};

const columns = [
  { key: 'codigoReserva', label: 'Código'   },
  { key: 'vehiculo',      label: 'Vehículo' },
  { key: 'usuario',       label: 'Cliente'  },
  { key: 'fechas',        label: 'Fechas'   },
  { key: 'totalAmount',   label: 'Total'    },
  { key: 'status',        label: 'Estado'   },
];

const { data, isLoading } = useAdminReservas();
const updateStatus = useAdminUpdateReservaStatus();
const statusError = ref<string | null>(null);

const reservas = computed<Reserva[]>(() => Array.isArray(data.value) ? data.value as Reserva[] : []);

async function handleStatusChange(id: string, status: string) {
  statusError.value = null;
  try { await updateStatus.mutateAsync({ id, status }); }
  catch (err: unknown) {
    statusError.value = (err as { message?: string }).message ?? 'Error al actualizar estado';
  }
}
</script>
