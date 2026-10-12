<script setup>
import { useRouter } from 'vue-router';
import { store, hasDataFor } from '@/store';
import { METIERS } from '@/data/metiers';

const router = useRouter();

const hasDataForDiscipline = (discipline) => !!discipline && hasDataFor(r => r.discipline === discipline);

const viewDiscipline = (discipline) => {
  store.filters.discipline = discipline;
  router.push('/');
};
</script>

<template>
  <div class="animate-fade-in space-y-10">
    <section class="bg-amber-50/50 p-8 rounded-2xl border border-amber-100">
      <h1 class="text-3xl font-extrabold text-black mb-4 tracking-tight">Les métiers étudiés</h1>
      <p class="text-lg text-black/80 leading-relaxed max-w-3xl">
        Re•Source documente un ensemble de métiers d'art choisis pour leur diversité et leur représentativité, avec l'appui des établissements partenaires du Conservatoire.
      </p>
    </section>

    <section>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="metier in METIERS"
          :key="metier.name"
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-amber-200 transition-all group"
        >
          <h4 class="font-bold text-lg text-gray-900 group-hover:text-amber-800 transition-colors mb-3">{{ metier.name }}</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-6 grow">{{ metier.description }}</p>
          <button
            :disabled="!hasDataForDiscipline(metier.discipline)"
            :class="[
              'w-full py-3 rounded-xl font-bold text-sm transition-all',
              hasDataForDiscipline(metier.discipline)
                ? 'bg-gray-900 text-white hover:bg-amber-700 shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            ]"
            @click="viewDiscipline(metier.discipline)"
          >
            {{ hasDataForDiscipline(metier.discipline) ? 'Voir les ressources associées' : 'Ressources à venir' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
