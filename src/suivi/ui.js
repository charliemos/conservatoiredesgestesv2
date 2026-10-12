// Classes Tailwind partagées par les formulaires de suivi (même langage visuel que la page Rechercher).
export const ui = {
  label: 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block',
  field: 'w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all',
  card: 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100',
  primary: 'bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-700 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2',
  secondary: 'px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 border border-gray-200 hover:bg-gray-100 transition-all',
  danger: 'ml-auto px-5 py-2.5 rounded-xl font-bold text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
};

export const ROLES = [
  'PILOTE',
  'CO-PILOTE',
  'PARTENAIRE CONTRIBUTEUR',
  'PARTENAIRE PARTICIPANT',
  'PRESTATAIRE',
  'PARTENAIRE EXTERNE',
];

export const TYPOLOGIES = [
  'Réunion',
  'Publication',
  'Code - ressource logicielle',
  'Formation',
  'Rapport',
  'Prototype',
  'Vidéo',
  'Autre',
];
