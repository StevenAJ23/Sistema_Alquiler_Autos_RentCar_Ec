<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
        @keydown.esc="$emit('close')"
      >
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <div class="relative w-full max-w-md card shadow-2xl shadow-black/60">
          <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
            <h2 class="text-base font-bold text-white">{{ title }}</h2>
            <button
              @click="$emit('close')"
              class="text-zinc-500 hover:text-white p-1.5 hover:bg-zinc-800 rounded-lg transition-all"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="$emit('submit')" class="px-6 py-5 space-y-4">
            <div v-if="error" class="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{{ error }}</span>
            </div>
            <slot />
            <div class="flex gap-3 pt-2">
              <button type="button" @click="$emit('close')" class="btn-outline flex-1 text-sm">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
              >
                <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
                {{ isLoading ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Loader2, AlertCircle } from 'lucide-vue-next';
defineProps<{ title: string; open: boolean; isLoading: boolean; error?: string | null }>();
defineEmits<{ close: []; submit: [] }>();
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
