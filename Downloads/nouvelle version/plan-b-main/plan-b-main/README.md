# PLANb - Plateforme de Gestion Immobilière

<div align="center">
  <img src="./PlanB_Logo/logofinal.png" alt="PLANb Logo" width="200" height="200">
  <p><strong>Une plateforme web et mobile complète pour la gestion et la location de biens immobiliers</strong></p>
</div>

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![PHP](https://img.shields.io/badge/PHP-8.2-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![Symfony](https://img.shields.io/badge/Symfony-7-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-316192)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table des matières

- [À propos](#à-propos)
- [Caractéristiques](#caractéristiques)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Démarrage rapide](#démarrage-rapide)
- [Structure du projet](#structure-du-projet)
- [Flux de travail Git](#flux-de-travail-git)
- [Documentation technique](#documentation-technique)
- [Contribution](#contribution)
- [Support](#support)

---

## À propos

**PLANb** est une plateforme complète de gestion immobilière conçue pour simplifier la publication d'annonces, la gestion des propriétés et les transactions entre propriétaires et locataires. La plateforme offre une expérience utilisateur fluide sur web, mobile et desktop avec des services en temps réel.

### Objectifs du projet
- ✨ Interface utilisateur moderne et intuitive
- 🔒 Système d'authentification sécurisé avec JWT
- 📱 Application mobile native avec React Native
- 💬 Communication en temps réel via WebSocket
- 💳 Intégration de paiements multiples
- 📊 Gestion avancée des annonces et contrats
- 🔄 Workflow de modération et validation

---

## Caractéristiques

### 👤 Utilisateurs
- **Inscription et authentification** sécurisée
- **Gestion de profil** avec documents et pièces d'identité
- **Historique de transactions** et messages
- **Notifications en temps réel**
- **Système de notation** et avis

### 🏠 Annonces immobilières
- **Publication d'annonces** avec photos et vidéos
- **Visite virtuelle 360°** via tour virtuel
- **Filtrage avancé** par localisation, prix, commodités
- **Gestion des favoris** et comparaison
- **Modération** et vérification des annonces

### 📋 Gestion des contrats
- **Contrats de location** avec workflow de signature
- **Contrats d'escrow** pour les transactions sécurisées
- **Historique des modifications** et versioning
- **E-signatures** intégrées
- **Notifications d'étapes** automatiques

### 💳 Paiements
- **Intégration Stripe**
- **Intégration Orange Money**
- **Paiements sécurisés** et chiffrés
- **Historique des transactions**
- **Remboursements** automatiques

### 🔔 Communication
- **Chat en temps réel** avec WebSocket
- **Notifications push** (web et mobile)
- **Emails transactionnels** automatiques
- **Système de messages** persistants

---

## Architecture

### Infrastructure globale

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Web (Vite React)                │
│              (planb-frontend)                                │
│         localhost:5173 (développement)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ API REST + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                 Node.js Socket.IO Server                     │
│            (planb-socketio-server)                          │
│               localhost:3001                                 │
└──────────────────────────────────────────────────────────────┘
                         │ API REST
┌─────────────────────────────────────────────────────────────┐
│              Backend Symfony (PHP 8.2+)                      │
│             (planb-backend)                                 │
│         localhost:8000 (développement)                      │
│         API REST + Traitement métier                        │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
           ┌─────────────▼─────────────┐
           │   PostgreSQL Database      │
           │   (Port 5432)              │
           └────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           Application Mobile (React Native)                  │
│              (planb-mobile)                                 │
│         Accès via Expo ou APK compilée                      │
└──────────────────────────────────────────────────────────────┘
```

### Stack technologique

| Composant | Technologie |
|-----------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Leaflet.js |
| **Backend** | Symfony 7, PHP 8.2+, Doctrine ORM |
| **Base de données** | PostgreSQL 14+ |
| **Real-time** | Node.js, Socket.IO |
| **Mobile** | React Native, Expo |
| **Authentification** | JWT (JsonWebToken) |
| **Paiements** | Stripe API, Orange Money |
| **Emails** | SwiftMailer, Templates |
| **Tests** | PHPUnit, Vitest, Playwright |
| **Déploiement** | Docker, Render.com, Netlify |

---

## Prérequis

### Requis globaux
- **Git** 2.30+
- **Node.js** 18+ et **npm** 8+
- **PHP** 8.2+ avec extensions: pgsql, curl, mbstring, json
- **Composer** 2.0+
- **PostgreSQL** 14+
- **Docker** et **Docker Compose** (optionnel, pour environnement conteneurisé)

### Vérification des prérequis

```bash
# Node.js
node --version  # v18.x.x ou supérieur
npm --version   # 8.x.x ou supérieur

# PHP
php --version   # 8.2.x ou supérieur
composer --version  # 2.x.x

# PostgreSQL
psql --version  # 14 ou supérieur

# Git
git --version   # 2.30 ou supérieur
```

---

## Installation

### 1️⃣ Cloner le repository

```bash
git clone https://github.com/elohimdjedje/PLANb.git
cd PLANb
```

### 2️⃣ Installation du Backend

```bash
cd planb-backend

# Installer les dépendances PHP
composer install

# Créer le fichier .env
cp .env.example .env

# Configurer la base de données dans .env
# DATABASE_URL=postgresql://user:password@localhost:5432/planb_db

# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Charger les données de test (optionnel)
php bin/console doctrine:fixtures:load
```

### 3️⃣ Installation du Frontend

```bash
cd ../planb-frontend

# Installer les dépendances
npm install

# Créer le fichier de configuration
cp .env.example .env.local

# Configuration :
# VITE_API_URL=http://localhost:8000/api
# VITE_SOCKET_URL=http://localhost:3001
```

### 4️⃣ Installation du serveur Socket.IO

```bash
cd ../planb-socketio-server

# Installer les dépendances
npm install

# Créer la configuration
cp .env.example .env

# Configuration :
# PORT=3001
# API_URL=http://localhost:8000/api
```

### 5️⃣ Installation de l'application Mobile

```bash
cd ../planb-mobile

# Installer les dépendances
npm install

# Créer la configuration
cp .env.example .env

# Configuration :
# API_URL=http://YOUR_IP:8000/api
# SOCKET_URL=http://YOUR_IP:3001
```

---

## Démarrage rapide

### Démarrage complet (tous les services)

#### Avec Docker (Recommandé)

```bash
cd planb-backend
docker-compose up -d
```

#### Manuellement (Windows PowerShell)

**Terminal 1 - Backend Symfony**
```powershell
cd planb-backend
php -S localhost:8000 -t public
```

**Terminal 2 - Socket.IO Server**
```powershell
cd planb-socketio-server
npm start
```

**Terminal 3 - Frontend React**
```powershell
cd planb-frontend
npm run dev
```

**Terminal 4 - Mobile (optionnel)**
```powershell
cd planb-mobile
npm start  # ou: expo start
```

### Accès aux applications

| Application | URL | Port |
|------------|-----|------|
| **Frontend** | http://localhost:5173 | 5173 |
| **Backend API** | http://localhost:8000/api | 8000 |
| **Socket.IO** | http://localhost:3001 | 3001 |
| **Mobile** | Expo CLI / APK | - |
| **PhpMyAdmin** | http://localhost:8080 | 8080 |

### Compte de test

```
Email: admin@planb.local
Mot de passe: admin123
Rôle: administrateur
```

---

## Structure du projet

```
PLANb/
├── planb-backend/              # API Symfony
│   ├── src/
│   │   ├── Entity/            # Modèles de données
│   │   ├── Controller/        # Contrôleurs API
│   │   ├── Service/           # Logique métier
│   │   ├── Repository/        # Accès aux données
│   │   └── Security/          # JWT & authentification
│   ├── migrations/            # Migrations BDD
│   ├── tests/                 # Tests PHPUnit
│   ├── config/                # Configuration Symfony
│   └── composer.json
│
├── planb-frontend/             # Interface Web React
│   ├── src/
│   │   ├── pages/             # Pages React
│   │   ├── components/        # Composants réutilisables
│   │   ├── services/          # Services API
│   │   ├── hooks/             # Hooks personnalisés
│   │   ├── context/           # Context API
│   │   └── styles/            # Styles Tailwind
│   ├── tests/                 # Tests Vitest
│   ├── e2e/                   # Tests E2E Playwright
│   └── vite.config.js
│
├── planb-socketio-server/      # Serveur temps réel
│   ├── server.js              # Point d'entrée
│   ├── services/              # Services Socket.IO
│   ├── middleware/            # Middlewares
│   └── package.json
│
├── planb-mobile/               # App Mobile React Native
│   ├── src/
│   │   ├── screens/           # Écrans
│   │   ├── components/        # Composants
│   │   ├── services/          # Services API
│   │   ├── navigation/        # Navigation
│   │   └── context/           # Context
│   ├── assets/                # Images et ressources
│   └── app.json               # Configuration Expo
│
├── BD/                         # Fichiers base de données
├── PlanB_Logo/                # Assets logo
├── templates/                  # Templates emails
├── database_full_export.sql    # Sauvegarde BDD
└── README.md                   # Ce fichier
```

---

## Flux de travail Git

### Branches principales

| Branche | Objectif | Protection |
|---------|----------|-----------|
| **main** | Production - Code stable et testé | ✅ PR requise |
| **develop** | Intégration - Branche de développement | ⚠️ Recommandée |
| **feature/** | Nouvelles fonctionnalités | ❌ Locale |
| **bugfix/** | Corrections de bugs | ❌ Locale |
| **hotfix/** | Corrections urgentes en production | ✅ PR requise |

### Workflow recommandé

#### 1. Créer une branche de fonctionnalité

```bash
# Depuis develop
git checkout develop
git pull origin develop

# Créer la branche
git checkout -b feature/nom-fonctionnalite

# Exemple: git checkout -b feature/payment-integration
```

#### 2. Développer et commiter

```bash
# Effectuer les changements
# ...

# Staged les changements
git add .

# Commiter avec message descriptif
git commit -m "feat: description de la fonctionnalité

- Point 1
- Point 2
- Point 3"
```

#### 3. Pusher et créer une Pull Request

```bash
# Pusher la branche
git push -u origin feature/nom-fonctionnalite

# Aller sur GitHub et créer une PR
# Assigner un reviewer
# Attendre l'approbation
```

#### 4. Merger sur develop

```bash
# Une fois approuvée, merger depuis GitHub ou localement
git checkout develop
git pull origin develop
git merge --no-ff feature/nom-fonctionnalite
git push origin develop

# Optionnel: supprimer la branche
git push origin --delete feature/nom-fonctionnalite
```

#### 5. Release sur main

```bash
git checkout main
git pull origin main
git merge --no-ff develop -m "chore: release v1.x.x"
git tag -a v1.x.x -m "Release version 1.x.x"
git push origin main --tags
```

### Conventions de commits

Utiliser le format **Conventional Commits** :

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage (sans logique)
- `refactor:` Refactorisation
- `perf:` Amélioration de performance
- `test:` Tests
- `chore:` Tâches diverses

**Exemples:**
```
feat(auth): implémenter l'authentification JWT
fix(listings): corriger la pagination des annonces
docs(readme): ajouter les instructions d'installation
```

---

## Documentation technique

### Endpoints API principales

#### Authentification
```
POST   /api/auth/register       # Inscription
POST   /api/auth/login          # Connexion
POST   /api/auth/refresh        # Rafraîchir token JWT
POST   /api/auth/logout         # Déconnexion
```

#### Utilisateurs
```
GET    /api/users/{id}          # Récupérer l'utilisateur
PUT    /api/users/{id}          # Modifier le profil
POST   /api/users/{id}/avatar   # Charger avatar
GET    /api/users/{id}/history  # Historique des transactions
```

#### Annonces
```
GET    /api/listings            # Lister les annonces
POST   /api/listings            # Créer une annonce
GET    /api/listings/{id}       # Détails d'une annonce
PUT    /api/listings/{id}       # Modifier une annonce
DELETE /api/listings/{id}       # Supprimer une annonce
POST   /api/listings/{id}/photos # Ajouter des photos
```

#### Contrats
```
GET    /api/contracts           # Lister les contrats
POST   /api/contracts           # Créer un contrat
GET    /api/contracts/{id}      # Détails du contrat
PUT    /api/contracts/{id}      # Modifier le contrat
POST   /api/contracts/{id}/sign # Signer electroniquement
```

#### Paiements
```
POST   /api/payments            # Créer un paiement
GET    /api/payments/{id}       # Statut du paiement
GET    /api/transactions        # Historique
```

### Variables d'environnement

#### Backend (.env)
```env
APP_ENV=dev|prod
APP_DEBUG=true|false
DATABASE_URL=postgresql://user:password@localhost:5432/planb_db
JWT_SECRET=votre_clé_secrète_jwt
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
ORANGE_MONEY_KEY=...
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
SOCKET_IO_URL=http://localhost:3001
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_NAME=PLANb
```

### Gestion des migrations BDD

```bash
# Créer une migration
php bin/console make:migration

# Voir les migrations
php bin/console doctrine:migrations:list

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Revenir en arrière
php bin/console doctrine:migrations:migrate prev
```

### Tests

```bash
# Backend - PHPUnit
cd planb-backend
./vendor/bin/phpunit

# Frontend - Vitest
cd planb-frontend
npm run test

# Frontend - E2E (Playwright)
npm run test:e2e

# Tous les tests
npm run test:all
```

---

## Contribution

### Avant de contribuer

1. ✅ Vérifiez les [issues](https://github.com/elohimdjedje/PLANb/issues) ouvertes
2. 📋 Créez une issue pour discuter de votre idée
3. 🍴 Forkez le repository
4. 🌿 Créez une branche `feature/...`

### Processus de contributon

1. **Clonez votre fork**
   ```bash
   git clone https://github.com/VOTRE_USERNAME/PLANb.git
   cd PLANb
   git remote add upstream https://github.com/elohimdjedje/PLANb.git
   ```

2. **Synchronisez avec le dépôt principal**
   ```bash
   git fetch upstream
   git checkout develop
   git merge upstream/develop
   ```

3. **Créez une branche de fonctionnalité**
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```

4. **Committez vos changements**
   ```bash
   git commit -m "feat(scope): description claire"
   ```

5. **Poussez vers votre fork**
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

6. **Créez une Pull Request**
   - Donnez un titre descriptif
   - Décrivez les changements
   - Attachez les issues liées
   - Demandez une review

### Critères de qualité

- ✅ Tous les tests passent
- ✅ Code formaté (ESLint, PHP-CS-Fixer)
- ✅ Pas de warnings/erreurs
- ✅ Documentation mise à jour
- ✅ Commits atomiques avec bons messages
- ✅ Approuvé par au moins 1 reviewer

---

## Support

### Documentation

- 📖 [Architecture détaillée](./docs/ARCHITECTURE.md)
- 💳 [Intégration paiements](./planb-backend/docs/PAYMENT_PROVIDERS.md)
- 📧 [Configuration emails](./planb-backend/docs/EMAIL_CONFIGURATION.md)
- 🔐 [Sécurité et authentification](./docs/SECURITY.md)
- 📱 [Guide mobile](./planb-mobile/README.md)
- 🔌 [Socket.IO real-time](./planb-socketio-server/README.md)

### Problèmes courants

**Port déjà utilisé**
```bash
# Trouver le processus
netstat -ano | findstr :8000

# Tuer le processus
taskkill /PID <PID> /F
```

**Base de données non accessible**
```bash
# Vérifier PostgreSQL
psql -U postgres -W

# Vérifier les credentials dans .env
# Recréer la base de données
php bin/console doctrine:database:drop --force
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

**Module npm manquant**
```bash
npm install
# ou
npm ci  # pour ignorer les versions lock
```

### Contact et communauté

- 👨‍💼 **Propriétaire du projet**: [elohimdjedje](https://github.com/elohimdjedje)
- 📧 **Email**: contactelohi@gmail.com
- 🐛 **Signaler un bug**: [Issues](https://github.com/elohimdjedje/PLANb/issues)
- 💬 **Discussions**: [Discussions](https://github.com/elohimdjedje/PLANb/discussions)

---

## Licence

Ce projet est sous licence [MIT](LICENSE) - voir le fichier LICENSE pour les détails.

---

## Remerciements

- 🙏 Merci à tous les contributeurs
- 🤝 Merci aux collaborateurs actifs
- 🚀 Merci à la communauté open-source

---

<div align="center">
  <p>Construit avec ❤️ pour simplifier la gestion immobilière</p>
  <p><strong>PLANb - La plateforme immobilière du futur</strong></p>
</div>

---

**Dernière mise à jour**: 2 mars 2026  
**Version**: 1.0.0  
**Statut**: Production Ready ✅

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation

---

## 📦 Installation & Démarrage

### ⚡ Démarrage Rapide (Recommandé)

**Pour démarrer l'application, utilisez les scripts automatisés dans le dossier `DEMARRAGE/`**

```powershell
# 1. Première installation (une seule fois)
.\DEMARRAGE\4-INSTALLATION-COMPLETE.ps1

# 2. Démarrer tous les serveurs
.\DEMARRAGE\DEMARRER.ps1

# 3. Vérifier l'état des serveurs
.\DEMARRAGE\VERIFIER.ps1

# 4. Arrêter tous les serveurs
.\DEMARRAGE\ARRETER.ps1
```

📖 **[Voir la documentation complète du dossier DEMARRAGE](./DEMARRAGE/README.md)**

---

### 📋 Prérequis

- ✅ **Docker** (pour PostgreSQL)
- ✅ **PHP >= 8.2** avec Composer
- ✅ **Node.js >= 18** avec npm
- ✅ **PowerShell**

---

### 🔧 Installation Manuelle (si nécessaire)

<details>
<summary>Cliquez pour voir les étapes détaillées</summary>

#### 1. Cloner le projet

```bash
git clone https://github.com/VOTRE_USERNAME/plan-b.git
cd plan-b
```

#### 2. Backend (Symfony)

```bash
cd planb-backend

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer la base de données dans .env
# DATABASE_URL="postgresql://postgres:root@127.0.0.1:5432/planb?serverVersion=15&charset=utf8"

# Créer la base de données
php bin/console doctrine:database:create

# Appliquer les migrations
php bin/console doctrine:migrations:migrate

# Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# Démarrer le serveur
php -S localhost:8000 -t public
```

Le backend sera accessible sur **http://localhost:8000**

#### 3. Frontend (React)

```bash
cd planb-frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Vérifier la configuration dans .env
# VITE_API_URL=http://localhost:8000/api/v1

# Démarrer le serveur
npm run dev
```

Le frontend sera accessible sur **http://localhost:5173**

</details>

---

## ⚙️ Configuration

### Backend (.env)

```env
# Environnement
APP_ENV=dev
APP_SECRET=votre_secret_unique

# Base de données
DATABASE_URL="postgresql://postgres:root@127.0.0.1:5432/planb?serverVersion=15&charset=utf8"

# JWT
JWT_TTL=3600

# CORS
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$

# Upload (optionnel - pour Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Paiements (optionnel)
WAVE_API_KEY=
OM_CLIENT_ID=
OM_CLIENT_SECRET=
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🎯 Utilisation

### Créer un compte

1. Ouvrir http://localhost:5173
2. Cliquer sur "Inscription"
3. Remplir le formulaire
4. Se connecter

### Publier une annonce

1. Cliquer sur le bouton "+" (orange)
2. Suivre les 6 étapes :
   - Catégorie
   - Sous-catégorie + Type
   - Photos (max 3)
   - Titre + Description + Prix
   - Ville
   - Contact (optionnel)
3. Publier

### Consulter ses annonces

1. Aller dans "Profil" (menu en bas)
2. Voir toutes ses annonces avec statistiques

---

## 📚 Documentation

### 📁 Documentation Principale

- **[DEMARRAGE/README.md](./DEMARRAGE/README.md)** - ⭐ Guide de démarrage rapide
- **[ARCHIVE_DOCUMENTATION/](./ARCHIVE_DOCUMENTATION/)** - Documentation historique et guides techniques

### Structure du projet

```
plan-b/
├── planb-backend/          # API Symfony
│   ├── src/
│   │   ├── Controller/     # Routes API
│   │   ├── Entity/         # Modèles DB
│   │   └── Repository/     # Requêtes
│   ├── config/             # Configuration
│   └── public/             # Point d'entrée + uploads
│
├── planb-frontend/         # Application React
│   ├── src/
│   │   ├── api/           # Client API
│   │   ├── components/    # Composants React
│   │   ├── pages/         # Pages de l'app
│   │   ├── store/         # État global
│   │   └── utils/         # Utilitaires
│   └── public/            # Assets statiques
│
└── docs/                  # Documentation (tous les .md)
```

### Endpoints API

```
POST   /api/v1/auth/register      # Inscription
POST   /api/v1/auth/login         # Connexion
GET    /api/v1/auth/me            # Profil
GET    /api/v1/listings           # Liste annonces
POST   /api/v1/listings           # Créer annonce
GET    /api/v1/listings/{id}      # Détails annonce
GET    /api/v1/users/my-listings  # Mes annonces
POST   /api/v1/upload             # Upload images
POST   /api/v1/favorites/toggle   # Toggle favori
```

---

## 🧪 Tests

### Backend

```bash
cd planb-backend
php bin/phpunit
```

### Frontend

```bash
cd planb-frontend
npm run test
```

---

## 🚀 Déploiement

### Backend

1. Configurer un serveur avec PHP 8.2+
2. Installer PostgreSQL
3. Configurer Nginx ou Apache
4. Migrer vers Cloudinary pour les images
5. Configurer les paiements Wave/Orange Money

### Frontend

1. Build de production :
   ```bash
   npm run build
   ```

2. Déployer le dossier `dist/` sur :
   - Netlify (recommandé)
   - Vercel
   - AWS S3 + CloudFront

---

## 🤝 Contribution

### Workflow Git

```bash
# Créer une branche
git checkout -b feature/ma-nouvelle-feature

# Faire vos modifications
git add .
git commit -m "feat: ajout de ma feature"

# Pousser la branche
git push origin feature/ma-nouvelle-feature

# Créer une Pull Request sur GitHub
```

### Conventions

- **Commits** : https://www.conventionalcommits.org/
  - `feat:` nouvelle fonctionnalité
  - `fix:` correction de bug
  - `docs:` documentation
  - `style:` formatage
  - `refactor:` refactoring
  - `test:` ajout de tests

---

## 📝 TODO

### Priorité haute 🔴
- [ ] Finaliser les paiements Wave
- [ ] Optimiser l'upload d'images (Cloudinary)
- [ ] Ajouter les tests E2E

### Priorité moyenne 🟡
- [ ] Système de notifications
- [ ] Chat en temps réel (Socket.io)
- [ ] Dashboard admin

### Priorité basse 🟢
- [ ] Mode sombre
- [ ] PWA (Progressive Web App)
- [ ] Multi-langue (i18n)

---

## 🐛 Bugs connus

Aucun bug majeur actuellement. ✅

Pour signaler un bug, créez une issue sur GitHub.

---

## 📞 Support

- **Email** : support@planb.com (à configurer)
- **Issues** : https://github.com/VOTRE_USERNAME/plan-b/issues

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

- **Elohim Mickael** - Développeur principal
- **Votre collègue** - Collaborateur

---

## 🙏 Remerciements

- Symfony pour le framework backend
- React pour l'UI
- TailwindCSS pour le styling
- Framer Motion pour les animations

---

**Fait avec ❤️ pour l'Afrique de l'Ouest** 🌍
#   C o n f i g u r a t i o n   m i s e   �   j o u r  
 