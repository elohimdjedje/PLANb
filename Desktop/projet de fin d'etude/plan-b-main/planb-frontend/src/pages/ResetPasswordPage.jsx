// ResetPasswordPage - Réinitialisation du mot de passe
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import PasswordStrengthIndicator, { validatePassword } from '../components/PasswordStrengthIndicator';

function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Token opaque depuis l'URL (?token=xxx) ou email depuis le state (saisie manuelle)
    const [resetToken, setResetToken] = useState('');
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        
        if (tokenParam) {
            setResetToken(tokenParam);
            // Nettoyer l'URL pour ne pas exposer le token dans la barre d'adresse
            window.history.replaceState({}, '', '/reset-password');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!resetToken && !email) {
            setError('Veuillez entrer votre adresse email');
            return;
        }

        if (!resetToken && !code) {
            setError('Le code de réinitialisation est requis');
            return;
        }

        if (!password) {
            setError('Le nouveau mot de passe est requis');
            return;
        }

        if (!validatePassword(password)) {
            setError('Le mot de passe ne respecte pas les règles de sécurité (8+ caractères, majuscule, minuscule, chiffre, caractère spécial).');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            const { authService } = await import('../services/api.js');
            const result = await authService.resetPassword({ token: resetToken, email, code, password });

            if (result.ok) {
                setSuccess(true);
                toast.success('Mot de passe réinitialisé avec succès !');
                
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                const errMsg = result.data?.error || 'Erreur lors de la réinitialisation';
                setError(errMsg);
                toast.error(errMsg);
                if (result.data?.attempts_remaining !== undefined) {
                    setError(`${errMsg} (${result.data.attempts_remaining} tentative${result.data.attempts_remaining > 1 ? 's' : ''} restante${result.data.attempts_remaining > 1 ? 's' : ''})`);
                }
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
            toast.error('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Mot de passe réinitialisé ! ✅
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        Votre mot de passe a été modifié avec succès. 
                        Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                    </p>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Réinitialiser votre mot de passe
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {resetToken 
                            ? 'Entrez votre nouveau mot de passe'
                            : 'Entrez le code reçu par email et votre nouveau mot de passe'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Champ email : visible uniquement en saisie manuelle (pas de token dans l'URL) */}
                    {!resetToken && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Champ code : visible uniquement en saisie manuelle (pas de token) */}
                    {!resetToken && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Code de réinitialisation
                            </label>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-center text-2xl font-mono tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Code à 6 chiffres reçu par email
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nouveau mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                placeholder="••••••••"
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <PasswordStrengthIndicator password={password} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                placeholder="••••••••"
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Réinitialisation...
                            </>
                        ) : (
                            'Réinitialiser le mot de passe'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Vous n'avez pas reçu le code ?{' '}
                        <Link to="/forgot-password" className="text-orange-500 font-medium hover:underline">
                            Renvoyer l'email
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
