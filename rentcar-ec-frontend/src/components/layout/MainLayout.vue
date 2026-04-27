<template>
  <div class="min-h-screen bg-zinc-950 flex flex-col">

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <RouterLink to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Car class="w-5 h-5 text-black" />
            </div>
            <span class="font-black text-white text-lg tracking-tight">RENT<span class="text-orange-500">CAR</span></span>
          </RouterLink>

          <!-- Nav -->
          <nav class="hidden md:flex items-center gap-1">
            <RouterLink
              to="/buscar"
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <Search class="w-4 h-4" />
              Buscar autos
            </RouterLink>
            <RouterLink
              v-if="auth.isAuthenticated"
              to="/mis-reservas"
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <Calendar class="w-4 h-4" />
              Mis reservas
            </RouterLink>
            <RouterLink
              v-if="auth.isAuthenticated && !auth.isAdmin()"
              to="/perfil"
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              <UserCircle class="w-4 h-4" />
              Mi perfil
            </RouterLink>
            <RouterLink
              v-if="auth.isAdmin()"
              to="/admin"
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-zinc-800 rounded-lg transition-all"
            >
              <ShieldCheck class="w-4 h-4" />
              Admin
            </RouterLink>
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <template v-if="auth.isAuthenticated">
              <div class="hidden sm:flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-orange-500 text-black flex items-center justify-center font-black text-sm">
                  {{ auth.user?.nombres?.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-zinc-300">{{ auth.user?.nombres }}</span>
              </div>
              <button
                @click="handleLogout"
                class="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 px-3 py-2 rounded-lg transition-all"
              >
                <LogOut class="w-4 h-4" />
                <span class="hidden sm:inline">Salir</span>
              </button>
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                class="text-sm font-medium text-zinc-400 hover:text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-all"
              >
                Iniciar sesión
              </RouterLink>
              <RouterLink
                to="/register"
                class="btn-primary text-sm"
              >
                Registrarse
              </RouterLink>
            </template>
          </div>

        </div>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="border-t border-zinc-800 py-8">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
            <Car class="w-4 h-4 text-black" />
          </div>
          <span class="font-black text-white text-sm">RENT<span class="text-orange-500">CAR</span></span>
        </div>
        <p class="text-xs text-zinc-600">© {{ new Date().getFullYear() }} RentCar Ecuador · Plataforma académica</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Car, Search, Calendar, LogOut, ShieldCheck, UserCircle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.clearAuth();
  router.push('/login');
}
</script>
