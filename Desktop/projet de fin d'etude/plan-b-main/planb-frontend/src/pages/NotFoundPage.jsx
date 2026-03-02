import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-8xl font-bold text-orange-500 mb-4">404</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
                <p className="text-gray-500 mb-8">
                    La page que vous cherchez n'existe pas ou a été déplacée.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Accueil
                    </Link>
                    <Link
                        to="/annonces"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        Voir les annonces
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;
