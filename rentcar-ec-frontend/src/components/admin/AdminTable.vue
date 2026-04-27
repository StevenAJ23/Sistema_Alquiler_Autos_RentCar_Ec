<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-black text-white tracking-tight">{{ title }}</h1>
      <button
        v-if="onAdd"
        @click="onAdd"
        class="btn-primary flex items-center gap-2 text-sm"
      >
        <Plus class="w-4 h-4" /> Agregar
      </button>
    </div>

    <!-- Search -->
    <div v-if="searchKeys && searchKeys.length > 0" class="relative mb-4">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        v-model="search"
        placeholder="Buscar..."
        class="input-base pl-10"
      />
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <Loader2 class="w-7 h-7 animate-spin text-orange-500" />
      </div>
      <div v-else-if="filtered.length === 0" class="text-center py-20 text-zinc-500 text-sm">
        Sin registros
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-zinc-800">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                class="text-left px-5 py-3.5 font-semibold text-zinc-400 text-xs uppercase tracking-widest"
              >
                {{ col.label }}
              </th>
              <th v-if="onEdit || onDelete" class="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60">
            <tr
              v-for="row in filtered"
              :key="row.id"
              class="hover:bg-zinc-800/40 transition-colors group"
            >
              <td v-for="col in columns" :key="col.key" class="px-5 py-3.5 text-zinc-300">
                <slot :name="`cell-${col.key}`" :row="row">
                  {{ (row as Record<string, unknown>)[col.key] ?? '—' }}
                </slot>
              </td>
              <td v-if="onEdit || onDelete" class="px-5 py-3.5">
                <div class="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    v-if="onEdit"
                    @click="onEdit(row)"
                    class="text-zinc-500 hover:text-orange-400 transition-colors p-1.5 hover:bg-zinc-800 rounded-lg"
                    title="Editar"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <template v-if="onDelete">
                    <template v-if="pendingDeleteId === row.id">
                      <button
                        @click.stop="props.onDelete!(row.id); pendingDeleteId = null"
                        :disabled="isDeleting"
                        class="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-lg disabled:opacity-30 transition-colors whitespace-nowrap"
                      >
                        ¿Confirmar?
                      </button>
                      <button
                        @click.stop="pendingDeleteId = null"
                        class="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </template>
                    <button
                      v-else
                      @click.stop="pendingDeleteId = row.id"
                      :disabled="isDeleting"
                      class="text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-30 p-1.5 hover:bg-zinc-800 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string }">
import { ref, computed } from 'vue';
import { Plus, Pencil, Trash2, Loader2, Search, X } from 'lucide-vue-next';

interface Column { key: string; label: string; }

const props = defineProps<{
  title: string;
  data: T[] | undefined;
  columns: Column[];
  isLoading: boolean;
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  searchKeys?: string[];
}>();

const search          = ref('');
const pendingDeleteId = ref<string | null>(null);

const filtered = computed(() => {
  const items = props.data ?? [];
  if (!search.value || !props.searchKeys?.length) return items;
  return items.filter((row) =>
    props.searchKeys!.some((k) =>
      String((row as Record<string, unknown>)[k] ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
  );
});

</script>
