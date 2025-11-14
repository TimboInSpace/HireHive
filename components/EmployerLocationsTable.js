import { useState } from 'react';
import LocationInput from './LocationInput';
import { supabase } from '../lib/supabaseClient';

export default function EmployerLocationsTable({ locations, setLocations, userId }) {
    const [pendingAddress, setPendingAddress] = useState('');
    const [pendingCoords, setPendingCoords] = useState(null); // {lat, lon, display_name}
    const [adding, setAdding] = useState(false);

    const addLocation = async () => {
        if (!pendingCoords) return;
        setAdding(true);
        const wkt = `POINT(${pendingCoords.lon} ${pendingCoords.lat})`;
        try {
            const { data, error } = await supabase
                .from('locations')
                .insert({
                    owner: userId,
                    address: pendingCoords.display_name,
                    //address: pendingAddress,
                    geo: wkt
                })
                .select();
            if (!error && data?.length) {
                setLocations([...locations, data[0]]);
                setPendingAddress('');
                setPendingCoords(null);
            }
        } finally {
            setAdding(false);
        }
    };

    const deleteLocation = async (id) => {
        const { error } = await supabase
            .from('employer_locations')
            .delete()
            .eq('id', id);
        if (!error) {
            setLocations(locations.filter(l => l.id !== id));
        }
    };

    return (
        <div>
            
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Location</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {locations.map(loc => (
                        <tr key={loc.id}>
                            <td>{loc.address}</td>
                            <td className="text-end">
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => deleteLocation(loc.id)}
                                    style={{"font-size":"1.25rem"}}
                                >
                                    <i className="bi bi-trash" ></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {locations.length === 0 ? <tr key="0"><td>No locations added yet.</td><td></td></tr> : ""}
                </tbody>
            </table>

            <div className="mt-3 d-flex flex-row align-items-baseline">
                <LocationInput
                    label=""
                    value={pendingAddress}
                    onChange={setPendingAddress}
                    onValidLocation={setPendingCoords}
                />
                <button
                    style={{width:"150px"}}
                    className="btn btn-success mt-2 ml-3 flex-shrink-0"
                    disabled={adding || !pendingCoords}
                    onClick={addLocation}
                >
                    {adding ? 'Adding…' : 'Add Location'}
                </button>
            </div>
        </div>
    );
}

