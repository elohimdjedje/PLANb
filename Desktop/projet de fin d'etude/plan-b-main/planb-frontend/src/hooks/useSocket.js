import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { authService } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKETIO_URL || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useSocket = () => {
    const socket = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [typingUser, setTypingUser] = useState(null);

    // Initialiser la connexion
    useEffect(() => {
        const token = authService.getToken();
        if (!token) return;

        // Don't connect if no socket server URL is configured or server is optional
        try {
            socket.current = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 5000,
                timeout: 5000,
            });

        socket.current.on('connect', () => {
            console.log('✅ Socket connected:', socket.current.id);
            setIsConnected(true);
        });

        socket.current.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.current.on('connect_error', () => {
            // Socket.io server not available — silently degrade
            setIsConnected(false);
        });

        socket.current.on('new_message', (data) => {
            setLastMessage(data);
        });

        socket.current.on('typing', (data) => {
            setTypingUser(data);
        });
        } catch (err) {
            // Socket.io connection failed — feature degrades gracefully
            console.debug('[Socket] Connection unavailable:', err.message);
        }

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    // Rejoindre une conversation
    const joinConversation = useCallback((conversationId) => {
        if (socket.current && isConnected) {
            socket.current.emit('join_conversation', conversationId);
        }
    }, [isConnected]);

    // Quitter une conversation
    const leaveConversation = useCallback((conversationId) => {
        if (socket.current && isConnected) {
            socket.current.emit('leave_conversation', conversationId);
        }
    }, [isConnected]);

    // Indiquer qu'on écrit
    const sendTyping = useCallback((conversationId, isTyping) => {
        if (socket.current && isConnected) {
            socket.current.emit(isTyping ? 'typing' : 'stop_typing', { conversationId });
        }
    }, [isConnected]);

    return {
        socket: socket.current,
        isConnected,
        lastMessage,
        typingUser,
        joinConversation,
        leaveConversation,
        sendTyping
    };
};
