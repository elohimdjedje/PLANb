// Terms Page - Conditions d'utilisation
function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Conditions d'utilisation</h1>
                    <p className="text-white/90 text-lg">Dernière mise à jour : Janvier 2026</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
                        <p className="text-gray-600 leading-relaxed">
                            En accédant et en utilisant la plateforme PlanB, vous acceptez d'être lié par les présentes conditions d'utilisation. 
                            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description du service</h2>
                        <p className="text-gray-600 leading-relaxed">
                            PlanB est une plateforme de petites annonces permettant aux utilisateurs de publier, rechercher et 
                            consulter des annonces dans différentes catégories : immobilier, véhicules, locations de vacances, etc.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Inscription et compte</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Pour publier des annonces, vous devez créer un compte. Vous êtes responsable de la confidentialité 
                            de vos identifiants et de toutes les activités effectuées sous votre compte.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Règles de publication</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Les utilisateurs s'engagent à :
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Publier des annonces honnêtes et exactes</li>
                            <li>Ne pas publier de contenu illégal, offensant ou frauduleux</li>
                            <li>Respecter les droits de propriété intellectuelle</li>
                            <li>Ne pas utiliser la plateforme à des fins de spam ou de harcèlement</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Responsabilité</h2>
                        <p className="text-gray-600 leading-relaxed">
                            PlanB agit en tant qu'intermédiaire et n'est pas partie aux transactions entre utilisateurs. 
                            Nous ne garantissons pas la qualité, la sécurité ou la légalité des articles annoncés, 
                            ni la capacité des vendeurs à vendre ou des acheteurs à acheter.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Propriété intellectuelle</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Tous les contenus de la plateforme (logos, textes, images, code) sont la propriété de PlanB 
                            ou de ses partenaires et sont protégés par les lois sur la propriété intellectuelle.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Protection des données</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Vos données personnelles sont traitées conformément à notre politique de confidentialité. 
                            Nous nous engageons à protéger vos informations et à les utiliser uniquement dans le cadre 
                            de nos services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Modifications</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Nous nous réservons le droit de modifier ces conditions à tout moment. 
                            Les modifications entrent en vigueur dès leur publication sur la plateforme.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Contact</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Pour toute question concernant ces conditions, veuillez nous contacter à : 
                            <a href="mailto:legal@planb-africa.com" className="text-orange-500 hover:underline ml-1">legal@planb-africa.com</a>
                        </p>
                    </section>
                </div>
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

export default TermsPage;
