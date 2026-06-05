# HireNest Frontend

Interface web du projet **HireNest**, une plateforme orientee recrutement, analyse de CV, recommandations de carriere et matching candidat-offre.  
Ce frontend est developpe avec **Next.js**, **React**, **TypeScript** et une collection de composants UI bases sur **Radix UI**.

## Sommaire

- [Presentation du projet](#presentation-du-projet)
- [Fonctionnalites principales](#fonctionnalites-principales)
- [Stack technique](#stack-technique)
- [Architecture globale](#architecture-globale)
- [Structure du projet](#structure-du-projet)
- [Routes de l'application](#routes-de-lapplication)
- [Services et communication API](#services-et-communication-api)
- [Gestion de l'authentification](#gestion-de-lauthentification)
- [Configuration environnement](#configuration-environnement)
- [Installation et lancement](#installation-et-lancement)
- [Scripts disponibles](#scripts-disponibles)
- [Workflow Git et GitHub](#workflow-git-et-github)
- [Bonnes pratiques](#bonnes-pratiques)

## Presentation du projet

HireNest Frontend est l'application cliente d'une plateforme de recrutement intelligente.  
Elle fournit une interface utilisateur pour :

- consulter un tableau de bord candidat ;
- s'inscrire et se connecter ;
- analyser un CV ;
- consulter des offres d'emploi ;
- voir des recommandations personnalisees ;
- acceder a des pages d'entretien, de QCM, d'insights et de parametres.

Le frontend communique avec une API backend via une URL configurable dans les variables d'environnement.

## Fonctionnalites principales

- **Landing page** : presentation de la plateforme, sections marketing, appel a l'action et navigation publique.
- **Authentification** : pages de connexion et d'inscription avec stockage local du token.
- **Dashboard** : espace principal de l'utilisateur avec statistiques, actions rapides et activite recente.
- **Analyse de CV** : upload de fichier et affichage de recommandations liees au CV.
- **Matching emploi** : affichage d'offres avec score de compatibilite, competences presentes et competences manquantes.
- **Recommandations de carriere** : suggestions personnalisees selon le profil candidat.
- **Pages metier** : jobs, resume, interview, qcm, insights et settings.
- **Composants UI reutilisables** : boutons, cards, dialogs, forms, tabs, tables, sidebars, toasts, etc.

## Stack technique

| Categorie | Technologie |
| --- | --- |
| Framework | Next.js 15 |
| UI | React 18 |
| Langage | TypeScript |
| Styling | Tailwind CSS 4 |
| Composants headless | Radix UI |
| Icons | Lucide React |
| Formulaires | React Hook Form, Zod |
| Graphiques | Recharts |
| Notifications | Sonner, Toast UI |
| Build tooling | Next.js, PostCSS |
| Gestion package | npm, avec lockfiles npm/yarn/pnpm presents |

## Architecture globale

L'application suit une organisation modulaire :

```text
Utilisateur
   |
   v
Pages Next.js / App Router
   |
   v
Composants UI et composants metier
   |
   v
Hooks React
   |
   v
Services frontend
   |
   v
API Backend
```

Les responsabilites sont separees de la maniere suivante :

- `app/` expose les routes Next.js.
- `pages/` contient les pages React metier reutilisees par les routes.
- `components/` contient les composants visuels.
- `hooks/` contient la logique React partagee.
- `services/` contient les appels API et les donnees metier.
- `lib/` contient les utilitaires transverses.
- `public/` contient les images et assets statiques.
- `styles/` contient les styles globaux et le theme.

## Structure du projet

```text
Frontend/
├── app/
│   ├── dashboard/
│   ├── insights/
│   ├── interview/
│   ├── jobs/
│   ├── login/
│   ├── qcm/
│   ├── recommendations/
│   ├── register/
│   ├── resume/
│   ├── settings/
│   ├── signin/
│   ├── signup/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── landing/
│   ├── layout/
│   ├── resume/
│   └── ui/
├── hooks/
├── lib/
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── interview/
│   ├── jobs/
│   ├── qcm/
│   ├── recommendations/
│   ├── resume/
│   ├── settings/
│   └── LandingPage.tsx
├── public/
│   └── images/
├── services/
├── styles/
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
└── components.json
```

## Description des dossiers

### `app/`

Contient les routes Next.js basees sur l'App Router.  
Chaque dossier correspond a une route accessible dans le navigateur.

Exemples :

- `app/page.tsx` : page d'accueil.
- `app/dashboard/page.tsx` : tableau de bord.
- `app/jobs/page.tsx` : offres d'emploi.
- `app/resume/page.tsx` : analyse de CV.
- `app/signin/page.tsx` : connexion.
- `app/signup/page.tsx` : inscription.

Certains fichiers `.route.tsx` servent de couche de separation pour exporter la logique de page ou de layout.

### `pages/`

Contient les vraies pages React fonctionnelles qui sont importees par les routes de `app/`.  
Cette separation permet de garder les routes simples et de centraliser le rendu metier.

### `components/`

Contient tous les composants reutilisables :

- `components/auth/` : composants lies aux formulaires d'authentification.
- `components/dashboard/` : cartes statistiques, actions rapides, activite recente.
- `components/landing/` : hero section, navbar, footer, features, call to action.
- `components/layout/` : sidebar, topbar, navbar, footer, layouts.
- `components/resume/` : upload et composants lies au CV.
- `components/ui/` : bibliotheque de composants UI generiques.

### `hooks/`

Contient les hooks personnalises :

- `useAuth.ts` : logique d'authentification cote client.
- `useResumeUpload.ts` : gestion de l'upload CV.
- `useMatchingResults.ts` : gestion des resultats de matching.
- `useMobile.ts` et `use-mobile.ts` : detection mobile.
- `use-toast.ts` : gestion des notifications.

### `services/`

Contient la logique d'acces aux donnees :

- `api.ts` : client HTTP centralise.
- `auth.service.ts` : connexion, inscription, token.
- `resume.service.ts` : analyse de CV.
- `matching.service.ts` : offres et scores de matching.
- `recommendation.service.ts` : recommandations de carriere.

### `lib/`

Contient les fonctions partagees :

- `api.ts` : re-export des services API.
- `auth-store.ts` : lecture/ecriture du token et informations utilisateur.
- `utils.ts` : fonctions utilitaires, notamment pour les classes CSS.

### `public/`

Contient les assets statiques :

- logos ;
- images de landing page ;
- images liees aux jobs, CV et illustrations ;
- placeholders.

### `styles/`

Contient les styles globaux :

- `globals.css` : styles globaux de l'application.
- `theme.css` : variables et theme visuel.

## Routes de l'application

| Route | Description |
| --- | --- |
| `/` | Page d'accueil publique |
| `/signin` | Connexion utilisateur |
| `/signup` | Inscription utilisateur |
| `/login` | Route alternative de connexion |
| `/register` | Route alternative d'inscription |
| `/dashboard` | Tableau de bord utilisateur |
| `/jobs` | Liste des offres et matching emploi |
| `/resume` | Upload et analyse de CV |
| `/recommendations` | Recommandations de carriere |
| `/interview` | Preparation ou espace entretien |
| `/qcm` | Questions ou evaluations QCM |
| `/insights` | Insights et analyses |
| `/settings` | Parametres utilisateur |

## Services et communication API

Le fichier `services/api.ts` centralise les appels HTTP.

Il gere :

- l'URL de base de l'API ;
- l'ajout automatique du header `Authorization` si un token existe ;
- le header `Content-Type: application/json` ;
- la lecture des erreurs renvoyees par le backend ;
- les requetes generiques via `apiRequest`;
- les requetes POST via `apiPost`.

URL par defaut :

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Si aucune variable d'environnement n'est definie, le frontend utilise :

```text
http://127.0.0.1:8000
```

## Gestion de l'authentification

L'authentification est geree par :

- `services/auth.service.ts`
- `hooks/useAuth.ts`
- `lib/auth-store.ts`

Le projet contient actuellement deux approches :

- une authentification mockee cote frontend pour faciliter le developpement ;
- des fonctions pour connecter le frontend au backend via `/login` et `/signup`.

Le token d'acces est stocke cote navigateur et peut etre ajoute automatiquement aux requetes API.

## Configuration environnement

Creer un fichier `.env.local` a la racine du projet :

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Adapter cette valeur selon l'environnement :

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Important :

- ne pas publier les secrets dans GitHub ;
- ne pas stocker de cles privees dans `.env.local` ;
- seules les variables prefixees par `NEXT_PUBLIC_` sont exposees au navigateur.

## Installation et lancement

### Prerequis

- Node.js 18 ou plus recent.
- npm installe avec Node.js.
- Backend lance si les pages utilisent l'API.

### Cloner le projet

```bash
git clone <URL_DU_REPOSITORY_FRONTEND>
cd Frontend
```

### Installer les dependances

```bash
npm install
```

### Lancer en developpement

```bash
npm run dev
```

Application disponible par defaut sur :

```text
http://localhost:3000
```

### Build de production

```bash
npm run build
```

### Lancer la version production

```bash
npm run start
```

## Scripts disponibles

| Script | Commande | Description |
| --- | --- | --- |
| `dev` | `next dev` | Lance le serveur de developpement |
| `build` | `next build` | Genere le build de production |
| `start` | `next start` | Lance l'application apres build |
| `lint` | `next lint` | Lance la verification lint |

## Workflow Git et GitHub

### Verifier l'etat du projet

```bash
git status
```

### Ajouter les changements

```bash
git add .
```

### Creer un commit

```bash
git commit -m "Add frontend documentation"
```

### Pousser vers GitHub

```bash
git push origin main
```

### Premiere publication si le remote n'existe pas

```bash
git remote add origin <URL_DU_REPOSITORY_FRONTEND>
git branch -M main
git push -u origin main
```

## Bonnes pratiques

- Garder `.env.local` hors du repository.
- Ne pas versionner `node_modules/`.
- Ne pas versionner `.next/`.
- Mettre a jour le README apres chaque changement important d'architecture.
- Centraliser les appels API dans `services/`.
- Reutiliser les composants existants de `components/ui/`.
- Garder les pages metier dans `pages/` et les routes dans `app/`.
- Verifier le build avant une mise en production.

## Notes de securite

- Les donnees sensibles ne doivent jamais etre placees dans le frontend.
- Les tokens JWT stockes cote client doivent etre manipules avec prudence.
- Les routes backend doivent verifier les roles et permissions cote serveur.
- Le frontend ne remplace jamais les controles de securite backend.

## Etat actuel du projet

Le projet contient deja :

- une structure Next.js fonctionnelle ;
- des composants UI reutilisables ;
- une landing page complete ;
- des pages pour dashboard, jobs, CV, recommandations, entretien, QCM, insights et settings ;
- un client API centralise ;
- une configuration d'environnement pour connecter le backend.

