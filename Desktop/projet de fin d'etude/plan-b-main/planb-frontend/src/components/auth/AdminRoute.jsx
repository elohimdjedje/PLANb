/**
 * AdminRoute - Route guard for admin users
 * Redirects to /home if not admin, /login if not authenticated
 */
import { Navigate, useLocation } from 'react-router-dom';

function AdminRoute({ children }) {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user.roles?.includes('ROLE_ADMIN') && !user.isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default AdminRoute;
