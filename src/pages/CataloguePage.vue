<script setup>
import { computed } from 'vue';
import { store, resetFilters } from '@/store';
import CollectionCard from '@/components/CollectionCard.vue';
import { catalogueToGovernanceRows, downloadCSV } from '@/services/dataService';

const NIVEAUX_MAITRISE = ["Apprenti", "Confirmé", "Maître d'art"];
const PUBLICS = ["Professeur", "Professionnel", "Apprenant"];

const normalizeText = (str) => (str || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const uniqueValues = computed(() => {
  const disciplines = new Set();
  const categories = new Set();
  for (const col of store.catalogue?.collections || []) {
    for (const r of [col, ...(col.data || [])]) {
      if (r.discipline) disciplines.add(r.discipline.trim());
      if (r.category) categories.add(r.category.trim());
    }
  }
  return { disciplines: [...disciplines].sort(), categories: [...categories].sort() };
});

// La recherche texte porte sur `searchIn` ; chaque autre critère est satisfait
// si l'un des enregistrements de `criteriaIn` le satisfait.
const matches = (searchIn, criteriaIn, f) => {
  const search = normalizeText(f.search);
  const any = (pred) => criteriaIn.some(pred);
  return (!f.search || normalizeText(searchIn.title).includes(search) || normalizeText(searchIn.description).includes(search))
    && (!f.category || any(r => r.category === f.category))
    && (!f.discipline || any(r => r.discipline === f.discipline))
    && (!f.expertise || any(r => r.expertise.includes(f.expertise)))
    && (!f.audience || any(r => r.audience.includes(f.audience)))
    && (!f.rightsHolder || any(r => r.rightsHolder.includes(f.rightsHolder)));
};

const filteredCatalogue = computed(() => {
  const f = store.filters;
  return (store.catalogue?.collections || []).flatMap(col => {
    // Une ressource hérite des catégorie/discipline/niveau/public/détenteur de sa collection.
    const filteredData = (col.data || []).filter(d => matches(d, [d, col], f));
    if (matches(col, [col], f) || filteredData.length > 0) {
      return [{ ...col, data: filteredData.length > 0 ? filteredData : col.data }];
    }
    return [];
  });
});

const hasActiveFilter = computed(() => Object.values(store.filters).some(Boolean));

const exportAll = () => downloadCSV('gouvernance-catalogue.csv', catalogueToGovernanceRows(filteredCatalogue.value));

const SELECTS = [
  { key: 'category', label: 'Catégorie', all: 'Toutes les catégories', color: 'bg-cyan-50/50 border-cyan-100 text-cyan-900' },
  { key: 'discipline', label: 'Discipline', all: 'Toutes les disciplines', color: 'bg-indigo-50/50 border-indigo-100 text-indigo-900' },
  { key: 'expertise', label: 'Niveau de maîtrise', all: 'Tous les niveaux', color: 'bg-amber-50/50 border-amber-100 text-amber-900' },
  { key: 'audience', label: 'Public visé', all: 'Tous les publics', color: 'bg-sky-50/50 border-sky-100 text-sky-900' },
];

const optionsFor = (key) => ({
  category: uniqueValues.value.categories,
  discipline: uniqueValues.value.disciplines,
  expertise: NIVEAUX_MAITRISE,
  audience: PUBLICS,
}[key]);
</script>

<template>
  <div class="animate-fade-in">
    <h1 class="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Rechercher des ressources</h1>
    <p class="text-gray-500 mb-8">Filtrer les collections par texte, discipline, catégorie, niveau d’expertise et public cible.</p>

    <!-- Filtres -->
    <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 space-y-6">
      <div class="relative">
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Recherche globale</label>
        <div class="relative">
          <input
            v-model="store.filters.search"
            class="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            type="text"
            placeholder="Rechercher dans les titres, descriptions…"
          />
          <svg class="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="s in SELECTS" :key="s.key">
          <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{{ s.label }}</label>
          <select
            v-model="store.filters[s.key]"
            :class="['w-full border rounded-xl py-2.5 px-3 text-sm focus:outline-none transition-all appearance-none cursor-pointer', s.color]"
          >
            <option value="">{{ s.all }}</option>
            <option v-for="o in optionsFor(s.key)" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
      </div>

      <div class="flex justify-between items-center pt-2">
        <span class="text-xs text-gray-400 font-medium">{{ filteredCatalogue.length }} collection(s) trouvée(s)</span>
        <div class="flex items-center gap-4">
          <button
            :disabled="filteredCatalogue.length === 0"
            class="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            @click="exportAll"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2-8H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /></svg>
            Exporter la gouvernance (CSV)
          </button>
          <button
            v-if="hasActiveFilter"
            class="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
            @click="resetFilters"
          >
            Effacer les filtres
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Liste du catalogue -->
    <div class="space-y-4">
      <template v-if="filteredCatalogue.length > 0">
        <CollectionCard
          v-for="(col, idx) in filteredCatalogue"
          :key="idx"
          :collection="col"
          :search-text="store.filters.search"
        />
      </template>
      <div v-else class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-gray-500 font-medium">Aucune collection ne correspond à vos critères.</p>
      </div>
    </div>
  </div>
</template>
