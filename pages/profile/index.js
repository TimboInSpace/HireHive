import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthProvider';

export default function Profile() {
    const router = useRouter();
    const { user, authLoading } = useAuth();
    const [ready, setReady] = useState(false);
    const [mounted, setMounted] = useState(false);

/*
    // mark component as mounted (client-only)
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || authLoading) return;

        if (!user) {
            router.push('/login');
        } else if (user.role === 'worker') {
            router.push('/profile/worker');
        } else if (user.role === 'employer') {
            router.push('/profile/employer');
        } else {
            setReady(true); // no role yet, show selection
        }
    }, [mounted, authLoading, user, router]);
    */

    const selectRole = (role) => {
        if (role === 'worker') router.push('/profile/worker');
        else if (role === 'employer') router.push('/profile/employer');
    };

    return (
        <div className="container py-5 text-center">
            <h2>Select Your Role</h2>
            <p>Choose Worker if you want to do jobs, or Employer if you want to post jobs.</p>
            <div className="d-flex justify-content-center gap-4 mt-4">
                <button
                    className="btn btn-primary btn-lg d-flex flex-column align-items-center"
                    onClick={() => selectRole('worker')}
                >
                    <i className="bi bi-person-workspace" style={{ fontSize: '2rem' }}></i>
                    Worker
                </button>
                <button
                    className="btn btn-secondary btn-lg d-flex flex-column align-items-center"
                    onClick={() => selectRole('employer')}
                >
                    <i className="bi bi-building" style={{ fontSize: '2rem' }}></i>
                    Employer
                </button>
            </div>
        </div>
    );
}

