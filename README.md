# Site personnel de Mehdi TAZI

Site statique EN / FR généré avec Eleventy. L’anglais conserve les URL existantes ;
les pages françaises sont dans `fr/`. Les modèles sont partagés : une modification
de structure s’applique aux deux langues.

## Développement

Node.js 22 ou plus récent est nécessaire uniquement pour la génération.

```sh
npm ci
npm run dev
```

Le serveur Eleventy affiche son URL locale. Il reconstruit les pages pendant les
modifications. Pour préparer les fichiers publiables et vérifier le site :

```sh
npm run validate
```

## Où modifier le contenu

- `src/index.njk`, `src/ventures.njk`, `src/perspectives.njk` : les trois modèles.
- `src/_includes/` : navigation, pied de page, téléchargements de CV et mise en page.
- `src/_data/copy/en.json` et `fr.json` : textes et métadonnées des pages. Les clés
  doivent rester identiques dans les deux langues. Le balisage riche est réservé
  aux contenus rédigés dans ces fichiers, jamais à une saisie visiteur.
- `src/_data/shared.json` : libellés communs.
- `src/_data/travelUi.json` : messages de la carte. Les noms des pays français sont
  générés à partir de leurs codes ISO. Les codes et continents de filtrage restent
  des identifiants communs aux deux langues.
- `data/travel-albums.json` : liens des albums, photos et données géographiques.
- `resources/` : les deux PDF. Le téléchargement principal et son badge suivent
  la langue du site : anglais sur EN, français sur FR. L’autre version reste
  disponible dans le menu du bouton.

## Génération et publication

`npm run build` génère `_site/`, puis synchronise les six HTML, le sitemap et les
deux petits dictionnaires de carte vers leurs emplacements statiques habituels.
Les HTML à la racine et dans `fr/` sont **générés : ne pas les modifier à la main**.
Inclure les fichiers générés avec leurs sources dans chaque commit.

Cette organisation préserve une publication GitHub Pages depuis la branche
`main`, sans serveur Node en production. `_site/` est également un dossier complet
publiable si une publication par artefact est configurée ultérieurement.
Le workflow de validation reconstruit le site et détecte les sorties oubliées ;
il ne modifie pas la configuration GitHub Pages et ne pousse aucun commit.

Le navigateur reçoit uniquement la page demandée. Les CSS, images, logos, scripts
et données de voyage sont partagés. Seule Perspectives charge la carte et son
dictionnaire de langue ; aucun catalogue complet EN / FR n’est envoyé au visiteur.
Le sélecteur préserve la page, l’ancre et les paramètres, dont le pays sélectionné.

Les validations couvrent les traductions, liens et ancres, métadonnées `lang`,
`canonical` et `hreflang`, CV par défaut et cohérence des données de voyage.
Les vérifications visuelles et interactives restent à effectuer en navigateur
lorsqu’un composant ou une mise en page change.
