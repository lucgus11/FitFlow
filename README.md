# FitFlow — PWA d'entraînement personnalisée

Application Next.js (App Router) + TypeScript + Tailwind CSS, fonctionnant hors-ligne (PWA),
permettant de charger des fichiers `.fit` (JSON) et de suivre une séance avec un chronomètre
ultra-précis basé sur un Web Worker.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Build de production

```bash
npm run build
npm start
```

## Déploiement sur Vercel

1. Pousser ce dossier sur un dépôt GitHub.
2. Importer le dépôt sur https://vercel.com/new — aucune configuration supplémentaire requise
   (préréglages Next.js détectés automatiquement).

## Format `.fit`

Voir `types/fit.ts` pour la spécification TypeScript complète. Deux exemples sont fournis dans
`public/samples/` :
- `full-body-hiit.fit.json`
- `jambes-cardio.fit.json`

## Fonctionnement hors-ligne

- `public/sw.js` : Service Worker (stratégie stale-while-revalidate) qui met en cache l'app
  shell, les icônes et les exemples `.fit`.
- `components/RegisterSW.tsx` : enregistre le Service Worker au chargement.
- `public/manifest.json` : rend l'application installable sur smartphone (Android/iOS).

## Chronomètre

- `workers/timer.worker.ts` : moteur de timer dans un Web Worker, basé sur `Date.now()` pour
  rester précis même si l'onglet est en arrière-plan ou l'écran verrouillé.
- `lib/buildTimeline.ts` : transforme un fichier `.fit` en une timeline d'étapes (effort/repos).
- `lib/sounds.ts` : bips sonores via Web Audio API (3-2-1 avant chaque transition).
- L'écran utilise la **Wake Lock API** pour empêcher la mise en veille pendant l'effort.

## Gem Gemini

Le prompt système pour générer des fichiers `.fit` via un Gem Gemini personnalisé est fourni
séparément (voir conversation / `gemini-gem-prompt.md`).
