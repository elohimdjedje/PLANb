import { Outlet } from 'react-router-dom';

/**
 * LayoutMinimal - Layout épuré sans header/footer
 * Utilisé pour les pages d'authentification, de paiement, etc.
 */
function LayoutMinimal({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children || <Outlet />}
        </div>
    );
}

export default LayoutMinimal;
