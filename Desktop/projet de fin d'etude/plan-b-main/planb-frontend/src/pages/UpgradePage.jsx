// UpgradePage - Upgrade to PRO subscription
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Check, Camera, TrendingUp, Shield, Clock, Zap } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

function UpgradePage() {
    const navigate = useNavigate();
    const [selectedDuration, setSelectedDuration] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const prices = {
        1: 5000,
        3: 12000,
        6: 22000,
        12: 40000
    };

    const features = [
        { icon: Camera, text: 'Jusqu\'à 10 photos par annonce' },
        { icon: Zap, text: 'Annonces illimitées' },
        { icon: TrendingUp, text: 'Statistiques détaillées' },
        { icon: Star, text: 'Mise en avant sur la page d\'accueil' },
        { icon: Shield, text: 'Badge vendeur vérifié' },
        { icon: Clock, text: 'Annonces valides 90 jours' }
    ];

    const handlePayment = async (method) => {
        setLoading(true);
        try {
            const { paymentService } = await import('../services/api.js');
            
            // MTN et Moov passent par KKiaPay
            if (method === 'mtn_money' || method === 'moov_money') {
                // Créer le paiement côté backend pour obtenir la config KKiaPay
                const result = await paymentService.createSubscription(selectedDuration, method);
                
                if (!result.ok) {
                    const errorMsg = result.data?.error || 'Erreur lors du paiement';
                    alert('Erreur: ' + errorMsg);
                    setLoading(false);
                    return;
                }
                
                const kkConfig = result.data?.payment?.kkiapay_config || result.data?.kkiapay_config;
                const paymentId = result.data?.payment?.id;
                
                if (kkConfig) {
                    // Charger le SDK KKiaPay dynamiquement
                    if (!window.openKkiapayWidget) {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.kkiapay.me/k.js';
                        script.async = true;
                        await new Promise((resolve, reject) => {
                            script.onload = resolve;
                            script.onerror = reject;
                            document.head.appendChild(script);
                        });
                    }
                    
                    // Ouvrir le widget KKiaPay
                    window.openKkiapayWidget({
                        amount: kkConfig.amount || prices[selectedDuration],
                        position: 'center',
                        sandbox: kkConfig.sandbox ?? true,
                        key: kkConfig.publicKey,
                        name: kkConfig.name || '',
                        email: kkConfig.email || '',
                        phone: kkConfig.phone || '',
                        callback: '',
                        theme: '#FF6B00',
                        paymentMethods: method === 'mtn_money' ? ['momo'] : ['moov']
                    });
                    
                    // Écouter les événements KKiaPay
                    window.addEventListener('successKkiapay', async function onSuccess(e) {
                        window.removeEventListener('successKkiapay', onSuccess);
                        const transactionId = e.detail?.transactionId;
                        if (transactionId) {
                            const verifyResult = await paymentService.verifyKKiaPayTransaction(
                                transactionId, selectedDuration, 'subscription'
                            );
                            if (verifyResult.ok && verifyResult.data?.success) {
                                alert('Paiement réussi ! Votre compte PRO est activé.');
                                navigate('/settings');
                            } else {
                                alert('La vérification du paiement a échoué. Contactez le support.');
                            }
                        }
                        setLoading(false);
                    }, { once: true });
                    
                    window.addEventListener('failedKkiapay', function onFail() {
                        window.removeEventListener('failedKkiapay', onFail);
                        alert('Le paiement a échoué. Veuillez réessayer.');
                        setLoading(false);
                    }, { once: true });
                    
                    return; // Don't setLoading(false) here, KKiaPay events will handle it
                } else {
                    alert('Configuration KKiaPay non disponible. Veuillez réessayer.');
                    setLoading(false);
                    return;
                }
            }
            
            // Wave, Orange Money et Carte passent par PayTech
            let result;
            if (method === 'wave' || method === 'orange_money' || method === 'card') {
                result = await paymentService.createSubscription(selectedDuration, method);
            } else {
                result = await paymentService.createSubscription(selectedDuration, method);
            }
            
            if (result && result.ok) {
                const data = result.data;
                const paymentUrl = data.payment?.paymentUrl || data.payment?.payment_url || data.paymentUrl || data.payment_url || data.redirect_url;
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                } else if (data.success) {
                    alert('Paiement initié avec succès !');
                    navigate('/settings');
                } else {
                    alert('Paiement initié. Veuillez suivre les instructions.');
                }
            } else if (result) {
                const errorMsg = result.data?.error || result.data?.message || 'Erreur lors du paiement';
                if (errorMsg.includes('non activé') || errorMsg.includes('not enabled') || result.data?.enabled === false) {
                    alert('Le service de paiement n\'est pas encore configuré.\n\nContactez l\'administrateur pour activer les paiements.');
                } else if (errorMsg.includes('authentifié')) {
                    alert('Veuillez vous connecter pour effectuer un paiement.');
                    navigate('/login');
                } else {
                    alert('Erreur: ' + errorMsg);
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
                        <Star className="w-4 h-4 fill-current" />
                        COMPTE PRO
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Boostez vos ventes avec PlanB PRO
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Passez au niveau supérieur et profitez de fonctionnalités exclusives pour maximiser vos chances de vendre.
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-2 gap-4 mb-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-xl">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <feature.icon className="w-6 h-6 text-orange-500" />
                            </div>
                            <span className="font-medium text-gray-900">{feature.text}</span>
                        </div>
                    ))}
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-2xl p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Choisissez votre durée</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {Object.entries(prices).map(([months, price]) => (
                            <button
                                key={months}
                                onClick={() => setSelectedDuration(parseInt(months))}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    selectedDuration === parseInt(months)
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                }`}
                            >
                                <p className="text-2xl font-bold text-gray-900">{months}</p>
                                <p className="text-sm text-gray-500">mois</p>
                                <p className="text-lg font-bold text-orange-500 mt-2">{formatPrice(price)} FCFA</p>
                                {parseInt(months) > 1 && (
                                    <p className="text-xs text-green-600 mt-1">
                                        -{Math.round((1 - price / (5000 * parseInt(months))) * 100)}%
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                        Passer au PRO - {formatPrice(prices[selectedDuration])} FCFA
                    </button>
                </div>

                {/* Comparison */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-50 p-4 font-medium">
                        <div>Fonctionnalité</div>
                        <div className="text-center">FREE</div>
                        <div className="text-center text-orange-500">PRO</div>
                    </div>
                    {[
                        ['Photos par annonce', '3', '10'],
                        ['Nombre d\'annonces', '4', 'Illimité'],
                        ['Durée des annonces', '30 jours', '90 jours'],
                        ['Statistiques', '❌', '✅'],
                        ['Mise en avant', '❌', '✅'],
                        ['Badge vérifié', '❌', '✅']
                    ].map(([feature, free, pro], index) => (
                        <div key={index} className="grid grid-cols-3 p-4 border-t border-gray-100">
                            <div className="text-gray-700">{feature}</div>
                            <div className="text-center text-gray-500">{free}</div>
                            <div className="text-center font-medium">{pro}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowPaymentModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-md z-50">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Choisissez votre moyen de paiement</h3>
                        <p className="text-center text-gray-600 mb-4">
                            Montant: <span className="font-bold text-orange-500">{formatPrice(prices[selectedDuration])} FCFA</span>
                            {selectedDuration > 1 && (
                                <span className="text-green-600 text-sm ml-2">
                                    (-{Math.round((1 - prices[selectedDuration] / (5000 * selectedDuration)) * 100)}%)
                                </span>
                            )}
                        </p>
                        <div className="space-y-4">
                            {/* Wave */}
                            <button
                                onClick={() => handlePayment('wave')}
                                disabled={loading}
                                className="w-full py-4 px-6 bg-[#1DC3FF] hover:bg-[#19b0e8] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <img src="/images/wave.webp" alt="Wave" className="w-8 h-8 rounded-lg bg-white p-1" onError={(e) => e.target.style.display='none'} />
                                        <span>Payer avec Wave</span>
                                    </>
                                )}
                            </button>

                            {/* Orange Money */}
                            <button
                                onClick={() => handlePayment('orange_money')}
                                disabled={loading}
                                className="w-full py-4 px-6 bg-[#FF6600] hover:bg-[#e65c00] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <img src="/images/orange.webp" alt="Orange Money" className="w-8 h-8 rounded-lg bg-white p-1" onError={(e) => e.target.style.display='none'} />
                                        <span>Payer avec Orange Money</span>
                                    </>
                                )}
                            </button>

                            {/* MTN Mobile Money */}
                            <button
                                onClick={() => handlePayment('mtn_money')}
                                disabled={loading}
                                className="w-full py-4 px-6 bg-[#FFCC00] hover:bg-[#e6b800] text-gray-900 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <img src="/images/mtn.jpeg" alt="MTN" className="w-8 h-8 rounded-lg" onError={(e) => e.target.style.display='none'} />
                                        <span>Payer avec MTN MoMo</span>
                                    </>
                                )}
                            </button>

                            {/* Moov Money */}
                            <button
                                onClick={() => handlePayment('moov_money')}
                                disabled={loading}
                                className="w-full py-4 px-6 bg-[#0066B3] hover:bg-[#005a9e] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <img src="/images/moov.jpg" alt="Moov" className="w-8 h-8 rounded-lg bg-white p-1" onError={(e) => e.target.style.display='none'} />
                                        <span>Payer avec Moov Money</span>
                                    </>
                                )}
                            </button>

                            {/* Carte bancaire */}
                            <button
                                onClick={() => handlePayment('card')}
                                disabled={loading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <img src="/images/banque.webp" alt="Carte" className="w-8 h-8 rounded-lg bg-white p-1" onError={(e) => e.target.style.display='none'} />
                                        <span>Payer par Carte Bancaire</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="w-full mt-4 py-3 text-gray-600 hover:text-gray-900"
                        >
                            Annuler
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default UpgradePage;
