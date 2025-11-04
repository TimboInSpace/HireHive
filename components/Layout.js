// components/Layout.js
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import PostJobModal from './PostJobModal';
import ProtectedRoute from './ProtectedRoute';

export default function Layout({ children }) {
    
    // Get the user (the user ID) and the logout function from the AuthContext
    const { user, authLoading, logout } = useAuth();

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
                <div className="container-fluid">
                    <Link href="/job-board" className="navbar-brand fw-bold text-primary">
                        🐝 HireHive
                    </Link>
                    <div className="d-flex align-items-center ms-auto">
                        <span className="small info" style={{paddingRight:"1rem"}}>[{user?.role || "No role"}]</span>
                        {user ? (
                            <>
                                <Link
                                    href="/profile"
                                    className="btn btn-outline-secondary me-2 d-flex align-items-center"
                                >
                                    <i className="bi bi-person-circle me-1"></i> Profile
                                </Link>
                                <button
                                    onClick={logout}
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
                
                <ProtectedRoute allowedRoles={['employer','both']}>
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
               </ProtectedRoute>
            </main>
        </>
    );
}

