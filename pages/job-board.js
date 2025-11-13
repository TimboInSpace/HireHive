// pages/job-board.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import JobCard from '../components/JobCard';
import JobMap from '../components/JobMap';
import PostJobModal from '../components/PostJobModal';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthProvider';
import ProtectedRoute from '../components/ProtectedRoute';
import dynamic from 'next/dynamic';

// Force client-side rendering of the react-leaflet component.
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });

export default function JobBoard() {
    const router = useRouter();
    const { user } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pos, setPos] = useState(null);
    const [radius, setRadius] = useState(1000); // meters

    useEffect(() => {
        if (!user) return;
        if (!navigator.geolocation) {
            alert('Geolocation required; logging out.');
            supabase.auth.signOut();
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (p) => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
            () => {
                alert('Location required; logging out!');
                supabase.auth.signOut();
            },
            { enableHighAccuracy: true }
        );
    }, [user]);

    async function fetchJobs() {
        if (!pos) return;
        setLoading(true);
        const { data, error } = await supabase.rpc('get_nearby_jobs', {
            user_lon: pos.lon,
            user_lat: pos.lat,
            max_distance: radius,
        });
        if (error) console.error(error);
        setJobs(data || []);
        setLoading(false);
    }

    useEffect(() => {
        if (!pos) return;
        fetchJobs();
    }, [pos, radius]);

    return (
        <ProtectedRoute allowedRoles={['employer','worker','both','authenticated']}>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Neighborhood Jobs</h2>
                    <div className="radius-selector text-center">
                        <select
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="form-select"
                        >
                            <option value={100}>100 m</option>
                            <option value={500}>500 m</option>
                            <option value={1000}>1 km</option>
                            <option value={5000}>5 km</option>
                            <option value={10000}>10 km</option>
                            <option value={100000}>100 km</option>
                            <option value={500000}>500 km</option>
                        </select>
                        {pos && <span className="small d-block mt-2">{pos.lat.toFixed(3)}°, {pos.lon.toFixed(3)}°</span>}
                    </div>
                </div>

           
                {pos && <JobMap pos={pos} jobs={jobs} radius={radius} />}

                <div className="row row-cols-1 row-cols-md-3 g-3">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div className="col" key={i}><JobCard isLoading /></div>
                          ))
                        : jobs.map((job) => (
                            <div className="col" key={job.id}>
                                <JobCard job={job} employer_id={job.employer_id} isLoading={loading} />
                            </div>
                          ))}
                </div>
            </div>
        </ProtectedRoute>
    );
}

