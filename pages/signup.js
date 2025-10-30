// pages/signup.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });

        setLoading(false);
        if (error) alert(error.message);
        else {
            alert('Check your email for verification link!');
            router.push('/login');
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '400px' }}>
            <h2 className="text-center mb-4">Sign Up</h2>
            <form onSubmit={handleSignup}>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-secondary w-100" disabled={loading}>
                    {loading ? 'Signing Up…' : 'Sign Up'}
                </button>
            </form>
            <p className="text-center mt-3">
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
}

