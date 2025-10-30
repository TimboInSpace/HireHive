// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getSession();
            const sessionUser = data?.session?.user;

            if (!sessionUser) {
                router.push('/login');
                setAuthLoading(false);
                return;
            }

            // Load or create profile
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

        // Listen for auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => listener.subscription.unsubscribe();
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, setUser, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

