<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-black text-white tracking-tight">Mi perfil</h1>
      <p class="text-zinc-500 text-sm mt-1">Edita tu información personal</p>
    </div>

    <!-- Avatar + info básica -->
    <div class="card p-6 flex items-center gap-5 mb-6">
      <div class="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-black font-black text-2xl shrink-0">
        {{ auth.user?.nombres?.charAt(0)?.toUpperCase() }}
      </div>
      <div>
        <p class="text-lg font-black text-white">{{ auth.user?.nombres }} {{ auth.user?.apellidos }}</p>
        <p class="text-sm text-zinc-500">{{ auth.user?.email }}</p>
        <span class="badge mt-1 inline-block bg-orange-500/10 text-orange-400 border border-orange-500/20">
          {{ auth.user?.role }}
        </span>
      </div>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="card p-6 space-y-5">
      <h2 class="font-bold text-white text-sm border-b border-zinc-800 pb-3">Datos personales</h2>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Nombres</label>
          <input v-model="form.nombres" type="text" required :class="inputCls" />
        </div>
        <div>
          <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Apellidos</label>
          <input v-model="form.apellidos" type="text" required :class="inputCls" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Teléfono</label>
        <input v-model="form.telefono" type="tel" placeholder="+593 99 000 0000" :class="inputCls" />
      </div>

      <div class="flex items-center justify-between pt-2">
        <p v-if="successMsg" class="text-sm text-emerald-400 font-medium">{{ successMsg }}</p>
        <p v-if="errorMsg"   class="text-sm text-red-400 font-medium">{{ errorMsg }}</p>
        <div class="ml-auto">
          <button
            type="submit"
            :disabled="isPending"
            class="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Loader2 v-if="isPending" class="w-4 h-4 animate-spin" />
            {{ isPending ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </form>

    <!-- Accesos rápidos -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <RouterLink
        to="/mis-reservas"
        class="card p-5 flex items-center gap-3 hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200"
      >
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Calendar class="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p class="text-sm font-bold text-white">Mis reservas</p>
          <p class="text-xs text-zinc-500">Ver historial</p>
        </div>
      </RouterLink>
      <button
        @click="handleLogout"
        class="card p-5 flex items-center gap-3 hover:border-red-500/30 hover:-translate-y-0.5 transition-all duration-200 text-left"
      >
        <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <LogOut class="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p class="text-sm font-bold text-red-400">Cerrar sesión</p>
          <p class="text-xs text-zinc-500">Salir de la cuenta</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Loader2, Calendar, LogOut } from 'lucide-vue-next';
import { useMutation } from '@tanstack/vue-query';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth.service';
import type { Usuario } from '@/types/domain';

const inputCls = 'input-base';
const auth   = useAuthStore();
const router = useRouter();

const form = reactive({
  nombres:   auth.user?.nombres   ?? '',
  apellidos: auth.user?.apellidos ?? '',
  telefono:  auth.user?.telefono  ?? '',
});

const successMsg = ref('');
const errorMsg   = ref('');

const { isPending, mutateAsync } = useMutation({
  mutationFn: () => authService.updateMe({
    nombres:   form.nombres   || undefined,
    apellidos: form.apellidos || undefined,
    telefono:  form.telefono  || undefined,
  }),
  onSuccess: (res) => {
    const updated = (res as { data: Usuario }).data;
    auth.setAuth(updated, auth.token!);
    successMsg.value = 'Perfil actualizado correctamente';
    errorMsg.value   = '';
    setTimeout(() => { successMsg.value = ''; }, 3000);
  },
});

async function handleSubmit() {
  errorMsg.value   = '';
  successMsg.value = '';
  try {
    await mutateAsync();
  } catch (err: unknown) {
    errorMsg.value = (err as { message?: string }).message ?? 'Error al guardar';
  }
}

function handleLogout() {
  auth.clearAuth();
  router.push('/login');
}
</script>