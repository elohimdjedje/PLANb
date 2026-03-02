/**
 * Serveur Socket.io pour le chat en temps réel
 * Plan B - Plateforme de petites annonces
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configuration CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Stockage des utilisateurs connectés
const connectedUsers = new Map(); // userId -> socketId
const userRooms = new Map(); // userId -> Set<conversationIds>
const userBookingRooms = new Map(); // userId -> Set<bookingIds>

const fs = require('fs');
const path = require('path');

/**
 * Vérifier le token JWT
 * Utilise la clé publique JWT de Symfony pour vérification de signature.
 * Fallback sur décodage uniquement en développement.
 */
function verifyToken(token) {
  try {
    // Option 1: Vérification avec clé publique RSA (recommandé)
    const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || path.join(__dirname, '..', 'planb-backend', 'config', 'jwt', 'public.pem');
    if (fs.existsSync(publicKeyPath)) {
      const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
      return {
        sub: decoded.sub || decoded.id || decoded.user_id,
        id: decoded.sub || decoded.id || decoded.user_id,
        user_id: decoded.sub || decoded.id || decoded.user_id,
        email: decoded.email,
        ...decoded
      };
    }

    // Option 2: Vérification avec passphrase (HMAC)
    const passphrase = process.env.JWT_PASSPHRASE;
    if (passphrase) {
      const decoded = jwt.verify(token, passphrase);
      return {
        sub: decoded.sub || decoded.id || decoded.user_id,
        id: decoded.sub || decoded.id || decoded.user_id,
        user_id: decoded.sub || decoded.id || decoded.user_id,
        email: decoded.email,
        ...decoded
      };
    }

    // Option 3: Développement SEULEMENT - décodage sans vérification
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ JWT décodé SANS vérification - Ne jamais utiliser en production!');
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.payload) return null;
      return {
        sub: decoded.payload.sub || decoded.payload.id || decoded.payload.user_id,
        id: decoded.payload.sub || decoded.payload.id || decoded.payload.user_id,
        user_id: decoded.payload.sub || decoded.payload.id || decoded.payload.user_id,
        email: decoded.payload.email,
        ...decoded.payload
      };
    }

    console.error('No JWT verification method available in production!');
    return null;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

/**
 * Authentification Socket.io
 */
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  
  if (!token) {
    return next(new Error('Token manquant'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error('Token invalide'));
  }

  // Normaliser userId en entier pour éviter les décalages String vs Int
  socket.userId = parseInt(decoded.sub || decoded.id || decoded.user_id, 10);
  socket.user = decoded;
  next();
});

/**
 * Gestion des connexions
 */
io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`✅ Utilisateur connecté: ${userId} (socket: ${socket.id})`);

  // Enregistrer l'utilisateur comme connecté
  connectedUsers.set(userId, socket.id);
  socket.emit('connected', { userId });

  /**
   * Rejoindre une conversation (room)
   */
  socket.on('join_conversation', (conversationId) => {
    if (!conversationId) return;

    socket.join(`conversation_${conversationId}`);
    console.log(`👥 Utilisateur ${userId} a rejoint la conversation ${conversationId}`);

    // Stocker les rooms de l'utilisateur
    if (!userRooms.has(userId)) {
      userRooms.set(userId, new Set());
    }
    userRooms.get(userId).add(conversationId);

    // Notifier les autres participants
    socket.to(`conversation_${conversationId}`).emit('user_joined', {
      userId,
      conversationId
    });
  });

  /**
   * Quitter une conversation
   */
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`👋 Utilisateur ${userId} a quitté la conversation ${conversationId}`);

    if (userRooms.has(userId)) {
      userRooms.get(userId).delete(conversationId);
    }
  });

  /**
   * Nouveau message (reçu depuis Symfony)
   * Émis via HTTP POST depuis le backend
   */
  socket.on('new_message', (data) => {
    // Cette fonction est appelée depuis Symfony via HTTP
    // Voir SocketIoService.php
  });

  /**
   * Indicateur de frappe (typing)
   */
  socket.on('typing', (data) => {
    const { conversationId } = data;
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit('typing', {
      userId,
      conversationId,
      isTyping: true
    });
  });

  /**
   * Arrêter la frappe
   */
  socket.on('stop_typing', (data) => {
    const { conversationId } = data;
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit('typing', {
      userId,
      conversationId,
      isTyping: false
    });
  });

  /**
   * Message lu
   */
  socket.on('message_read', (data) => {
    const { messageId, conversationId } = data;
    if (!messageId || !conversationId) return;

    socket.to(`conversation_${conversationId}`).emit('message_read', {
      messageId,
      conversationId,
      readBy: userId
    });
  });

  /**
   * S'abonner aux mises à jour d'une réservation (room booking)
   */
  socket.on('join_booking', (bookingId) => {
    if (!bookingId) return;
    const bId = parseInt(bookingId, 10);
    socket.join(`booking_${bId}`);
    console.log(`🏠 Utilisateur ${userId} s'abonne à la réservation ${bId}`);

    // Suivre les rooms de réservation de l'utilisateur
    if (!userBookingRooms.has(userId)) {
      userBookingRooms.set(userId, new Set());
    }
    userBookingRooms.get(userId).add(bId);
  });

  socket.on('leave_booking', (bookingId) => {
    if (!bookingId) return;
    const bId = parseInt(bookingId, 10);
    socket.leave(`booking_${bId}`);
    if (userBookingRooms.has(userId)) {
      userBookingRooms.get(userId).delete(bId);
    }
  });

  /**
   * Déconnexion
   */
  socket.on('disconnect', () => {
    console.log(`❌ Utilisateur déconnecté: ${userId} (socket: ${socket.id})`);
    
    // Retirer de la liste des connectés
    connectedUsers.delete(userId);

    // Capturer les rooms AVANT de supprimer du Map
    const rooms = userRooms.get(userId);
    userRooms.delete(userId);
    userBookingRooms.delete(userId);

    // Notifier toutes les conversations
    if (rooms && rooms.size > 0) {
      rooms.forEach(conversationId => {
        socket.to(`conversation_${conversationId}`).emit('user_left', {
          userId,
          conversationId
        });
      });
    }
  });
});

