// pages/api/jobs.js
import { supabaseServer } from '../../lib/supabaseServer';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { lat, lng, radius = 500 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        // radius in meters
        const radiusMeters = parseFloat(radius);

        // Supabase SQL query with PostGIS ST_DWithin
        const { data, error } = await supabaseServer
            .from('jobs')
            .select(`
                id,
                title,
                description,
                location,
                employer_id,
                compensation,
                created_at,
                expires_at,
                status
            `)
            .filter('status', 'eq', 'open') // only open jobs
            .filter('expires_at', 'gte', new Date().toISOString()) // not expired
            .gte('ST_DWithin(location::geography, ST_MakePoint(?, ?)::geography, ?)', [lng, lat, radiusMeters]);

        if (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

