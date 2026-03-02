/**
 * Service API pour PlanB Frontend
 * Gère l'authentification JWT avec Axios et intercepteurs
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ==================== TOKEN MANAGEMENT ====================
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setRefreshToken = (token) => localStorage.setItem('refreshToken', token);
const removeRefreshToken = () => localStorage.removeItem('refreshToken');
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag pour éviter les appels multiples de refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si erreur 401 et pas déjà en train de retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Si c'est la route login ou refresh-token, ne pas tenter de refresh
            if (originalRequest.url.includes('/auth/login') ||
                originalRequest.url.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }

            // Si l'utilisateur n'est pas connecté (pas de token), ne pas rediriger
            // Laisser l'erreur remonter pour que les pages publiques gèrent le cas
            const currentToken = getToken();
            if (!currentToken) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Ajouter à la queue si déjà en train de refresh
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                // Pas de refresh token, déconnecter
                isRefreshing = false;
                removeToken();
                removeRefreshToken();
                removeUser();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Appeler l'endpoint refresh-token
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                const { token, refreshToken: newRefreshToken } = response.data;

                // Sauvegarder les nouveaux tokens
                setToken(token);
                if (newRefreshToken) {
                    setRefreshToken(newRefreshToken);
                }

                // Mettre à jour le header et relancer la requête
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers.Authorization = `Bearer ${token}`;

                processQueue(null, token);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh échoué, déconnecter
                removeToken();
                removeRefreshToken();
                removeUser();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ==================== AUTH ====================
export const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            // Si le backend demande une vérification 2FA
            if (data['2fa_required']) {
                return { ok: true, data, twoFactorRequired: true };
            }

            if (data.token) {
                setToken(data.token);
                if (data.refreshToken) {
                    setRefreshToken(data.refreshToken);
                }
                setUser(data.user);
            }
            return { ok: true, data };
        } catch (error) {
            const status = error.response?.status;
            const data = error.response?.data || { error: error.message };
            // Détecter le cas "email non vérifié" (403)
            if (status === 403 && data.emailNotVerified) {
                return { ok: false, emailNotVerified: true, email: data.email, data };
            }
            return { ok: false, data };
        }
    },

    async verify2FA(twoFactorToken, code) {
        try {
            const response = await api.post('/2fa/verify', { '2fa_token': twoFactorToken, code });
            const data = response.data;
            if (data.token) {
                setToken(data.token);
                if (data.refreshToken) {
                    setRefreshToken(data.refreshToken);
                }
                setUser(data.user);
            }
            return { ok: true, data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return { ok: true, data: response.data };
        } catch (error) {
            // Améliorer la gestion des erreurs 500
            if (error.response?.status === 500) {
                const errorData = error.response?.data || {};
                // Si c'est une erreur de base de données, afficher un message clair
                if (errorData.message?.includes('base de données') ||
                    errorData.message?.includes('database') ||
                    errorData.error?.includes('base de données')) {
                    return {
                        ok: false,
                        data: {
                            error: 'Base de données non disponible',
                            message: 'La base de données n\'est pas accessible. Veuillez vérifier que PostgreSQL est démarré.'
                        }
                    };
                }
            }
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async verifyEmail(token) {
        try {
            const response = await api.get('/auth/verify-email', { params: { token } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async resendVerificationEmail(email) {
        try {
            const response = await api.post('/auth/verify-email', { email });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async sendOTP(phone) {
        try {
            const response = await api.post('/auth/send-otp', { phone });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async verifyOTP(phone, code) {
        try {
            const response = await api.post('/auth/verify-otp', { phone, code });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async forgotPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async resetPassword({ token, email, code, password }) {
        try {
            const payload = { code, password };
            if (token) payload.token = token;
            else if (email) payload.email = email;
            const response = await api.post('/auth/reset-password', payload);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMe() {
        try {
            const response = await api.get('/auth/me');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async updateProfile(profileData) {
        try {
            const response = await api.put('/auth/update-profile', profileData);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async logout() {
        const refreshToken = getRefreshToken();
        // Invalider le refresh token côté serveur
        try {
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } catch (e) {
            // Ignorer les erreurs réseau (le token sera quand même supprimé localement)
        }
        removeToken();
        removeRefreshToken();
        removeUser();
        window.location.href = '/login';
    },

    isAuthenticated() {
        return !!getToken();
    },

    getToken,
    getRefreshToken,
    getUser,
};

// ==================== USER STATS ====================
export const userStatsService = {
    async getStats() {
        try {
            const response = await api.get('/user/stats');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getDashboard() {
        try {
            const response = await api.get('/user/dashboard');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== PAYMENTS ====================
export const paymentService = {
    async createSubscription(months, paymentMethod, phoneNumber = null) {
        try {
            const response = await api.post('/payments/create-subscription', { months, paymentMethod, phoneNumber });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async confirmWavePayment(months, amount, phoneNumber) {
        try {
            const response = await api.post('/payments/confirm-wave', { months, amount, phoneNumber });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async boostListing(listingId) {
        try {
            const response = await api.post('/payments/boost-listing', { listing_id: listingId });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getPaymentStatus(paymentId) {
        try {
            const response = await api.get(`/payments/${paymentId}/status`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getPaymentHistory() {
        try {
            const response = await api.get('/payments/history');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async initiatePayTechPayment(months, amount) {
        try {
            const baseUrl = API_BASE_URL.replace('/api/v1', '');
            const response = await axios.post(`${baseUrl}/api/paytech/subscription`, { duration: months, amount }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getKKiaPayConfig() {
        try {
            const baseUrl = API_BASE_URL.replace('/api/v1', '');
            const response = await axios.get(`${baseUrl}/api/kkiapay/config`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async verifyKKiaPayTransaction(transactionId, months, type = 'subscription') {
        try {
            const baseUrl = API_BASE_URL.replace('/api/v1', '');
            const response = await axios.post(`${baseUrl}/api/kkiapay/verify`, { transactionId, months, type }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Prix des abonnements PRO
    getSubscriptionPrices() {
        return {
            1: { price: 5000, label: '1 mois' },
            3: { price: 12000, label: '3 mois', savings: 3000 },
            6: { price: 22000, label: '6 mois', savings: 8000 },
            12: { price: 40000, label: '12 mois', savings: 20000 },
        };
    },

    // Méthodes de paiement disponibles
    getPaymentMethods() {
        return [
            {
                id: 'wave',
                name: 'Wave',
                logo: '/images/wave.webp',
                description: 'Paiement mobile Wave',
                countries: ['SN', 'CI', 'ML', 'BF'],
                requiresPhone: true
            },
            {
                id: 'orange_money',
                name: 'Orange Money',
                logo: '/images/orange.webp',
                description: 'Paiement mobile Orange',
                countries: ['SN', 'CI', 'ML', 'BF', 'GN'],
                requiresPhone: true
            },
            {
                id: 'moov_money',
                name: 'Moov Money',
                logo: '/images/moov.jpg',
                description: 'Paiement mobile Moov',
                countries: ['CI', 'BF', 'BJ', 'TG'],
                requiresPhone: true
            },
            {
                id: 'mtn_money',
                name: 'MTN Mobile Money',
                logo: '/images/mtn.jpeg',
                description: 'Paiement mobile MTN',
                countries: ['CI', 'GH', 'CM', 'BJ'],
                requiresPhone: true
            },
            {
                id: 'card',
                name: 'Carte Bancaire',
                logo: '/images/banque.webp',
                description: 'Visa, Mastercard',
                countries: ['*'],
                requiresPhone: false
            },
        ];
    }
};

// ==================== LISTINGS ====================
export const listingService = {
    async getAll(params = {}) {
        try {
            const response = await api.get('/listings', { params });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getOne(id) {
        try {
            const response = await api.get(`/listings/${id}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getById(id) {
        try {
            const response = await api.get(`/listings/${id}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getProListings(limit = 6) {
        try {
            const response = await api.get('/listings/pro', { params: { limit } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getRecentListings(limit = 8) {
        try {
            const response = await api.get('/listings/recent', { params: { limit } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async create(listingData) {
        try {
            const response = await api.post('/listings', listingData);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async update(id, listingData) {
        try {
            const response = await api.put(`/listings/${id}`, listingData);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async delete(id) {
        try {
            const response = await api.delete(`/listings/${id}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMyListings() {
        try {
            const response = await api.get('/listings/my');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async search(query, filters = {}) {
        try {
            const response = await api.get('/search', { params: { q: query, ...filters } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getStats() {
        try {
            const response = await api.get('/listings/stats');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getByUser(userId) {
        try {
            // Récupérer les listings de l'utilisateur via l'endpoint listings
            const response = await api.get(`/listings`, { params: { userId } });
            const listings = response.data?.data || response.data || [];

            // Extraire les infos du vendeur depuis la première annonce
            let seller = null;
            if (listings.length > 0 && listings[0].user) {
                const u = listings[0].user;
                seller = {
                    id: userId,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    fullName: `${u.firstName} ${u.lastName}`,
                    isPro: u.isPro,
                    accountType: u.accountType,
                    averageRating: u.averageRating || 0,
                    reviewsCount: u.reviewsCount || 0,
                };
            }

            return {
                ok: true,
                data: {
                    seller,
                    stats: {
                        activeListings: listings.length,
                        totalViews: listings.reduce((acc, l) => acc + (l.viewsCount || 0), 0),
                    },
                    listings
                }
            };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== USER ====================
export const userService = {
    async getById(userId) {
        try {
            const response = await api.get(`/users/${userId}/public-profile`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== UPLOAD ====================
export const uploadService = {
    async uploadImages(files) {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('images[]', file);
            });
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async deleteImage(filename) {
        try {
            const response = await api.delete(`/upload/${filename}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== REVIEWS ====================
export const reviewService = {
    async create(listingId, rating, comment, reviewType = 'transaction') {
        try {
            const response = await api.post('/reviews', { listingId, rating, comment, reviewType });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getSellerReviews(sellerId, page = 1, limit = 10) {
        try {
            const response = await api.get(`/reviews/seller/${sellerId}`, { params: { page, limit } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getListingReviews(listingId) {
        try {
            const response = await api.get(`/reviews/listing/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async delete(reviewId) {
        try {
            const response = await api.delete(`/reviews/${reviewId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== NOTIFICATIONS ====================
export const notificationService = {
    async getAll(page = 1, limit = 20) {
        try {
            const response = await api.get('/notifications', { params: { page, limit } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async markAsRead(notificationId) {
        try {
            const response = await api.post(`/notifications/${notificationId}/read`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async markAllAsRead() {
        try {
            const response = await api.post('/notifications/read-all');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async delete(notificationId) {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getUnreadCount() {
        try {
            const response = await api.get('/notifications/unread-count');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== FAVORITES ====================
export const favoriteService = {
    async getAll() {
        try {
            const response = await api.get('/favorites');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async add(listingId) {
        try {
            const response = await api.post(`/favorites/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async remove(listingId) {
        try {
            const response = await api.delete(`/favorites/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async check(listingId) {
        try {
            const response = await api.get(`/favorites/check/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== MESSAGES ====================
export const messageService = {
    async getConversations() {
        try {
            const response = await api.get('/conversations');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMessages(conversationId) {
        try {
            // Messages are returned within the conversation detail endpoint
            const response = await api.get(`/conversations/${conversationId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async sendMessage(conversationId, content) {
        try {
            // Backend expects POST /messages with conversationId in body
            const response = await api.post('/messages', { conversationId, content });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async startConversation(listingId, message) {
        try {
            // Backend expects POST /conversations/start/{listingId}
            const response = await api.post(`/conversations/start/${listingId}`, { message });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== BOOKINGS ====================
export const bookingService = {
    async create(listingId, startDate, endDate, guests = 1) {
        try {
            const response = await api.post('/bookings', {
                listing_id: listingId,
                start_date: startDate,
                end_date: endDate,
                message: guests !== 1 ? `${guests} voyageur(s)` : undefined
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMyBookings(role = 'tenant') {
        try {
            // Backend uses GET /bookings?role=tenant or role=owner
            const response = await api.get('/bookings', { params: { role } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getBookingsForMyListings() {
        try {
            const response = await api.get('/bookings', { params: { role: 'owner' } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async updateStatus(bookingId, status, payload = {}) {
        try {
            // Mapping complet des statuts → endpoints backend
            const actionMap = {
                'accepted':             'accept',
                'rejected':             'reject',
                'cancelled':            'cancel',
                'visited':              'mark-visited',
                'confirmed':            'confirm-after-visit',
                'refused_after_visit':  'refuse-after-visit',
            };
            const action = actionMap[status];
            if (!action) {
                return { ok: false, data: { error: `Statut inconnu: ${status}` } };
            }
            const response = await api.post(`/bookings/${bookingId}/${action}`, payload);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== CONTACT ====================
export const contactService = {
    async submit(data) {
        try {
            const response = await api.post('/contact', data);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getWhatsAppLink(message) {
        try {
            const response = await api.get('/contact/whatsapp', {
                params: { message: message || 'Bonjour, j\'aimerais contacter l\'équipe Plan B' }
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== VIRTUAL TOUR ====================
// ==================== KKIAPAY ====================
// Note: KKiaPay routes are under /api/ not /api/v1/
const kkiapayBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
export const kkiapayService = {
    async getConfig() {
        try {
            const response = await axios.get(`${kkiapayBaseUrl}/api/kkiapay/config`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async verifyTransaction(transactionId, months = 1, type = 'subscription') {
        try {
            const response = await axios.post(`${kkiapayBaseUrl}/api/kkiapay/verify`, { transactionId, months, type }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getPaymentHistory() {
        try {
            const response = await axios.get(`${kkiapayBaseUrl}/api/kkiapay/history`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

export const virtualTourService = {
    async upload(listingId, file) {
        try {
            const formData = new FormData();
            formData.append('virtual_tour', file);
            const response = await api.post(`/listings/${listingId}/virtual-tour`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async get(listingId) {
        try {
            const response = await api.get(`/listings/${listingId}/virtual-tour`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async delete(listingId) {
        try {
            const response = await api.delete(`/listings/${listingId}/virtual-tour`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async setExternalUrl(listingId, url, type = 'external') {
        try {
            const response = await api.put(`/listings/${listingId}/virtual-tour-url`, { url, type });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== VISIT SLOTS ====================
export const visitSlotService = {
    // Créneaux disponibles pour une annonce (public)
    async getByListing(listingId) {
        try {
            const response = await api.get(`/visit-slots/listing/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Mes créneaux (propriétaire)
    async getMySlots(status = null) {
        try {
            const url = status ? `/visit-slots/my-slots?status=${status}` : '/visit-slots/my-slots';
            const response = await api.get(url);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Mes réservations (visiteur)
    async getMyBookings() {
        try {
            const response = await api.get('/visit-slots/my-bookings');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Créer un créneau (propriétaire)
    async create(data) {
        try {
            const response = await api.post('/visit-slots', data);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Modifier un créneau
    async update(id, data) {
        try {
            const response = await api.put(`/visit-slots/${id}`, data);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Supprimer un créneau
    async delete(id) {
        try {
            const response = await api.delete(`/visit-slots/${id}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Réserver un créneau (visiteur)
    async book(id, data = {}) {
        try {
            const response = await api.post(`/visit-slots/${id}/book`, data);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Annuler une réservation
    async cancel(id) {
        try {
            const response = await api.post(`/visit-slots/${id}/cancel`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Marquer comme complétée
    async complete(id) {
        try {
            const response = await api.post(`/visit-slots/${id}/complete`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// Admin service for admin dashboard
export const adminService = {
    async getStats() {
        try {
            const response = await api.get('/admin/dashboard');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getUsers(params = {}) {
        try {
            const response = await api.get('/admin/users', { params });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getUser(userId) {
        try {
            const response = await api.get(`/admin/users/${userId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async updateUser(userId, data) {
        try {
            const response = await api.put(`/admin/users/${userId}`, data);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getPendingPayments() {
        try {
            const response = await api.get('/admin/payments/pending');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async approvePayment(paymentId) {
        try {
            // Backend uses PUT /admin/payments/{id}/confirm
            const response = await api.put(`/admin/payments/${paymentId}/confirm`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async rejectPayment(paymentId, reason) {
        try {
            // Backend uses PUT /admin/payments/{id}/reject
            const response = await api.put(`/admin/payments/${paymentId}/reject`, { reason });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // ✅ Méthodes manquantes pour AdminPage
    async getListings(params = {}) {
        try {
            const response = await api.get('/admin/listings', { params });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async approveListing(listingId) {
        try {
            const response = await api.put(`/admin/listings/${listingId}/approve`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async deleteListing(listingId) {
        try {
            const response = await api.delete(`/admin/listings/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== PUSH NOTIFICATIONS ====================
export const pushNotificationService = {
    async subscribe(subscriptionData) {
        try {
            const response = await api.post('/push-subscriptions', subscriptionData);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async unsubscribe(id) {
        try {
            const response = await api.delete(`/push-subscriptions/${id}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async unsubscribeAll() {
        try {
            const response = await api.delete('/push-subscriptions');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getSubscriptions() {
        try {
            const response = await api.get('/push-subscriptions');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== STATISTICS ====================
export const statisticsService = {
    async getListingStats(listingId) {
        try {
            const response = await api.get(`/listings/${listingId}/stats`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMyListingStats() {
        try {
            const response = await api.get('/listings/my/stats');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== ADVANCED SEARCH ====================
export const searchService = {
    async advancedSearch(params) {
        try {
            const response = await api.get('/search', { params });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getSuggestions(query) {
        try {
            const response = await api.get('/search/suggestions', { params: { q: query } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getPopularSearches() {
        try {
            const response = await api.get('/search/popular');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getCategories() {
        try {
            const response = await api.get('/search/categories');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getCities(country) {
        try {
            const response = await api.get('/search/cities', { params: { country } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== VERIFICATION ====================
export const verificationService = {
    async getStatus() {
        try {
            const response = await api.get('/verification/status');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getRequiredDocuments(category) {
        try {
            const response = await api.get(`/verification/required-documents/${category}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async submit(category, files) {
        try {
            const formData = new FormData();
            formData.append('category', category);
            Object.entries(files).forEach(([key, file]) => {
                if (file) formData.append(key, file);
            });
            const response = await api.post('/verification/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Admin endpoints
    async adminGetRequests(status = 'pending') {
        try {
            const response = await api.get('/verification/admin/requests', { params: { status } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async adminGetDocuments(requestId) {
        try {
            const response = await api.get(`/verification/admin/requests/${requestId}/documents`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async adminApprove(requestId) {
        try {
            const response = await api.post(`/verification/admin/requests/${requestId}/approve`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async adminReject(requestId, reason) {
        try {
            const response = await api.post(`/verification/admin/requests/${requestId}/reject`, { reason });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async adminCertifyManual(userId) {
        try {
            const response = await api.post(`/verification/admin/certify-manual/${userId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async adminRevoke(userId, reason) {
        try {
            const response = await api.post(`/verification/admin/revoke/${userId}`, { reason });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// Export Axios instance for custom requests
export { api };

// ==================== CAUTION SÉCURISÉE (ESCROW) ====================
export const secureDepositService = {
    // Helper interne pour uniformiser la gestion d'erreurs (BUG-020)
    async _call(fn) {
        try { return await fn(); }
        catch (e) { return { success: false, error: e.response?.data?.error || e.message }; }
    },

    async list() { return this._call(() => api.get('/secure-deposits').then(r => r.data)); },
    async get(id) { return this._call(() => api.get(`/secure-deposits/${id}`).then(r => r.data)); },
    async create(data) { return this._call(() => api.post('/secure-deposits', data).then(r => r.data)); },
    async signLandlord(id) { return this._call(() => api.post(`/secure-deposits/${id}/sign-landlord`).then(r => r.data)); },
    async signAdmin(id) { return this._call(() => api.post(`/secure-deposits/${id}/sign-admin`).then(r => r.data)); },
    async confirmPayment(id, data = {}) { return this._call(() => api.post(`/secure-deposits/${id}/confirm`, data).then(r => r.data)); },
    async requestTermination(id) { return this._call(() => api.post(`/secure-deposits/${id}/request-termination`).then(r => r.data)); },
    async adminReview(id) { return this._call(() => api.post(`/secure-deposits/${id}/admin-review`).then(r => r.data)); },
    async landlordInspect(id, data = {}) { return this._call(() => api.post(`/secure-deposits/${id}/landlord-inspect`, data).then(r => r.data)); },
    async tenantExitSign(id) { return this._call(() => api.post(`/secure-deposits/${id}/tenant-exit-sign`).then(r => r.data)); },
    async adminFinalSign(id) { return this._call(() => api.post(`/secure-deposits/${id}/admin-final-sign`).then(r => r.data)); },
    async processRefund(id, data = {}) { return this._call(() => api.post(`/secure-deposits/${id}/process-refund`, data).then(r => r.data)); },
    async cancel(id) { return this._call(() => api.post(`/secure-deposits/${id}/cancel`).then(r => r.data)); },
    async openDispute(id, data) { return this._call(() => api.post(`/secure-deposits/${id}/dispute`, data).then(r => r.data)); },
    async respondToDispute(id, data) { return this._call(() => api.post(`/secure-deposits/${id}/dispute-respond`, data).then(r => r.data)); },
    async releaseFunds(id, data) { return this._call(() => api.post(`/secure-deposits/${id}/release`, data).then(r => r.data)); },
    async setPayoutMethods(id, data) { return this._call(() => api.post(`/secure-deposits/${id}/payout-methods`, data).then(r => r.data)); },
    async getCertificate(id) { return this._call(() => api.get(`/secure-deposits/${id}/certificate`).then(r => r.data)); },
    async adminStats() { return this._call(() => api.get('/secure-deposits/admin/stats').then(r => r.data)); },
};

// ==================== CONTRACT SERVICE ====================
/**
 * Service de contractualisation PlanB.
 * Machine à états : draft → tenant_signed → owner_signed → locked
 * Paiement : Kkiapay (confirmation côté client + webhook backend)
 */
