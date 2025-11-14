import { useState } from 'react';

/**
 * Reusable location input with integrated validation & search.
 * 
 * Props:
 * - label: string (optional label text)
 * - value: string (the address value)
 * - onChange: (newValue: string) => void
 * - onValidLocation: (coords: { lat, lon, display_name }) => void
 */
export default function LocationInput({ label = 'Location', value, onChange, onValidLocation }) {
    const [valid, setValid] = useState(null);   // true, false, or null
    const [loading, setLoading] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [foundAddress, setFoundAddress] = useState("");

    const searchLocation = async () => {
        const trimmed = value.trim();
        if (!trimmed) return;

        setLoading(true);
        setDirty(true);

        try {
            const resp = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}`
            );
            const data = await resp.json();

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setValid(true);
                setFoundAddress(display_name);
                onValidLocation({ lat, lon, display_name });
            } else {
                setValid(false);
                setLabel("");
                onValidLocation(null);
            }
        } catch (err) {
            console.error('Geocode error:', err);
            setValid(false);
            setFoundAddress("");
            onValidLocation(null);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        onChange(e.target.value);
        setValid(null);
        setFoundAddress("");
        setDirty(true);
    };

    return (
        <div className="mb-3">
            <label className="form-label">{label}</label>
            <div className="input-group">
                <input
                    type="text"
                    className={`form-control ${
                        valid === null
                            ? ''
                            : valid
                            ? 'is-valid'
                            : dirty
                            ? 'is-invalid'
                            : ''
                    }`}
                    value={value}
                    onChange={handleInputChange}
                    placeholder="Enter your location"
                />
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={searchLocation}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                            ></span>
                        </>
                    ) : (
                        <i class="bi bi-search"></i>
                    )}
                </button>
            </div>
            {valid === false && dirty && (
                <div className="invalid-feedback d-block">
                    Could not find that location.
                </div>
            )}
            <p className="text-info">{foundAddress}</p>
        </div>
    );
}

