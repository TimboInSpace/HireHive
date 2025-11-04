export default function Spinner({ fullscreen = false }) {
    const containerClass = fullscreen
        ? 'd-flex justify-content-center align-items-center vh-100'
        : 'd-flex justify-content-center align-items-center';

    const containerStyle = fullscreen ? { minHeight: '100vh' } : {};

    return (
        <div className={containerClass} style={containerStyle}>
            <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: '4rem', height: '4rem' }}
            >
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

