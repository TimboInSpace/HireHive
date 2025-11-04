// pages/job/[id].js
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthProvider';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function JobDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { user, authLoading } = useAuth();
    
    const [job, setJob] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        supabase.from('jobs').select('*').eq('id', id).single().then(({ data }) => setJob(data));
    }, [id]);

    async function claim() {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase
            .from('jobs')
            .update({ claimed_by: session.user.id, claimed_at: new Date().toISOString() })
            .eq('id', id);
        setLoading(false);
        if (error) return alert(error.message);
        // optionally refresh
        const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
        setJob(data);
    }

    async function markWorkerComplete() {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (job.claimed_by !== session.user.id) return alert('Only claiming worker can mark complete.');
        const { error } = await supabase.from('jobs').update({ worker_marked_complete: true }).eq('id', id);
        setLoading(false);
        if (error) alert(error.message);
        else alert('Marked complete. Employer will see email link to confirm.');
        // create rating link for employer to rate worker (create rating row with UUID and no stars yet)
        const ratingId = uuidv4();
        await supabase.from('ratings').insert({
            id: ratingId,
            job_id: id,
            rater_id: session.user.id,
            ratee_id: job.employer_id
        });
    }

    async function generateEmployerCompleteLink() {
        // create a unique rating link for employer to mark job complete + rate
        const ratingId = uuidv4();
        await supabase.from('ratings').insert({
            id: ratingId,
            job_id: id,
            rater_id: job.employer_id,
            ratee_id: job.claimed_by
        });
        // in real app: email link to employer. Here just show URL
        alert(`Employer completion link: ${location.origin}/rate/${ratingId}`);
    }

    if (!job) return <div className="container py-4">Loading...</div>;

    return (
        <ProtectedRoute allowedRoles={['employer','worker','both']}>
            <div className="container py-4">
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <p><strong>Compensation:</strong> {job.compensation}</p>
                <p><strong>Payment:</strong> {job.payment_methods}</p>
                <p><strong>Tools:</strong> {job.tools_provided}</p>
                <ProtectedRoute allowedRoles={['worker','both']}>
                {job.claimed_by ? (
                    <>
                        <p><strong>Claimed by:</strong> {job.claimed_by}</p>
                        <div className="d-flex gap-2">
                            <button className="btn btn-success" onClick={markWorkerComplete} disabled={loading}>Mark worker complete</button>
                            <button className="btn btn-outline-primary" onClick={generateEmployerCompleteLink}>Generate employer email link</button>
                        </div>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={claim}>Claim job</button>
                )}
                </ProtectedRoute>
            </div>
        </ProtectedRoute>
    );
}

