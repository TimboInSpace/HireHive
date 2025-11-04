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

    if (authLoading) return;
    if (!user) return null;
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return null;

    return children;
}

