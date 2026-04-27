<template>
  <div>
    <AdminTable
      title="Usuarios"
      :data="usuarios"
      :columns="columns"
      :is-loading="isLoading"
      :on-edit="openEdit"
      :on-delete="(id) => del.mutate(id)"
      :is-deleting="del.isPending.value"
      :search-keys="['email', 'nombres', 'apellidos']"
    >
      <template #cell-nombres="{ row }">
        <span class="font-medium">{{ row.nombres }} {{ row.apellidos }}</span>
      </template>
      <template #cell-email="{ row }">{{ row.email }}</template>
      <template #cell-role="{ row }">
        <span
          class="text-xs px-2 py-0.5 rounded-full font-medium"
          :class="row.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : row.role === 'OPERADOR' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'"
        >
          {{ row.role }}
        </span>
      </template>
      <template #cell-isActive="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="row.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'">
          {{ row.isActive ? 'Activo' : 'Inactivo' }}
        </span>
      </template>
    </AdminTable>

    <AdminFormModal
      title="Editar Usuario"
      :open="modal.open"
      :is-loading="update.isPending.value"
      :error="formError"
      @close="close"
      @submit="handleSubmit"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
        <input v-model="modal.row.email" type="email" required :class="inputCls" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombres <span class="text-red-500">*</span></label>
          <input v-model="modal.row.nombres" required :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
          <input v-model="modal.row.apellidos" :class="inputCls" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <input v-model="modal.row.telefono" placeholder="+593 99 000 0000" :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Rol <span class="text-red-500">*</span></label>
        <select v-model="modal.row.role" :class="inputCls">
          <option value="CLIENTE">CLIENTE</option>
          <option value="OPERADOR">OPERADOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="modal.row.isActive" type="checkbox" class="w-4 h-4 rounded text-blue-600" />
        <span class="text-sm text-gray-700">Usuario activo</span>
      </label>
    </AdminFormModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import AdminFormModal from '@/components/admin/AdminFormModal.vue';
import { useAdminUsers, useUpdateUser, useDeleteUser } from '@/composables/useAdmin';
import type { Usuario, UserRole } from '@/types/domain';

const inputCls = 'input-base';

const columns = [
  { key: 'nombres',  label: 'Nombre'  },
  { key: 'email',    label: 'Email'   },
  { key: 'role',     label: 'Rol'     },
  { key: 'isActive', label: 'Estado'  },
];

const { data, isLoading } = useAdminUsers();
const update = useUpdateUser();
const del    = useDeleteUser();

const usuarios = computed<Usuario[]>(() => Array.isArray(data.value) ? data.value as Usuario[] : []);

function makeEmpty(row?: Usuario) {
  return {
    email: row?.email ?? '', nombres: row?.nombres ?? '', apellidos: row?.apellidos ?? '',
    telefono: row?.telefono ?? '', role: (row?.role ?? 'CLIENTE') as UserRole, isActive: row?.isActive ?? true,
  };
}

const modal = reactive({ open: false, id: '' as string, row: makeEmpty() });
const formError = ref<string | null>(null);

function openEdit(row: Usuario) { formError.value = null; Object.assign(modal, { open: true, id: row.id, row: makeEmpty(row) }); }
function close() { formError.value = null; Object.assign(modal, { open: false, id: '', row: makeEmpty() }); }

async function handleSubmit() {
  formError.value = null;
  try { await update.mutateAsync({ id: modal.id, ...modal.row }); close(); }
  catch (err: unknown) {
    formError.value = (err as { message?: string }).message ?? 'Error al actualizar usuario';
  }
}
</script>
