# 🚀 Plan B - Plateforme de Petites Annonces

Plateforme de petites annonces moderne pour l'Afrique de l'Ouest, inspirée de Le Bon Coin, avec paiement mobile (Wave, Orange Money) et interface WhatsApp.

![Status](https://img.shields.io/badge/status-en%20développement-yellow)
![PHP](https://img.shields.io/badge/PHP-8.2-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Symfony](https://img.shields.io/badge/Symfony-7.0-black)

---

## 📋 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Documentation](#-documentation)

---

## ✨ Fonctionnalités

### Actuellement fonctionnel ✅
- 🔐 **Authentification** : Inscription/Connexion avec JWT
- 📝 **Publication d'annonces** : Avec images (jusqu'à 3 pour FREE, 10 pour PRO)
- 🖼️ **Upload d'images** : Stockage local (prêt pour Cloudinary)
- 👤 **Profil utilisateur** : Gestion des annonces, statistiques
- ❤️ **Favoris** : Sauvegarde des annonces préférées
- 💬 **Messagerie** : Intégration WhatsApp
- 🔍 **Recherche** : Par catégorie, ville, prix
- 📱 **Responsive** : Mobile-first design

### En cours de développement 🚧
- 💳 **Paiements** : Wave et Orange Money
- ⭐ **Système PRO** : Abonnement payant
- 📊 **Statistiques** : Dashboard pour compte PRO
- 🔔 **Notifications** : Alertes favoris

---

## 🛠 Technologies

### Backend
- **PHP 8.2** - Langage
- **Symfony 7.0** - Framework
- **PostgreSQL 15** - Base de données
- **JWT** - Authentification
- **API Platform** - API REST

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
