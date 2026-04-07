import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await api.logout();
        navigate('/admin/login');
    };

    return (
        <>
            <nav className="admin-nav">
                <div className="admin-nav-inner">
                    <NavLink to="/admin" className="admin-brand" end>AAC <span>Admin</span></NavLink>
                    <div className="admin-nav-links">
                        <NavLink to="/admin" end className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
                        <NavLink to="/admin/settings" className={({isActive}) => isActive ? 'active' : ''}>Settings</NavLink>
                        <NavLink to="/admin/faculty" className={({isActive}) => isActive ? 'active' : ''}>Faculty</NavLink>
                        <NavLink to="/admin/council" className={({isActive}) => isActive ? 'active' : ''}>Council</NavLink>
                        <NavLink to="/admin/clubs" className={({isActive}) => isActive ? 'active' : ''}>Clubs</NavLink>
                        <a href="/" target="_blank" rel="noreferrer">View Site ↗</a>
                        <button onClick={handleLogout} className="btn-logout" style={{background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Logout</button>
                    </div>
                </div>
            </nav>
            <main className="admin-main">
                <Outlet />
            </main>
        </>
    );
}
