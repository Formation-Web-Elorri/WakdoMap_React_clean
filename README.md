# Wacdo — Front-end (Bloc 3 : Développement avancé via Framework)

Interface de recherche et de sélection d'un restaurant McDonald's sur une carte interactive, réalisée dans le cadre de la certification RNCP 37805 - Développeur Web.

Ce dépôt correspond au **Bloc 3, Sujet 2** (Framework front) : une application React qui permet à un utilisateur de rechercher une ville, visualiser les restaurants McDonald's à proximité sur une carte, et en sélectionner un.

---

## 1. Objectif du projet

D'après le cahier des charges (kit d'examen Bloc 3, Sujet 2) :

> Intégrer l'interface de recherche d'un restaurant McDonald's sur une carte : l'utilisateur recherche une ville, la carte se centre dessus et affiche les restaurants sous forme de marqueurs, qu'il peut sélectionner.

Concrètement, l'application doit :
- Permettre la recherche d'une ville avec suggestions
- Centrer une carte interactive sur la ville choisie
- Afficher les restaurants de la ville sous forme de marqueurs cliquables
- Permettre la sélection d'un restaurant depuis un marqueur

---

## 2. Stack technique

| Élément | Choix | Pourquoi |
|---|---|---|
| Framework | React 19 | Imposé par le kit d'examen |
| Meta-framework | TanStack Start (SSR) | Rendu serveur, routing par fichiers, gestion des erreurs serveur intégrée |
| Build tool | Vite 8 | Imposé par le kit d'examen ("React dans un environnement Vite.js") |
| Cartographie | react-leaflet + Leaflet | Bibliothèque imposée par le kit d'examen |
| Données géographiques | API Nominatim (OpenStreetMap) | Imposée par le kit d'examen, pour la recherche de villes et de restaurants |
| Style | CSS Modules | Un fichier `.module.css` par composant — pas de framework CSS ajouté, le besoin de style était trop simple pour le justifier |
| Tests | Vitest + Testing Library | Tests unitaires par composant, imposés par le critère "chaque composant doit être testé individuellement" |
| Déploiement | Node.js (build SSR autonome via Nitro) | `npm run build` produit un serveur Node prêt à déployer, sans dépendance à une plateforme spécifique |

---

## 3. Architecture des composants

L'arborescence suit un découpage par domaine fonctionnel plutôt qu'un dossier `components/` plat :

```
src/
├── App.tsx                    # Composition de l'écran principal, état partagé
├── components/
│   ├── Map/
│   │   ├── Map.tsx            # Carte Leaflet, gestion du recentrage et des icônes
│   │   ├── RestaurantMarker.tsx  # Un marqueur + son popup
│   │   └── ZoomControl.tsx    # Contrôle de zoom personnalisé
│   ├── Search/
│   │   ├── SearchBar.tsx      # Champ de recherche + soumission
│   │   └── SuggestionList.tsx # Liste déroulante de villes (clavier + souris)
│   └── Overlay/
│       ├── Overlay.tsx        # Bandeau d'état (aucun restaurant / restaurant choisi)
│       └── Button.tsx         # Bouton réutilisable
├── services/
│   └── nominatim.ts           # Tous les appels à l'API Nominatim, typés
├── routes/                    # Routing par fichiers (TanStack Router)
├── lib/                       # Utilitaires bas niveau (récupération d'erreurs SSR)
└── types.ts                   # Types partagés (City, Restaurant)
```

Chaque composant a son propre fichier `.module.css` : les classes sont scopées automatiquement (pas de collision de noms), et le style d'un composant reste à côté de son code.

### Flux de données

L'état (ville recherchée, suggestions, restaurants, restaurant sélectionné) vit entièrement dans `App.tsx` et descend en props — il n'y a que 4 composants avec état partagé, un state manager (Redux, Zustand...) aurait été disproportionné.

