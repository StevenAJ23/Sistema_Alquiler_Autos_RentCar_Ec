<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-black text-white tracking-tight">Historial de acciones</h1>
      <span class="text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full">
        Solo lectura — auditoría
      </span>
    </div>

    <!-- Buscador -->
    <div class="relative mb-4">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input v-model="search" placeholder="Buscar por acción, entidad o usuario..." class="input-base pl-10" />
    </div>

    <div class="card overflow-hidden">
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <Loader2 class="w-7 h-7 animate-spin text-orange-500" />
      </div>
      <div v-else-if="filtered.length === 0" class="text-center py-20 text-zinc-500 text-sm">Sin registros</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-zinc-800">
            <tr>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Fecha</th>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Usuario</th>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Acción</th>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Entidad</th>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">ID Entidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60">
            <tr v-for="h in filtered" :key="h.id" class="hover:bg-zinc-800/40 transition-colors">
              <td class="px-5 py-3.5 text-zinc-500 text-xs whitespace-nowrap">
                {{ new Date(h.createdAt).toLocaleString('es-EC') }}
              </td>
              <td class="px-5 py-3.5 text-zinc-300">
                <p class="font-medium">{{ h.usuario?.nombres ?? '—' }}</p>
                <p class="text-xs text-zinc-600">{{ h.usuario?.email ?? '' }}</p>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs px-2 py-0.5 rounded-full font-bold font-mono" :class="accionCls(h.accion)">
                  {{ h.accion }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-zinc-400 font-medium">{{ h.entidad }}</td>
              <td class="px-5 py-3.5 text-zinc-600 font-mono text-xs">{{ h.entidadId?.slice(0, 12) }}…</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Loader2 } from 'lucide-vue-next';
import { useAdminHistorial } from '@/composables/useAdmin';

interface HistorialItem {
  id: string;
  accion: string;
  entidad: string;
  entidadId: string;
  createdAt: string;
  usuario?: { nombres: string; email: string } | null;
}

const search = ref('');
const { data, isLoading } = useAdminHistorial();

const items = computed<HistorialItem[]>(() =>
  Array.isArray(data.value) ? data.value as HistorialItem[] : []
);

const filtered = computed(() => {
  if (!search.value) return items.value;
  const q = search.value.toLowerCase();
  return items.value.filter(h =>
    h.accion.toLowerCase().includes(q) ||
    h.entidad.toLowerCase().includes(q) ||
    h.usuario?.nombres?.toLowerCase().includes(q) ||
    h.usuario?.email?.toLowerCase().includes(q)
  );
});

function accionCls(accion: string) {
  if (accion.includes('CREADA') || accion.includes('REGISTRADO') || accion.includes('GENERADA') || accion.includes('INICIADO'))
    return 'bg-emerald-500/20 text-emerald-400';
  if (accion.includes('CANCELADA') || accion.includes('ELIMINADO') || accion.includes('FALLIDO'))
    return 'bg-red-500/20 text-red-400';
  if (accion.includes('ACTUALIZADO') || accion.includes('COMPLETADA') || accion.includes('DEVUELTO'))
    return 'bg-blue-500/20 text-blue-400';
  return 'bg-zinc-700 text-zinc-400';
}
</script>