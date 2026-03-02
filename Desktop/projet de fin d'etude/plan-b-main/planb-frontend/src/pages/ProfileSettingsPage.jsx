// ProfileSettingsPage - User profile settings
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, Lock, Bell, Shield } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import PhoneInput from '../components/PhoneInput';

function ProfileSettingsPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        bio: '',
        profilePicture: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            city: user.city || '',
            country: user.country || 'Côte d\'Ivoire',
            bio: user.bio || ''
        });
    }, []);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('L\'image ne doit pas dépasser 5 Mo');
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image valide');
            return;
        }
        try {
            const { uploadService } = await import('../services/api.js');
            const result = await uploadService.uploadImages([file]);
            if (result.ok && result.data?.urls?.length > 0) {
                const url = result.data.urls[0];
                setFormData(prev => ({ ...prev, profilePicture: url }));
                setSuccess('Photo de profil mise à jour');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Erreur lors de l\'upload de la photo');
            }
        } catch (err) {
            setError('Erreur de connexion lors de l\'upload');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const { authService } = await import('../services/api.js');
            const result = await authService.updateProfile(formData);
            if (result.ok) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...user, ...formData }));
                setSuccess('Profil mis à jour avec succès');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.data?.message || 'Erreur lors de la mise à jour');
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validations
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError('Tous les champs sont requis');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        
        try {
            const { authService } = await import('../services/api.js');
            const result = await authService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );
            if (result.ok) {
                setSuccess('Mot de passe modifié avec succès');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.data?.error || result.data?.message || 'Erreur lors du changement de mot de passe');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const countries = ['Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée'];

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres du profil</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'profile', label: 'Profil', icon: User },
                        { id: 'security', label: 'Sécurité', icon: Lock },
                        { id: 'notifications', label: 'Notifications', icon: Bell }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === tab.id 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                                    {formData.firstName?.charAt(0) || 'U'}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                                >
                                    <Camera className="w-4 h-4 text-gray-600" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</h3>
                                <p className="text-gray-500">{formData.email}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={(value) => setFormData({...formData, phone: value})}
                                    placeholder="00 00 00 00 00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                                <select
                                    value={formData.country}
                                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                >
                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                rows={3}
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none"
                                placeholder="Parlez-nous de vous..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:bg-orange-300"
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Changer le mot de passe</h2>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:bg-orange-300"
                            >
                                {loading ? 'Modification...' : 'Modifier le mot de passe'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="bg-white rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Préférences de notifications</h2>
                        
                        {/* Push Notifications */}
                        <PushNotificationsSection />
                        
                        <div className="mt-8 space-y-4">
                            <h3 className="text-md font-semibold text-gray-900 mb-4">Types de notifications</h3>
                            {[
                                { id: 'messages', label: 'Nouveaux messages', desc: 'Recevoir une notification pour chaque nouveau message' },
                                { id: 'favorites', label: 'Favoris', desc: 'Être notifié des changements sur vos annonces favorites' },
                                { id: 'offers', label: 'Offres reçues', desc: 'Recevoir une notification pour les nouvelles offres' },
                                { id: 'newsletter', label: 'Newsletter', desc: 'Recevoir notre newsletter hebdomadaire' }
                            ].map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.label}</p>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <button className="w-12 h-7 bg-orange-500 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Push Notifications Section Component
function PushNotificationsSection() {
    const { isSupported, isSubscribed, error, subscribe, unsubscribe } = usePushNotifications();
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            if (isSubscribed) {
                await unsubscribe();
            } else {
                await subscribe();
            }
        } catch (err) {
            console.error('Error toggling push notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
                <p className="text-sm text-yellow-800">
                    Les notifications push ne sont pas supportées par votre navigateur.
                </p>
            </div>
        );
    }

    return (
        <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications push
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Recevez des notifications même quand l'application est fermée
                    </p>
                </div>
                <button
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isSubscribed
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    } disabled:opacity-50`}
                >
                    {isLoading ? 'Chargement...' : isSubscribed ? 'Désactiver' : 'Activer'}
                </button>
            </div>
            {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                </div>
            )}
            {isSubscribed && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600">
                    ✓ Notifications push activées
                </div>
            )}
        </div>
    );
}

export default ProfileSettingsPage;
