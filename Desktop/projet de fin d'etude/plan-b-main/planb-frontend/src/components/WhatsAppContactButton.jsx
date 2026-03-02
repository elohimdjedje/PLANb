import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { contactService } from '../services/api';

function WhatsAppContactButton({ className = '', message = null }) {
    const [whatsappLink, setWhatsappLink] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWhatsAppLink = async () => {
            try {
                const defaultMessage = message || 'Bonjour, j\'aimerais contacter l\'équipe Plan B';
                const result = await contactService.getWhatsAppLink(defaultMessage);
                if (result.ok) {
                    setWhatsappLink(result.data.whatsappLink);
                }
            } catch (error) {
                console.error('Error fetching WhatsApp link:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWhatsAppLink();
    }, [message]);

    const handleClick = () => {
        if (whatsappLink) {
            window.open(whatsappLink, '_blank');
        }
    };

    if (isLoading) {
        return (
            <button
                disabled
                className={`flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed ${className}`}
            >
                <MessageCircle className="w-5 h-5" />
                <span>Chargement...</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors ${className}`}
        >
            <MessageCircle className="w-5 h-5" />
            <span>Contacter via WhatsApp</span>
        </button>
    );
}

export default WhatsAppContactButton;
