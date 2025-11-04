import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import EmployerProfile from '../components/EmployerProfile';
import WorkerProfile from '../components/WorkerProfile';
import ProtectedRoute from '../components/ProtectedRoute';
import Spinner from '../components/Spinner';

export default function Profile() {
    const { user, authLoading } = useAuth();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) return; // user not logged in, could show login link later
        setReady(true);
    }, [authLoading, user]);

    if (!ready || !user) {
        return <Spinner fullscreen color="secondary"/>;
    }
    
    // Render, dependent on the role
    let ret;

    // Show component depending on user role
    if (user?.role === 'employer') {
        ret = (
            <ProtectedRoute allowedRoles={['employer', 'both']}>
                <EmployerProfile user={user} authLoading={authLoading} />
            </ProtectedRoute>
        );
    }

    else if (user?.role === 'worker') {
        ret = (
            <ProtectedRoute allowedRoles={['worker', 'both']}>
                <WorkerProfile user={user} authLoading={authLoading} />
            </ProtectedRoute>
        );
    }

    // No role yet → role selection UI
    else ret = (
        <ProtectedRoute allowedRoles={['employer','worker','both','authenticated']}>
            <div className="container py-5 text-center">
                <h2>Select Your Role</h2>
                <p>Choose Worker if you want to do jobs, or Employer if you want to post jobs.</p>
                <div className="d-flex justify-content-center gap-4 mt-4">
                    <button
                        className="btn btn-primary btn-lg d-flex flex-column align-items-center"
                        onClick={() => alert('Set role=worker and reload (not implemented yet)')}
                    >
                        <i className="bi bi-person-workspace" style={{ fontSize: '2rem' }}></i>
                        Worker
                    </button>
                    <button
                        className="btn btn-secondary btn-lg d-flex flex-column align-items-center"
                        onClick={() => alert('Set role=employer and reload (not implemented yet)')}
                    >
                        <i className="bi bi-building" style={{ fontSize: '2rem' }}></i>
                        Employer
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
    
    return ret;
}

