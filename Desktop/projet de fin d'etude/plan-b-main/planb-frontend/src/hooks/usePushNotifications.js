import { useEffect, useState } from 'react';
import { pushNotificationService } from '../services/api';

/**
 * Hook pour gérer les notifications push
 */
export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Vérifier si le navigateur supporte les notifications push
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            if (sub) {
                setSubscription(sub);
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error('Error checking subscription:', err);
        }
    };

    const subscribe = async () => {
        try {
            setError(null);

            // Enregistrer le service worker
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            // Demander la permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Permission refusée pour les notifications');
            }

            // Obtenir les clés VAPID depuis le serveur
            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
            if (!vapidPublicKey) {
                throw new Error('VAPID public key non configurée');
            }

            // Convertir la clé VAPID en format ArrayBuffer
            const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

            // S'abonner aux notifications push
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey,
            });

            // Envoyer la souscription au serveur
            const subscriptionData = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
                    auth: arrayBufferToBase64(sub.getKey('auth')),
                },
                platform: 'web',
            };

            const result = await pushNotificationService.subscribe(subscriptionData);
            if (result.ok) {
                setSubscription(sub);
                setIsSubscribed(true);
                return { success: true };
            } else {
                throw new Error(result.data.error || 'Erreur lors de l\'abonnement');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const unsubscribe = async () => {
        try {
            setError(null);

            if (subscription) {
                await subscription.unsubscribe();
            }

            const result = await pushNotificationService.unsubscribeAll();
            if (result.ok) {
                setSubscription(null);
                setIsSubscribed(false);
                return { success: true };
            } else {
                throw new Error(result.data.error || 'Erreur lors du désabonnement');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    return {
        isSupported,
        isSubscribed,
        subscription,
        error,
        subscribe,
        unsubscribe,
    };
}

/**
 * Convertir une clé VAPID base64 en Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Convertir un ArrayBuffer en base64
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
