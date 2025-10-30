// pages/rate/[id].js
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Rate() {
    const router = useRouter();
    const { id } = router.query;
    const [ratingEntry, setRatingEntry] = useState(null);
    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!id) return;
        supabase.from('ratings').select('*').eq('id', id).single().then(({ data }) => {
            setRatingEntry(data);
        });
    }, [id]);

    async function submit() {
        const { error } = await supabase.from('ratings').update({
            stars,
            comment
        }).eq('id', id);
        if (error) return alert(error.message);
        alert('Thanks for rating!');
        router.push('/');
    }

    if (!ratingEntry) return <div className="container py-4">Loading...</div>;

    return (
        <div className="container py-4">
            <h4>Rate</h4>
            <p>Rate the work (1-5)</p>
            <input type="range" min="1" max="5" value={stars} onChange={e => setStars(Number(e.target.value))} />
            <div className="mb-3">Stars: {stars}</div>
            <div className="mb-3">
                <textarea className="form-control" rows={4} value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={submit}>Submit rating</button>
        </div>
    );
}

