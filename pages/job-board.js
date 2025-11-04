// pages/job-board.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import JobCard from '../components/JobCard';
import PostJobModal from '../components/PostJobModal';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthProvider';
import ProtectedRoute from '../components/ProtectedRoute';

export default function JobBoard() {
    const router = useRouter();
    const { user, authLoading } = useAuth();
    
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pos, setPos] = useState(null);
    const [radius, setRadius] = useState(500); // meters
    const [page, setPage] = useState(0);
    
    // geolocation prompt after login. If denied, sign out immediately.
    useEffect(() => {
        if (!user) return;
        if (!navigator.geolocation) {
            alert('Geolocation required; logging out.');
            supabase.auth.signOut();
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (p) => {
                setPos({ lat: p.coords.latitude, lon: p.coords.longitude });
            },
            (err) => {
                alert('Due to the nature of this web app, location services are REQUIRED. Logging out!');
                supabase.auth.signOut();
            },
            { enableHighAccuracy: true }
        );
    }, [user]);

    // fetch jobs: basic radius filter using PostGIS ST_DWithin
    async function fetchJobs(reset = false) {
        if (!pos) return;
        setLoading(true);
        
        const offset = reset ? 0 : page * 20;
        
        // We should inner-join on the location field
        console.log(`fetching jobs...`);

        
        const { data, error } = await supabase.rpc('get_nearby_jobs', {
            user_lon: pos.lon,
            user_lat: pos.lat,
            max_distance: radius // dynamic radius
        });
        
        // NOTE: For spatial filtering you'd normally use .filter with RPC. For now, we fetch and filter client-side (simple).
        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }
            
        console.log(JSON.stringify(data, null, '  '));
        setJobs(data);
        setLoading(false);
    }

    useEffect(() => {
        if (!pos) return;
        fetchJobs(true);
    }, [pos, radius]);

    return (
        <ProtectedRoute allowedRoles={['employer','worker','both','authenticated']}>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Neighborhood Jobs</h2>
                    <div className="radius-selector d-flex flex-column justify-content-center align-items-center">
                        <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="form-select d-inline-block">
                            <option value={100}>100 m</option>
                            <option value={500}>500 m</option>
                            <option value={1000}>1 km</option>
                            <option value={5000}>5 km</option>
                            <option value={10000}>10 km</option>
                            <option value={100000}>100 km</option>
                            <option value={500000}>500 km</option>
                        </select>
                        <br/>
                        <span className="small">{pos?.lat.toFixed(3)}° N, {pos?.lon.toFixed(3)}° E</span>
                    </div>
                </div>

                <div className="row row-cols-1 row-cols-md-3 g-3">
                    {loading && Array.from({ length: 6 }).map((_, i) => (
                        <div className="col" key={i}>
                            <JobCard isLoading />
                        </div>
                    ))}
                    {!loading && jobs.map(job => (
                        <div className="col" key={job.id}>
                            <JobCard job={job} employer_id={job.employer_id} isLoading={loading} />
                        </div>
                    ))}
                </div>
            </div>
        </ProtectedRoute>
    );
}

