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
        setAuthLoading(true);
        await supabase.auth.signOut();
        router.replace('/login');
        setAuthLoading(false);
    };
    
    
    // TO-DO: make sure this gets called on every login? 
    // ?!? Maybe it should go in the supabase.auth.onAuthStateChange handler ?!?
    // 
    const lookupProfile = async (userId) => {
            let userProfile;
            // Attempt to look up the profile
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) console.error(error);
            else if (profile) {
                userProfile = profile;
            }
            else {
                // Insert the profile
                const { data: insertedProfile, error: insertError} = await supabase
                    .from('profiles')
                    .insert([{ id: sessionUser.id, username: sessionUser.email.split('@')[0] }])
                    .select('*');
                    
                if (insertError) { 
                    console.error(error); 
                    return null;
                } else if (!insertedProfile) {
                    console.error(`New profile was created without error, but was not returned by the query?`);
                    return null;
                }
                userProfile = insertedProfile;
            }
            return userProfile;
    }

    // Initialize session
    useEffect(() => {
        const init = async () => {

            const { data } = await supabase.auth.getSession();
            const sessionUser = data?.session?.user;

            if (!sessionUser) {
                setAuthLoading(false);
                return;
            }
            const prof = await lookupProfile(sessionUser.id);
            setUser({ ...sessionUser, role: prof?.role });
            setAuthLoading(false);
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session?.user || null);
                (async () => {
                    const prof = await lookupProfile(session.user.id);
                    setUser({ ...session.user, role: prof?.role || null });
                })();
            } else {
                setUser(null);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);
    
    /*
    useEffect(() => {
        if (authLoading) return;
        if (!user?.role) {
            console.log(`redirecting to login because there is no user role!`);
            router.replace('/login');
        }
    }, [authLoading, user]);
    */
    
    
    useEffect(() => {
        const onPageLoad = async () => {
        
            // Wait until auth settles
            if (authLoading) return;
            
            // We don't care about auth on public routes
            if (publicRoutes.includes(router.pathname)) return;
            console.log(`router.pathname was ${router.pathname}`);
            
            // This is a protected route. If the user is null, return to login.
            if (!user || !user?.id) {
                console.log(`redirecting because there is no user id, and we're on a protected route`);
                router.replace('/login');
            }
            
            // On protected routes, we must have a valid role
            if (user?.id && !appRoles.includes(user?.role)) {
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