```
SearchBar (saisie) → App.handleSearch → services/nominatim.searchCities → suggestions
SuggestionList (clic) → App.handleSelectCity → services/nominatim.searchMcDonalds → restaurants
Map (marqueur cliqué) → App.setSelected → Overlay (affiche le restaurant choisi)
```

---

## 4. La carte (Leaflet)

### Pourquoi le composant `Map` est chargé en lazy (`React.lazy`)

Leaflet lit `window`/`document` dès l'import du module — or l'application fait du rendu serveur (SSR). Si `Map.tsx` était importé normalement en haut de `App.tsx`, ce serait exécuté aussi côté serveur (Node.js), où ces objets n'existent pas correctement, ce qui casse le rendu SSR.

```tsx
const Map = lazy(() =>
  import("./components/Map/Map").then((mod) => ({ default: mod.Map })),
);
```

Un import dynamique (`lazy`) n'est exécuté que lorsque React tente réellement d'afficher le composant — jamais côté serveur puisque la carte n'y est jamais rendue. C'est la façon standard d'isoler une librairie "navigateur uniquement" dans une app avec SSR.

### Le bug des icônes de marqueurs cassées

Leaflet, sous n'importe quel bundler (Vite, Webpack...), a un comportement documenté : même quand on lui fournit une URL complète pour ses icônes, sa méthode interne `_getIconUrl` la préfixe quand même avec un chemin auto-détecté, ce qui produit une URL invalide. La correction standard consiste à désactiver cette méthode avant de fournir les icônes :

```tsx
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
```

### Recentrage de la carte

`Recenter` est un composant "invisible" (il ne rend rien, `return null`) dont le seul rôle est d'appeler l'API impérative de Leaflet (`map.setView`) via le hook `useMap` à chaque changement de ville. C'est le pattern recommandé par react-leaflet pour piloter la carte depuis l'extérieur du `<MapContainer>` sans sortir du modèle déclaratif de React.

---

## 5. Communication avec Nominatim

Tous les appels réseau sont centralisés dans `src/services/nominatim.ts` — aucun composant ne fait de `fetch` directement. Deux fonctions exposées :

| Fonction | Rôle |
|---|---|
| `searchCities(query)` | Recherche des villes correspondant à la saisie |
| `searchMcDonalds(city)` | Recherche les restaurants McDonald's dans la bounding box de la ville |

Points respectés par rapport à la politique d'usage de Nominatim (documentée dans le kit d'examen) :
- **Pas d'appel à chaque frappe clavier** : la recherche ne part qu'à la soumission du formulaire, jamais sur `onChange`
- **`viewbox` + `bounded=1`** : la recherche de restaurants est bornée à la zone de la ville sélectionnée, pour ne pas récupérer des résultats hors sujet
- **`Accept-Language: fr`** : résultats dans la langue de l'utilisateur

---

## 6. Gestion des erreurs

Deux niveaux distincts, correspondant à deux types de pannes différents :

**Erreurs applicatives (API Nominatim indisponible, requête échouée)** : capturées dans `App.tsx` avec un `try/catch` autour de chaque appel réseau, affichées à l'utilisateur via un bandeau d'erreur (`role="alert"`), sans faire planter le reste de l'application.

**Erreurs de rendu serveur (SSR)** : TanStack Start peut planter côté serveur pour des raisons indépendantes de l'application (dépendance incompatible, timeout...). `src/lib/error-capture.ts` et `src/lib/error-page.ts` fournissent un filet de sécurité : si le serveur ne parvient pas à produire de réponse HTML normale, une page d'erreur minimale et autonome (HTML + CSS inline, sans dépendance à React) est renvoyée à la place d'un écran blanc ou d'un JSON brut.

---

## 7. Sécurité

