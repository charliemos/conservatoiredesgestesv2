# Conservatoire des gestes et du savoir-faire des métiers d'art

Catalogue des données du projet **Re-Source** (France 2030) : métadonnées et liens de republication [Nakala](https://nakala.fr/) des captations de gestes et ressources pédagogiques des métiers d'art, avec recherche plein texte et filtrage par catégorie, discipline, niveau d'expertise et public.

Site statique (SPA React) : les données sont lues depuis `public/data/catalogue.json`, la recherche et les filtres s'exécutent dans le navigateur.

## Développement

**Prérequis :** Node.js

```bash
npm install      # installer les dépendances
npm run dev      # serveur de développement (http://localhost:3000)
npm run build    # build de production dans dist/
npm run preview  # prévisualiser le build de production
```

## Stack

- [React 19](https://react.dev/) + [react-router](https://reactrouter.com/) (navigation Recherche / À propos)
- [Tailwind CSS 4](https://tailwindcss.com/) (styles, compilé via le plugin Vite)
- [Vite 6](https://vite.dev/) (build et serveur de dev)

## Mettre à jour le catalogue

Remplacer `public/data/catalogue.json` puis republier le site (`npm run build`).
