// components/JobMap.js
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// SSR-safe dynamic imports
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

export default function JobMap({ pos, jobs = [], radius = 1000 }) {
    const [map, setMap] = useState(null);
    const [icons, setIcons] = useState({});

    // Import a small library of Bootstrap icons to be used on the map
    useEffect(() => {

        // This should only happen if the window is being rendered CLIENT-SIDE!
        if (typeof window === 'undefined') return;
        
        const imgSize = 32; // This is half the width of the icon

        import('leaflet').then(L => {
            // helper to wrap any SVG markup in a Leaflet divIcon
            const svgIcon = (svgMarkup) =>
                L.divIcon({
                    html: svgMarkup,
                    className: '', // no default Leaflet styles
                    iconSize: [2*imgSize, 2*imgSize],
                    iconAnchor: [imgSize, imgSize],
                    popupAnchor: [0, -2*imgSize + 4],
                });

            // Bootstrap SVGs (you can inline or import them)
            const defaultIcon = svgIcon(`
                <div class="map-icon-container unclaimed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${imgSize}" height="${imgSize}" fill="#444444" class="map-icon unclaimed bi bi-cash" viewBox="0 0 16 16">
                        <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                        <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2z"/>
                    </svg>
                </div>
            `);

            const employerIcon = svgIcon(`
                <div class="map-icon-container claimed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${imgSize}" height="${imgSize}" fill="#444444" class="map-icon claimed bi bi-check-circle-fill" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                </div>
            `);

            setIcons({ defaultIcon, employerIcon });
        });
    }, []);

    useEffect(() => {
        if (!map) return;
        const resize = () => map.invalidateSize();
        const t = setTimeout(resize, 150);
        window.addEventListener('resize', resize);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', resize);
        };
    }, [map, pos, jobs, radius]);

    if (!pos) return null;

    return (
        <div style={{ height: '320px', width: '100%', marginBottom: '1rem' }}>
            <MapContainer
                center={[pos.lat, pos.lon]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                whenCreated={setMap}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Circle center={[pos.lat, pos.lon]} radius={radius} />

                {icons.defaultIcon &&
                    jobs.map(job =>
                        job.lat && job.lon ? (
                            <Marker
                                key={job.job_id}
                                position={[job.lat, job.lon]}
                                icon={
                                    job.claimed_by
                                        ? icons.employerIcon
                                        : icons.defaultIcon
                                }
                            >
                                <Popup>
                                    <strong>{job.title}</strong>
                                    <br />
                                    {job.distance_m && `${job.distance_m.toFixed(0)} m away`}
                                    <br/><Link href={"/job/"+job.job_id}>View</Link>
                                </Popup>
                            </Marker>
                        ) : null
                    )}
            </MapContainer>
        </div>
    );
}

