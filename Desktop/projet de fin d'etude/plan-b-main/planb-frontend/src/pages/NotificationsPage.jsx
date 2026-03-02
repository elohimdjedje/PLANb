// NotificationsPage - User notifications
import { useState, useEffect } from 'react';
import { Bell, Heart, MessageSquare, Star, Check, Trash2 } from 'lucide-react';

function NotificationsPage() {
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { notificationService } = await import('../services/api.js');
                const result = await notificationService.getAll();
                if (result.ok) {
                    setNotifications(result.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const { notificationService } = await import('../services/api.js');
            await notificationService.markAsRead(id);
        } catch (e) { /* ignore */ }
        setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
    };

    const markAllAsRead = async () => {
        try {
            const { notificationService } = await import('../services/api.js');
            await notificationService.markAllAsRead();
        } catch (e) { /* ignore */ }
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'favorite': return <Heart className="w-5 h-5 text-red-500" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'review': return <Star className="w-5 h-5 text-yellow-500" />;
            default: return <Bell className="w-5 h-5 text-orange-500" />;
        }
    };

    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(n => filter === 'unread' ? !n.read : n.read);

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <button 
                        onClick={markAllAsRead}
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                        Tout marquer comme lu
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['all', 'unread', 'read'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === f 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-500'
                            }`}
                        >
                            {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : 'Lues'}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notification => (
                            <div 
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 flex items-start gap-4 ${
                                    !notification.read ? 'bg-orange-50' : ''
                                }`}
                            >
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-900">{notification.message}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <button 
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-gray-400 hover:text-green-500"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Aucune notification</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NotificationsPage;
