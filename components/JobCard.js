import React, { useEffect, useState } from 'react';
import RatingStars from './RatingStars';
import Link from 'next/link';
import { getEmployerRatings, getProfile } from '../lib/utils';

// This cache is shared by all JobCards
const employerCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default function JobCard({ job, employer_id, isLoading }) {
    const [employer, setEmployer] = useState(null);
    const [avgRating, setAvgRating] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!employer_id) return;

        async function hydrateEmployer() {
            setLoading(true);

            // check cache validity
            const cached = employerCache.get(employer_id);
            const isValid =
                cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

            if (isValid) {
                setEmployer(cached.profile);
                setAvgRating(cached.avgRating);
                setLoading(false);
                return;
            }

            try {
                const profile = await getProfile(employer_id);
                const ratings = await getEmployerRatings(employer_id);

                const rated = ratings.filter(r => r.job_rating != null);
                const avgRating =
                    rated.length > 0
                        ? rated.reduce((sum, r) => sum + r.job_rating, 0) / rated.length
                        : 0;

                // store fresh data
                employerCache.set(employer_id, {
                    profile,
                    avgRating,
                    timestamp: Date.now(),
                });

                setEmployer(profile);
                setAvgRating(avgRating);
            } catch (err) {
                console.error('Error hydrating employer data:', err);
            } finally {
                setLoading(false);
            }
        }
        hydrateEmployer();
    }, [employer_id]);

    const claimed = job?.claimed_by !== null;
    const excerpt = job?.description?.slice(0, 200) + (job?.description?.length > 200 ? '...' : '');

    // --- Placeholder for entire card except employer info ---
    if (isLoading) {
        return (
            <div className="card p-3" style={{ minHeight: 160 }}>
                <div className="placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <p className="placeholder col-4"></p>
                    <div
                        className="placeholder col-12"
                        style={{ height: 80 }}
                    ></div>
                </div>
            </div>
        );
    }

    return (
        <div className="card h-100 overflow-hidden position-relative">
            {claimed && (
                <Link
                    className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                        background: 'rgba(0,0,0,0.45)',
                        zIndex: 2,
                        color: 'white',
                        transform: 'rotate(-30deg) scale(2.25)',
                    }}
                    href={`/job/${job.job_id}`}
                >
                    CLAIMED
                </Link>
            )}
            <div className="card-body">
                <h5 className="card-title">{job.title}</h5>
                <p className="card-text small">{excerpt}</p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        {loading ? (
                            <div className="placeholder-glow">
                                <span className="placeholder small">Employer Username</span><br/>
                                <div className="placeholder" style={{ height: '16px', width: '5rem' }}></div>
                            </div>
                        ) : (
                            <div>
                                <span className="small">{employer?.username || 'Employer'}</span><br/>
                                <RatingStars
                                    value={Math.round(avgRating || 0)} 
                                    size={16}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <Link
                            href={`/job/${job.job_id}`}
                            className={`btn ${
                                claimed
                                    ? 'btn-secondary disabled'
                                    : 'btn-primary'
                            }`}
                        >
                            View
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

