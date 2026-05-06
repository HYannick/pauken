# Deutsch A1 — PWA

Flashcards allemand A1 : Articles, Pays, Verbes irréguliers, Pluriels.

## Stack

- Vue 3 + TypeScript + `<script setup>`
- Tailwind CSS v4
- Vite 6
- vite-plugin-pwa (Workbox)

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Le dossier `dist/` est prêt à déployer. Nécessite **HTTPS** en prod pour que le service worker s'enregistre.

## Déploiement rapide

**Netlify Drop** : glisse le dossier `dist/` sur [app.netlify.com/drop](https://app.netlify.com/drop)

**VPS (Nginx)** :
```nginx
server {
  listen 443 ssl;
  server_name ton-domaine.com;
  root /var/www/deutsch-a1/dist;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
  # Headers PWA
  location ~* \.(js|css|png|svg|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

## Icônes

Génère deux PNG et place-les dans `public/` :
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

## Structure

```
src/
  App.vue                  # Composant principal
  main.ts                  # Entry point
  style.css                # Tailwind v4 + animations
  types.ts                 # TypeScript interfaces
  data.ts                  # Données (mots, sections, constantes)
  composables/
    useGame.ts             # Logique jeu (buildDeck, getOptStyle…)
    useStorage.ts          # Persistence localStorage
```
