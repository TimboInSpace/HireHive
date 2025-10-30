// components/JobCard.js
import React from 'react';
import RatingStars from './RatingStars';
import Link from 'next/link';

export default function JobCard({ job, employer, isLoading }) {
    if (isLoading) {
        return (
            <div className="card p-3" style={{ minHeight: 160 }}>
                <div className="placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <p className="placeholder col-4"></p>
                    <div className="placeholder col-12" style={{ height: 80 }}></div>
                </div>
            </div>
        );
    }

    const claimed = job.claimed_by !== null;
    const excerpt = job.description?.slice(0, 200) + (job.description?.length > 200 ? '...' : '');

    return (
        <div className="card h-100 overflow-hidden">
            {claimed && <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.45)', zIndex: 2, color: 'white', transform: 'rotate(-30deg) scale(2.25)'}}>CLAIMED</div>}
            <div className="card-body">
                <h5 className="card-title">{job.title}</h5>
                <p className="card-text small">{excerpt}</p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <div className="small">{employer?.username || 'Employer'}</div>
                        <RatingStars value={employer?.avg_stars || 0} />
                    </div>
                    <div>
                        <Link href={`/job/${job.id}`} className={`btn ${claimed ? 'btn-secondary disabled' : 'btn-primary'}`}>
                            View
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

