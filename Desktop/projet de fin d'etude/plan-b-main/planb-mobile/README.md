# 📱 Plan B Mobile - Application React Native

Application mobile de Plan B développée avec React Native et Expo.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

## 📱 Tester avec Expo Go

### 1. **Installer Expo Go sur votre téléphone**

- **Android** : [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS** : [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2. **Lancer l'application**

```bash
npm start
```

### 3. **Scanner le QR Code**

- **Android** : Ouvrez Expo Go et scannez le QR code affiché dans le terminal
- **iOS** : Ouvrez l'app Appareil Photo et scannez le QR code, puis touchez la notification

### 4. **Connexion au backend local**

⚠️ **Important** : Pour que votre téléphone puisse se connecter au backend sur votre PC :

1. **Votre téléphone et PC doivent être sur le même réseau Wi-Fi**

2. **Trouvez votre adresse IP locale** :
   ```powershell
   ipconfig
   # Cherchez "Adresse IPv4" (ex: 192.168.1.10)
   ```

3. **Modifiez l'URL du backend dans l'app** :
   - Au lieu de `http://localhost:8000`
   - Utilisez `http://VOTRE_IP:8000` (ex: `http://192.168.1.10:8000`)

4. **Autorisez le port dans le pare-feu Windows** :
   ```powershell
   New-NetFirewallRule -DisplayName "Plan B Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   ```

## 🔧 Configuration Backend

### Créer le fichier de configuration API

Créez `config/api.js` :

```javascript
// Remplacez par votre IP locale
const API_URL = __DEV__ 
  ? 'http://192.168.1.10:8000/api/v1'  // <- VOTRE IP ICI
  : 'https://votre-domaine.com/api/v1';

export default {
  API_URL
};
```

## 📦 Scripts disponibles

- `npm start` : Démarre le serveur de développement
- `npm run android` : Lance sur un émulateur Android
- `npm run ios` : Lance sur un simulateur iOS
- `npm run web` : Lance dans le navigateur

## 🌐 Architecture

```
planb-mobile/
├── App.js              # Point d'entrée de l'application
├── app.json            # Configuration Expo
├── package.json        # Dépendances
├── config/
│   └── api.js         # Configuration API
├── screens/           # Écrans de l'application
├── components/        # Composants réutilisables
└── assets/           # Images et ressources
```

## 🐛 Dépannage

### Problème de connexion au backend

Si l'app ne peut pas se connecter au backend :

1. Vérifiez que le backend est bien lancé : `http://localhost:8000`
2. Vérifiez que votre téléphone et PC sont sur le même Wi-Fi
3. Désactivez temporairement le pare-feu pour tester
4. Utilisez votre IP locale, pas `localhost`

### Expo Go ne se connecte pas

1. Redémarrez le serveur de développement
2. Assurez-vous que le port 19000 n'est pas bloqué
3. Essayez le mode Tunnel : `npm start -- --tunnel`

## 📝 Prochaines étapes

1. Créer les écrans principaux (Accueil, Annonces, Profil)
2. Implémenter l'authentification JWT
3. Ajouter la navigation (React Navigation)
4. Connecter à l'API backend
5. Ajouter les fonctionnalités principales (recherche, filtres, favoris)

## 🔗 Liens utiles

- [Documentation Expo](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Go](https://expo.dev/client)
