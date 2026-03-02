# 🚀 Serveur Socket.io - Plan B

Serveur WebSocket pour le chat en temps réel de Plan B.

## 📦 Installation

```bash
cd planb-socketio-server
npm install
```

## ⚙️ Configuration

Copier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Éditer `.env` :

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=votre_secret_jwt_symfony
SYMFONY_URL=http://localhost:8000
```

**Important :** `JWT_SECRET` doit correspondre à celui de Symfony !

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

Le serveur sera accessible sur `http://localhost:3001`

## 📡 Endpoints

### WebSocket
- Connexion : `ws://localhost:3001`
- Authentification : Token JWT dans `auth.token`

### HTTP
- `POST /emit-message` - Émettre un message (depuis Symfony)
- `GET /user/:userId/online` - Vérifier si utilisateur en ligne
- `GET /health` - Santé du serveur

## 🔧 Événements Socket.io

### Client → Serveur
- `join_conversation` - Rejoindre une conversation
- `leave_conversation` - Quitter une conversation
- `typing` - Indicateur de frappe
- `stop_typing` - Arrêter la frappe
- `message_read` - Message lu

### Serveur → Client
- `new_message` - Nouveau message
- `message_read` - Message marqué comme lu
- `typing` - Quelqu'un tape
- `user_joined` - Utilisateur a rejoint
- `user_left` - Utilisateur a quitté

## 🧪 Test

```bash
# Vérifier la santé
curl http://localhost:3001/health

# Vérifier si un utilisateur est en ligne
curl http://localhost:3001/user/1/online
```

## 📝 Logs

Le serveur affiche dans la console :
- ✅ Connexions utilisateurs
- 📨 Messages émis
- 👥 Rejoindre/quitter conversations
- ❌ Déconnexions

## 🔒 Sécurité

- Authentification JWT obligatoire
- Validation des tokens
- CORS configuré
- Rate limiting (à ajouter)

---

**Le serveur doit tourner en parallèle du backend Symfony !**


