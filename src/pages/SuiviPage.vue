<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { suivi, loadSuivi, toast } from '@/suivi/store';
import { DOCS_URL } from '@/suivi/api';
import { ui } from '@/suivi/ui';

// Rapport Power BI (lien « Publier sur le web » : public, visible sans connexion par quiconque a le lien).
const POWERBI_URL =
  'https://app.powerbi.com/view?r=eyJrIjoiNThjNTc1NjgtNmIwZC00YzFiLWE5YWUtN2NlM2YwNmIwZWJjIiwidCI6IjRmOGZkNjk1LWIzYjUtNDA4Mi04MDA1LTYxMGU5NDUzZTZkMCIsImMiOjh9';

const route = useRoute();
onMounted(() => { if (!suivi.connected) loadSuivi(); });
</script>

<template>
  <div class="animate-fade-in space-y-8">
    <div>
      <h1 class="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Suivi du projet</h1>
      <p class="text-gray-500">
        Actions, opérations et productions du projet Re•Source, lues et modifiées dans le fichier Excel de suivi.
      </p>
    </div>

    <section :class="[ui.card, 'flex flex-wrap items-center gap-3 !py-4']">
      <span :class="['w-2.5 h-2.5 rounded-full shrink-0', suivi.connected ? 'bg-green-500' : suivi.loaded ? 'bg-red-500' : 'bg-gray-300']"></span>
      <span class="text-xs text-gray-500 flex-1 min-w-0 break-all">{{ suivi.statusText }}</span>
      <button class="text-xs font-bold text-amber-700 hover:text-amber-900" @click="loadSuivi()">Recharger</button>
      <a :href="DOCS_URL" target="_blank" rel="noopener" class="text-xs font-bold text-gray-500 hover:text-gray-800">Swagger ↗</a>
    </section>

    <details :class="[ui.card, 'group']" open>
      <summary class="cursor-pointer font-bold text-gray-900 select-none">Rapport Power BI</summary>
      <p class="text-xs text-gray-400 mt-2 mb-4">
        Le rapport affiche le dernier rafraîchissement publié, pas l'état instantané du fichier Excel.
      </p>
      <div class="aspect-video w-full">
        <iframe
          title="Rapport de suivi Power BI"
          :src="POWERBI_URL"
          class="w-full h-full rounded-xl border border-gray-100"
          allowfullscreen
        ></iframe>
      </div>
    </details>

    <template v-if="suivi.connected">
      <RouterLink v-if="route.path !== '/suivi'" to="/suivi" class="inline-block text-sm font-bold text-gray-500 hover:text-gray-800">
        ← Retour
      </RouterLink>
      <!-- :key force un nouveau formulaire quand on passe d'un écran à l'autre (même composant). -->
      <RouterView :key="route.path" />
    </template>

    <div
      v-if="toast.visible"
      :class="[
        'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg border',
        toast.type === 'err' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-800 border-green-200',
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>
