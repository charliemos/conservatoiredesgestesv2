# Conservatoire des gestes et du savoir-faire des métiers d'art

Catalogue des données du projet **Re-Source** (France 2030) : métadonnées et liens de republication [Nakala](https://nakala.fr/) des captations de gestes et ressources pédagogiques des métiers d'art, avec recherche plein texte et filtrage par catégorie, discipline, niveau d'expertise et public.

Site statique (SPA Vue) : les données sont lues depuis `public/data/catalogue.json`, la recherche et les filtres s'exécutent dans le navigateur.

## Développement

**Prérequis :** Node.js, et Python 3 pour l'onglet Suivi

```bash
npm install                                # installer les dépendances
pip install -r server/requirements.txt     # dépendances de l'API de suivi (une fois)
npm run dev      # site (http://localhost:3000) + API de suivi (http://localhost:8000)
npm run dev:site # site seul, sans l'API
npm run build    # build de production dans dist/
npm run preview  # prévisualiser le build de production
```

## Stack

- [Vue 3](https://vuejs.org/) + [vue-router](https://router.vuejs.org/) (navigation Recherche / Métiers / À propos / Suivi)
- [Tailwind CSS 4](https://tailwindcss.com/) (styles, compilé via le plugin Vite)
- [Vite 6](https://vite.dev/) (build et serveur de dev)

## Onglet Suivi (interne)

L'onglet **Suivi** (`#/suivi`) affiche le rapport Power BI du projet et permet de créer, modifier et supprimer
les opérations et productions du fichier Excel de suivi. Il s'appuie sur l'API FastAPI de `server/main.py`,
lancée automatiquement avec le site par `npm run dev` (ou seule avec `npm run api`). Swagger :
http://localhost:8000/docs.

**Fichier Excel.** Il n'est jamais versionné (`*.xlsx` dans `.gitignore`). Son chemin est lu, dans l'ordre :
1. dans la variable d'environnement `EXCEL_FILE_PATH` ;
2. dans `server/config.local.json` (non versionné ; copier `server/config.example.json` et y mettre le chemin) ;
3. à défaut, `server/suivi_projet.xlsx`.

Le fichier ne doit pas être ouvert dans Excel pendant les modifications (Excel le verrouille).

En dev, `vite.config.js` redirige `/api` vers le port 8000. Pour un autre hébergement de l'API, définir
`VITE_SUIVI_API_URL` (et `VITE_SUIVI_DOCS_URL` pour le lien Swagger) au moment du build.


## Mettre à jour le catalogue

Remplacer `public/data/catalogue.json` puis republier le site (`npm run build`).

## Organisation du code (`src/`)

- `main.js`, `App.vue`, `router.js` : point d'entrée, mise en page (navigation, bandeau, pied de page) et routes
- `store.js` : état partagé (catalogue chargé, filtres actifs)
- `services/dataService.js` : normalisation du JSON, URLs Nakala/IIIF, export CSV de gouvernance
- `data/` : membres du conservatoire et métiers étudiés
- `pages/` et `components/` : pages Recherche / Métiers / À propos / Suivi et cartes collection / ressource
- `suivi/` : onglet Suivi (accès à l'API, état, formulaires opérations / productions)
- `../server/` : API de suivi en Python (FastAPI + openpyxl) qui lit et écrit le fichier Excel
