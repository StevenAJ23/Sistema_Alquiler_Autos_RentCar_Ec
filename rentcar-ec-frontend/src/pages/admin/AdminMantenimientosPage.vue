<template>
  <div>
    <AdminTable
      title="Mantenimientos"
      :data="mantenimientos"
      :columns="columns"
      :is-loading="isLoading"
      :on-add="openCreate"
      :on-edit="openEdit"
      :on-delete="(id) => del.mutate(id)"
      :is-deleting="del.isPending.value"
      :search-keys="['tipo', 'tecnico']"
    >
      <template #cell-vehiculo="{ row }">
        <div>
          <p class="text-zinc-300 font-medium text-sm">
            {{ row.vehiculo?.modelo?.marca?.nombre }} {{ row.vehiculo?.modelo?.nombre }}
          </p>
          <p class="text-xs text-zinc-600 font-mono">{{ row.vehiculo?.placa }}</p>
        </div>
      </template>
      <template #cell-tipo="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {{ row.tipo }}
        </span>
      </template>
      <template #cell-descripcion="{ row }">
        <span class="text-zinc-400 text-xs">{{ row.descripcion }}</span>
      </template>
      <template #cell-fechaInicio="{ row }">
        {{ row.fechaInicio ? new Date(row.fechaInicio).toLocaleDateString('es-EC') : '—' }}
      </template>
      <template #cell-fechaFin="{ row }">
        {{ row.fechaFin ? new Date(row.fechaFin).toLocaleDateString('es-EC') : '—' }}
      </template>
      <template #cell-costo="{ row }">
        <span class="font-semibold text-zinc-300">${{ Number(row.costo ?? 0).toFixed(2) }}</span>
      </template>
      <template #cell-tecnico="{ row }">
        <span class="text-zinc-400">{{ row.tecnico ?? '—' }}</span>
      </template>
    </AdminTable>

    <AdminFormModal
      :title="modal.id ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'"
      :open="modal.open"
      :is-loading="isPending"
      :error="formError"
      @close="close"
      @submit="handleSubmit"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo <span class="text-red-500">*</span></label>
        <select v-model="modal.form.vehiculoId" :required="!modal.id" :disabled="!!modal.id" :class="[inputCls, modal.id ? 'opacity-50 cursor-not-allowed' : '']">
          <option value="">Seleccione un vehículo...</option>
          <option v-for="v in listaVehiculos" :key="v.id" :value="v.id">
            {{ v.placa }} - {{ v.modelo?.marca?.nombre }} {{ v.modelo?.nombre }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo <span class="text-red-500">*</span></label>
        <input v-model="modal.form.tipo" placeholder="Ej: Cambio de aceite, Frenos..." required :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción <span class="text-red-500">*</span></label>
        <input v-model="modal.form.descripcion" placeholder="Detalle del trabajo..." required :class="inputCls" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio <span class="text-red-500">*</span></label>
          <input v-model="modal.form.fechaInicio" type="date" required :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
          <input v-model="modal.form.fechaFin" type="date" :min="modal.form.fechaInicio" :class="inputCls" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Costo ($)</label>
          <input v-model.number="modal.form.costo" type="number" min="0" step="0.01" :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
          <input v-model="modal.form.tecnico" placeholder="Nombre del técnico" :class="inputCls" />
        </div>
      </div>
    </AdminFormModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import AdminFormModal from '@/components/admin/AdminFormModal.vue';
import {
  useAdminMantenimientos, useCrearMantenimiento,
  useUpdateMantenimiento, useDeleteMantenimiento,
} from '@/composables/useAdmin';
import { useVehiculos } from '@/composables/useVehiculos';
import type { Vehiculo } from '@/types/domain';
import * as V from '@/utils/validators';

const inputCls = 'input-base';

interface Mantenimiento {
  id: string;
  vehiculoId: string;
  tipo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string | null;
  costo?: number | null;
  tecnico?: string | null;
  vehiculo?: { placa: string; modelo?: { nombre: string; marca?: { nombre: string } } } | null;
}

const columns = [
  { key: 'vehiculo',    label: 'Vehículo'    },
  { key: 'tipo',        label: 'Tipo'         },
  { key: 'descripcion', label: 'Descripción'  },
  { key: 'fechaInicio', label: 'Inicio'       },
  { key: 'fechaFin',    label: 'Fin'          },
  { key: 'costo',       label: 'Costo'        },
  { key: 'tecnico',     label: 'Técnico'      },
];

const { data, isLoading } = useAdminMantenimientos();
const { data: dataVeh } = useVehiculos(1, 100); // Traemos una buena cantidad de vehículos
const crear  = useCrearMantenimiento();
const update = useUpdateMantenimiento();
const del    = useDeleteMantenimiento();

const mantenimientos = computed<Mantenimiento[]>(() =>
  Array.isArray(data.value) ? data.value as Mantenimiento[] : []
);

const listaVehiculos = computed<Vehiculo[]>(() => {
  const d = dataVeh.value as { data?: { data?: Vehiculo[] } | Vehiculo[] } | undefined;
  return (d?.data as { data?: Vehiculo[] })?.data ?? (d?.data as Vehiculo[]) ?? [];
});

function makeForm(row?: Mantenimiento) {
  return {
    vehiculoId:  row?.vehiculoId  ?? '',
    tipo:        row?.tipo        ?? '',
    descripcion: row?.descripcion ?? '',
    fechaInicio: row?.fechaInicio ? row.fechaInicio.slice(0, 10) : '',
    fechaFin:    row?.fechaFin    ? row.fechaFin.slice(0, 10)    : '',
    costo:       row?.costo       ?? 0,
    tecnico:     row?.tecnico     ?? '',
  };
}

const modal = reactive({ open: false, id: '', form: makeForm() });
const isPending = computed(() => crear.isPending.value || update.isPending.value);
const formError = ref<string | null>(null);

function openCreate() { formError.value = null; Object.assign(modal, { open: true, id: '', form: makeForm() }); }
function openEdit(row: Mantenimiento) { formError.value = null; Object.assign(modal, { open: true, id: row.id, form: makeForm(row) }); }
function close() { formError.value = null; Object.assign(modal, { open: false, id: '', form: makeForm() }); }

function validateMantenimiento(): string {
  const f = modal.form;
  const checks: string[] = [
    !modal.id ? V.uuid(f.vehiculoId, 'El ID de vehículo') : '',
    V.minLen(f.tipo,        3, 'El tipo'),
    V.minLen(f.descripcion, 5, 'La descripción'),
    V.reqStr(f.fechaInicio, 'La fecha de inicio'),
    f.fechaFin ? V.rangoFechas(f.fechaInicio, f.fechaFin) : '',
    V.numeroNoNegativo(f.costo ?? 0, 'El costo'),
    f.tecnico ? V.soloLetrasOpc(f.tecnico, 'El nombre del técnico') : '',
  ];
  return checks.find(e => !!e) ?? '';
}

async function handleSubmit() {
  formError.value = null;
  const err = validateMantenimiento();
  if (err) { formError.value = err; return; }
  try {
    const body: Record<string, unknown> = {
      tipo:        modal.form.tipo,
      descripcion: modal.form.descripcion,
      fechaInicio: modal.form.fechaInicio,
    };
    if (modal.form.fechaFin)  body['fechaFin']  = modal.form.fechaFin;
    if (modal.form.costo)     body['costo']     = modal.form.costo;
    if (modal.form.tecnico)   body['tecnico']   = modal.form.tecnico;

    if (modal.id) {
      await update.mutateAsync({ id: modal.id, ...body });
    } else {
      await crear.mutateAsync({ vehiculoId: modal.form.vehiculoId, ...body });
    }
    close();
  } catch (err: unknown) {
    formError.value = (err as { message?: string }).message ?? 'Error al guardar mantenimiento';
  }
}
</script>