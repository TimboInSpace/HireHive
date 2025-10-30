// components/ProtectedRoute.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthProvider';

/**
 * @param {React.ReactNode} children
 * @param {Array<string>} allowedRoles - e.g. ['employer', 'both']
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, authLoading } = useAuth();
    const router = useRouter();
    const [ mounted, setMounted ] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!authLoading) {
            if (!user) {
                // Not logged in at all
                router.push('/login');
            } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                // Logged in but role not allowed
                router.push('/'); // Or an "Unauthorized" page
            }
        }
    }, [mounted, user, authLoading, allowedRoles, router]);

    // Show a spinner while checking session or redirecting
    if (authLoading || !user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
        return <div>Loading...</div>;
    }

    return children;
}

