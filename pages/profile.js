import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { getProfile, getLocations } from '../lib/utils';
import EmployerProfile from '../components/EmployerProfile';
import WorkerProfile from '../components/WorkerProfile';
import ProtectedRoute from '../components/ProtectedRoute';
import Spinner from '../components/Spinner';
import AvatarUploader from '../components/AvatarUploader';

export default function Profile() {
    const { user, authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [locations, setLocations] = useState([]);
    const [ready, setReady] = useState(false);
    const [role, setRoleState] = useState(user?.role ?? null);
    
    const [defaultRate, setDefaultRate] = useState('');
    
    useEffect(() => {
        setRoleState(user?.role ?? null);
    }, [user]);
    
    function setRole(s) {
        const validRoles = ['worker', 'employer', 'both'];
        if (!user || !validRoles.includes(s)) return;
        setRoleState(s); // triggers re-render
    }

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;
        
        // Immediately invoke the async function to load the profile
        (async () => {
            try {
                const prof = await getProfile(user.id, user);
                setProfile(prof);
            } catch (err) {
                console.error('Error loading employer data:', err);
            } finally {
                setReady(true);
                setRoleState(user?.role ?? null); // sync local role when user changes
            }
        })();
    }, [authLoading, user]);
    
    useEffect(() => {
        if (!user || authLoading) return;
        (async () => {
            try {
                // start the UI skeleton/preview
                const locs = await getLocations(user.id);
                setLocations(locs || []);
            } catch (err) {
                console.error('Error loading employer data:', err);
            } finally {
                // Make it so the UI skeleton/preview stops
            }
        })();
    }, [profile]);

    if (!ready || !user) {
        return <Spinner fullscreen color="secondary"/>;
    }
    
    let roleSpecific = "";

    // Show component depending on user role
    if (role === 'employer') {
        roleSpecific = (
            <EmployerProfile
                user={user}
                authLoading={authLoading}
                profile={profile}
                locations={locations}
                setLocations={setLocations}
            />
        );
    }

    else if (role === 'worker') {
        roleSpecific = (
            <WorkerProfile
                user={user} 
                authLoading={authLoading} 
            />
        );
    }

    // No role yet → role selection UI
    return (
        <ProtectedRoute allowedRoles={['employer','worker','both','authenticated']}>
            <div className="container text-center" style={{ maxWidth: '800px' }}>
            
                <section className="profile-section profile-section-general py-3">
                    <h2>Profile</h2>
                    <AvatarUploader user={user} profile={profile} onChange={ (url) => setProfile({...profile, avatar_url: url}) } />
                    <div className="row mb-3 justify-content-center align-items-center">
                        <label htmlFor="defaultRate" className="col-auto col-form-label">
                            Default Rate ($/h)
                        </label>
                        <div className="col-auto">
                            <input
                                type="number"
                                step="0.50"
                                min="3.0"
                                className="form-control"
                                id="defaultRate"
                                value={defaultRate}
                                onChange={(e) => setDefaultRate(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </section>
                
                <section className="profile-section profile-section-rolechoice text-center py-3">
                    <h4>Select Your Role</h4>
                    <p>Choose Worker if you want to do jobs, or Employer if you want to post jobs.</p>
                    <div className="d-flex justify-content-center gap-4 mt-4">
                        <button
                            className="role-choice btn btn-primary btn-lg d-flex flex-column align-items-center"
                            onClick={() => setRole('worker')}
                        >
                            <i className="bi bi-person-workspace" style={{ fontSize: '2rem' }}></i>
                            Worker
                        </button>
                        <button
                            className="role-choice btn btn-secondary text-dark border-dark btn-lg d-flex flex-column align-items-center"
                            onClick={() => setRole('employer')}
                        >
                            <i className="bi bi-building" style={{ fontSize: '2rem' }}></i>
                            Employer
                        </button>
                    </div>
                </section>
                
                { roleSpecific ? <section className="profile-section profile-section-rolespecific py-3">{roleSpecific}</section> : "" }
                
            </div>
        </ProtectedRoute>
    );

}

