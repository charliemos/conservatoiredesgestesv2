<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Mosaïque de photos animée : 8 cases sur une grille 12×2 ; toutes les INTERVAL ms, une case au
// hasard passe en fondu sur une photo qui n'est pas déjà affichée (avec un léger zoom lent).
// Elle remplit son parent (h-full) : c'est l'appelant qui fixe la hauteur et superpose son contenu.
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

// `offset` décale les photos de départ, pour que deux mosaïques d'une même page ne soient pas identiques.
// `logos` : images toujours visibles (ex. logo), affichées en entier, en couleur, sur fond gris clair.
// Chacune occupe en permanence une case et change de case tous les LOGO_MOVE_EVERY changements ;
// au chargement, elles sont dans les premières cases (la première dans la grande case de gauche).
const props = defineProps({
  offset: { type: Number, default: 0 },
  logos: { type: Array, default: () => [] },
});
const LOGO_MOVE_EVERY = 3;
const nLogos = props.logos.length;
const POOL = [
  ...props.logos.map(src => ({ src, logo: true })),
  ...PHOTOS.map(src => ({ src, logo: false })),
];

// Chaque case superpose deux images (a, b), index dans POOL ; `front` indique laquelle est visible.
const start = (i) => (i < nLogos ? i : nLogos + ((i - nLogos + props.offset) % PHOTOS.length));
const tiles = ref(LAYOUT.map((_, i) => ({ a: start(i), b: start(i), front: 0 })));
let last = -1;
let swaps = 0;
let timer = null;

const shownIn = (t) => (t.front ? t.b : t.a);
const randomOf = (list) => list[Math.floor(Math.random() * list.length)];

// Fait apparaître en fondu l'image `img` dans la case `t`.
const show = (t, img) => {
  if (t.front) Object.assign(t, { a: img, front: 0 });
  else Object.assign(t, { b: img, front: 1 });
};

const swap = () => {
  const shown = tiles.value.map(shownIn);
  const freePhotos = POOL.map((_, i) => i).filter(i => !POOL[i].logo && !shown.includes(i));
  const photoTiles = tiles.value.map((_, i) => i).filter(i => !POOL[shown[i]].logo);
  const logoTiles = tiles.value.map((_, i) => i).filter(i => POOL[shown[i]].logo);

  swaps += 1;
  if (logoTiles.length && swaps % LOGO_MOVE_EVERY === 0) {
    // Déplacement d'un logo : il apparaît dans une case photo, une photo libre reprend sa place.
    const from = randomOf(logoTiles);
    const to = randomOf(photoTiles);
    show(tiles.value[to], shown[from]);
    show(tiles.value[from], randomOf(freePhotos));
    last = to;
    return;
  }

  // Changement ordinaire : une case photo (jamais celle d'un logo) passe sur une photo libre.
  const candidates = photoTiles.filter(i => i !== last);
  const k = randomOf(candidates.length ? candidates : photoTiles);
  last = k;
  show(tiles.value[k], randomOf(freePhotos));
};

onMounted(() => {
  POOL.forEach(({ src }) => { new Image().src = src; });
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
  <div class="grid grid-cols-12 grid-rows-2 gap-[3px] h-full bg-[#fffcf3]">
    <div
      v-for="(t, i) in tiles"
      :key="i"
      class="relative overflow-hidden bg-[#1c1c1c]"
      :style="{ gridColumn: LAYOUT[i][0], gridRow: LAYOUT[i][1] }"
    >
      <img
        v-for="(slot, s) in [t.a, t.b]"
        :key="s"
        :src="POOL[slot].src"
        alt=""
        :class="['mosaic-img', { 'mosaic-logo': POOL[slot].logo }]"
        :style="imgStyle(s === 0 ? !t.front : !!t.front)"
      />
    </div>
  </div>
</template>

<style scoped>
.mosaic-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.1);
  transition: opacity 2s ease, transform 10s ease-out;
}
/* Logo : affiché en entier, sans filtre, sur un gris clair qui s'accorde aux photos en noir et blanc. */
.mosaic-logo {
  object-fit: contain;
  padding: 8% 10%;
  background: #e6e6e6;
  filter: none;
}
</style>
