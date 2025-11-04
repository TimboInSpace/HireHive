import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function EmployerLocationsTable({ locations, setLocations, userId, handleLocationBlur }) {
    const [newAddress, setNewAddress] = useState('');
    const [valid, setValid] = useState(null);
    const [coords, setCoords] = useState(null);
    const [adding, setAdding] = useState(false);

    const addLocation = async () => {
        if (!coords) {
            alert('Please enter a valid address.');
            return;
        }
        setAdding(true);
        try {
            const { data, error } = await supabase
                .from('employer_locations')
                .insert([
                    {
                        owner: userId,
                        address: coords.display_name || newAddress,
                        geo: `POINT(${coords.lon} ${coords.lat})`,
                    },
                ])
                .select('*')
                .single();

            if (error) throw error;
            setLocations([...locations, data]);
            setNewAddress('');
            setCoords(null);
            setValid(null);
        } catch (err) {
            console.error('Add location error:', err);
            alert(err.message);
        } finally {
            setAdding(false);
        }
    };

    const deleteLocation = async (id) => {
        if (!confirm('Delete this location?')) return;
        try {
            const { error } = await supabase
                .from('employer_locations')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setLocations(locations.filter((loc) => loc.id !== id));
        } catch (err) {
            console.error('Delete location error:', err);
            alert(err.message);
        }
    };

    return (
        <div className="mt-4">
            <h5>Employer Locations</h5>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map((loc) => (
                        <tr key={loc.id}>
                            <td>{loc.address}</td>
                            <td>{new Date(loc.created_at).toLocaleString()}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteLocation(loc.id)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td>
                            <input
                                type="text"
                                className={`form-control ${
                                    valid === null
                                        ? ''
                                        : valid
                                        ? 'is-valid'
                                        : 'is-invalid'
                                }`}
                                value={newAddress}
                                onChange={(e) => {
                                    setNewAddress(e.target.value);
                                    setValid(null);
                                }}
                                onBlur={() =>
                                    handleLocationBlur(newAddress, setValid, setCoords)
                                }
                                placeholder="Add new address"
                            />
                        </td>
                        <td colSpan="2">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={addLocation}
                                disabled={adding}
                            >
                                {adding ? 'Adding...' : 'Add Location'}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

