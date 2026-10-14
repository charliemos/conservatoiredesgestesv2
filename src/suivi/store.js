import { reactive } from 'vue';
import { api } from './api';

// État de l'onglet Suivi, séparé du catalogue : il n'est chargé qu'à l'ouverture de l'onglet.
export const suivi = reactive({
  loaded: false,
  connected: false,
  statusText: 'Connexion à l’API de suivi…',
  actions: [],
  operations: [],
  productions: [],
  membres: [],
});

// L'API Python met quelques secondes à démarrer après le site (`npm run dev`) :
// en cas d'échec, on réessaie automatiquement avant d'afficher l'erreur.
const RETRIES = 6;
const RETRY_DELAY = 2000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const loadSuivi = async (retries = RETRIES) => {
  try {
    const info = await api.info();
    const [actions, operations, productions, membres] = await Promise.all([
      api.actions(), api.operations(), api.productions(), api.membres(),
    ]);
    Object.assign(suivi, {
      loaded: true,
      connected: true,
      statusText: `Connecté · ${info.fichier} (${info.taille_ko} ko)`,
      actions, operations, productions, membres,
    });
  } catch {
    if (retries > 0) {
      suivi.statusText = 'Connexion à l’API de suivi… (démarrage en cours)';
      await wait(RETRY_DELAY);
      return loadSuivi(retries - 1);
    }
    Object.assign(suivi, {
      loaded: true,
      connected: false,
      statusText: 'API de suivi inaccessible — lancez le site avec `npm run dev` (qui démarre aussi l’API) et vérifiez le terminal « api ».',
    });
  }
};

export const reloadOperations = async () => { suivi.operations = await api.operations(); };
export const reloadProductions = async () => { suivi.productions = await api.productions(); };

// --- Notifications ---------------------------------------------------------
export const toast = reactive({ message: '', type: 'ok', visible: false });
let toastTimer = null;
export const showToast = (message, type = 'ok') => {
  clearTimeout(toastTimer);
  Object.assign(toast, { message, type, visible: true });
  toastTimer = setTimeout(() => { toast.visible = false; }, 3200);
};

// --- Dates -----------------------------------------------------------------
// L'API renvoie soit une chaîne ISO (dates saisies dans Excel), soit un numéro de
// série Excel (dates écrites par l'API) ; on ramène les deux au format <input type=date>.
export const toInputDate = (v) => {
  if (typeof v === 'string') return v.slice(0, 10);
  if (typeof v !== 'number') return '';
  const d = new Date(Date.UTC(1899, 11, 30));
  d.setUTCDate(d.getUTCDate() + v);
  return d.toISOString().slice(0, 10);
};

export const toIntOrNull = (v) => (v !== '' && v != null ? parseInt(v, 10) : null);
