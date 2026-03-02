// MessagesPage - Conversations list and chat
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, ArrowLeft, Search, RefreshCw, AlertCircle, Check, CheckCheck, Clock } from 'lucide-react';
import { messageService, authService } from '../services/api';
import { useSocket } from '../hooks/useSocket'; // Import du hook socket

function MessagesPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { socket, isConnected, lastMessage, joinConversation, leaveConversation, sendTyping } = useSocket();

    // Refs stables pour éviter les re-rendus infinis dus à isConnected (BUG-023)
    const joinConvRef  = useRef(joinConversation);
    const leaveConvRef = useRef(leaveConversation);
    useEffect(() => { joinConvRef.current  = joinConversation; }, [joinConversation]);
    useEffect(() => { leaveConvRef.current = leaveConversation; }, [leaveConversation]);

    // États
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    // Initialisation user
    useEffect(() => {
        const user = authService.getUser();
        if (user) setCurrentUser(user);
    }, []);

    // Scroll automatique vers le bas
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Charger les conversations
    const fetchConversations = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            console.debug('[Messages] Fetching conversations for user:', currentUser?.email || 'unknown');
            const result = await messageService.getConversations();
            if (result.ok) {
                // Backend renvoie { conversations: [...] } ou { data: [...] }
                const convs = result.data.conversations || result.data.data || result.data || [];
                const convArray = Array.isArray(convs) ? convs : [];
                console.debug('[Messages] Loaded', convArray.length, 'conversations');
                setConversations(convArray);

                // Gestion paramètre URL (conversationId)
                const urlConvId = searchParams.get('conversationId');
                if (urlConvId) {
                    const allConvs = result.data.conversations || result.data.data || [];
                    const targetConv = allConvs.find(c => c.id === parseInt(urlConvId));
                    if (targetConv) {
                        setSelectedConversation(targetConv);
                    } else {
                        console.warn('[Messages] Conversation', urlConvId, 'not found in list - refreshing');
                        // Conversation might have just been created; retry once after brief delay
                        setTimeout(async () => {
                            try {
                                const retry = await messageService.getConversations();
                                if (retry.ok) {
                                    const retryConvs = retry.data.conversations || retry.data.data || [];
                                    const retryArray = Array.isArray(retryConvs) ? retryConvs : [];
                                    setConversations(retryArray);
                                    const found = retryArray.find(c => c.id === parseInt(urlConvId));
                                    if (found) setSelectedConversation(found);
                                }
                            } catch (e) { /* ignore retry error */ }
                        }, 1000);
                    }
                }
            } else {
                const errorMsg = result.data?.error || result.data?.message || 'Erreur lors du chargement';
                console.error('[Messages] API error:', result.data);
                setLoadError(errorMsg);
            }
        } catch (error) {
            console.error('[Messages] Network error:', error);
            setLoadError('Erreur réseau. Vérifiez votre connexion.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [searchParams]);

    // 2. Charger les messages quand une conversation est sélectionnée
    useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            try {
                const result = await messageService.getMessages(selectedConversation.id);
                if (result.ok) {
                    // Backend renvoie { messages: [...] } ou { data: [...] }
                    setMessages(result.data.messages || result.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        joinConvRef.current(selectedConversation.id); // Rejoindre la room socket

        return () => {
            leaveConvRef.current(selectedConversation.id); // Quitter la room
        };
    }, [selectedConversation]);

    // 3. Écouter les nouveaux messages socket
    useEffect(() => {
        if (lastMessage && selectedConversation && lastMessage.conversationId == selectedConversation.id) {
            // Ajouter le message seulement s'il n'existe pas déjà (déduplication basique)
            setMessages(prev => {
                // Si le message vient de moi (envoyé via API), il est peut-être déjà là via l'état local optimiste
                // Mais ici on reçoit le message broadcasté par le serveur
                const exists = prev.some(m => m.id === lastMessage.message.id);
                if (exists) return prev;
                return [...prev, lastMessage.message];
            });
        }

        // Mettre à jour la liste des conversations (dernier message)
        if (lastMessage) {
            setConversations(prev => prev.map(conv => {
                if (conv.id == lastMessage.conversationId) {
                    return {
                        ...conv,
                        lastMessage: { content: lastMessage.message?.content || lastMessage.message, createdAt: new Date().toISOString() },
                        lastMessageAt: new Date().toISOString()
                    };
                }
                return conv;
            }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))); // Trier par date
        }
    }, [lastMessage, selectedConversation]);

    // Envoi de message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const tempMessage = {
            id: Date.now(), // ID temporaire
            content: newMessage,
            sender: currentUser,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        // UI Optimiste
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        try {
            const result = await messageService.sendMessage(selectedConversation.id, tempMessage.content);
            if (!result.ok) {
                // Rollback en cas d'erreur
                console.error('Failed to send message:', result);
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
                alert("Erreur lors de l'envoi");
            } else {
                // Remplacer message optimiste par le vrai retour serveur si nécessaire
                // Le socket fera le reste pour la synchro
            }
        } catch (error) {
            console.error('Network error sending message:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                    <div className="flex h-full">
                        {/* Conversations List */}
                        <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            <div className="p-4 border-b border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : conversations.length > 0 ? (
                                    conversations.map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv)}
                                            className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${selectedConversation?.id === conv.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                                                    {conv.otherUser?.profilePicture ? (
                                                        <img src={conv.otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        (conv.otherUser?.fullName || conv.otherUser?.firstName || 'U').charAt(0)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {conv.otherUser?.fullName || `${conv.otherUser?.firstName || ''} ${conv.otherUser?.lastName || ''}`.trim() || 'Utilisateur'}
                                                        </p>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {conv.lastMessageAt && (
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                            {conv.unreadCount > 0 && (
                                                                <span className="min-w-[20px] h-5 px-1.5 bg-orange-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                                                                    {conv.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {/* Indicateur lu/non lu sur le dernier message si envoyé par moi */}
                                                        {conv.lastMessage && typeof conv.lastMessage === 'object' && conv.lastMessage.isFromMe && (
                                                            conv.lastMessage.isRead !== false ? (
                                                                <CheckCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                                            ) : (
                                                                <Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                            )
                                                        )}
                                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                                            {typeof conv.lastMessage === 'object' ? conv.lastMessage?.content : conv.lastMessage || 'Nouvelle conversation'}
                                                        </p>
                                                    </div>
                                                    {/* Badge Listing */}
                                                    {conv.listing && (
                                                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            🏠 {conv.listing.title}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : loadError ? (
                                    <div className="text-center py-12 px-4">
                                        <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                                        <p className="text-red-500 font-medium">Erreur de chargement</p>
                                        <p className="text-sm text-gray-500 mt-1 mb-4">{loadError}</p>
                                        <button
                                            onClick={fetchConversations}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Réessayer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 px-4">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">Aucune conversation</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {currentUser ? (
                                                <>Connecté en tant que <span className="font-medium text-gray-600">{currentUser.firstName || currentUser.email}</span>.<br /></>
                                            ) : null}
                                            Contactez un vendeur pour démarrer une discussion.
                                        </p>
                                        <button
                                            onClick={() => navigate('/annonces')}
                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                                        >
                                            <Search className="w-4 h-4" />
                                            Parcourir les annonces
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white shadow-sm z-10">
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="md:hidden p-2 -ml-2 text-gray-500"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>

                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                                            {selectedConversation.otherUser?.profilePicture ? (
                                                <img src={selectedConversation.otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (selectedConversation.otherUser?.fullName || selectedConversation.otherUser?.firstName || 'U').charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {selectedConversation.otherUser?.fullName || `${selectedConversation.otherUser?.firstName || ''} ${selectedConversation.otherUser?.lastName || ''}`.trim() || 'Utilisateur'}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                {isConnected ? (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> En ligne
                                                    </span>
                                                ) : (
                                                    <span>Hors ligne</span>
                                                )}
                                                {/* Afficher l'annonce contextuelle */}
                                                {selectedConversation.listing && (
                                                    <span className="border-l border-gray-300 pl-2">
                                                        Concernant : <b>{selectedConversation.listing.title}</b>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center py-10">
                                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <MessageSquare className="w-8 h-8 text-blue-500" />
                                                </div>
                                                <p className="text-gray-900 font-medium">Dites bonjour ! 👋</p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Posez vos questions sur l'annonce.
                                                </p>
                                            </div>
                                        ) : (
                                            messages.map((msg, index) => {
                                                // Le backend renvoie isFromMe (boolean) ou on compare sender.id
                                                const isMe = msg.isFromMe ?? msg.isOptimistic ?? (msg.sender?.id === currentUser?.id);
                                                return (
                                                    <div
                                                        key={msg.id || index}
                                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                                                    ? 'bg-orange-500 text-white rounded-tr-none'
                                                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                                }`}
                                                        >
                                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                                                                <span className="text-[10px]">
                                                                    {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {isMe && (
                                                                    msg.isOptimistic ? (
                                                                        <Clock className="w-3 h-3 text-orange-200" />
                                                                    ) : msg.isRead ? (
                                                                        <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                                                                    ) : (
                                                                        <Check className="w-3.5 h-3.5 text-orange-200" />
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <div className="flex gap-3 items-end">
                                            <div className="flex-1 relative">
                                                <textarea
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Écrivez un message..."
                                                    className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none max-h-32 min-h-[50px]"
                                                    rows="1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                                className={`p-3 rounded-xl flex items-center justify-center transition-colors ${newMessage.trim()
                                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-gray-50">
                                    <div className="text-center px-4">
                                        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
                                            <MessageSquare className="w-10 h-10 text-orange-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Vos Messages</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            Sélectionnez une conversation pour voir vos échanges avec les vendeurs et acheteurs.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessagesPage;
