import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getProfile } from '../lib/utils';
import EmployerLocationsTable from './EmployerLocationsTable';

export default function EmployerProfile({ user, authLoading }) {
    const [profile, setProfile] = useState(null);
    const [defaultRate, setDefaultRate] = useState('');
    const [buildingType, setBuildingType] = useState('');
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Like an "onUnfocus" event handler, for the `location` field.
    const handleLocationBlur = async (address, setValid, setCoords) => {
        if (!address.trim()) return;
        try {
            const resp = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await resp.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setCoords({ lat, lon, display_name });
                setValid(true);
            } else {
                setCoords(null);
                setValid(false);
            }
        } catch (err) {
            console.error('Geocode error:', err);
            setCoords(null);
            setValid(false);
        }
    };

    useEffect(() => {
        if (!user || authLoading) return;
        (async () => {
            try {
                const prof = await getProfile(user.id);
                setProfile(prof);
                setDefaultRate(prof.default_rate || '');
                setBuildingType(prof.building_type || '');

                const { data: locs, error } = await supabase
                    .from('employer_locations')
                    .select('*')
                    .eq('owner', user.id);
                if (error) throw error;
                setLocations(locs || []);
            } catch (err) {
                console.error('Error loading employer data:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await supabase
                .from('profiles')
                .update({
                    default_rate: parseFloat(defaultRate),
                    building_type: buildingType,
                })
                .eq('id', user.id);
            alert('Profile updated!');
        } catch (err) {
            console.error('Error saving profile:', err);
            alert(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Employer Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Default Rate ($/h)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={defaultRate}
                        onChange={(e) => setDefaultRate(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Building Type</label>
                    <select
                        className="form-select"
                        value={buildingType}
                        onChange={(e) => setBuildingType(e.target.value)}
                        required
                    >
                        <option value="House">House</option>
                        <option value="Condo">Condo</option>
                        <option value="Business">Business</option>
                    </select>
                </div>

                <EmployerLocationsTable
                    locations={locations}
                    setLocations={setLocations}
                    userId={user.id}
                    handleLocationBlur={handleLocationBlur}
                />

                <button type="submit" className="btn btn-secondary mt-3">
                    Save Profile
                </button>
            </form>
        </div>
    );
}

