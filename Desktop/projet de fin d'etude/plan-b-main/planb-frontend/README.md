# 🎨 Plan B Frontend

**Frontend React pour la plateforme de petites annonces Plan B**

---

## 📦 Stack Technique

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Navigation
- **Axios** - Requêtes API
- **Lucide React** - Icônes modernes

---

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Le frontend sera accessible sur **http://localhost:3000**

### Build Production

```bash
npm run build
npm run preview
```

---

## 📁 Structure du Projet

```
planb-frontend/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/          # Pages de l'application
│   ├── services/       # API calls
│   ├── context/        # Context API (Auth, etc.)
│   ├── utils/          # Fonctions utilitaires
│   ├── assets/         # Images, fonts
│   ├── App.jsx         # Composant principal
│   ├── main.jsx        # Point d'entrée
│   └── index.css       # Styles globaux
├── public/             # Fichiers statiques
├── index.html          # HTML de base
├── vite.config.js      # Configuration Vite
├── tailwind.config.js  # Configuration Tailwind
└── package.json
```

---

## 🔗 Connexion au Backend

Le frontend est configuré pour se connecter automatiquement au backend Plan B :

- **Backend URL :** http://localhost:8000
- **Proxy Vite :** `/api` → `http://localhost:8000`

---

## 🎨 Maquette

En cours de développement...

---

## 📝 TODO

- [ ] Pages principales (Accueil, Liste, Détail, Profil)
- [ ] Authentification (Login, Register)
- [ ] Upload d'images
- [ ] Recherche et filtres
- [ ] Paiements (Fedapay)
- [ ] Dashboard utilisateur
- [ ] Responsive design

---

**Version :** 1.0.0  
**Date :** 3 novembre 2025
