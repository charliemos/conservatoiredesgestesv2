<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: { type: String, default: '' },
  search: { type: String, default: '' },
});

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Découpe le texte en segments, en marquant ceux qui correspondent à la recherche.
const parts = computed(() => {
  if (!props.search || !props.text) return [{ text: props.text, hit: false }];
  const needle = props.search.toLowerCase();
  return props.text
    .split(new RegExp(`(${escapeRegExp(props.search)})`, 'gi'))
    .map(text => ({ text, hit: text.toLowerCase() === needle }));
});
</script>

<template>
  <template v-for="(part, i) in parts" :key="i">
    <span v-if="part.hit" class="search-highlight">{{ part.text }}</span>
    <template v-else>{{ part.text }}</template>
  </template>
</template>
