// lib/utils.js
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/*
Perform the query: `SELECT * FROM profiles WHERE userid={id}`
Return the resulting row.
*/
async function getProfile(id, user) {

    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (!existingProfile) {
        const { data: insertedRecord, error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: id, username: `${user.username}` }]); // basic default username
        if (insertError) throw insertError;
        return insertedRecord;
    }
    
    return existingProfile;
    
}


/*
Perform the query: `SELECT * FROM employer_locations WHERE owner={employer_id}`
Return an array of employer_locations
*/
async function getEmployerLocations(employer_id) {

    const { data: locations } = await supabase
        .from('locations')
        .select('*')
        .eq('owner', employer_id)
    
    if (error) {
        console.error('Error fetching employer locations:', error.message);
        throw error;
    }

    return locations;

}


/*
Perform the query: `SELECT * FROM jobs WHERE employer_id={employer_id}`
Return an array of jobs posted by that employer
*/
async function getEmployerJobs(employer_id) {

    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', employer_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching employer jobs:', error.message);
        throw error;
    }

    return jobs;
}


/*
Perform the query:
SELECT r.*
FROM ratings r
JOIN jobs j ON r.job_id = j.id
WHERE j.employer_id = {employer_id}
  AND (r.job_rating IS NOT NULL OR r.worker_rating IS NOT NULL);
Return an array of full ratings records.
*/
async function getEmployerRatings(employer_id) {

    const { data: ratings, error } = await supabase
        .from('ratings')
        .select('*, jobs!inner(id, employer_id)')
        .eq('jobs.employer_id', employer_id)
        .or('job_rating.not.is.null,worker_rating.not.is.null');

    if (error) {
        console.error('Error fetching employer ratings:', error.message);
        throw error;
    }

    return ratings;
}

export { getProfile, getEmployerLocations, getEmployerJobs, getEmployerRatings };
