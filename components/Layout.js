// components/Layout.js
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import PostJobModal from './PostJobModal';
import ProtectedRoute from './ProtectedRoute';

export default function Layout({ children }) {
    const router = useRouter();
    const { user, authLoading } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!user) return;

        const loadProfile = async () => {
            let profileData = null;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (error) throw error;
                profileData = data;
            } catch (err) {
                console.error(err);
            }

            if (!profileData) {
                const { data: inserted, error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ id: user.id, username: user.email.split('@')[0] }])
                    .select();
                if (insertError) throw insertError;
                profileData = inserted[0];
            }

            setProfile(profileData);

        };

        loadProfile();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session?.user) {
                setProfile(null);
            }
        });

        return () => listener.subscription.unsubscribe();
    }, [user, router]);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
                <div className="container-fluid">
                    <Link href="/" className="navbar-brand fw-bold text-primary">
                        HireHive
                    </Link>

                    <div className="d-flex align-items-center ms-auto">
                        {user ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="btn btn-outline-secondary me-2 d-flex align-items-center"
                                >
                                    <i className="bi bi-person-circle me-1"></i> Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-danger d-flex align-items-center"
                                >
                                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn btn-outline-primary me-2">
                                    Login
                                </Link>
                                <Link href="/signup" className="btn btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="container mt-4 position-relative">
            
                {children}
                
                
                    <button
                        type="button"
                        className="btn btn-primary rounded-circle shadow-lg position-fixed"
                        style={{
                            bottom: '30px',
                            right: '30px',
                            width: '60px',
                            height: '60px',
                            fontSize: '24px',
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#postJobModal"
                    >
                        <i className="bi bi-plus-lg"></i>
                    </button>

                    <PostJobModal />
               

            </main>
        </>
    );
}

