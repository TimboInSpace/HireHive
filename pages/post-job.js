// pages/post-job.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function PostJob() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [compensation, setCompensation] = useState('');
    const [paymentMethods, setPaymentMethods] = useState('');
    const [approxDuration, setApproxDuration] = useState('');
    const [dueBy, setDueBy] = useState('');
    const [workStart, setWorkStart] = useState('');
    const [workEnd, setWorkEnd] = useState('');
    const [toolsProvided, setToolsProvided] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // ensure logged-in
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) router.push('/');
        });
    }, []);

    async function submit() {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const employer_id = session.user.id;

        // use employer primary_location as default
        const { data: prof } = await supabase.from('profiles').select('primary_location').eq('id', employer_id).single();
        const locationGeom = prof?.primary_location || null;
        // sanitize textual inputs (basic)
        const sanitize = (s) => (s || '').replace(/<[^>]*>?/gm, '').slice(0, 2000);

        const { error } = await supabase.from('jobs').insert([{
            employer_id,
            title: sanitize(title),
            description: sanitize(description),
            location: locationGeom,
            location_address: '', // optionally set
            compensation: sanitize(compensation),
            payment_methods: sanitize(paymentMethods),
            approx_duration: sanitize(approxDuration),
            due_by: dueBy || null,
            work_within_timestart: workStart || null,
            work_within_timeend: workEnd || null,
            tools_provided: sanitize(toolsProvided)
        }]);
        setLoading(false);
        if (error) return alert(error.message);
        router.push('/');
    }

    return (
        <div className="container py-4">
            <h4>Post a Job</h4>
            <div className="mb-3">
                <input className="form-control" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="mb-3">
                <textarea className="form-control" placeholder="Description" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="mb-3">
                <input className="form-control" placeholder="Compensation (e.g., $20/h or $100 flat)" value={compensation} onChange={e => setCompensation(e.target.value)} />
            </div>
            <div className="mb-3">
                <input className="form-control" placeholder="Payment methods (comma separated)" value={paymentMethods} onChange={e => setPaymentMethods(e.target.value)} />
            </div>
            <div className="mb-3">
                <input className="form-control" placeholder="Approx duration" value={approxDuration} onChange={e => setApproxDuration(e.target.value)} />
            </div>
            <div className="mb-3">
                <label>Due by (optional)</label>
                <input type="datetime-local" className="form-control" value={dueBy} onChange={e => setDueBy(e.target.value)} />
            </div>
            <div className="mb-3">
                <label>Work within (optional)</label>
                <input type="datetime-local" className="form-control mb-2" value={workStart} onChange={e => setWorkStart(e.target.value)} />
                <input type="datetime-local" className="form-control" value={workEnd} onChange={e => setWorkEnd(e.target.value)} />
            </div>
            <div className="mb-3">
                <input className="form-control" placeholder="Tools (worker-provided or employer-provided)" value={toolsProvided} onChange={e => setToolsProvided(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</button>
        </div>
    );
}

