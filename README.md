# MoyennesED - v4

## 📖 Présentation
MoyennesED est une application mobile conçue pour permettre aux élèves de consulter leurs **moyennes scolaires** et aux parents celles de leurs enfants, si leur école/collège/lycée utilise le service ÉcoleDirecte.  
Pour l'utiliser, il faut avoir au préalable un compte ÉcoleDirecte (compte élève ou parent) fourni par votre établissement.  
L'app est actuellement disponible sur **iOS** et **Android**.  

<a href="https://apps.apple.com/fr/app/moyennesed-sans-pubs/id6739073850">
  <img src="assets/images/app-store-badge.svg" alt="Télécharger dans l'App Store" height="50">
</a>
<a href="https://play.google.com/store/apps/details?id=me.diegof.moyennesed_no_ads">
  <img src="assets/images/google-play-badge.svg" alt="Disponible sur Google Play" height="50">
</a>

## 🚀 Fonctionnalités
- [x] Authentification (élève / parent) (+ double authentification)
- [x] Récupération des notes
  - [x] Calcul des moyennes avec coefficients personnalisables
  - [x] Fonction "devine coefficients" pour améliorer la précision
  - [x] Graphiques de l'évolution des moyennes (générale, par matière, par sous-matière)
- [x] Récupération des devoirs
  - [x] Détection des évaluations
  - [x] Statut fait/non fait synchronisé avec ÉcoleDirecte
  - [x] Fichiers attachés téléchargeables

## ⚛️ Fonctionnement
Structure : **JavaScript** avec **React Native** et **Expo**  
L'application imite le fonctionnement du site web [ÉcoleDirecte](https://www.ecoledirecte.com) pour se connecter, récupérer une clé de connexion, et ensuite récupérer les notes et les devoirs de l'élève automatiquement. Aucune information personnelle ne passe par d'autres serveurs, seuls les signalements de bugs sont stockés sur [Firebase](https://firebase.google.com).    

## Développement
Si vous souhaitez participer au développement de l'application et ajouter de nouvelles fonctionnalités, régler des bugs... le code complet de l'application est disponible.  
Je vous recommande d'utiliser **Bun**, qui permet un développement rapide avec **Expo**.

Commencez par cloner le projet :
```bash
git clone https://github.com/diegofino15/moyennesed-v4.git
cd moyennesed-v4
```

Il manquera alors les fichiers **google-services.json**, **GoogleService-Info.plist** et **.env**, dont vous pouvez récupérer des exemples génériques en ligne (ou en les retirant de **app.json**).

Installer les dépendances et prebuild :
```
bun install
bun expo prebuild
```

Le développement sur simulateur ou sur téléphone se fait alors simplement :
```bash
bun expo run:ios #--device (pour choisir un téléphone physique)
bun expo run:android #--device
```

## Contact
Si vous avez des questions ou des suggestions, n’hésitez pas à ouvrir une issue sur GitHub ou à me contacter directement via mail à **diego@dfino.dev**.

## License
Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg
