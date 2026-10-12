<script setup>
import { ref, computed } from 'vue';
import HighlightText from './HighlightText.vue';
import { makeDownloadURL, makeIIIFUrl, formatExtent } from '@/services/dataService';

const props = defineProps({
  resource: { type: Object, required: true },
  searchText: { type: String, default: '' },
});

const isOpen = ref(false);

const downloadUrl = computed(() => makeDownloadURL(props.resource));
const format = computed(() => props.resource.format || '');

// Type de lecteur à afficher selon le format / mediatype de la ressource.
const mediaKind = computed(() => {
  if (!downloadUrl.value) return null;
  const f = format.value;
  const mediatype = (props.resource.mediatype || '').toLowerCase();
  if (f.includes('pdf')) return 'pdf';
  if (f.startsWith('video') || mediatype.includes('vidéo') || mediatype.includes('video')) return 'video';
  if (f.startsWith('audio') || mediatype.includes('audio')) return 'audio';
  if (f.startsWith('image')) return 'image';
  return 'file';
});

const pdfPreview = computed(() => downloadUrl.value && makeIIIFUrl(downloadUrl.value, '1000,'));
const imagePreview = computed(() => downloadUrl.value && (makeIIIFUrl(downloadUrl.value) || downloadUrl.value));
</script>

<template>
  <div class="border border-gray-100 rounded-lg mb-3 overflow-hidden bg-white shadow-sm">
    <div
      class="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      @click="isOpen = !isOpen"
    >
      <div class="flex gap-3 items-center">
        <span class="text-gray-400 font-bold w-4 text-center">{{ isOpen ? '−' : '+' }}</span>
        <h4 class="text-sm font-semibold text-gray-800">
          <HighlightText :text="resource.title || '(Sans titre)'" :search="searchText" />
        </h4>
      </div>
      <div class="flex flex-wrap gap-2 justify-end">
        <span v-if="resource.mediatype" class="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{{ resource.mediatype }}</span>
        <span v-if="resource.license" class="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-medium">CC</span>
        <span v-if="resource.extent" class="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-medium">{{ formatExtent(resource.extent) }}</span>
      </div>
    </div>

    <div v-if="isOpen" class="p-4 border-t border-gray-50 bg-gray-50/30">
      <p v-if="resource.description" class="text-xs text-gray-600 leading-relaxed">
        <HighlightText :text="resource.description" :search="searchText" />
      </p>

      <div v-if="mediaKind === 'pdf'" class="mt-4">
        <img v-if="pdfPreview" :src="pdfPreview" alt="PDF Preview" class="rounded shadow-sm mb-2 max-h-96" />
        <a :href="downloadUrl" target="_blank" rel="noopener" class="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors">
          Ouvrir / Télécharger PDF
        </a>
      </div>

      <video v-else-if="mediaKind === 'video'" controls class="w-full rounded mt-4 bg-black">
        <source :src="downloadUrl" :type="format" />
      </video>

      <audio v-else-if="mediaKind === 'audio'" controls class="w-full mt-4">
        <source :src="downloadUrl" :type="format" />
      </audio>

      <img v-else-if="mediaKind === 'image'" :src="imagePreview" :alt="resource.title" class="rounded mt-4 shadow-sm" />

      <div v-else-if="mediaKind === 'file'" class="mt-4">
        <a :href="downloadUrl" target="_blank" rel="noopener" class="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors">
          Télécharger le fichier ({{ format || 'inconnu' }})
        </a>
      </div>
    </div>
  </div>
</template>
