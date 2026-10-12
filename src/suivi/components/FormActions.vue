<script setup>
import { ui } from '../ui';

// Barre de boutons commune aux formulaires + affichage de la réponse brute de l'API.
defineProps({
  submitting: Boolean,
  submitLabel: { type: String, required: true },
  canDelete: Boolean,
  response: { type: Object, default: null },
  responseOk: Boolean,
});
defineEmits(['submit', 'cancel', 'delete']);
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 pt-2">
    <button :class="ui.primary" :disabled="submitting" @click="$emit('submit')">
      <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      {{ submitting ? 'En cours…' : submitLabel }}
    </button>
    <button :class="ui.secondary" @click="$emit('cancel')">Annuler</button>
    <button v-if="canDelete" :class="ui.danger" :disabled="submitting" @click="$emit('delete')">Supprimer</button>
  </div>
  <pre
    v-if="response"
    :class="[
      'mt-4 text-xs p-4 rounded-xl border whitespace-pre-wrap break-all',
      responseOk ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700',
    ]"
  >{{ JSON.stringify(response, null, 2) }}</pre>
</template>
