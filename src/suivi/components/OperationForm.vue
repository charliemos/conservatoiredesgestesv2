<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { suivi, reloadOperations, reloadProductions, showToast, toInputDate } from '../store';
import { ui } from '../ui';
import MemberSelect from './MemberSelect.vue';
import FormActions from './FormActions.vue';

// mode 'create' : choix de l'action + nom (l'IdOp en découle) ; mode 'edit' : choix d'une opération existante.
const props = defineProps({ mode: { type: String, required: true } });
const isEdit = computed(() => props.mode === 'edit');
const router = useRouter();
const back = () => router.push('/suivi');

const actionId = ref('');
const nom = ref('');
const selected = ref('');
const loaded = ref(false);
const form = ref({ description: '', debut: '', fin: '', etat: '' });
const membres = ref([]);
const submitting = ref(false);
const response = ref(null);
const responseOk = ref(true);

const newKey = computed(() => (actionId.value && nom.value.trim() ? `${actionId.value}-${nom.value.trim()}` : null));
const showFields = computed(() => !isEdit.value || loaded.value);

const setResponse = (data, ok) => { response.value = data; responseOk.value = ok; };
const fail = (e) => { setResponse(e.data || { error: e.message }, false); showToast('Erreur : ' + (e.message || 'API'), 'err'); };

const loadOp = async () => {
  response.value = null;
  loaded.value = false;
  if (!selected.value) return;
  try {
    const op = await api.operation(selected.value);
    form.value = {
      description: op.description || '',
      debut: toInputDate(op.debut_op),
      fin: toInputDate(op.fin_op),
      etat: op.etat ?? '',
    };
    membres.value = op.membres || [];
    loaded.value = true;
  } catch {
    showToast('Erreur de chargement', 'err');
  }
};

const payload = () => ({
  description: form.value.description || null,
  debut_op: form.value.debut || null,
  fin_op: form.value.fin || null,
  etat_avancement: form.value.etat !== '' ? parseInt(form.value.etat, 10) : null,
  membres: membres.value,
});

const submit = async () => {
  if (!isEdit.value && (!actionId.value || !nom.value.trim())) {
    showToast('Action et nom sont obligatoires', 'err');
    return;
  }
  if (isEdit.value && !selected.value) return;
  submitting.value = true;
  try {
    const data = isEdit.value
      ? await api.updateOperation(selected.value, payload())
      : await api.createOperation({ num_action: parseInt(actionId.value, 10), nom_op: nom.value.trim(), ...payload() });
    setResponse(data, true);
    showToast('✓ ' + (data.status || 'OK'));
    await reloadOperations();
  } catch (e) {
    fail(e);
  } finally {
    submitting.value = false;
  }
};

const remove = async () => {
  const nbProds = suivi.productions.filter((p) => p.id_op === selected.value).length;
  const msg = `Supprimer définitivement l'opération « ${selected.value} » et ses membres ?`
    + (nbProds ? `\n\n⚠️ Ses ${nbProds} production(s) rattachée(s) seront également supprimées.` : '');
  if (!confirm(msg)) return;
  submitting.value = true;
  try {
    const data = await api.deleteOperation(selected.value, nbProds > 0);
    showToast('✓ ' + data.status);
    selected.value = '';
    loaded.value = false;
    setResponse(data, true);
    await Promise.all([reloadOperations(), reloadProductions()]);
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
        {{ isEdit ? 'Modifier une opération' : 'Créer une opération' }}
      </h2>
      <p class="text-sm text-gray-500">Feuille Excel cible : <code>Operation</code> et <code>OperationMembres</code></p>
    </div>

    <div v-if="isEdit">
      <label :class="ui.label">Opération <span class="text-red-500">*</span></label>
      <select v-model="selected" :class="ui.field" @change="loadOp">
        <option value="">— choisir une opération —</option>
        <option v-for="o in suivi.operations" :key="o.id_op" :value="o.id_op">{{ o.id_op }}</option>
      </select>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label :class="ui.label">Action parente <span class="text-red-500">*</span></label>
          <select v-model="actionId" :class="ui.field">
            <option value="">— choisir —</option>
            <option v-for="a in suivi.actions" :key="a.id" :value="a.id">{{ a.id }} – {{ a.nom || '' }}</option>
          </select>
        </div>
        <div>
          <label :class="ui.label">Nom de l'opération <span class="text-red-500">*</span></label>
          <input v-model="nom" :class="ui.field" type="text" placeholder="ex : Atelier co-conception" />
        </div>
      </div>
      <div class="bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3">
        <div :class="ui.label">IdOp généré automatiquement</div>
        <div :class="['font-mono text-sm', newKey ? 'text-amber-900' : 'text-gray-300']">{{ newKey || '—' }}</div>
      </div>
    </template>

    <template v-if="showFields">
      <div>
        <label :class="ui.label">Description</label>
        <textarea v-model="form.description" :class="[ui.field, 'min-h-24']" placeholder="Décrivez l'opération…"></textarea>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><label :class="ui.label">Date de début</label><input v-model="form.debut" :class="ui.field" type="date" /></div>
        <div><label :class="ui.label">Date de fin</label><input v-model="form.fin" :class="ui.field" type="date" /></div>
        <div>
          <label :class="ui.label">État d'avancement (0–5)</label>
          <input v-model="form.etat" :class="ui.field" type="number" min="0" max="5" placeholder="0" />
        </div>
      </div>

      <div>
        <div :class="ui.label">Membres et rôles</div>
        <MemberSelect v-model="membres" :options="suivi.membres" with-roles />
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
