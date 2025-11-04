// context/AuthProvider.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useRouter();
    
    const publicRoutes = ['/', '/login', '/signup', '/about'];
    const appRoles = ['employer','worker','both'];

    const logout = async () => {
        await supabase.auth.signOut();
    };

    // Initialize session
    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getSession();
            const sessionUser = data?.session?.user;

            if (!sessionUser) {
                setAuthLoading(false);
                router.replace('/login');
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', sessionUser.id)
                .single();

            if (error) console.error(error);
            else if (!profile) {
                await supabase
                    .from('profiles')
                    .insert([{ id: sessionUser.id, username: sessionUser.email.split('@')[0] }]);
            }
            setUser({ ...sessionUser, role: profile?.role });
            setAuthLoading(false);
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => listener.subscription.unsubscribe();
    }, []);
    
    
    useEffect(() => {
        if (authLoading) return;
        if (!user?.role) {
            router.replace('/login');
        }
    }, [authLoading, user]);
    
    
    useEffect(() => {
        const onPageLoad = async () => {
            // Wait until auth settles
            if (authLoading) return;
            // We don't care about auth on public routes
            if (publicRoutes.includes(router.pathname)) return;
            // On protected routes, we must have a valid role
            if (true || !appRoles.includes(user?.role)) {
                // Look up the role
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (error) console.error(error);
                if (user?.role !== profile?.role) {
                    //alert('overwriting role: ' + user?.role + ' with ' + profile?.role);    
                    setUser({ ...user, role: profile?.role });
                }
            }
        };
        onPageLoad();
    }, [authLoading, router]);

    return (
        <AuthContext.Provider value={{ user, authLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

