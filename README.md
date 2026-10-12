# Conservatoire des gestes et du savoir-faire des métiers d'art

Catalogue des données du projet **Re-Source** (France 2030) : métadonnées et liens de republication [Nakala](https://nakala.fr/) des captations de gestes et ressources pédagogiques des métiers d'art, avec recherche plein texte et filtrage par catégorie, discipline, niveau d'expertise et public.

Site statique (SPA Vue) : les données sont lues depuis `public/data/catalogue.json`, la recherche et les filtres s'exécutent dans le navigateur.

## Développement

**Prérequis :** Node.js

```bash
npm install      # installer les dépendances
npm run dev      # serveur de développement (http://localhost:3000)
npm run build    # build de production dans dist/
npm run preview  # prévisualiser le build de production
```

## Stack

- [Vue 3](https://vuejs.org/) + [vue-router](https://router.vuejs.org/) (navigation Recherche / Métiers / À propos / Suivi)
- [Tailwind CSS 4](https://tailwindcss.com/) (styles, compilé via le plugin Vite)
- [Vite 6](https://vite.dev/) (build et serveur de dev)

## Onglet Suivi (interne)

L'onglet **Suivi** (`#/suivi`) affiche le rapport Power BI du projet et permet de créer, modifier et supprimer
les opérations et productions du fichier Excel de suivi. Il s'appuie sur l'API FastAPI du projet voisin
`api-suivi`, qui doit tourner en parallèle :

```bash
cd ../api-suivi
python main_local.py   # API sur http://localhost:8000, routes sous /api
```

En dev, `vite.config.js` redirige `/api` vers ce port. Pour un autre hébergement de l'API, définir
`VITE_SUIVI_API_URL` (et `VITE_SUIVI_DOCS_URL` pour le lien Swagger) au moment du build.

⚠️ L'API n'a **aucune authentification** : ne pas exposer l'onglet Suivi sur le site public tant
qu'une authentification n'est pas en place.

## Mettre à jour le catalogue

Remplacer `public/data/catalogue.json` puis republier le site (`npm run build`).

## Organisation du code (`src/`)

- `main.js`, `App.vue`, `router.js` : point d'entrée, mise en page (navigation, bandeau, pied de page) et routes
- `store.js` : état partagé (catalogue chargé, filtres actifs)
- `services/dataService.js` : normalisation du JSON, URLs Nakala/IIIF, export CSV de gouvernance
- `data/` : membres du conservatoire et métiers étudiés
- `pages/` et `components/` : pages Recherche / Métiers / À propos / Suivi et cartes collection / ressource
- `suivi/` : onglet Suivi (accès à l'API, état, formulaires opérations / productions)
