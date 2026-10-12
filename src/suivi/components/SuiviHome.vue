<script setup>
import { suivi } from '../store';
import { ui } from '../ui';

const TILES = [
  { to: '/suivi/operation/nouvelle', title: 'Créer une opération', sub: 'Ajouter une opération à une action existante' },
  { to: '/suivi/operation/modifier', title: 'Modifier une opération', sub: 'Mettre à jour ou supprimer une opération' },
  { to: '/suivi/production/nouvelle', title: 'Créer une production', sub: 'Ajouter une production à une opération' },
  { to: '/suivi/production/modifier', title: 'Modifier une production', sub: 'Mettre à jour ou supprimer une production' },
];
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap justify-between items-baseline gap-2">
      <h2 class="text-xl font-extrabold text-gray-900 tracking-tight">Que souhaitez-vous faire ?</h2>
      <span class="text-xs text-gray-400 font-medium">
        {{ suivi.actions.length }} actions · {{ suivi.operations.length }} opérations · {{ suivi.productions.length }} productions
      </span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RouterLink
        v-for="t in TILES"
        :key="t.to"
        :to="t.to"
        :class="[ui.card, 'hover:border-amber-200 transition-all group']"
      >
        <div class="font-bold text-gray-900 group-hover:text-amber-800 transition-colors">{{ t.title }}</div>
        <div class="text-sm text-gray-500 mt-1">{{ t.sub }}</div>
      </RouterLink>
    </div>
  </section>
</template>
