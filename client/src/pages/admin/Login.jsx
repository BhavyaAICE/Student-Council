import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.login(username, password);
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-body">
            <div className="login-card">
                <div className="login-logo">AAC</div>
                <h1>Admin Portal</h1>
                <p>Anand Activity Council</p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus placeholder="Enter username" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full">Sign In</button>
                </form>
            </div>
        </div>
    );
}
