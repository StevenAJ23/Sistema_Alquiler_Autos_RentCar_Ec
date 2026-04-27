<template>
  <div>
    <AdminTable
      title="Devoluciones"
      :data="devoluciones"
      :columns="columns"
      :is-loading="isLoading"
      :search-keys="['estadoVehiculo']"
    >
      <template #cell-alquiler="{ row }">
        <span class="font-mono text-xs text-zinc-400">
          {{ row.alquiler?.reserva?.codigoReserva ?? row.alquilerId?.slice(0, 8) }}
        </span>
      </template>
      <template #cell-vehiculo="{ row }">
        {{ row.alquiler?.reserva?.vehiculo
          ? `${row.alquiler.reserva.vehiculo.modelo?.marca?.nombre ?? ''} ${row.alquiler.reserva.vehiculo.modelo?.nombre ?? ''} · ${row.alquiler.reserva.vehiculo.placa}`
          : '—' }}
      </template>
      <template #cell-cliente="{ row }">
        {{ row.alquiler?.reserva?.usuario
          ? `${row.alquiler.reserva.usuario.nombres} ${row.alquiler.reserva.usuario.apellidos}`
          : '—' }}
      </template>
      <template #cell-fechaDevolucion="{ row }">
        {{ row.fechaDevolucion ? new Date(row.fechaDevolucion).toLocaleDateString('es-EC') : '—' }}
      </template>
      <template #cell-kmEntrada="{ row }">
        {{ row.kmEntrada?.toLocaleString() ?? '—' }}
      </template>
      <template #cell-estadoVehiculo="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="ESTADO_CLS[row.estadoVehiculo] ?? 'bg-zinc-700 text-zinc-400'">
          {{ row.estadoVehiculo }}
        </span>
      </template>
      <template #cell-cargoExtra="{ row }">
        <span :class="Number(row.cargoExtra) > 0 ? 'text-amber-400 font-semibold' : 'text-zinc-500'">
          ${{ Number(row.cargoExtra).toFixed(2) }}
        </span>
      </template>
    </AdminTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { useAdminDevoluciones } from '@/composables/useAdmin';
import type { Devolucion } from '@/types/domain';

const ESTADO_CLS: Record<string, string> = {
  EXCELENTE: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  BUENO:     'bg-blue-500/20   text-blue-400   border border-blue-500/30',
  REGULAR:   'bg-amber-500/20  text-amber-400  border border-amber-500/30',
  DAÑADO:    'bg-red-500/20    text-red-400    border border-red-500/30',
};

const columns = [
  { key: 'alquiler',        label: 'Reserva'    },
  { key: 'vehiculo',        label: 'Vehículo'   },
  { key: 'cliente',         label: 'Cliente'    },
  { key: 'fechaDevolucion', label: 'Fecha'      },
  { key: 'kmEntrada',       label: 'Km entrada' },
  { key: 'estadoVehiculo',  label: 'Estado'     },
  { key: 'cargoExtra',      label: 'Cargo extra'},
];

const { data, isLoading } = useAdminDevoluciones();
const devoluciones = computed<Devolucion[]>(() =>
  Array.isArray(data.value) ? data.value as Devolucion[] : []
);
</script>