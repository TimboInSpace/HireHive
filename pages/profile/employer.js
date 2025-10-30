import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthProvider';

export default function Employer() {
    const router = useRouter();
    const { user, authLoading } = useAuth();
    
    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState(null);
    const [validLocation, setValidLocation] = useState(null);
    const [defaultRate, setDefaultRate] = useState('10');
    const [buildingType, setBuildingType] = useState('House');
    const [loading, setLoading] = useState(false);
    

    // Whenever `location` loses focus, do the OSM lookup of the address WKBF geocode
    const handleLocationBlur = async () => {
        if (!location.trim()) return;
        try {
            const resp = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
            );
            const data = await resp.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setCoords({ lat, lon, display_name });
                setValidLocation(true);
            } else {
                setCoords(null);
                setValidLocation(false);
            }
        } catch (err) {
            console.error('Geocode error:', err);
            setCoords(null);
            setValidLocation(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!coords) {
            alert('Please provide a valid location.');
            return;
        }

        setLoading(true);

        try {

            // Ensure profile exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (!existingProfile) {
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ id: user.id, username: user.email.split('@')[0] }]); // basic default username
                if (insertError) throw insertError;
            }
            
            // Does that address exist already?
            // [ fill this in ]

            // Insert employer_location (it's a foreign key, so we need to do this first.)
            const { data: locData, error: locError } = await supabase
                .from('employer_locations')
                .insert([
                    {
                        owner: user.id,
                        address: coords.display_name || location,
                        geom: `POINT(${coords.lon} ${coords.lat})`,
                    },
                ])
                .select('id')
                .single();

            if (locError) throw locError;

            // Update profile
            const { error: profError } = await supabase
                .from('profiles')
                .update({
                    role: 'employer',
                    primary_location: locData.id,
                    default_rate: parseFloat(defaultRate),
                    building_type: buildingType,
                })
                .eq('id', user.id);

            if (profError) throw profError;

            router.push('/');
        } catch (err) {
            console.error('Error saving employer profile:', err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Employer Profile Setup</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Primary Location</label>
                    <input
                        type="text"
                        className={`form-control ${
                            validLocation === null
                                ? ''
                                : validLocation
                                ? 'is-valid'
                                : 'is-invalid'
                        }`}
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                            setValidLocation(null);
                        }}
                        onBlur={handleLocationBlur}
                        placeholder="123 Main St, City"
                        required
                    />
                    <div className="valid-feedback">Location verified!</div>
                    <div className="invalid-feedback">
                        Could not verify this address.
                    </div>
                </div>

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

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
}

