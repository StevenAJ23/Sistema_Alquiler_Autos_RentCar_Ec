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
                <input
                  v-model="form.nombres"
                  placeholder="Juan"
                  class="input-base pl-9"
                  :class="errors.nombres ? 'border-red-500' : ''"
                  @input="form.nombres = form.nombres.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')"
                  @blur="errors.nombres = V.soloLetras(form.nombres, 'Nombres')"
                />
              </div>
              <p v-if="errors.nombres" class="text-xs text-red-400 mt-1">{{ errors.nombres }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Apellidos *</label>
              <input
                v-model="form.apellidos"
                placeholder="Pérez"
                class="input-base"
                :class="errors.apellidos ? 'border-red-500' : ''"
                @input="form.apellidos = form.apellidos.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')"
                @blur="errors.apellidos = V.soloLetras(form.apellidos, 'Apellidos')"
              />
              <p v-if="errors.apellidos" class="text-xs text-red-400 mt-1">{{ errors.apellidos }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email *</label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                v-model="form.email"
                type="text"
                placeholder="tu@email.com"
                class="input-base pl-10"
                :class="errors.email ? 'border-red-500' : ''"
                @blur="errors.email = V.email(form.email)"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-red-400 mt-1">{{ errors.email }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Cédula</label>
              <div class="relative">
                <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  v-model="form.cedula"
                  placeholder="1700000000"
                  maxlength="10"
                  class="input-base pl-9"
                  :class="errors.cedula ? 'border-red-500' : ''"
                  @input="form.cedula = form.cedula.replace(/\D/g, '')"
                  @blur="errors.cedula = V.cedulaEc(form.cedula)"
                />
              </div>
              <p v-if="errors.cedula" class="text-xs text-red-400 mt-1">{{ errors.cedula }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Teléfono</label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  v-model="form.telefono"
                  placeholder="+593 99 000 0000"
                  class="input-base pl-9"
                  :class="errors.telefono ? 'border-red-500' : ''"
                  @input="form.telefono = form.telefono.replace(/[^\d\s+()\-]/g, '')"
                  @blur="errors.telefono = V.telefonoOpc(form.telefono)"
                />
              </div>
              <p v-if="errors.telefono" class="text-xs text-red-400 mt-1">{{ errors.telefono }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Contraseña *</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="input-base pl-10"
                :class="errors.password ? 'border-red-500' : ''"
                @blur="errors.password = V.password(form.password)"
              />
            </div>
            <p v-if="errors.password" class="text-xs text-red-400 mt-1">{{ errors.password }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Confirmar contraseña *</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                v-model="form.confirmPassword"
                type="password"
                placeholder="••••••••"
                class="input-base pl-10"
                :class="errors.confirmPassword ? 'border-red-500' : ''"
                @blur="errors.confirmPassword = V.confirmarPassword(form.password, form.confirmPassword)"
              />
            </div>
            <p v-if="errors.confirmPassword" class="text-xs text-red-400 mt-1">{{ errors.confirmPassword }}</p>
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
import * as V from '@/utils/validators';

const registerMutation = useRegister();
const form = reactive({
  email: '', password: '', confirmPassword: '',
  nombres: '', apellidos: '', cedula: '', telefono: '',
});
const errors = reactive({
  email: '', password: '', confirmPassword: '',
  nombres: '', apellidos: '', cedula: '', telefono: '',
});

const errorMessage = computed(() => {
  if (!registerMutation.error.value) return null;
  const err = registerMutation.error.value as { response?: { data?: { error?: { message?: string } } } };
  return err?.response?.data?.error?.message ?? 'Error al registrarse';
});

function validate(): boolean {
  errors.nombres          = V.soloLetras(form.nombres,   'Nombres');
  errors.apellidos        = V.soloLetras(form.apellidos, 'Apellidos');
  errors.email            = V.email(form.email);
  errors.cedula           = V.cedulaEc(form.cedula);
  errors.telefono         = V.telefonoOpc(form.telefono);
  errors.password         = V.password(form.password);
  errors.confirmPassword  = V.confirmarPassword(form.password, form.confirmPassword);
  return Object.values(errors).every(e => !e);
}

function onSubmit() {
  if (!validate()) return;
  const { confirmPassword: _, ...data } = form;
  registerMutation.mutate({
    ...data,
    cedula:   data.cedula   || undefined,
    telefono: data.telefono || undefined,
  });
}
</script>
