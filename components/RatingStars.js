// components/RatingStars.js
import React from 'react';

export default function RatingStars({ value = 0, size = 16 }) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const filled = i <= value;
        stars.push(
            <svg key={i} width={size} height={size} viewBox="0 0 16 16" className="me-1" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12.146l-3.717 2.056.71-4.142L1.6 6.698l4.158-.606L8 2.5l1.242 3.592 4.158.606-3.393 3.362.71 4.142z"/>
            </svg>
        );
    }
    return <span style={{ color: '#DE8755' }}>{stars}</span>;
}

