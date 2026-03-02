import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * InstallPrompt - Bannière d'installation PWA
 * S'affiche quand le navigateur détecte que l'app est installable.
 * Gère aussi iOS (Safari) avec des instructions manuelles.
 */
function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Vérifier si déjà installée
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
            return;
        }

        // Vérifier si l'utilisateur a déjà refusé récemment (24h)
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
            return;
        }

        // Détecter iOS (Safari n'a pas beforeinstallprompt)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isIOS && isSafari) {
            // Afficher après 30s sur iOS
            const timer = setTimeout(() => setShowIOSInstructions(true), 30000);
            return () => clearTimeout(timer);
        }

        // Écouter l'événement beforeinstallprompt (Chrome, Edge, Samsung Internet)
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Afficher la bannière après 20s de navigation
            setTimeout(() => setShowBanner(true), 20000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Détecter si l'app est installée après le prompt
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowBanner(false);
            setDeferredPrompt(null);
            console.log('[PWA] Application installée !');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('[PWA] Installation acceptée');
        } else {
            console.log('[PWA] Installation refusée');
            localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        }

        setDeferredPrompt(null);
        setShowBanner(false);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        setShowIOSInstructions(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (isInstalled) return null;

    // ── Bannière Android/Desktop (Chrome, Edge) ────────────
    if (showBanner && deferredPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-slide-up sm:left-auto sm:right-4 sm:w-96">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-4">
                    {/* Icône */}
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-white" />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm">
                            Installer Plan B
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Accédez plus vite à vos annonces depuis votre écran d'accueil
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                                Installer
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors"
                            >
                                Plus tard
                            </button>
                        </div>
                    </div>

                    {/* Fermer */}
                    <button
                        onClick={handleDismiss}
                        className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // ── Instructions iOS (Safari) ──────────────────────────
    if (showIOSInstructions) {
        return (
            <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-slide-up sm:left-auto sm:right-4 sm:w-96">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-sm">
                                Installer Plan B
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Appuyez sur{' '}
                                <span className="inline-flex items-center">
                                    <svg className="w-4 h-4 inline text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </span>
                                {' '}puis <strong>« Sur l'écran d'accueil »</strong>
                            </p>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default InstallPrompt;
