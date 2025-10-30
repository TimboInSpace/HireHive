// components/PostJobModal.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthProvider';

export default function PostJobModal() {
    
    const { user, authLoading } = useAuth();
    const [locations, setLocations] = useState([]);
    
    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [compensation, setCompensation] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [approxDuration, setApproxDuration] = useState('');
    const [dueBy, setDueBy] = useState('');
    const [tools, setTools] = useState('');
    const [workStart, setWorkStart] = useState('');
    const [workEnd, setWorkEnd] = useState('');
    const [loading, setLoading] = useState(false);

    // Load employer’s available locations
    useEffect(() => {
        async function fetchLocations() {
            if (!user) return;
            const { data, error } = await supabase
                .from('employer_locations')
                .select('id, address')
                .eq('owner', user.id)
                .order('created_at', { ascending: true });

            if (error) console.error('Error fetching locations:', error);
            else setLocations(data || []);
        }
        fetchLocations();
    }, [user]);

    // Validate and submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !location || !compensation || !paymentMethod) {
            alert('Please fill in all required fields.');
            return;
        }

        // Validate datetime range
        if (workStart && workEnd) {
            const start = new Date(workStart);
            const end = new Date(workEnd);
            const now = new Date();

            if (isNaN(start) || isNaN(end) || start <= now || end <= now || end <= start) {
                alert('Invalid work window: both must be in the future and end must follow start.');
                return;
            }
        }

        setLoading(true);

        // Construct the job record
        const { error } = await supabase.from('jobs').insert([
            {
                employer_id: user.id,
                title,
                description,
                location,
                compensation: parseFloat(compensation),
                payment_method: paymentMethod,
                approx_duration: approxDuration || null,
                due_by: dueBy ? new Date(dueBy).toISOString() : null,
                tools: tools || null,
                work_within:
                    workStart && workEnd
                        ? `[${new Date(workStart).toISOString()},${new Date(workEnd).toISOString()}]`
                        : null,
            },
        ]);

        setLoading(false);

        if (error) {
            console.error(error);
            alert('Error posting job: ' + error.message);
        } else {
            alert('Job posted successfully!');
            // Reset form
            setTitle('');
            setDescription('');
            setLocation('');
            setCompensation('');
            setPaymentMethod('');
            setApproxDuration('');
            setDueBy('');
            setTools('');
            setWorkStart('');
            setWorkEnd('');
            // Close modal via Bootstrap
            const modal = bootstrap.Modal.getInstance(document.getElementById('postJobModal'));
            modal.hide();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {(user) && (
                <button
                    type="button"
                    className="btn btn-primary rounded-circle shadow-lg position-fixed"
                    style={{
                        bottom: '30px',
                        right: '30px',
                        width: '60px',
                        height: '60px',
                        fontSize: '24px',
                    }}
                    data-bs-toggle="modal"
                    data-bs-target="#postJobModal"
                >
                    <i className="bi bi-plus-lg"></i>
                </button>
            )}

            {/* Modal */}
            <div
                className="modal fade"
                id="postJobModal"
                tabIndex="-1"
                aria-labelledby="postJobModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            <div className="modal-header">
                                <h5 className="modal-title" id="postJobModalLabel">
                                    Post a New Job
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Title *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Location *</label>
                                    <select
                                        className="form-select"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required
                                    >
                                        <option value="">Select location...</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.address}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Compensation ($) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={compensation}
                                            onChange={(e) => setCompensation(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Payment Method *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            placeholder="e.g., PayPal, Cash, E-transfer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Approx. Duration</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={approxDuration}
                                            onChange={(e) => setApproxDuration(e.target.value)}
                                            placeholder="e.g., 2 hours, 1 day"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Due By</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={dueBy}
                                            onChange={(e) => setDueBy(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Work Window (optional)</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={workStart}
                                            onChange={(e) => setWorkStart(e.target.value)}
                                        />
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={workEnd}
                                            onChange={(e) => setWorkEnd(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Tools</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={tools}
                                        onChange={(e) => setTools(e.target.value)}
                                        placeholder="worker-provided or employer-provided"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Posting...' : 'Post Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

