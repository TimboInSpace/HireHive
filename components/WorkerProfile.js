// components/WorkerProfile.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getProfile } from '../lib/utils';
import LocationInput from './LocationInput';

export default function WorkerProfile({ user, authLoading }) {
    const [profile, setProfile] = useState(null);
    const [tools, setTools] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState(null);
    const [valid, setValid] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user || authLoading) return;
        (async () => {
            try {
                const prof = await getProfile(user.id);
                setProfile(prof || null);
                setTools(prof?.tools || '');
                setSpecialties(prof?.specialties || '');

                const { data: loc, error } = await supabase
                    .from('employer_locations')
                    .select('*')
                    .eq('owner', user.id)
                    .maybeSingle();

                if (error) throw error;

                if (loc) {
                    setLocation(loc.address);
                    setCoords({
                        lat: loc.lat,
                        lon: loc.lon,
                        display_name: loc.address,
                    });
                    setValid(true);
                    setLastUpdate(new Date(loc.updated_at));
                }
            } catch (err) {
                console.error('Error loading worker data:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await supabase.from('profiles').update({ tools, specialties }).eq('id', user.id);

            if (coords && valid) {
                const now = new Date();
                const canUpdate =
                    !lastUpdate ||
                    (now - new Date(lastUpdate)) / (1000 * 60 * 60 * 24) >= 1;

                if (!canUpdate) {
                    alert('You can only change your location once per day.');
                    setSaving(false);
                    return;
                }

                await supabase.from('employer_locations').delete().eq('owner', user.id);

                const { error: insertErr } = await supabase
                    .from('employer_locations')
                    .insert([
                        {
                            owner: user.id,
                            address: coords.display_name,
                            geo: `POINT(${coords.lon} ${coords.lat})`,
                            updated_at: now.toISOString(),
                        },
                    ]);

                if (insertErr) throw insertErr;
                setLastUpdate(now);
            }

            alert('Profile updated!');
        } catch (err) {
            console.error('Error saving worker profile:', err);
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Worker Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Tools</label>
                    <textarea
                        className="form-control"
                        value={tools}
                        onChange={(e) => setTools(e.target.value)}
                        placeholder="List your tools..."
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Specialties</label>
                    <textarea
                        className="form-control"
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        placeholder="Describe your specialties..."
                        required
                    />
                </div>

                <LocationInput
                    label="Work Location"
                    value={location}
                    onChange={setLocation}
                    onValidLocation={(coordsObj) => {
                        setCoords(coordsObj);
                        setValid(!!coordsObj);
                    }}
                    disabled={saving}
                />

                <button
                    type="submit"
                    className="btn btn-secondary text-dark mt-3"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
}

