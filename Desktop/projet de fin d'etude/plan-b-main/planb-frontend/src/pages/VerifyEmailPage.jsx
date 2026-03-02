import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api.js';

function VerifyEmailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!token) {
                setError('Lien de vérification invalide (token manquant).');
                setLoading(false);
                return;
            }

            try {
                const result = await authService.verifyEmail(token);

                if (cancelled) return;

                if (!result.ok) {
                    setError(result.data?.error || result.data?.message || 'Échec de la vérification de l’email.');
                    setLoading(false);
                    return;
                }

                const data = result.data;

                if (data?.['2fa_required'] && data?.['2fa_token']) {
                    sessionStorage.setItem('twoFactorToken', data['2fa_token']);
                    sessionStorage.setItem('twoFactorExpiresIn', String(data.expires_in || 300));
                    sessionStorage.setItem('twoFactorNextPage', '/home');
                    if (data.dev_otp) {
                        sessionStorage.setItem('twoFactorDevOtp', data.dev_otp);
                    }

                    navigate('/verify-2fa', {
                        state: {
                            twoFactorToken: data['2fa_token'],
                            expiresIn: data.expires_in || 300,
                            nextPage: '/home',
                        },
                    });
                    return;
                }

                // Fallback: email vérifié mais pas de 2FA retourné
                setLoading(false);
            } catch (e) {
                if (cancelled) return;
                setError('Erreur de connexion au serveur.');
                setLoading(false);
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-gray-900 text-center">Vérification de l’email</h1>

                {loading && (
                    <div className="mt-6 text-center">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-600">Vérification en cours…</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="mt-6">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm whitespace-pre-line">
                            {error}
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/login" className="text-orange-500 font-medium hover:underline">Retour à la connexion</Link>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-700">
                            Email vérifié. Vous pouvez maintenant vous connecter.
                        </p>
                        <div className="mt-4">
                            <Link to="/login" className="text-orange-500 font-medium hover:underline">Aller à la connexion</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmailPage;
