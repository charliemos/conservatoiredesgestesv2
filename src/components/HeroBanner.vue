<script setup>
import PhotoMosaic from './PhotoMosaic.vue';

// Bandeau du haut : mosaïque de photos animée avec le titre superposé.
const TITLE_LINES = ["Conservatoire des gestes et du savoir faire des métiers d'art"];
</script>

<template>
  <section class="hidden md:block relative h-[233px] pb-[3px] bg-[#fffcf3]">
    <PhotoMosaic />

    <!-- Voile sombre au centre, pour détacher le titre des photos. -->
    <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_55%_at_center,rgba(0,0,0,0.6),transparent)]"></div>

    <!-- Titre superposé ; `isolate` garde l'effet de survol des lettres au-dessus du fond du cartouche. -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="pointer-events-auto isolate px-10 py-5 rounded-2xl">
        <div
          v-for="(line, l) in TITLE_LINES"
          :key="l"
          :class="[l === 0 ? 'first-container' : 'second-container', 'share']"
        >
          <h1 :aria-label="l === 0 ? TITLE_LINES.join(' ') : ''">
            <span v-for="(ch, i) in line" :key="i">{{ ch === ' ' ? ' ' : ch }}</span>
          </h1>
        </div>
      </div>
    </div>
  </section>
</template>
