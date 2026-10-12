<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Bandeau mosaïque : 8 cases sur une grille 12×2 ; toutes les INTERVAL ms, une case au hasard
// passe en fondu sur une photo qui n'est pas déjà affichée (avec un léger zoom lent).
// Photos Unsplash copiées dans public/banner/ (nom = identifiant Unsplash).
const PHOTOS = [
  '1506806732259-39c2d0268443', '1497219055242-93359eeed651', '1632649027900-389e810204e6',
  '1511306162219-1c5a469ab86c', '1568288796918-03e7d93306bd', '1553051021-9f94520a6cad',
  '1590375096341-0c6b35a09d79', '1721508490084-1b1de5b230d4', '1660796334938-cf0b03be7e6d',
  '1628927124199-a8a2a5394392', '1611021061285-16c871740efa', '1488806374796-a4071c52353b',
].map(id => `/banner/${id}.jpg`);

// [colonnes, lignes] de chaque case.
const LAYOUT = [
  ['1 / 4', '1 / 3'], ['4 / 6', '1 / 2'], ['4 / 6', '2 / 3'], ['6 / 9', '1 / 3'],
  ['9 / 11', '1 / 2'], ['11 / 13', '1 / 2'], ['9 / 11', '2 / 3'], ['11 / 13', '2 / 3'],
];
const INTERVAL = 3500;
const TITLE_LINES = ['Conservatoire des gestes', "et du savoir faire des métiers d'art"];

// Chaque case superpose deux images (a, b) ; `front` indique laquelle est visible.
const tiles = ref(LAYOUT.map((_, i) => ({ a: i, b: i, front: 0 })));
let last = -1;
let timer = null;

const swap = () => {
  const shown = tiles.value.map(t => (t.front ? t.b : t.a));
  const free = PHOTOS.map((_, i) => i).filter(i => !shown.includes(i));
  let k;
  do { k = Math.floor(Math.random() * tiles.value.length); } while (k === last);
  last = k;
  const img = free[Math.floor(Math.random() * free.length)];
  const t = tiles.value[k];
  if (t.front) Object.assign(t, { a: img, front: 0 });
  else Object.assign(t, { b: img, front: 1 });
};

onMounted(() => {
  PHOTOS.forEach(src => { new Image().src = src; });
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  timer = setInterval(swap, INTERVAL);
});
onBeforeUnmount(() => clearInterval(timer));

const imgStyle = (visible) => ({
  opacity: visible ? 1 : 0,
  transform: `scale(${visible ? 1 : 1.06})`,
});
</script>

<template>
  <section class="hidden md:block relative bg-[#fffcf3] pb-[3px]">
    <div class="grid grid-cols-12 grid-rows-2 gap-[3px] h-[230px]">
      <div
        v-for="(t, i) in tiles"
        :key="i"
        class="relative overflow-hidden bg-[#1c1c1c]"
        :style="{ gridColumn: LAYOUT[i][0], gridRow: LAYOUT[i][1] }"
      >
        <img :src="PHOTOS[t.a]" alt="" class="banner-img" :style="imgStyle(!t.front)" />
        <img :src="PHOTOS[t.b]" alt="" class="banner-img" :style="imgStyle(!!t.front)" />
      </div>
    </div>

    <!-- Titre superposé ; `isolate` garde l'effet de survol des lettres au-dessus du fond du cartouche. -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="pointer-events-auto isolate bg-amber-100/90 text-[#8f6666] px-10 py-5 rounded-2xl shadow-lg shadow-black/20">
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

<style scoped>
.banner-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.1);
  transition: opacity 2s ease, transform 10s ease-out;
}
</style>
