import { reactive } from 'vue';
import { normalizeCatalogue } from '@/services/dataService';

export const emptyFilters = () => ({
  search: '',
  category: '',
  discipline: '',
  expertise: '',
  audience: '',
  rightsHolder: '',
});

// État partagé entre les pages : le catalogue et les filtres survivent à la navigation.
export const store = reactive({
  catalogue: null,
  loading: true,
  filters: emptyFilters(),
});

export const loadCatalogue = async () => {
  try {
    const res = await fetch('/data/catalogue.json');
    store.catalogue = normalizeCatalogue(await res.json());
  } catch (err) {
    console.error('Error loading catalogue:', err);
  } finally {
    store.loading = false;
  }
};

export const resetFilters = () => {
  store.filters = emptyFilters();
};

const collectionHas = (col, predicate) => predicate(col) || (col.data || []).some(predicate);

export const hasDataFor = (predicate) =>
  !!store.catalogue && store.catalogue.collections.some(col => collectionHas(col, predicate));
