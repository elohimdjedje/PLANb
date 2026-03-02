import { useState } from 'react';
import { X, Bell, Bookmark } from 'lucide-react';

// Save Search Modal
function SaveSearchModal({ isOpen, onClose, searchQuery }) {
    const [searchName, setSearchName] = useState('');
    const [notifications, setNotifications] = useState(true);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!searchName.trim()) return;
        try {
            const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
            savedSearches.push({
                id: Date.now(),
                name: searchName.trim(),
                query: searchQuery,
                notifications,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        } catch (e) {
            console.error('Error saving search:', e);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sauvegarder cette recherche</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la recherche *
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Appartements à Dakar"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">Critères de recherche :</p>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-medium text-gray-900">Notifications</p>
                                <p className="text-sm text-gray-500">Être averti des nouvelles annonces</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-7 rounded-full transition-colors ${notifications ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Bookmark className="w-4 h-4" />
                        Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SaveSearchModal;
