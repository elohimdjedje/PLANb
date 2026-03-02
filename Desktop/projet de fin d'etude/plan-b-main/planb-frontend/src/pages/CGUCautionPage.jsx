// CGUCautionPage - Conditions Générales d'Utilisation — Caution Sécurisée
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CGUCautionPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>

                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Conditions Générales d&apos;Utilisation
                        </h1>
                        <h2 className="text-lg text-orange-600 font-semibold mt-1">
                            Service de Caution Sécurisée — PlanB
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 1 — Objet</h3>
                            <p>
                                Le service de <strong>Caution Sécurisée</strong> proposé par la plateforme PlanB permet le séquestre temporaire
                                d&apos;un dépôt de garantie dans le cadre d&apos;une location immobilière ou de véhicule entre un bailleur
                                et un locataire. PlanB agit en tant qu&apos;intermédiaire technologique facilitant la sécurisation des fonds.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 2 — Rôle de PlanB</h3>
                            <p>
                                PlanB <strong>ne détient jamais directement les fonds</strong>. Les sommes versées au titre de la caution
                                sont séquestrées par un prestataire de paiement agréé (PayTech, KKiaPay ou tout autre prestataire
                                intégré à la plateforme). PlanB intervient uniquement comme facilitateur technologique pour :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>La collecte sécurisée du dépôt de garantie</li>
                                <li>La génération du certificat de caution électronique</li>
                                <li>La gestion du cycle de vie de la caution (activation, fin de location, litige, remboursement)</li>
                                <li>Le déclenchement des remboursements ou libérations de fonds via le prestataire de paiement</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 3 — Commission</h3>
                            <p>
                                PlanB prélève une commission de <strong>5% (cinq pour cent)</strong> du montant de la caution au moment
                                du paiement initial par le locataire. Cette commission est non remboursable et couvre les frais de
                                gestion, de sécurisation et de traitement de la transaction.
                            </p>
                            <p>
                                <strong>Exemple :</strong> Pour une caution de 200 000 FCFA, la commission est de 10 000 FCFA.
                                Le locataire paie 210 000 FCFA au total. 200 000 FCFA sont séquestrés, 10 000 FCFA sont conservés
                                par PlanB au titre de sa commission.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 4 — Certificat de caution</h3>
                            <p>
                                Un certificat de caution au format PDF est généré automatiquement après le paiement. Ce certificat
                                contient :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>L&apos;identité des parties (bailleur et locataire)</li>
                                <li>La description du bien concerné</li>
                                <li>Le montant de la caution, la commission et le montant séquestré</li>
                                <li>Le moyen de paiement utilisé et l&apos;identifiant de transaction</li>
                                <li>Les conditions de restitution</li>
                                <li>Les signatures électroniques des deux parties</li>
                            </ul>
                            <p>
                                Le certificat prend effet après signature électronique des deux parties (bailleur et locataire).
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 5 — Conditions de restitution</h3>
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-4">
                                <h4 className="font-semibold text-green-800 mb-2">Règle des 72 heures — Remboursement intégral</h4>
                                <p className="text-sm text-green-700">
                                    À la fin de la période de location, le bailleur dispose d&apos;un délai de <strong>72 heures</strong> pour
                                    signaler d&apos;éventuels dommages. Si aucun dommage n&apos;est signalé dans ce délai, la caution est
                                    <strong> automatiquement et intégralement remboursée</strong> au locataire.
                                </p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                <h4 className="font-semibold text-orange-800 mb-2">Règle des 7 jours — Litige non résolu</h4>
                                <p className="text-sm text-orange-700">
                                    En cas de litige signalé par le bailleur, le locataire dispose de <strong>7 jours</strong> pour
                                    accepter ou refuser la retenue proposée. Si le litige n&apos;est pas résolu dans ce délai (refus
                                    ou absence de réponse), la caution est <strong>automatiquement remboursée intégralement</strong> au
                                    locataire.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 6 — Procédure de litige</h3>
                            <p>En cas de dommages constatés, le bailleur peut ouvrir un litige en fournissant :</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Une description détaillée des dommages constatés</li>
                                <li>Le coût estimé des réparations</li>
                                <li>Des photographies des dommages (optionnel mais recommandé)</li>
                                <li>Un devis de réparation (optionnel)</li>
                            </ul>
                            <p className="mt-3">Le locataire peut alors :</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Accepter</strong> la retenue : les fonds sont répartis entre le bailleur (montant des dommages) et le locataire (solde restant)</li>
                                <li><strong>Refuser</strong> la retenue : le délai de 7 jours continue de courir. À expiration, remboursement automatique intégral au locataire</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 7 — Moyens de paiement acceptés</h3>
                            <p>Le service de Caution Sécurisée accepte les moyens de paiement suivants :</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>🟠 Orange Money</li>
                                <li>🟡 MTN Mobile Money</li>
                                <li>🔵 Moov Money</li>
                                <li>🌊 Wave</li>
                                <li>💳 Carte bancaire (Visa, Mastercard)</li>
                            </ul>
                            <p className="mt-3">
                                Les remboursements sont effectués via le même canal de paiement utilisé lors du dépôt initial,
                                ou via un autre moyen de paiement Mobile Money choisi par le bénéficiaire.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 8 — Protection des données</h3>
                            <p>
                                Les données personnelles collectées dans le cadre du service de Caution Sécurisée (identité,
                                numéro de pièce d&apos;identité, coordonnées de paiement) sont traitées conformément à notre
                                politique de confidentialité et aux réglementations en vigueur en matière de protection des
                                données personnelles applicables dans les pays d&apos;opération (Côte d&apos;Ivoire, Bénin, Sénégal,
                                Mali, Burkina Faso, Guinée).
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 9 — Responsabilité</h3>
                            <p>
                                PlanB agit en qualité d&apos;intermédiaire technologique. La plateforme ne peut être tenue responsable :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Des litiges entre bailleurs et locataires concernant l&apos;état des biens loués</li>
                                <li>Des retards de traitement imputables aux prestataires de paiement</li>
                                <li>De l&apos;exactitude des informations fournies par les utilisateurs</li>
                                <li>Des dommages indirects liés à l&apos;utilisation du service</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 10 — Droit applicable</h3>
                            <p>
                                Les présentes conditions sont régies par le droit applicable dans le pays de résidence du locataire
                                au moment de la transaction. En cas de litige, les parties s&apos;engagent à rechercher une solution
                                amiable avant toute action judiciaire.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 11 — Modifications</h3>
                            <p>
                                PlanB se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs
                                seront informés des modifications par notification dans l&apos;application. L&apos;utilisation continue
                                du service après modification vaut acceptation des nouvelles conditions.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-gray-900">Article 12 — Contact</h3>
                            <p>
                                Pour toute question relative au service de Caution Sécurisée, vous pouvez nous contacter :
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Par email : <a href="mailto:support@planb.africa" className="text-orange-600 hover:underline">support@planb.africa</a></li>
                                <li>Via la page <a href="/contact" className="text-orange-600 hover:underline">Contact</a> de l&apos;application</li>
                            </ul>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} PlanB — Tous droits réservés
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CGUCautionPage;
