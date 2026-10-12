<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { suivi, reloadProductions, showToast, toInputDate, toIntOrNull } from '../store';
import { ui, TYPOLOGIES } from '../ui';
import MemberSelect from './MemberSelect.vue';
import FormActions from './FormActions.vue';

// mode 'create' : choix de l'opération + nom (l'IdProd en découle) ; mode 'edit' : choix d'une production existante.
const props = defineProps({ mode: { type: String, required: true } });
const isEdit = computed(() => props.mode === 'edit');
const router = useRouter();
const back = () => router.push('/suivi');

const emptyForm = () => ({
  typologie: '', livrable: 'NON', description: '', debut: '', fin: '',
  volume: '', structures: '', beneficiaires: '', lieux: '', impact: '',
});

const opId = ref('');
const nom = ref('');
const selected = ref('');
const loaded = ref(false);
const form = ref(emptyForm());
const membres = ref([]);
const submitting = ref(false);
const response = ref(null);
const responseOk = ref(true);

const newKey = computed(() => (opId.value && nom.value.trim() ? `${opId.value}-${nom.value.trim()}` : null));
const showFields = computed(() => !isEdit.value || loaded.value);

const setResponse = (data, ok) => { response.value = data; responseOk.value = ok; };
const fail = (e) => { setResponse(e.data || { error: e.message }, false); showToast('Erreur : ' + (e.message || 'API'), 'err'); };

const loadProd = async () => {
  response.value = null;
  loaded.value = false;
  if (!selected.value) return;
  try {
    const p = await api.production(selected.value);
    form.value = {
      typologie: p.typologie || '',
      livrable: p.livrable_cdc || 'NON',
      description: p.description || '',
      debut: toInputDate(p.debut_prod),
      fin: toInputDate(p.fin_prod),
      volume: p.volume ?? '',
      structures: p.nb_structures ?? '',
      beneficiaires: p.nb_beneficiaires ?? '',
      lieux: p.lieux || '',
      impact: p.type_impact || '',
    };
    membres.value = p.membres || [];
    loaded.value = true;
  } catch {
    showToast('Erreur de chargement', 'err');
  }
};

const payload = () => {
  const f = form.value;
  return {
    typologie: f.typologie || null,
    description: f.description || null,
    debut_prod: f.debut || null,
    fin_prod: f.fin || null,
    volume: toIntOrNull(f.volume),
    lieux: f.lieux || null,
    livrable_cdc: f.livrable,
    type_impact: f.impact || null,
    nb_structures: toIntOrNull(f.structures),
    nb_beneficiaires: toIntOrNull(f.beneficiaires),
    membres: membres.value,
  };
};

const submit = async () => {
  if (!isEdit.value && (!opId.value || !nom.value.trim())) {
    showToast('Opération et nom sont obligatoires', 'err');
    return;
  }
  if (isEdit.value && !selected.value) return;
  submitting.value = true;
  try {
    const data = isEdit.value
      ? await api.updateProduction(selected.value, payload())
      : await api.createProduction({ id_op: opId.value, nom_prod: nom.value.trim(), ...payload() });
    setResponse(data, true);
    showToast('✓ ' + (data.status || 'OK'));
    await reloadProductions();
  } catch (e) {
    fail(e);
  } finally {
    submitting.value = false;
  }
};

const remove = async () => {
  if (!confirm(`Supprimer définitivement la production « ${selected.value} » et ses membres ?`)) return;
  submitting.value = true;
  try {
    const data = await api.deleteProduction(selected.value);
    showToast('✓ ' + data.status);
    selected.value = '';
    loaded.value = false;
    setResponse(data, true);
    await reloadProductions();
  } catch (e) {
    fail(e);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section :class="[ui.card, 'space-y-6']">
    <div>
      <h2 class="text-xl font-extrabold text-gray-900 tracking-tight">
        {{ isEdit ? 'Modifier une production' : 'Créer une production' }}
      </h2>
      <p class="text-sm text-gray-500">Feuille Excel cible : <code>Production</code> et <code>ProductionMembres</code></p>
    </div>

    <div v-if="isEdit">
      <label :class="ui.label">Production <span class="text-red-500">*</span></label>
      <select v-model="selected" :class="ui.field" @change="loadProd">
        <option value="">— choisir une production —</option>
        <option v-for="p in suivi.productions" :key="p.id_prod" :value="p.id_prod">{{ p.id_prod }}</option>
      </select>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label :class="ui.label">Opération parente <span class="text-red-500">*</span></label>
          <select v-model="opId" :class="ui.field">
            <option value="">— choisir —</option>
            <option v-for="o in suivi.operations" :key="o.id_op" :value="o.id_op">{{ o.id_op }}</option>
          </select>
        </div>
        <div>
          <label :class="ui.label">Nom de la production <span class="text-red-500">*</span></label>
          <input v-model="nom" :class="ui.field" type="text" placeholder="ex : Compte-rendu" />
        </div>
      </div>
      <div class="bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3">
        <div :class="ui.label">IdProd généré automatiquement</div>
        <div :class="['font-mono text-sm break-all', newKey ? 'text-amber-900' : 'text-gray-300']">{{ newKey || '—' }}</div>
      </div>
    </template>

    <template v-if="showFields">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label :class="ui.label">Typologie</label>
          <select v-model="form.typologie" :class="ui.field">
            <option value="">— choisir —</option>
            <option v-for="t in TYPOLOGIES" :key="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label :class="ui.label">Livrable CDC</label>
          <select v-model="form.livrable" :class="ui.field">
            <option value="NON">NON</option>
            <option value="OUI">OUI</option>
          </select>
        </div>
      </div>
      <div>
        <label :class="ui.label">Description</label>
        <textarea v-model="form.description" :class="[ui.field, 'min-h-24']" placeholder="Décrivez la production…"></textarea>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label :class="ui.label">Date de début</label><input v-model="form.debut" :class="ui.field" type="date" /></div>
        <div><label :class="ui.label">Date de fin</label><input v-model="form.fin" :class="ui.field" type="date" /></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><label :class="ui.label">Volume</label><input v-model="form.volume" :class="ui.field" type="number" min="0" /></div>
        <div><label :class="ui.label">Nb structures</label><input v-model="form.structures" :class="ui.field" type="number" min="0" /></div>
        <div><label :class="ui.label">Nb bénéficiaires</label><input v-model="form.beneficiaires" :class="ui.field" type="number" min="0" /></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label :class="ui.label">Lieux</label><input v-model="form.lieux" :class="ui.field" type="text" placeholder="si pertinent" /></div>
        <div><label :class="ui.label">Type d'impact</label><input v-model="form.impact" :class="ui.field" type="text" /></div>
      </div>

      <div>
        <div :class="ui.label">Membres participants</div>
        <MemberSelect v-model="membres" :options="suivi.membres" />
      </div>
    </template>

    <FormActions
      v-if="showFields || response"
      :submitting="submitting"
      :submit-label="isEdit ? 'Enregistrer' : 'Valider et créer'"
      :can-delete="isEdit && loaded"
      :response="response"
      :response-ok="responseOk"
      @submit="submit"
      @cancel="back"
      @delete="remove"
    />
  </section>
</template>