Le périmètre de sécurité de ce bloc est plus restreint que le Bloc 2 (pas d'authentification, pas de base de données), mais plusieurs points sont tout de même traités :

- **Aucune clé d'API exposée** : Nominatim est un service public sans authentification, aucun secret à protéger côté client
- **Pas d'injection HTML** : React échappe automatiquement tout contenu textuel inséré dans le DOM (nom de ville, adresse de restaurant) — aucun usage de `dangerouslySetInnerHTML` dans le projet
- **Validation des entrées réseau** : les réponses de Nominatim sont typées (`NominatimResult`) et transformées explicitement avant d'atteindre les composants, plutôt que d'injecter la réponse brute de l'API
- **En-têtes de sécurité côté serveur** : héritées de la configuration SSR de TanStack Start/Nitro

---

## 8. Tests

Chaque composant est testé individuellement avec Vitest + Testing Library, conformément au critère du kit d'examen. 11 tests au total :

| Fichier | Ce qui est testé |
|---|---|
| `nominatim.test.ts` | Construction correcte des URLs d'appel (viewbox, bounding, encodage), mapping de la réponse API |
| `SearchBar.test.tsx` | Soumission du formulaire, absence d'affichage si aucune suggestion |
| `SuggestionList.test.tsx` | Rendu de chaque suggestion, sélection au clic |
| `Overlay.test.tsx` | Affichage conditionnel (état vide / restaurant sélectionné) |
| `Button.test.tsx` | Rendu du label, déclenchement du `onClick` |

```bash
npm test          # lance la suite une fois
npm run test:watch  # mode watch
```

---

## 9. Installation en local

```bash
git clone <url-du-repo>
cd wakdo-frontend
npm install
npm run dev
```

Aucune variable d'environnement n'est nécessaire : Nominatim est un service public, sans clé d'API.

## 10. Déploiement

```bash
npm run build     # build SSR + client, sortie dans .output/
node .output/server/index.mjs   # démarre le serveur Node de production
```

Le build produit un serveur Node.js autonome (via Nitro) — déployable sur n'importe quel hébergeur supportant Node.js, sans configuration spécifique à une plateforme.

---

## 11. Choix de conception justifiés

**CSS Modules plutôt qu'un framework UI.** L'interface ne comporte que quelques composants visuels (carte, champ de recherche, liste, bandeau). Installer une librairie de composants complète (shadcn/ui, Material UI...) aurait ajouté des dizaines de dépendances pour un besoin qui se couvre très bien avec des fichiers `.module.css` ciblés, plus simples à auditer et à faire évoluer.

**Chargement paresseux (`React.lazy`) du composant carte.** Leaflet accède à `window`/`document` dès son import, ce qui est incompatible avec le rendu serveur. Plutôt que de désactiver le SSR pour toute l'application, seul le composant qui en a besoin est exclu du rendu serveur — le reste de l'application (recherche, overlay) profite bien du SSR.

**Centralisation des appels réseau dans `services/nominatim.ts`.** Aucun composant ne connaît l'URL de l'API ni la forme brute de sa réponse : les composants manipulent uniquement les types `City`/`Restaurant` du domaine. Si l'API change de forme demain, ou si Nominatim est remplacé par un autre fournisseur, un seul fichier est à modifier.

**État centralisé dans `App.tsx`, sans state manager externe.** Avec seulement quatre morceaux d'état partagés entre trois composants (ville, suggestions, restaurants, sélection), faire descendre l'état par props reste lisible. Introduire Redux, Zustand ou même le Context API aurait ajouté de la complexité sans bénéfice réel à cette échelle.

**Une erreur réseau ne doit jamais faire planter l'application ni rester invisible.** Chaque appel à Nominatim est protégé par un `try/catch` qui alimente un état d'erreur affiché à l'utilisateur — au lieu de laisser une promesse rejetée silencieusement bloquer l'interface, ce qui était le comportement initial avant correction.

**Un filet de sécurité pour les pannes SSR imprévisibles.** Au-delà des erreurs applicatives prévues, `src/lib/error-capture.ts` et `error-page.ts` garantissent qu'un plantage serveur inattendu renvoie toujours une page HTML lisible plutôt qu'une réponse brute ou un écran blanc — utile en démonstration devant un jury, où une erreur imprévue doit rester présentable.
