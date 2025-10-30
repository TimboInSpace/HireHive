// pages/profile/worker.js
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthProvider';

export default function WorkerProfile() {
    const router = useRouter();
    const [tools, setTools] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, authLoading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const user = supabase.auth.getSession().then(({ data }) => data.session?.user);

        const { error } = await supabase.from('profiles').upsert({
            id: (await user).id,
            role: 'worker',
            tools: tools.trim(),
            specialties: specialties.trim(),
        });

        setLoading(false);
        if (error) alert(error.message);
        
        router.push('/'); // Redirect to main job board
    };

    return (
        <div className="container py-5">
            <h2>Worker Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Tools Available</label>
                    <input
                        type="text"
                        className="form-control"
                        value={tools}
                        onChange={(e) => setTools(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Specialties</label>
                    <input
                        type="text"
                        className="form-control"
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
}

