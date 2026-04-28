<template>
  <div>
    <AdminTable
      title="Vehículos"
      :data="vehiculos"
      :columns="columns"
      :is-loading="isLoading"
      :on-add="openCreate"
      :on-edit="openEdit"
      :on-delete="handleDelete"
      :is-deleting="del.isPending.value"
      :search-keys="['placa']"
    >
      <template #cell-placa="{ row }">
        <span class="font-mono font-medium">{{ row.placa }}</span>
      </template>
      <template #cell-vehiculo="{ row }">
        {{ row.modelo?.marca?.nombre ?? '' }} {{ row.modelo?.nombre ?? '' }} {{ row.anio }}
      </template>
      <template #cell-categoria="{ row }">{{ row.categoria?.nombre ?? '—' }}</template>
      <template #cell-agencia="{ row }">{{ row.agencia?.nombre ?? '—' }}</template>
      <template #cell-precioDia="{ row }">${{ Number(row.precioDia).toFixed(2) }}</template>
      <template #cell-status="{ row }">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="STATUS_CLS[row.status as VehicleStatus] ?? 'bg-gray-100 text-gray-600'">
          {{ row.status }}
        </span>
      </template>
    </AdminTable>

    <AdminFormModal
      :title="modal.id ? 'Editar Vehículo' : 'Nuevo Vehículo'"
      :open="modal.open"
      :is-loading="isPending"
      :error="formError"
      @close="close"
      @submit="handleSubmit"
    >
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Placa <span class="text-red-500">*</span></label>
        <input
          v-model="modal.row.placa"
          required
          placeholder="ABC-1234"
          :class="inputCls"
          @input="handlePlacaInput"
        />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Color <span class="text-red-500">*</span></label>
          <input v-model="modal.row.color" required :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Año <span class="text-red-500">*</span></label>
          <input v-model.number="modal.row.anio" type="number" required :min="1990" :max="new Date().getFullYear()+1" :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
          <input v-model.number="modal.row.kilometraje" type="number" min="0" :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Precio/día ($) <span class="text-red-500">*</span></label>
          <input v-model.number="modal.row.precioDia" type="number" required min="0" step="0.01" :class="inputCls" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Plazas</label>
          <input v-model.number="modal.row.numeroPasajeros" type="number" min="1" max="20" :class="inputCls" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Agencia <span class="text-red-500">*</span></label>
        <select v-model="modal.row.agenciaId" required :class="inputCls">
          <option value="">— Selecciona agencia —</option>
          <option v-for="a in agencias" :key="a.id" :value="a.id">
            {{ a.nombre }} ({{ a.ciudad?.nombre ?? '' }})
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Modelo <span class="text-red-500">*</span></label>
        <select v-model="modal.row.modeloId" required :class="inputCls">
          <option value="">— Selecciona modelo —</option>
          <option v-for="m in modelos" :key="m.id" :value="m.id">
            {{ m.marca?.nombre }} {{ m.nombre }}
          </option>
          <option value="NEW_MODEL" class="text-orange-500 font-bold">+ Agregar nuevo modelo...</option>
        </select>
      </div>

      <!-- Formulario Nuevo Modelo -->
      <div v-if="modal.row.modeloId === 'NEW_MODEL'" class="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 space-y-3">
        <p class="text-xs font-bold text-orange-400 uppercase tracking-widest">Nuevo Modelo</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-zinc-500 mb-1 uppercase">Marca</label>
            <select v-model="newModelForm.marcaId" :class="inputCls" class="!py-1.5 !text-xs">
              <option value="">— Marca —</option>
              <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
              <option value="NEW_MARCA" class="text-orange-500 font-bold">+ Agregar nueva marca...</option>
            </select>
          </div>
          <div v-if="newModelForm.marcaId === 'NEW_MARCA'">
            <label class="block text-[10px] font-bold text-zinc-500 mb-1 uppercase">Nombre de la Marca</label>
            <input v-model="newModelForm.nuevaMarcaNombre" placeholder="Ej: Tesla" :class="inputCls" class="!py-1.5 !text-xs" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-zinc-500 mb-1 uppercase">Nombre del Modelo</label>
            <input v-model="newModelForm.nombre" placeholder="Ej: Corolla" :class="inputCls" class="!py-1.5 !text-xs" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría <span class="text-red-500">*</span></label>
          <select v-model="modal.row.categoriaId" required :class="inputCls">
            <option value="">— Categoría —</option>
            <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Combustible <span class="text-red-500">*</span></label>
          <select v-model="modal.row.tipoCombustibleId" required :class="inputCls">
            <option value="">— Combustible —</option>
            <option v-for="c in combustibles" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Transmisión <span class="text-red-500">*</span></label>
          <select v-model="modal.row.tipoTransmisionId" required :class="inputCls">
            <option value="">— Transmisión —</option>
            <option v-for="t in transmisiones" :key="t.id" :value="t.id">{{ t.nombre }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <input v-model="modal.row.descripcion" placeholder="Descripción del vehículo..." :class="inputCls" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">URL de la Imagen (Recomendado para Azure)</label>
        <input v-model="modal.row.imagenUrl" placeholder="https://ejemplo.com/auto.jpg" :class="inputCls" />
      </div>
      <div v-if="modal.row.imagenUrl" class="mb-2">
        <img
          :src="modal.row.imagenUrl.startsWith('http') ? modal.row.imagenUrl : getImagenUrl(modal.row.imagenUrl)"
          alt="Vista previa"
          class="w-full h-48 object-cover rounded-2xl border border-zinc-800 shadow-2xl"
        />
      </div>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="modal.row.isActive" type="checkbox" class="w-4 h-4 rounded text-blue-600" />
        <span class="text-sm text-gray-700">Vehículo activo</span>
      </label>
    </AdminFormModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import AdminFormModal from '@/components/admin/AdminFormModal.vue';
import { useVehiculos, useCreateVehiculo, useUpdateVehiculo, useDeleteVehiculo } from '@/composables/useVehiculos';
import { apiClient } from '@/lib/api-client';
import { adminService } from '@/services/admin.service';
import type { Vehiculo, VehicleStatus, Modelo, Categoria, TipoCombustible, TipoTransmision, Agencia, Marca } from '@/types/domain';
import * as V from '@/utils/validators';

const inputCls = 'input-base';

const STATUS_CLS: Record<VehicleStatus, string> = {
  DISPONIBLE:   'bg-green-100 text-green-700',
  RESERVADO:    'bg-yellow-100 text-yellow-700',
  EN_USO:       'bg-blue-100 text-blue-700',
  MANTENIMIENTO:'bg-orange-100 text-orange-700',
  INACTIVO:     'bg-red-100 text-red-700',
};

const columns = [
  { key: 'placa',     label: 'Placa' },
  { key: 'vehiculo',  label: 'Vehículo' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'agencia',   label: 'Agencia' },
  { key: 'precioDia', label: 'Precio/día' },
  { key: 'status',    label: 'Estado' },
];

const { data, isLoading } = useVehiculos();
const create = useCreateVehiculo();
const update = useUpdateVehiculo();
const del    = useDeleteVehiculo();

const vehiculos = computed<Vehiculo[]>(() => {
  const d = data.value as { data?: { data?: Vehiculo[] } | Vehiculo[] } | undefined;
  return (d?.data as { data?: Vehiculo[] })?.data ?? (d?.data as Vehiculo[]) ?? [];
});

const formError     = ref<string | null>(null);

const marcas       = ref<Marca[]>([]);
const modelos      = ref<Modelo[]>([]);
const categorias   = ref<Categoria[]>([]);
const combustibles = ref<TipoCombustible[]>([]);
const transmisiones = ref<TipoTransmision[]>([]);
const agencias     = ref<Agencia[]>([]);

const newModelForm = reactive({ nombre: '', marcaId: '', nuevaMarcaNombre: '' });

/** Extrae un array de una respuesta que puede ser array directo o paginada { data: [...] } */
function extractArray(val: unknown): any[] {
  if (!val) return [];
  const d = (val as any)?.data;
  if (Array.isArray(d)) return d;           // { success, data: [...] }
  if (Array.isArray(d?.data)) return d.data; // { success, data: { data: [...], total } }
  if (Array.isArray(val))     return val as any[];
  return [];
}

onMounted(async () => {
  const [rm, rc, rcomb, rt, ra, rma] = await Promise.allSettled([
    adminService.getModelos(),
    adminService.getCategorias(),
    adminService.getCombustibles(),
    adminService.getTransmisiones(),
    adminService.getAgencias(),
    adminService.getMarcas(),
  ]);
  if (rm.status    === 'fulfilled') modelos.value       = extractArray(rm.value);
  if (rc.status    === 'fulfilled') categorias.value    = extractArray(rc.value);
  if (rcomb.status === 'fulfilled') combustibles.value  = extractArray(rcomb.value);
  if (rt.status    === 'fulfilled') transmisiones.value = extractArray(rt.value);
  if (ra.status    === 'fulfilled') agencias.value      = extractArray(ra.value);
  if (rma.status   === 'fulfilled') marcas.value        = extractArray(rma.value);
});

function makeEmpty(row?: Vehiculo) {
  return {
    placa:             row?.placa                        ?? '',
    color:             row?.color                        ?? '',
    anio:              row?.anio                         ?? new Date().getFullYear(),
    kilometraje:       row?.kilometraje                  ?? 0,
    precioDia:         row ? Number(row.precioDia)       : 0,
    numeroPasajeros:   row?.numeroPasajeros              ?? 5,
    descripcion:       row?.descripcion                  ?? '',
    isActive:          row?.isActive                     ?? true,
    imagenUrl:         (row as any)?.imagenUrl           ?? null as string | null,
    modeloId:          row?.modelo?.id                   ?? '',
    categoriaId:       row?.categoria?.id                ?? '',
    tipoCombustibleId: row?.tipoCombustible?.id          ?? '',
    tipoTransmisionId: row?.tipoTransmision?.id          ?? '',
    agenciaId:         row?.agencia?.id                  ?? '',
  };
}

const modal = reactive({ open: false, id: null as string | null, row: makeEmpty() });

function openCreate() { formError.value = null; Object.assign(modal, { open: true, id: null, row: makeEmpty() }); }
function openEdit(row: Vehiculo) { formError.value = null; Object.assign(modal, { open: true, id: row.id, row: makeEmpty(row) }); }
function close() { 
  formError.value = null; 
  Object.assign(modal, { open: false, id: null, row: makeEmpty() }); 
  newModelForm.nombre = '';
  newModelForm.marcaId = '';
  newModelForm.nuevaMarcaNombre = '';
}

function handlePlacaInput(e: Event) {
  const input = e.target as HTMLInputElement;
  let val = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (val.length > 3) {
    val = val.substring(0, 3) + '-' + val.substring(3, 7);
  }
  modal.row.placa = val;
}

function getImagenUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace('/api/v1', '');
  return `${base}${url}`;
}

