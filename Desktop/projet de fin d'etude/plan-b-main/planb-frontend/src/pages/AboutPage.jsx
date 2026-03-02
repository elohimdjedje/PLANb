import { Shield, Users } from 'lucide-react';

// Sparkles icon placeholder (not in lucide-react standard)
const Sparkles = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
    </svg>
);

// About Page - Qui sommes-nous
function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Qui sommes-nous ?</h1>
                    <p className="text-white/90 text-lg">Découvrez l'histoire de PlanB, la première plateforme de petites annonces pour l'Afrique</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Mission */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        PlanB est née d'une vision simple : créer la plateforme de référence pour les petites annonces en Afrique. 
                        Nous croyons que chaque personne mérite un accès facile et sécurisé pour acheter, vendre ou louer des biens et services.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Notre objectif est de connecter les vendeurs et acheteurs à travers tout le continent africain, 
                        en offrant une expérience utilisateur moderne, intuitive et adaptée aux réalités locales.
                    </p>
                </section>

                {/* Values */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos Valeurs</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Confiance</h3>
                            <p className="text-gray-600 text-sm">Nous vérifions les annonces et les utilisateurs pour garantir des transactions sécurisées.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Communauté</h3>
                            <p className="text-gray-600 text-sm">Nous construisons une communauté active et engagée à travers l'Afrique.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                            <p className="text-gray-600 text-sm">Nous innovons constamment pour offrir les meilleures fonctionnalités à nos utilisateurs.</p>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-8">PlanB en chiffres</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-3xl font-bold text-orange-500">10K+</p>
                            <p className="text-gray-400 text-sm">Utilisateurs actifs</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-orange-500">5K+</p>
                            <p className="text-gray-400 text-sm">Annonces publiées</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-orange-500">15+</p>
                            <p className="text-gray-400 text-sm">Pays couverts</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-orange-500">98%</p>
                            <p className="text-gray-400 text-sm">Satisfaction client</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-16">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center text-gray-500 text-sm">
                        © 2026 PlanB. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default AboutPage;
