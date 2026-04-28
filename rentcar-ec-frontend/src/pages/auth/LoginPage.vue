<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Glow -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full" />

    <div class="relative w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center gap-2 mb-6">
          <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Car class="w-6 h-6 text-black" />
          </div>
          <span class="font-black text-white text-xl tracking-tight">RENT<span class="text-orange-500">CAR</span></span>
        </RouterLink>
        <h1 class="text-2xl font-black text-white">Bienvenido de vuelta</h1>
        <p class="text-sm text-zinc-500 mt-1">Inicia sesión para continuar</p>
      </div>

      <div class="card p-7 shadow-2xl shadow-black/40">
        <!-- Error de servidor -->
        <div v-if="errorMessage" class="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3 mb-5">
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ errorMessage }}
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                v-model="form.email"
                type="text"
                placeholder="tu@email.com"
                class="input-base pl-10"
                :class="errors.email ? 'border-red-500 focus:border-red-500' : ''"
                @blur="errors.email = V.email(form.email)"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle class="w-3 h-3 shrink-0" />{{ errors.email }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Contraseña</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="input-base pl-10"
                :class="errors.password ? 'border-red-500 focus:border-red-500' : ''"
                @blur="errors.password = V.password(form.password)"
              />
            </div>
            <p v-if="errors.password" class="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle class="w-3 h-3 shrink-0" />{{ errors.password }}
            </p>
          </div>

          <button type="submit" :disabled="login.isPending.value" class="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            <Loader2 v-if="login.isPending.value" class="w-4 h-4 animate-spin" />
            {{ login.isPending.value ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>
        </form>

        <!-- Demo -->
        <div class="mt-5 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p class="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Credenciales de prueba</p>
          <div class="space-y-1 text-xs text-zinc-500">
            <p><span class="text-orange-400 font-semibold">Admin:</span> admin@rentcar.ec / Admin2025!</p>
            <p><span class="text-zinc-300 font-semibold">Cliente:</span> cliente@test.ec / Cliente2025!</p>
          </div>
        </div>

        <p class="text-center text-sm text-zinc-500 mt-5">
          ¿No tienes cuenta?
          <RouterLink to="/register" class="text-orange-400 font-semibold hover:text-orange-300 ml-1">Regístrate</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { Car, Mail, Lock, AlertCircle, Loader2 } from 'lucide-vue-next';
import { useLogin } from '@/composables/useAuth';
import * as V from '@/utils/validators';

const login = useLogin();
const form   = reactive({ email: '', password: '' });
const errors = reactive({ email: '', password: '' });

const errorMessage = computed(() => {
  if (!login.error.value) return null;
  const err = login.error.value as { response?: { data?: { error?: { message?: string } } } };
  return err?.response?.data?.error?.message ?? 'Error al iniciar sesión';
});

function validate(): boolean {
  errors.email    = V.email(form.email);
  errors.password = V.password(form.password);
  return !errors.email && !errors.password;
}

function onSubmit() {
  if (!validate()) return;
  login.mutate({ email: form.email, password: form.password });
}
</script>
