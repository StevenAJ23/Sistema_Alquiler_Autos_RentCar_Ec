<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
        <ShieldOff class="w-10 h-10 text-red-400" />
      </div>

      <h1 class="text-6xl font-black text-white mb-2">403</h1>
      <h2 class="text-xl font-bold text-zinc-200 mb-3">Acceso denegado</h2>
      <p class="text-zinc-400 text-sm mb-8">
        No tienes permisos para acceder a esta sección.<br>
        Esta área es exclusiva para administradores del sistema.
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <RouterLink
          to="/"
          class="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          Ir al inicio
        </RouterLink>
        <RouterLink
          to="/mis-reservas"
          class="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-sm transition-colors"
        >
          Mis reservas
        </RouterLink>
      </div>

      <p class="text-zinc-600 text-xs mt-8">
        Si crees que esto es un error, contacta al administrador.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldOff } from 'lucide-vue-next';
</script>
