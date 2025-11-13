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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchJob();
    }, [id]);

    async function fetchJob() {
        const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
        if (error) console.error(error);
        setJob(data);
    }

    async function updateJobState(updates) {
        setLoading(true);
        const { error } = await supabase.from('jobs').update(updates).eq('id', id);
        setLoading(false);
        if (error) return alert(error.message);
        fetchJob();
    }

    // --- Actions ---
    async function claimJob() {
        if (!user) return alert('Must be logged in.');
        await updateJobState({
            claimed_by: user.id,
            state: 'claimed',
            claimed_at: new Date().toISOString(),
        });
    }

    async function startWork() {
        if (job.claimed_by !== user.id) return alert('You did not claim this job.');
        await updateJobState({ state: 'in-progress' });
    }

    async function markWorkerComplete() {
        if (job.claimed_by !== user.id) return alert('Only claiming worker can mark complete.');
        await updateJobState({ state: 'worker-done' });

        // Create rating link for employer
        const ratingId = uuidv4();
        await supabase.from('ratings').insert({
            id: ratingId,
            job_id: id,
            rater_id: user.id,
            ratee_id: job.employer_id
        });
        alert('Marked complete. Employer will receive a link to confirm.');
    }

    async function confirmEmployerComplete() {
        if (job.employer_id !== user.id) return alert('Only the employer can confirm completion.');
        await updateJobState({ state: 'confirmed-done' });

        // Create rating link for employer to rate worker
        const ratingId = uuidv4();
        await supabase.from('ratings').insert({
            id: ratingId,
            job_id: id,
            rater_id: job.employer_id,
            ratee_id: job.claimed_by
        });
        alert('Job marked done and rating link generated.');
    }

    if (authLoading || !job) return <div className="container py-4">Loading...</div>;

    const isEmployer = user?.id === job.employer_id;
    const isWorker = user?.id === job.claimed_by;
    const canClaim = !job.claimed_by && user?.role?.includes('worker');

    function renderActions() {
        switch (job.state) {
            case 'posted':
                return canClaim && (
                    <button className="btn btn-primary" onClick={claimJob} disabled={loading}>
                        Claim Job
                    </button>
                );

            case 'claimed':
                if (isWorker)
                    return (
                        <button className="btn btn-outline-primary" onClick={startWork} disabled={loading}>
                            Start Work
                        </button>
                    );
                if (isEmployer)
                    return <p>Worker has claimed this job. Awaiting work start.</p>;
                break;

            case 'in-progress':
                if (isWorker)
                    return (
                        <button className="btn btn-success" onClick={markWorkerComplete} disabled={loading}>
                            Mark Complete
                        </button>
                    );
                if (isEmployer)
                    return <p>Job in progress. Waiting for worker to finish.</p>;
                break;

            case 'worker-done':
                if (isEmployer)
                    return (
                        <button className="btn btn-success" onClick={confirmEmployerComplete} disabled={loading}>
                            Confirm Completion
                        </button>
                    );
                if (isWorker)
                    return <p>Waiting for employer to confirm completion.</p>;
                break;

            case 'confirmed-done':
                return <p><strong>✅ Job completed.</strong></p>;

            default:
                return <p>Unknown state: {job.state}</p>;
        }
    }

    return (
        <ProtectedRoute allowedRoles={['employer', 'worker', 'both']}>
            <div className="container py-4">
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <p><strong>Compensation:</strong> {job.compensation}</p>
                <p><strong>Payment:</strong> {job.payment_methods}</p>
                <p><strong>Tools:</strong> {job.tools_provided}</p>
                <p><strong>Current State:</strong> {job.state}</p>

                {job.claimed_by && (
                    <p><strong>Claimed by:</strong> {job.claimed_by}</p>
                )}

                <div className="d-flex gap-2 mt-3">
                    {renderActions()}
                </div>
            </div>
        </ProtectedRoute>
    );
}

