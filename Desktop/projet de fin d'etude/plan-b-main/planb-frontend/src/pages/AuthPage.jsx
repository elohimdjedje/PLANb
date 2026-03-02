// AuthPage - Login/Register
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import PhoneInput from '../components/PhoneInput';
import PasswordStrengthIndicator, { validatePassword } from '../components/PasswordStrengthIndicator';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const CAPTCHA_ENABLED = !!RECAPTCHA_SITE_KEY;

function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const nextPageRaw = searchParams.get('next') || '/home';
    // Sécuriser le paramètre next contre les redirections ouvertes
    const nextPage = nextPageRaw.startsWith('/') && !nextPageRaw.startsWith('//') ? nextPageRaw : '/home';
    const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const recaptchaRef = useRef(null);
    // En mode dev (pas de clé reCAPTCHA configurée), bypass automatique
    const [captchaToken, setCaptchaToken] = useState(CAPTCHA_ENABLED ? null : 'dev-bypass');
    // État pour le cas "email non vérifié"
    const [emailNotVerified, setEmailNotVerified] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [verificationUrl, setVerificationUrl] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
    });

    useEffect(() => {
        setMode(location.pathname === '/register' ? 'register' : 'login');
        setError('');
        setInfo('');
        setEmailNotVerified(false);
        setUnverifiedEmail('');
        setVerificationUrl('');
    }, [location.pathname]);

    const handleResendVerification = async () => {
        if (!unverifiedEmail) return;
        setResendLoading(true);
        setError('');
        try {
            const { authService } = await import('../services/api.js');
            const result = await authService.resendVerificationEmail(unverifiedEmail);
            if (result.ok) {
                setEmailNotVerified(false);
                setInfo('Email de vérification renvoyé. Consultez votre boîte mail.');
            } else {
                setError(result.data?.message || result.data?.error || "Erreur lors de l'envoi de l'email de vérification.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        } finally {
            setResendLoading(false);
        }
    };

    // Mémoriser le handler pour le téléphone pour éviter les re-renders
    const handlePhoneChange = useCallback((value) => {
        setFormData(prev => ({ ...prev, phone: value }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInfo('');

        try {
            const { authService } = await import('../services/api.js');

            if (mode === 'login') {
                const result = await authService.login(formData.email.trim(), formData.password);
                if (result.ok) {
                    // Si le backend demande une vérification 2FA
                    if (result.twoFactorRequired) {
                        // Persister dans sessionStorage pour survie d'un refresh
                        sessionStorage.setItem('twoFactorToken', result.data['2fa_token']);
                        sessionStorage.setItem('twoFactorExpiresIn', String(result.data.expires_in || 300));
                        sessionStorage.setItem('twoFactorNextPage', nextPage);
                        if (result.data.dev_otp) {
                            sessionStorage.setItem('twoFactorDevOtp', result.data.dev_otp);
                        }
                        navigate('/verify-2fa', {
                            state: {
                                twoFactorToken: result.data['2fa_token'],
                                expiresIn: result.data.expires_in || 300,
                                nextPage: nextPage,
                            },
                        });
                        return;
                    }
                    window.dispatchEvent(new Event('authChange'));
                    navigate(nextPage);
                } else {
                    if (result.emailNotVerified) {
                        setEmailNotVerified(true);
                        setUnverifiedEmail(result.email || formData.email.trim());
                    } else {
                        setError(result.data?.message || result.data?.error || 'Email ou mot de passe incorrect');
                    }
                }
            } else {
                // Validation de la force du mot de passe côté client
                if (!validatePassword(formData.password)) {
                    setError('Le mot de passe ne respecte pas les règles de sécurité.');
                    setLoading(false);
                    return;
                }
                // Vérifier le reCAPTCHA (seulement si la clé est configurée)
                if (CAPTCHA_ENABLED && !captchaToken) {
                    setError('Veuillez cocher la case "Je ne suis pas un robot".');
                    setLoading(false);
                    return;
                }
                // Préparer les données pour l\'inscription
                const registerData = {
                    email: formData.email.trim(),
                    password: formData.password,
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    captchaToken: captchaToken,
                };

                // Ajouter le téléphone seulement s'il est fourni et valide
                if (formData.phone && formData.phone.trim()) {
                    registerData.phone = formData.phone.trim();
                }

                const result = await authService.register(registerData);
                if (result.ok) {
                    localStorage.setItem('isNewUser', 'true');
                    // URL de vérification fournie par le backend en mode DEV
                    if (result.data?.verificationUrl) {
                        setVerificationUrl(result.data.verificationUrl);
                    }
                    setInfo(
                        result.data?.message ||
                        'Inscription réussie. Vérifiez votre email : après vérification, vous recevrez un code OTP à saisir pour accéder à votre compte.'
                    );

                    // Nettoyer le mot de passe local
                    setFormData(prev => ({ ...prev, password: '' }));

                    // Réinitialiser le reCAPTCHA (seulement si activé)
                    if (CAPTCHA_ENABLED && recaptchaRef.current) {
                        recaptchaRef.current.reset();
                        setCaptchaToken(null);
                    }
                } else {
                    // Afficher les erreurs détaillées du backend
                    let errorMessage = result.data?.error || result.data?.message || 'Erreur lors de l\'inscription';
                    const errorDetails = result.data?.details;

                    // Vérifier si c'est une erreur de duplication d'email
                    if (errorMessage.includes('déjà utilisé') || errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
                        errorMessage = 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.';
                    }

                    if (errorDetails && typeof errorDetails === 'object') {
                        // Si on a des détails de validation, les formater de manière lisible
                        const detailsArray = [];
                        Object.entries(errorDetails).forEach(([field, messages]) => {
                            const fieldName = field === 'email' ? 'Email' :
                                field === 'password' ? 'Mot de passe' :
                                    field === 'firstName' ? 'Prénom' :
                                        field === 'lastName' ? 'Nom' : field;
                            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
                            detailsArray.push(`${fieldName}: ${msg}`);
                        });

                        if (detailsArray.length > 0) {
                            setError(`${errorMessage}\n\n${detailsArray.join('\n')}`);
                        } else {
                            setError(errorMessage);
                        }
                    } else {
                        setError(errorMessage);
                    }
                    // Réinitialiser le reCAPTCHA en cas d'erreur (seulement si activé)
                    if (CAPTCHA_ENABLED && recaptchaRef.current) {
                        recaptchaRef.current.reset();
                        setCaptchaToken(null);
                    }
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            console.error('Error details:', err.response?.data);
            // Afficher le message d'erreur du serveur si disponible
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Erreur de connexion au serveur. Vérifiez votre connexion internet et que le serveur backend est démarré.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <Link to="/home" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Retour à l'accueil
                </Link>

                <div className="text-center mb-12">
                    <img src="/logofinal.png" alt="PlanB" className="h-40 mx-auto mb-8" style={{ width: 'auto', objectFit: 'contain' }} />
                    <h1 className="text-2xl font-bold text-gray-900">
                        {mode === 'login' ? 'Connexion' : 'Créer un compte'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {mode === 'login'
                            ? 'Connectez-vous pour accéder à votre compte'
                            : 'Rejoignez la communauté PlanB'
                        }
                    </p>
                    {/* Pro banner when coming from landing 'Passer au Pro' */}
                    {nextPage === '/upgrade' && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl text-sm font-medium">
                            ⭐ Vous serez redirigé vers le plan Pro après inscription
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                            placeholder="Jean"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                        placeholder="Dupont"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="00 00 00 00 00"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                placeholder="votre@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {mode === 'register' && (
                            <PasswordStrengthIndicator password={formData.password} />
                        )}
                    </div>

                    {mode === 'register' && CAPTCHA_ENABLED && (
                        <div className="flex justify-center">
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={RECAPTCHA_SITE_KEY}
                                onChange={(token) => setCaptchaToken(token)}
                                onExpired={() => setCaptchaToken(null)}
                                hl="fr"
                            />
                        </div>
                    )}

                    {emailNotVerified && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                            <p className="font-semibold mb-1">Email non vérifié</p>
                            <p className="mb-3">
                                L'adresse <strong>{unverifiedEmail}</strong> n'est pas encore vérifiée.
                                Consultez votre boîte mail ou renvoyez le lien.
                            </p>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resendLoading}
                                className="text-sm font-semibold underline text-orange-600 hover:text-orange-800 disabled:opacity-60"
                            >
                                {resendLoading ? 'Envoi…' : 'Renvoyer l\'email de vérification'}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm whitespace-pre-line">
                            {error}
                        </div>
                    )}

                    {info && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm whitespace-pre-line">
                            {info}
                            {verificationUrl && (
                                <a
                                    href={verificationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-2 underline font-semibold text-green-800"
                                >
                                    ✉ Cliquez ici pour vérifier votre email (lien dev)
                                </a>
                            )}
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
                                {mode === 'login' ? 'Connexion...' : 'Inscription...'}
                            </>
                        ) : (
                            mode === 'login' ? 'Se connecter' : 'Créer mon compte'
                        )}
                    </button>
                </form>

                <div className="mt-6 space-y-2 text-center">
                    {mode === 'login' && (
                        <Link
                            to="/forgot-password"
                            className="block text-sm text-orange-500 font-medium hover:underline"
                        >
                            Mot de passe oublié ?
                        </Link>
                    )}
                    {mode === 'login' ? (
                        <p className="text-gray-600">
                            Pas encore de compte ?{' '}
                            <button
                                onClick={() => navigate(`/register${nextPage !== '/home' ? `?next=${nextPage}` : ''}`)}
                                className="text-orange-500 font-medium hover:underline"
                            >
                                Inscrivez-vous
                            </button>
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            Déjà un compte ?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-orange-500 font-medium hover:underline"
                            >
                                Connectez-vous
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
