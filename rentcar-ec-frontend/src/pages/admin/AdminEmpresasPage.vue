<template>
  <div>
    <AdminTable
      title="Empresas"
      :data="empresas"
      :columns="columns"
      :is-loading="isLoading"
      :on-add="openCreate"
      :on-edit="openEdit"
      :on-delete="(id) => del.mutate(id)"
      :is-deleting="del.isPending.value"
      :search-keys="['nombre', 'ruc']"
    >
      <template #cell-nombre="{ row }"><span class="font-medium">{{ row.nombre }}</span></template>
      <template #cell-ruc="{ row }"><span class="font-mono text-xs">{{ row.ruc }}</span></template>
      <template #cell-email="{ row }">{{ row.email ?? '—' }}</template>
      <template #cell-telefono="{ row }">{{ row.telefono ?? '—' }}</template>
      <template #cell-isActive="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
          {{ row.isActive ? 'Activa' : 'Inactiva' }}
        </span>
      </template>
    </AdminTable>

    <AdminFormModal
      :title="modal.id ? 'Editar Empresa' : 'Nueva Empresa'"
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
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">RUC</label>
        <input v-model="modal.row.ruc" placeholder="0990000000001" :class="inputCls" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="modal.row.email" type="email" :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input v-model="modal.row.telefono" placeholder="+593 2 000 0000" :class="inputCls" />
        </div>
      </div>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="modal.row.isActive" type="checkbox" class="w-4 h-4 rounded text-blue-600" />
        <span class="text-sm text-gray-700">Empresa activa</span>
      </label>
    </AdminFormModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import AdminFormModal from '@/components/admin/AdminFormModal.vue';
import { useAdminEmpresas, useCreateEmpresa, useUpdateEmpresa, useDeleteEmpresa } from '@/composables/useAdmin';
import type { Empresa } from '@/types/domain';

const inputCls = 'input-base';

const columns = [
  { key: 'nombre',   label: 'Nombre'   },
  { key: 'ruc',      label: 'RUC'      },
  { key: 'email',    label: 'Email'    },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'isActive', label: 'Estado'   },
];

const { data, isLoading } = useAdminEmpresas();
const create = useCreateEmpresa();
const update = useUpdateEmpresa();
const del    = useDeleteEmpresa();

const empresas = computed<Empresa[]>(() => Array.isArray(data.value) ? data.value as Empresa[] : []);
const formError = ref<string | null>(null);

function makeEmpty(row?: Empresa) {
  return { nombre: row?.nombre ?? '', ruc: row?.ruc ?? '', email: row?.email ?? '', telefono: row?.telefono ?? '', isActive: row?.isActive ?? true };
}

const modal = reactive({ open: false, id: null as string | null, row: makeEmpty() });

function openCreate() { formError.value = null; Object.assign(modal, { open: true, id: null, row: makeEmpty() }); }
function openEdit(row: Empresa) { formError.value = null; Object.assign(modal, { open: true, id: row.id, row: makeEmpty(row) }); }
function close() { formError.value = null; Object.assign(modal, { open: false, id: null, row: makeEmpty() }); }

const isPending = computed(() => create.isPending.value || update.isPending.value);

async function handleSubmit() {
  formError.value = null;
  try {
    if (modal.id) await update.mutateAsync({ id: modal.id, ...modal.row });
    else          await create.mutateAsync({ ...modal.row });
    close();
  } catch (err: unknown) {
    formError.value = (err as { message?: string }).message ?? 'Error al guardar la empresa';
  }
}
</script>
