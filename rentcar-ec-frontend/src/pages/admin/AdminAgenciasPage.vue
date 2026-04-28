<template>
  <div>
    <AdminTable
      title="Agencias"
      :data="agencias"
      :columns="columns"
      :is-loading="isLoading"
      :on-add="openCreate"
      :on-edit="openEdit"
      :on-delete="(id) => del.mutate(id)"
      :is-deleting="del.isPending.value"
      :search-keys="['nombre']"
    >
      <template #cell-nombre="{ row }"><span class="font-medium">{{ row.nombre }}</span></template>
      <template #cell-empresa="{ row }">{{ row.empresa?.nombre ?? '—' }}</template>
      <template #cell-ciudad="{ row }">{{ row.ciudad?.nombre ?? '—' }}</template>
      <template #cell-telefono="{ row }">{{ row.telefono ?? '—' }}</template>
      <template #cell-isActive="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
          {{ row.isActive ? 'Activa' : 'Inactiva' }}
        </span>
      </template>
    </AdminTable>

    <AdminFormModal
      :title="modal.id ? 'Editar Agencia' : 'Nueva Agencia'"
      :open="modal.open"
      :is-loading="isPending"
      :error="formError"
      @close="close"
      @submit="handleSubmit"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre <span class="text-red-500">*</span></label>
        <input v-model="modal.row.nombre" required :class="inputCls" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Empresa <span class="text-red-500">*</span></label>
          <select v-model="modal.row.empresaId" required :class="inputCls">
            <option value="">Seleccione...</option>
            <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad <span class="text-red-500">*</span></label>
          <select v-model="modal.row.ciudadId" required :class="inputCls">
            <option value="">Seleccione...</option>
            <option v-for="c in ciudades" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <input v-model="modal.row.direccion" placeholder="Av. Principal 123" :class="inputCls" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input v-model="modal.row.telefono" placeholder="+593 2 000 0000" :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="modal.row.email" type="email" :class="inputCls" />
        </div>
      </div>
    </AdminFormModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import AdminFormModal from '@/components/admin/AdminFormModal.vue';
import { useAdminAgencias, useCreateAgencia, useUpdateAgencia, useDeleteAgencia, useAdminEmpresas, useCiudades } from '@/composables/useAdmin';
import type { Agencia, Empresa, Ciudad } from '@/types/domain';
import * as V from '@/utils/validators';

const inputCls = 'input-base';

const columns = [
  { key: 'nombre',   label: 'Nombre'   },
  { key: 'empresa',  label: 'Empresa'  },
  { key: 'ciudad',   label: 'Ciudad'   },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'isActive', label: 'Estado'   },
];

const { data, isLoading } = useAdminAgencias();
const { data: dataEmp } = useAdminEmpresas();
const { data: dataCiu } = useCiudades();
const create = useCreateAgencia();
const update = useUpdateAgencia();
const del    = useDeleteAgencia();

const agencias = computed<Agencia[]>(() => Array.isArray(data.value) ? data.value as Agencia[] : []);
const empresas = computed<Empresa[]>(() => Array.isArray(dataEmp.value) ? dataEmp.value as Empresa[] : []);
const ciudades = computed<Ciudad[]>(() => Array.isArray(dataCiu.value) ? dataCiu.value as Ciudad[] : []);
const formError = ref<string | null>(null);

function makeEmpty(row?: Agencia) {
  return {
    nombre: row?.nombre ?? '',
    direccion: row?.direccion ?? '',
    telefono: row?.telefono ?? '',
    email: row?.email ?? '',
    empresaId: row?.empresa?.id ?? '',
    ciudadId: row?.ciudad?.id ?? '',
  };
}

const modal = reactive({ open: false, id: null as string | null, row: makeEmpty() });

function openCreate() { formError.value = null; Object.assign(modal, { open: true, id: null, row: makeEmpty() }); }
function openEdit(row: Agencia) { formError.value = null; Object.assign(modal, { open: true, id: row.id, row: makeEmpty(row) }); }
function close() { formError.value = null; Object.assign(modal, { open: false, id: null, row: makeEmpty() }); }

const isPending = computed(() => create.isPending.value || update.isPending.value);

function validateAgencia(): string {
  const r = modal.row;
  const checks = [
    V.minLen(r.nombre, 3, 'El nombre'),
    !r.empresaId ? 'Debe seleccionar una empresa' : '',
    !r.ciudadId ? 'Debe seleccionar una ciudad' : '',
    V.telefonoOpc(r.telefono),
    V.emailOpc(r.email),
  ];
  return checks.find(e => !!e) ?? '';
}

async function handleSubmit() {
  formError.value = null;
  const err = validateAgencia();
  if (err) { formError.value = err; return; }
  try {
    if (modal.id) await update.mutateAsync({ id: modal.id, ...modal.row });
    else          await create.mutateAsync({ ...modal.row });
    close();
  } catch (err: unknown) {
    formError.value = (err as { message?: string }).message ?? 'Error al guardar la agencia';
  }
}
</script>