const isPending = computed(() => create.isPending.value || update.isPending.value);

function validateVehiculo(): string {
  const r = modal.row;
  const checks: string[] = [
    V.placaEc(r.placa),
    V.soloLetras(r.color, 'Color'),
    V.anioVehiculo(r.anio),
    V.enteroNoNegativo(r.kilometraje, 'Kilometraje'),
    V.numeroPositivo(r.precioDia, 'Precio/día'),
    r.numeroPasajeros < 1 || r.numeroPasajeros > 20 ? 'Las plazas deben estar entre 1 y 20' : '',
    V.reqStr(r.agenciaId,         'La agencia'),
    V.reqStr(r.modeloId,          'El modelo'),
    V.reqStr(r.categoriaId,       'La categoría'),
    V.reqStr(r.tipoCombustibleId, 'El combustible'),
    V.reqStr(r.tipoTransmisionId, 'La transmisión'),
  ];
  return checks.find(e => !!e) ?? '';
}

async function handleSubmit() {
  formError.value = null;
  const err = validateVehiculo();
  if (err) { formError.value = err; return; }
  try {
    let vehiculoId: string;
    let finalModeloId = modal.row.modeloId;

    // Si es un modelo nuevo, crearlo primero
    if (finalModeloId === 'NEW_MODEL') {
      if (!newModelForm.nombre || !newModelForm.marcaId) {
        formError.value = 'Nombre y Marca son obligatorios para el nuevo modelo';
        return;
      }
      
      let finalMarcaId = newModelForm.marcaId;

      // Si también es una marca nueva
      if (finalMarcaId === 'NEW_MARCA') {
        if (!newModelForm.nuevaMarcaNombre) {
          formError.value = 'El nombre de la nueva marca es obligatorio';
          return;
        }
        const resMarca = await apiClient.post('/marcas', { nombre: newModelForm.nuevaMarcaNombre });
        finalMarcaId = (resMarca as any).data?.id ?? (resMarca as any).id;
      }

      const resM = await apiClient.post('/modelos', { nombre: newModelForm.nombre, marcaId: finalMarcaId });
      finalModeloId = (resM as any).data?.id ?? (resM as any).id;
      
      // Actualizar catálogos locales
      const [resMod, resMarc] = await Promise.all([adminService.getModelos(), adminService.getMarcas()]);
      modelos.value = extractArray(resMod);
      marcas.value  = extractArray(resMarc);
    }

    if (modal.id) {
      await update.mutateAsync({ id: modal.id, data: { ...modal.row, modeloId: finalModeloId } });
      vehiculoId = modal.id;
    } else {
      const res  = await create.mutateAsync({ ...modal.row, modeloId: finalModeloId });
      vehiculoId = (res as any)?.data?.id ?? (res as any)?.id ?? '';
    }

    close();
  } catch (err: unknown) {
    const msg = (err as any)?.response?.data?.error?.message
      ?? (err as any)?.message
      ?? 'Error al guardar el vehículo';
    formError.value = msg;
  }
}

function handleDelete(id: string) {
  del.mutate(id);
}
</script>