/**
 * Endpoint HTTP pour pousser les changements de statut de réservation depuis Symfony.
 * POST /emit-booking-update
 * Body: { bookingId, status, booking }
 */
app.post('/emit-booking-update', (req, res) => {
  const authHeader = req.headers['x-socket-secret'] || req.headers['authorization'];
  const expectedSecret = process.env.SOCKET_SECRET || 'planb-socket-secret-dev';

  if (authHeader !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  const { bookingId, status, booking, ownerTargetId, tenantTargetId } = req.body;

  if (!bookingId || !status) {
    return res.status(400).json({ error: 'bookingId et status requis' });
  }

  const payload = { bookingId, status, booking };

  // Notifier la room de la réservation
  io.to(`booking_${bookingId}`).emit('booking_status_update', payload);

  // Notifier directement le propriétaire et le locataire s'ils sont connectés
  [ownerTargetId, tenantTargetId].filter(Boolean).forEach(uid => {
    const sid = connectedUsers.get(uid) || connectedUsers.get(String(uid)) || connectedUsers.get(parseInt(uid));
    if (sid) {
      io.to(sid).emit('booking_status_update', payload);
    }
  });

  console.log(`📬 Réservation ${bookingId} → statut "${status}" émis`);
  res.json({ success: true });
});

/**
 * Endpoint HTTP pour recevoir les messages depuis Symfony
 * Symfony fait un POST ici après avoir sauvegardé le message
 * ✅ SECURITY: Protégé par shared secret
 */
app.post('/emit-message', (req, res) => {
  // Vérifier le secret partagé pour éviter les injections de messages
  const authHeader = req.headers['x-socket-secret'] || req.headers['authorization'];
  const expectedSecret = process.env.SOCKET_SECRET || 'planb-socket-secret-dev';
  
  if (authHeader !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }

  const { conversationId, message } = req.body;

  if (!conversationId || !message) {
    return res.status(400).json({ error: 'conversationId et message requis' });
  }

  // Émettre le message à tous les participants de la conversation
  io.to(`conversation_${conversationId}`).emit('new_message', {
    conversationId,
    message
  });

  console.log(`📨 Message émis pour la conversation ${conversationId}`);
  res.json({ success: true });
});

/**
 * Endpoint pour vérifier si un utilisateur est en ligne
 */
app.get('/user/:userId/online', (req, res) => {
  const { userId } = req.params;
  const isOnline = connectedUsers.has(userId) || connectedUsers.has(parseInt(userId));
  res.json({ online: isOnline });
});

/**
 * Endpoint de santé
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Serveur Socket.io démarré sur le port ${PORT}`);
  console.log(`📡 Prêt à recevoir les connexions WebSocket`);
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n📴 ${signal} reçu. Arrêt gracieux en cours...`);
  
  // Notifier les clients connectés
  io.emit('server_shutdown', { message: 'Le serveur redémarre, veuillez patienter...' });
  
  // Fermer le serveur Socket.io
  io.close(() => {
    console.log('✅ Socket.io fermé');
    server.close(() => {
      console.log('✅ Serveur HTTP fermé');
      process.exit(0);
    });
  });
  
  // Forcer l'arrêt après 10s si le graceful ne fonctionne pas
  setTimeout(() => {
    console.error('⚠️ Arrêt forcé après timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

