<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center p-4 py-10 relative overflow-hidden">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full" />

    <div class="relative w-full max-w-md">
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center gap-2 mb-6">
          <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Car class="w-6 h-6 text-black" />
          </div>
          <span class="font-black text-white text-xl tracking-tight">RENT<span class="text-orange-500">CAR</span></span>
        </RouterLink>
        <h1 class="text-2xl font-black text-white">Crear cuenta</h1>
        <p class="text-sm text-zinc-500 mt-1">Únete a RentCar Ecuador</p>
      </div>

      <div class="card p-7 shadow-2xl shadow-black/40">
        <div v-if="errorMessage" class="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3 mb-5">
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ errorMessage }}
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nombres *</label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input v-model="form.nombres" placeholder="Juan" required class="input-base pl-9" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Apellidos *</label>
              <input v-model="form.apellidos" placeholder="Pérez" required class="input-base" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email *</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input v-model="form.email" type="email" placeholder="tu@email.com" required class="input-base pl-10" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Cédula</label>
              <div class="relative">
                <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input v-model="form.cedula" placeholder="1700000000" maxlength="13" class="input-base pl-9" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Teléfono</label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input v-model="form.telefono" placeholder="+593 99 000 0000" class="input-base pl-9" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Contraseña *</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input v-model="form.password" type="password" placeholder="••••••••" required minlength="6" class="input-base pl-10" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Confirmar contraseña *</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input v-model="form.confirmPassword" type="password" placeholder="••••••••" required class="input-base pl-10" />
            </div>
            <p v-if="passwordError" class="text-xs text-red-400 mt-1">{{ passwordError }}</p>
          </div>

          <button type="submit" :disabled="registerMutation.isPending.value" class="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            <Loader2 v-if="registerMutation.isPending.value" class="w-4 h-4 animate-spin" />
            {{ registerMutation.isPending.value ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-center text-sm text-zinc-500 mt-5">
          ¿Ya tienes cuenta?
          <RouterLink to="/login" class="text-orange-400 font-semibold hover:text-orange-300 ml-1">Inicia sesión</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { Car, Mail, Lock, User, Phone, CreditCard, AlertCircle, Loader2 } from 'lucide-vue-next';
import { useRegister } from '@/composables/useAuth';

const registerMutation = useRegister();
const form = reactive({ email: '', password: '', confirmPassword: '', nombres: '', apellidos: '', cedula: '', telefono: '' });

const passwordError = computed(() =>
  form.confirmPassword && form.password !== form.confirmPassword ? 'Las contraseñas no coinciden' : ''
);
const errorMessage = computed(() => {
  if (!registerMutation.error.value) return null;
  const err = registerMutation.error.value as { response?: { data?: { error?: { message?: string } } } };
  return err?.response?.data?.error?.message ?? 'Error al registrarse';
});

function onSubmit() {
  if (passwordError.value) return;
  const { confirmPassword: _, ...data } = form;
  registerMutation.mutate({ ...data, cedula: data.cedula || undefined, telefono: data.telefono || undefined });
}
</script>
