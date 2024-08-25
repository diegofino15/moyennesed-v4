# MoyennesED - v4

## 📖 Présentation
MoyennesED est une application mobile conçue pour permettre aux élèves de consulter leurs **moyennes scolaires** et aux parents celles de leurs enfants, si leur école/collège/lycée utilise le service EcoleDirecte.

## 🚀 Fonctionnalités
- [x] Authentification (élève / parent) (+ double authentification)
- [x] Récupération des notes
  - [x] Calcul des moyennes avec coefficients personnalisables
  - [x] Fonction "devine coefficients" pour améliorer la précision
  - [x] Graphiques de l'évolution des moyennes (générale, par matière, par sous-matière)
- [x] Récupération des devoirs (nouveau)
  - [x] Détection des évaluations
  - [x] Statut fait/non fait syncronisé avec ÉcoleDirecte

## ⚛️ Fonctionnement
Structure : **JavaScript** avec **React Native** et **Expo**  
L'application imite le fonctionnement du site web [ÉcoleDirecte](https://www.ecoledirecte.com) pour se connecter, récupérer une clé de connexion, et ensuite récupérer les notes et les devoirs de l'élève automatiquement.  
Cette application est conçue pour les élèves n'ayant pas accès à leurs moyennes sur l'application officielle, ou pour les parents afin de suivre les résultats de leurs enfants.

## La v4 ?
Encore une fois, l'app a entièrement été réécrite de zéro, avec une structure plus claire et simple à étendre dans le futur, pour ajouter des nouvelles fonctionnalités. L'app est plus rapide que jamais, plus fluide, plus ergonimique, et devrait avoir encore moins de bugs !

## Développement
Si vous souhaitez participer au développement de l'application et ajouter de nouvelles fonctionnalités, régler de bugs... le code complet de l'application est disponible.
Vous avez besoin d'avoir **NodeJS**.

Commencez par cloner le projet :
```bash
git clone https://github.com/diegofino15/moyennesed-v4.git
cd moyennesed-v4
```

Installer les dépendances :
```
npm install -g yarn (si pas déja fait)
yarn install
npx expo prebuild
```

iOS (simulateur) :
```bash
cd ios && pod install && cd ..
npx expo run:ios
```

Android (simulateur) :
```bash
npx expo run:android
```

Vous pouvez aussi lancer l'appli sur votre téléphone avec ces commandes :
```bash
npx expo run:ios --device
npx expo run:android --device
```

## Contact
Si vous avez des questions ou des suggestions, n’hésitez pas à ouvrir une issue sur GitHub ou à me contacter directement via mail à moyennesed@gmail.com.

## License
Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg
