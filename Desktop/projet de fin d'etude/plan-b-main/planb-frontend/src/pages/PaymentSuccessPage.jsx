// PaymentSuccessPage - Page de confirmation de paiement réussi
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Home, Receipt, ArrowRight } from 'lucide-react';

function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    
    const orderId = searchParams.get('order_id');
    const paymentId = searchParams.get('payment_id');
    const isSubscription = searchParams.get('subscription') === 'true';
    const months = searchParams.get('months');

    useEffect(() => {
        // Simuler un délai de chargement pour confirmer le paiement
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Confirmation du paiement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Paiement réussi !
                </h1>

                {/* Message selon le type de paiement */}
                {isSubscription ? (
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                            Votre abonnement PRO de {months || 1} mois a été activé avec succès.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <p className="text-orange-700 font-medium">
                                🎉 Vous êtes maintenant un membre PRO !
                            </p>
                            <p className="text-sm text-orange-600 mt-1">
                                Profitez de vos avantages exclusifs.
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600 mb-6">
                        Votre paiement a été traité avec succès. 
                        {orderId && ` Référence: #${orderId}`}
                        {paymentId && ` Paiement: #${paymentId}`}
                    </p>
                )}

                {/* Receipt Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Receipt className="w-5 h-5" />
                        <span className="text-sm">
                            Un reçu a été envoyé à votre adresse email
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link 
                        to="/"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Retour à l'accueil
                    </Link>
                    
                    {isSubscription && (
                        <Link 
                            to="/profile"
                            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Voir mes annonces
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    )}
                    
                    {paymentId && (
                        <Link 
                            to="/payments"
                            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Voir mes paiements
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccessPage;
