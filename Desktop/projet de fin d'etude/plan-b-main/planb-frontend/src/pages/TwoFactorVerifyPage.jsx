// TwoFactorVerifyPage - Vérification du code OTP 2FA
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

function TwoFactorVerifyPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state || {};
    const persistedTwoFactorToken = sessionStorage.getItem('twoFactorToken');
    const persistedExpiresIn = sessionStorage.getItem('twoFactorExpiresIn');
    const persistedNextPage = sessionStorage.getItem('twoFactorNextPage');

    const twoFactorToken = state.twoFactorToken || persistedTwoFactorToken;
    const expiresIn = state.expiresIn || (persistedExpiresIn ? Number(persistedExpiresIn) : undefined);
    const nextPage = state.nextPage || persistedNextPage || '/home';
    const devOtp = sessionStorage.getItem('twoFactorDevOtp') || null;

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attemptsRemaining, setAttemptsRemaining] = useState(null);
    const [timeLeft, setTimeLeft] = useState(expiresIn || 300);

    const inputRefs = useRef([]);

    // Rediriger si pas de token (accès direct sans login)
    useEffect(() => {
        if (!twoFactorToken) {
            navigate('/login');
        }
    }, [twoFactorToken, navigate]);

    // Persister le challenge 2FA pour survivre à un refresh de page
    useEffect(() => {
        if (!twoFactorToken) return;
        sessionStorage.setItem('twoFactorToken', twoFactorToken);
        sessionStorage.setItem('twoFactorExpiresIn', String(expiresIn || 300));
        sessionStorage.setItem('twoFactorNextPage', nextPage || '/home');
    }, [twoFactorToken, expiresIn, nextPage]);

    // Décompte du temps restant
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Focus automatique sur le premier input
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        // Accepter uniquement les chiffres
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus sur le champ suivant
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit quand les 6 chiffres sont remplis
        if (value && index === 5 && newCode.every((d) => d !== '')) {
            handleSubmit(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const newCode = pasted.split('');
            setCode(newCode);
            inputRefs.current[5]?.focus();
            handleSubmit(pasted);
        }
    };

    const handleSubmit = async (fullCode) => {
        const codeStr = fullCode || code.join('');
        if (codeStr.length !== 6) {
            setError('Veuillez entrer les 6 chiffres du code.');
            return;
        }

        if (timeLeft <= 0) {
            setError('Le code a expiré. Veuillez vous reconnecter.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { authService } = await import('../services/api.js');
            const result = await authService.verify2FA(twoFactorToken, codeStr);

            if (result.ok) {
                sessionStorage.removeItem('twoFactorToken');
                sessionStorage.removeItem('twoFactorExpiresIn');
                sessionStorage.removeItem('twoFactorNextPage');
                sessionStorage.removeItem('twoFactorDevOtp');
                window.dispatchEvent(new Event('authChange'));
                navigate(nextPage || '/home');
            } else {
                const errorData = result.data;
                setError(errorData?.error || 'Code incorrect.');
                if (errorData?.attempts_remaining !== undefined) {
                    setAttemptsRemaining(errorData.attempts_remaining);
                }
                // Réinitialiser le code
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            console.error('2FA verify error:', err);
            setError('Erreur de connexion au serveur.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        setLoading(true);

        try {
            // Renvoyer le code = refaire un login (le backend recréera un OTP)
            setError('Pour recevoir un nouveau code, veuillez vous reconnecter.');
            setTimeout(() => navigate('/login'), 2000);
        } finally {
            setLoading(false);
        }
    };

    if (!twoFactorToken) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Vérification 2FA</h1>
                    <p className="text-gray-600 mt-2">
                        Un code de vérification a été envoyé par email.
                        <br />
                        Entrez-le ci-dessous.
                    </p>
                </div>

                {/* Timer */}
                <div className="text-center mb-6">
                    {timeLeft > 0 ? (
                        <span className="text-sm text-gray-500">
                            Code valide pendant{' '}
                            <span className={`font-bold ${timeLeft <= 60 ? 'text-red-500' : 'text-orange-500'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </span>
                    ) : (
                        <span className="text-sm text-red-500 font-medium">
                            Le code a expiré. Veuillez vous reconnecter.
                        </span>
                    )}
                </div>

                {/* OTP Input */}
                <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={loading || timeLeft <= 0}
                            className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                                ${digit ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
                                ${loading || timeLeft <= 0 ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'}
                            `}
                        />
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center mb-4">
                        {error}
                        {attemptsRemaining !== null && attemptsRemaining > 0 && (
                            <div className="mt-1 text-xs">
                                {attemptsRemaining} tentative{attemptsRemaining > 1 ? 's' : ''} restante{attemptsRemaining > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}

                {/* Submit button */}
                <button
                    onClick={() => handleSubmit()}
                    disabled={loading || code.some((d) => d === '') || timeLeft <= 0}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mb-4"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Vérification...
                        </>
                    ) : (
                        'Vérifier le code'
                    )}
                </button>

                {/* Resend */}
                <div className="text-center">
                    <button
                        onClick={handleResendCode}
                        disabled={loading}
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium inline-flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Renvoyer le code
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TwoFactorVerifyPage;
