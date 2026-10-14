<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { store, loadCatalogue } from '@/store';
import HeroBanner from '@/components/HeroBanner.vue';
import PhotoMosaic from '@/components/PhotoMosaic.vue';

const NAV = [
  { to: '/', label: 'Rechercher', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: '/metiers', label: 'Métiers', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/about', label: 'À propos', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/suivi', label: 'Suivi de projet', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

const route = useRoute();
const mobileMenuOpen = ref(false);

onMounted(loadCatalogue);
watch(() => route.path, () => { mobileMenuOpen.value = false; });

const navClass = (to, inactive) => [
  'flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all',
  (to === '/' ? route.path === '/' : route.path.startsWith(to)) ? 'bg-amber-100 text-amber-900 shadow-sm shadow-amber-200' : inactive,
];
</script>

<template>
  <div v-if="store.loading" class="min-h-screen flex items-center justify-center bg-[#fdfcf6]">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-amber-800 font-bold tracking-widest uppercase text-xs">Chargement du catalogue...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-[#fdfcf6] flex flex-col">
    <!-- Mobile Navbar -->
    <nav class="md:hidden bg-white border-b border-gray-100 px-4 py-6 sticky top-0 z-50">
      <div class="flex justify-between items-center">
        <RouterLink to="/" class="flex items-center gap-3">
          <img src="/Logos/ReSource.png" alt="Logo" class="w-6 h-8" />
          <span class="text-s font-black text-amber-900 leading-none">
            Conservatoire des gestes<br />
            et du savoir faire des métiers d'art
          </span>
        </RouterLink>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          :aria-expanded="mobileMenuOpen"
          class="text-gray-600 focus:outline-none"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'"
            />
          </svg>
        </button>
      </div>

      <div v-if="mobileMenuOpen" class="mt-3 pb-2">
        <div class="flex flex-col gap-2">
          <RouterLink
            v-for="item in NAV"
            :key="item.to"
            :to="item.to"
            :class="navClass(item.to, 'text-gray-500 hover:bg-gray-100 hover:text-gray-700')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            {{ item.label }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <HeroBanner />

    <div class="grow flex max-w-6xl w-full mx-auto p-4 md:p-8 gap-8">
      <!-- Sidebar Desktop -->
      <aside class="hidden md:flex flex-col w-64 shrink-0 space-y-10 sticky top-8 h-fit">
        <nav class="space-y-2">
          <RouterLink
            v-for="item in NAV"
            :key="item.to"
            :to="item.to"
            :class="navClass(item.to, 'text-gray-400 hover:bg-gray-100 hover:text-gray-600')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <main class="grow min-w-0">
        <RouterView />
      </main>
    </div>

    <footer class="relative bg-gray-900 text-gray-500 md:text-gray-300 py-12 px-8 mt-10 overflow-hidden">
      <!-- Sur ordinateur : même mosaïque animée que le bandeau, assombrie pour garder le texte lisible. -->
      <div class="hidden md:block absolute inset-0" aria-hidden="true">
        <PhotoMosaic :offset="4" />
        <div class="absolute inset-0 bg-gray-900/75"></div>
      </div>
      <div class="relative max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex flex-col items-center md:items-start">
          <span class="text-white font-black uppercase tracking-tighter text-lg italic">Re•Source</span>
          <span class="text-xs">Projet France 2030</span>
        </div>
        <a
          href="https://www.economie.gouv.fr/france-2030"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-auto inline-block bg-white/90 hover:bg-white rounded-xl p-2 transition-colors"
        >
          <img
            src="/Logos/France 2030.png"
            alt="France 2030 Logo"
            class="w-16 h-auto"
          />
        </a>
        <p class="text-xs text-center md:text-right max-w-sm">
          Favoriser la transmission des compétences et la préservation du patrimoine immatériel des métiers d'art.
        </p>
      </div>
    </footer>
  </div>
</template>