export const contractService = {
    /** Génère un contrat pour une réservation */
    async generate(bookingId, templateType = 'furnished_rental') {
        try {
            const response = await api.post('/contracts/generate', { booking_id: bookingId, template_type: templateType });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Récupère le contrat par réservation */
    async getByBooking(bookingId) {
        try {
            const response = await api.get(`/contracts/booking/${bookingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Récupère un contrat par ID */
    async get(contractId) {
        try {
            const response = await api.get(`/contracts/${contractId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Téléverse un PDF (propriétaire) */
    async uploadPdf(contractId, file) {
        try {
            const form = new FormData();
            form.append('pdf', file);
            const response = await api.post(`/contracts/${contractId}/upload-pdf`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Locataire signe en PREMIER */
    async signTenant(contractId, signatureUrl) {
        try {
            const response = await api.post(`/contracts/${contractId}/sign-tenant`, { signature_url: signatureUrl });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Propriétaire signe en SECOND (déclenche le verrouillage) */
    async signOwner(contractId, signatureUrl) {
        try {
            const response = await api.post(`/contracts/${contractId}/sign-owner`, { signature_url: signatureUrl });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Propriétaire saisit les montants (loyer + caution × mois) */
    async setPayment(contractId, rent, deposit, months) {
        try {
            const response = await api.post(`/contracts/${contractId}/set-payment`, { rent, deposit, months });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Confirme le paiement Kkiapay (après succès widget côté client) */
    async confirmPayment(contractId, transactionId) {
        try {
            const response = await api.post(`/contracts/${contractId}/confirm-payment`, { transaction_id: transactionId });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Récupère la clé publique Kkiapay (pour le widget frontend) */
    async getKkiapayConfig() {
        try {
            const response = await api.get('/contracts/kkiapay-config');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Locataire demande la restitution de caution */
    async requestRestitution(contractId) {
        try {
            const response = await api.post(`/contracts/${contractId}/request-restitution`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /**
     * Propriétaire traite la restitution
     * @param {string} decision 'full' | 'partial' | 'refused'
     */
    async processRestitution(contractId, decision, retainedAmount = null, notes = null) {
        try {
            const response = await api.post(`/contracts/${contractId}/process-restitution`, {
                decision,
                retained_amount: retainedAmount,
                notes,
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Récupère le journal d'audit immuable du contrat */
    async getAuditLog(contractId) {
        try {
            const response = await api.get(`/contracts/${contractId}/audit-log`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    /** Valide la restitution finale (admin ou propriétaire) */
    async completeRestitution(contractId) {
        try {
            const response = await api.post(`/contracts/${contractId}/complete-restitution`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

export default {
    auth: authService,
    payment: paymentService,
    listing: listingService,
    upload: uploadService,
    review: reviewService,
    notification: notificationService,
    favorite: favoriteService,
    message: messageService,
    booking: bookingService,
    contact: contactService,
    virtualTour: virtualTourService,
    visitSlot: visitSlotService,
    admin: adminService,
    pushNotification: pushNotificationService,
    statistics: statisticsService,
    search: searchService,
    secureDeposit: secureDepositService,
    contract: contractService,
};

