// components/RatingStars.js
import React, { useState } from 'react';

export default function RatingStars({ value = 0, size = 20, enabled = false, onChange }) {
    const [hoverValue, setHoverValue] = useState(null);
    const displayValue = hoverValue ?? value;
    const rating = Math.max(0, Math.min(displayValue, 10)) / 2;
    const stars = [];

    const handleClick = (index, half) => {
        if (!enabled) return;
        const newValue = half ? index * 2 - 1 : index * 2;
        onChange?.(newValue);
    };

    const handleMouseEnter = (index, half) => {
        if (enabled) setHoverValue(half ? index * 2 - 1 : index * 2);
    };

    const handleMouseLeave = () => {
        if (enabled) setHoverValue(null);
    };

    for (let i = 1; i <= 5; i++) {
        let iconClass;
        if (rating >= i) {
            iconClass = 'bi bi-star-fill';
        } else if (rating >= i - 0.5) {
            iconClass = 'bi bi-star-half';
        } else {
            iconClass = 'bi bi-star';
        }

        stars.push(
            <span
                key={i}
                style={{ position: 'relative', display: 'inline-block', cursor: enabled ? 'pointer' : 'default' }}
                onMouseLeave={handleMouseLeave}
            >
                <i
                    className={`${iconClass} me-1`}
                    style={{ fontSize: size, color: '#DE8755' }}
                ></i>
                {enabled && (
                    <>
                        <span
                            onMouseEnter={() => handleMouseEnter(i, true)}
                            onClick={() => handleClick(i, true)}
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: '50%',
                                height: '100%',
                            }}
                        ></span>
                        <span
                            onMouseEnter={() => handleMouseEnter(i, false)}
                            onClick={() => handleClick(i, false)}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                width: '50%',
                                height: '100%',
                            }}
                        ></span>
                    </>
                )}
            </span>
        );
    }

    return <span>{stars}</span>;
}

