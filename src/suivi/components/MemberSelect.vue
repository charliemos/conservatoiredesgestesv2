<script setup>
import { ref, watch } from 'vue';
import { ROLES } from '../ui';

// Liste à cocher des organismes. Avec `withRoles`, chaque organisme coché porte un statut
// (opérations) et la valeur est [{ organisme, statut }] ; sinon c'est une liste de noms (productions).
const props = defineProps({
  options: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
  withRoles: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const rows = ref([]);

const buildRows = () => {
  rows.value = props.options.map((org) => {
    if (props.withRoles) {
      const existing = props.modelValue.find((m) => m.organisme === org);
      return { org, checked: !!existing, statut: existing?.statut || 'PARTENAIRE CONTRIBUTEUR' };
    }
    return { org, checked: props.modelValue.includes(org), statut: null };
  });
};

watch(() => [props.options, props.modelValue], buildRows, { immediate: true, deep: true });

const emitChange = () => {
  const checked = rows.value.filter((r) => r.checked);
  emit('update:modelValue', props.withRoles
    ? checked.map((r) => ({ organisme: r.org, statut: r.statut }))
    : checked.map((r) => r.org));
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    <label
      v-for="row in rows"
      :key="row.org"
      :class="[
        'flex items-center gap-3 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm',
        row.checked ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50',
      ]"
    >
      <input v-model="row.checked" type="checkbox" class="accent-amber-700" @change="emitChange" />
      <span class="font-semibold grow">{{ row.org }}</span>
      <select
        v-if="withRoles"
        v-model="row.statut"
        :disabled="!row.checked"
        class="text-[11px] bg-white border border-gray-200 rounded-lg py-1 px-1.5 max-w-[11rem] disabled:opacity-40"
        @click.stop
        @change="emitChange"
      >
        <option v-for="r in ROLES" :key="r">{{ r }}</option>
      </select>
    </label>
  </div>
</template>
