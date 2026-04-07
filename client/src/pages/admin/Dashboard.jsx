import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

export default function Dashboard() {
    const [counts, setCounts] = useState(null);

    useEffect(() => {
        api.getDashboard().then(d => setCounts(d.counts));
    }, []);

    if (!counts) return <p>Loading...</p>;

    return (
        <>
            <h1>Dashboard</h1>
            <p className="admin-subtitle">Welcome back, <strong>admin</strong></p>
            <div className="stats-grid">
                <Link to="/admin/faculty" className="stat-card">
                    <span className="stat-val">{counts.faculty}</span>
                    <span className="stat-lbl">Faculty Heads</span>
                </Link>
                <Link to="/admin/council" className="stat-card">
                    <span className="stat-val">{counts.council}</span>
                    <span className="stat-lbl">Council Heads</span>
                </Link>
                <Link to="/admin/clubs" className="stat-card">
                    <span className="stat-val">{counts.clubs}</span>
                    <span className="stat-lbl">Clubs</span>
                </Link>
                <Link to="/admin/clubs" className="stat-card">
                    <span className="stat-val">{counts.members}</span>
                    <span className="stat-lbl">Total Members</span>
                </Link>
            </div>
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <Link to="/admin/faculty" className="action-card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        <span>Manage Faculty</span>
                    </Link>
                    <Link to="/admin/council" className="action-card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span>Manage Council</span>
                    </Link>
                    <Link to="/admin/clubs" className="action-card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        <span>Manage Clubs</span>
                    </Link>
                    <Link to="/admin/settings" className="action-card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        <span>Site Settings</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
