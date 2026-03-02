// PaymentCancelPage - Page d'annulation de paiement
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { X, Home, RefreshCw, ArrowLeft } from 'lucide-react';

function PaymentCancelPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const orderId = searchParams.get('order_id');
    const paymentId = searchParams.get('payment_id');
    const isSubscription = searchParams.get('subscription') === 'true';

    const handleRetry = () => {
        if (isSubscription) {
            navigate('/upgrade');
        } else if (paymentId) {
            navigate('/payments');
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* Cancel Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <X className="w-10 h-10 text-red-500" strokeWidth={3} />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Paiement annulé
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-6">
                    {isSubscription 
                        ? "Votre paiement d'abonnement PRO a été annulé."
                        : "Votre paiement a été annulé. Aucun montant n'a été débité."
                    }
                </p>

                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <p className="text-yellow-700 text-sm">
                        💡 Vous pouvez réessayer le paiement à tout moment.
                        {isSubscription && " L'abonnement PRO vous donne accès à des fonctionnalités exclusives."}
                    </p>
                </div>

                {/* Reference */}
                {(orderId || paymentId) && (
                    <p className="text-sm text-gray-500 mb-6">
                        Référence: {orderId ? `#${orderId}` : `#${paymentId}`}
                    </p>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button 
                        onClick={handleRetry}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Réessayer le paiement
                    </button>
                    
                    <Link 
                        to="/"
                        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Retour à l'accueil
                    </Link>

                    <button 
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retour en arrière
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentCancelPage;
