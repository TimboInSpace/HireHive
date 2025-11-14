import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getProfile } from '../lib/utils';
import EmployerLocationsTable from './EmployerLocationsTable';

export default function EmployerProfile({ user, authLoading, profile, locations, setLocations }) {
    

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await supabase
                .from('profiles')
                .update({
                })
                .eq('id', user.id);
            alert('Profile updated!');
        } catch (err) {
            console.error('Error saving profile:', err);
            alert(err.message);
        }
    };

    if (authLoading) return <p>Loading...</p>;

    return (
        <div className="border border-dark rounded p-3">
            <h2 className="mb-4">Employer Details</h2>
            <form onSubmit={handleSubmit}>

                <EmployerLocationsTable
                    locations={locations}
                    setLocations={setLocations}
                    userId={user.id}
                    handleLocationBlur={handleLocationBlur}
                />

                <button type="submit" className="btn btn-secondary text-dark border-dark mt-3">
                    Save Employer Details
                </button>
            </form>
        </div>
    );
}

