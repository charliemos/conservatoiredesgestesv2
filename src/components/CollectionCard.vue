<script setup>
import { ref, computed } from 'vue';
import HighlightText from './HighlightText.vue';
import ResourceItem from './ResourceItem.vue';
import { collectionToGovernanceRows, downloadCSV, joinList } from '@/services/dataService';

const props = defineProps({
  collection: { type: Object, required: true },
  searchText: { type: String, default: '' },
});

const isGovOpen = ref(false);

const formattedDate = computed(() => {
  if (!props.collection.issued) return 'n.c.';
  const date = new Date(props.collection.issued);
  if (isNaN(date.getTime())) return 'n.c.';
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
});

const exportCSV = () => {
  const c = props.collection;
  downloadCSV(`gouvernance-${c.identifier || c.title || 'collection'}.csv`, collectionToGovernanceRows(c));
};
</script>

<template>
  <section class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8 transition-shadow hover:shadow-lg">
    <header class="bg-gray-50 p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 class="text-xl font-bold text-gray-900 leading-tight">
        <HighlightText :text="collection.title || 'Collection sans titre'" :search="searchText" />
      </h2>
      <div class="flex flex-wrap gap-2">
        <span v-if="collection.category" class="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">{{ collection.category }}</span>
        <span v-if="collection.discipline" class="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">{{ collection.discipline }}</span>
      </div>
    </header>

    <div class="p-6">
      <div class="mb-4 border-b border-gray-50 pb-4">
        <button
          class="w-full flex items-center justify-between text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          @click="isGovOpen = !isGovOpen"
        >
          <span class="flex items-center gap-2">
            <span class="text-gray-400 font-bold w-3 text-center">{{ isGovOpen ? '−' : '+' }}</span>
            Informations de gouvernance
          </span>
          <span class="text-gray-400 font-medium italic normal-case">Publiée : {{ formattedDate }}</span>
        </button>

        <div v-if="isGovOpen" class="mt-3 pl-5 space-y-2">
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium italic">
            <span><strong>Producteur(s) :</strong> <HighlightText :text="joinList(collection.creator) || 'n.c.'" :search="searchText" /></span>
            <span><strong>Projet :</strong> <HighlightText :text="joinList(collection.publisher) || 'n.c.'" :search="searchText" /></span>
            <span><strong>Détenteur des droits :</strong> {{ joinList(collection.rightsHolder) || 'n.c.' }}</span>
            <span><strong>Licence :</strong> {{ collection.license || 'n.c.' }}</span>
            <span><strong>Dépôt :</strong> {{ collection.storage || 'Nakala' }}</span>
            <span><strong>Identifiant :</strong> {{ collection.identifier || 'n.c.' }}</span>
            <span><strong>DOI :</strong> {{ collection.doi || 'n.c.' }}</span>
            <span><strong>Date de production :</strong> {{ collection.created || 'n.c.' }}</span>
            <span><strong>Langue :</strong> {{ collection.language || 'n.c.' }}</span>
          </div>
          <button
            class="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
            @click="exportCSV"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2-8H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /></svg>
            Exporter en CSV
          </button>
        </div>
      </div>

      <p v-if="collection.description" class="text-gray-700 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
        <HighlightText :text="collection.description" :search="searchText" />
      </p>

      <div v-if="collection.data && collection.data.length" class="mt-6">
        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span class="h-px bg-gray-200 grow"></span>
          Ressources ({{ collection.data.length }})
          <span class="h-px bg-gray-200 grow"></span>
        </h3>
        <div class="space-y-1">
          <ResourceItem v-for="(item, idx) in collection.data" :key="idx" :resource="item" :search-text="searchText" />
        </div>
      </div>
      <p v-else class="text-sm italic text-gray-400 text-center py-4 bg-gray-50 rounded-lg">Aucune ressource listée dans cette collection.</p>
    </div>
  </section>
</template>
