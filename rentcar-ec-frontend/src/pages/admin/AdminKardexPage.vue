<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-black text-white tracking-tight">Kardex de vehículos</h1>
      <span class="text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full">
        Trazabilidad de estados
      </span>
    </div>

    <div class="relative mb-4">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input v-model="search" placeholder="Buscar por evento, placa o vehículo..." class="input-base pl-10" />
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
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Vehículo</th>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Evento</th>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Estado anterior</th>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Estado nuevo</th>
              <th class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest">Referencia</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60">
            <tr v-for="k in filtered" :key="k.id" class="hover:bg-zinc-800/40 transition-colors">
              <td class="px-5 py-3.5 text-zinc-500 text-xs whitespace-nowrap">
                {{ new Date(k.createdAt).toLocaleString('es-EC') }}
              </td>
              <td class="px-5 py-3.5">
                <p class="text-zinc-300 font-medium">
                  {{ k.vehiculo?.modelo?.marca?.nombre }} {{ k.vehiculo?.modelo?.nombre }}
                </p>
                <p class="text-xs text-zinc-600 font-mono">{{ k.vehiculo?.placa }}</p>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs px-2 py-0.5 rounded-full font-bold font-mono" :class="eventoCls(k.evento)">
                  {{ k.evento }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <span v-if="k.estadoAnterior" class="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {{ k.estadoAnterior }}
                </span>
                <span v-else class="text-zinc-600">—</span>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusCls(k.estadoNuevo)">
                  {{ k.estadoNuevo }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-zinc-600 font-mono text-xs">
                {{ k.referencia ? k.referencia.slice(0, 12) + '…' : '—' }}
              </td>
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
import { useAdminKardex } from '@/composables/useAdmin';

interface KardexItem {
  id: string;
  evento: string;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  referencia?: string | null;
  createdAt: string;
  vehiculo?: { placa: string; modelo?: { nombre: string; marca?: { nombre: string } } } | null;
}

const search = ref('');
const { data, isLoading } = useAdminKardex();

const items = computed<KardexItem[]>(() =>
  Array.isArray(data.value) ? data.value as KardexItem[] : []
);

const filtered = computed(() => {
  if (!search.value) return items.value;
  const q = search.value.toLowerCase();
  return items.value.filter(k =>
    k.evento.toLowerCase().includes(q) ||
    k.vehiculo?.placa?.toLowerCase().includes(q) ||
    k.vehiculo?.modelo?.nombre?.toLowerCase().includes(q)
  );
});

function eventoCls(evento: string) {
  if (evento.includes('INICIADO') || evento.includes('DISPONIBLE'))
    return 'bg-emerald-500/20 text-emerald-400';
  if (evento.includes('DEVUELTO') || evento.includes('COMPLETADO'))
    return 'bg-blue-500/20 text-blue-400';
  if (evento.includes('MANTENIMIENTO') || evento.includes('INACTIVO'))
    return 'bg-amber-500/20 text-amber-400';
  if (evento.includes('CANCELADO'))
    return 'bg-red-500/20 text-red-400';
  return 'bg-zinc-700 text-zinc-400';
}

function statusCls(estado: string) {
  const map: Record<string, string> = {
    DISPONIBLE:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    RESERVADO:     'bg-amber-500/20  text-amber-400  border border-amber-500/30',
    EN_USO:        'bg-blue-500/20   text-blue-400   border border-blue-500/30',
    MANTENIMIENTO: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    INACTIVO:      'bg-zinc-700      text-zinc-400',
  };
  return map[estado] ?? 'bg-zinc-700 text-zinc-400';
}
</script>