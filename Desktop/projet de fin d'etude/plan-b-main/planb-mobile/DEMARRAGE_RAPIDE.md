# 🚀 Démarrage Rapide - Plan B Mobile

Guide pour tester l'application sur votre téléphone avec Expo Go.

## 📋 Étapes (5 minutes)

### 1. **Installer Expo Go sur votre téléphone** 📱

Scannez ce QR code ou cherchez "Expo Go" dans votre store :

**Android** : https://play.google.com/store/apps/details?id=host.exp.exponent  
**iOS** : https://apps.apple.com/app/expo-go/id982107779

### 2. **Trouver votre adresse IP locale** 🌐

Sur votre PC, ouvrez PowerShell et tapez :
```powershell
ipconfig
```

Cherchez la ligne **"Adresse IPv4"** (exemple : `192.168.1.10`)

### 3. **Configurer l'application** ⚙️

Ouvrez le fichier `config/api.js` et remplacez l'IP :

```javascript
const LOCAL_IP = '192.168.1.10'; // <- VOTRE IP ICI
```

### 4. **Autoriser le pare-feu (Important !)** 🔒

Pour que votre téléphone puisse accéder au backend :

```powershell
# Autoriser le port 8000 (backend)
New-NetFirewallRule -DisplayName "Plan B Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow

# Autoriser le port 19000 (Expo)
New-NetFirewallRule -DisplayName "Expo Dev Server" -Direction Inbound -LocalPort 19000 -Protocol TCP -Action Allow
```

### 5. **Démarrer le backend** 🖥️

Assurez-vous que le backend Plan B est lancé :

```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b
.\demarrer.ps1
```

Vérifiez que ça fonctionne : http://localhost:8000

### 6. **Démarrer l'application mobile** 📱

```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-mobile
npm start
```

Un QR code va s'afficher dans le terminal.

### 7. **Scanner le QR code** 📷

- **Android** : Ouvrez Expo Go → Scannez le QR code
- **iOS** : Ouvrez l'appareil photo → Scannez le QR code → Touchez la notification

### 8. **C'est prêt !** 🎉

L'application va se charger sur votre téléphone.

---

## ⚠️ Checklist de dépannage

Si ça ne fonctionne pas :

- [ ] Le backend est bien démarré (`http://localhost:8000` fonctionne)
- [ ] Votre téléphone et PC sont sur le **même réseau Wi-Fi**
- [ ] Vous avez bien modifié l'IP dans `config/api.js`
- [ ] Le pare-feu autorise les ports 8000 et 19000
- [ ] Expo Go est bien installé sur votre téléphone

---

## 🎯 Test rapide de connexion

Une fois l'app lancée, vous devriez voir :

- ✅ L'écran d'accueil "Plan B"
- ✅ Les statistiques (4 annonces actives)
- ✅ Les boutons de connexion et d'exploration
- ✅ Les catégories (Immobilier, Véhicules, Hôtels)

---

## 📞 Tester la connexion au backend

Pour vérifier que la connexion fonctionne :

1. Appuyez sur le bouton **"Connexion"**
2. Entrez les identifiants de test :
   - **Email** : demo@test.com
   - **Mot de passe** : Demo123!

Si la connexion fonctionne, vous verrez le profil de l'utilisateur !

---

## 🔄 Rechargement automatique

Chaque fois que vous modifiez le code :

- L'application se recharge automatiquement sur votre téléphone
- Vous pouvez aussi secouer votre téléphone pour ouvrir le menu Expo

---

## 💡 Commandes utiles

```powershell
# Voir les logs en temps réel
npm start

# Effacer le cache et redémarrer
npm start --clear

# Mode tunnel (si problème de réseau)
npm start --tunnel
```

---

## 🌐 URLs utiles

- Backend : http://localhost:8000
- Backend API : http://localhost:8000/api/v1
- Adminer : http://localhost:8080

---

## 🎨 Personnalisation

Pour personnaliser l'app :

1. Modifiez `App.js` pour changer l'interface
2. Éditez `app.json` pour changer le nom et les couleurs
3. Ajoutez vos propres écrans dans le dossier `screens/`

---

## 📚 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/)
- [Guide Expo Go](https://docs.expo.dev/get-started/expo-go/)

---

Bon développement ! 🚀
