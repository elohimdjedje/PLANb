// ForgotPasswordPage - Mot de passe oublié
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email) {
            setError('Veuillez entrer votre adresse email');
            setLoading(false);
            return;
        }

        try {
            const { authService } = await import('../services/api.js');
            const result = await authService.forgotPassword(email);

            if (result.ok) {
                setSuccess(true);
                toast.success('Email envoyé ! Vérifiez votre boîte de réception.');
            } else {
                setError(result.data?.error || 'Erreur lors de l\'envoi de l\'email');
                toast.error(result.data?.error || 'Erreur lors de l\'envoi de l\'email');
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
                        Email envoyé ! ✅
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        Si l'adresse <strong>{email}</strong> existe dans notre système, 
                        vous recevrez un email avec un code de réinitialisation.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Astuce :</strong> Vérifiez aussi votre dossier spam/courrier indésirable.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/reset-password', { state: { email } })}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
                        >
                            J'ai reçu le code
                        </button>
                        
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setEmail('');
                            }}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                        >
                            Renvoyer l'email
                        </button>
                    </div>

                    <Link 
                        to="/login" 
                        className="mt-6 inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la connexion
                    </Link>
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
                        <Mail className="w-8 h-8 text-orange-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Mot de passe oublié ?
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Entrez votre adresse email et nous vous enverrons un code de réinitialisation
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                autoFocus
                            />
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
                                Envoi en cours...
                            </>
                        ) : (
                            'Envoyer le code de réinitialisation'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <Link to="/login" className="text-orange-500 font-medium hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
