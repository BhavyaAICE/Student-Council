import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from './api';

import HomePage from './pages/HomePage';
import ClubPage from './pages/ClubPage';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Settings from './pages/admin/Settings';
import Faculty from './pages/admin/Faculty';
import Council from './pages/admin/Council';
import Clubs from './pages/admin/Clubs';
import Members from './pages/admin/Members';
import AdminLayout from './components/AdminLayout';

import './styles/style.css';
import './styles/club-page.css';
import './styles/admin.css';

function ProtectedRoute({ children }) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        api.getMe()
            .then(() => setAuth(true))
            .catch(() => setAuth(false));
    }, []);

    if (auth === null) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Poppins,sans-serif',color:'#777'}}>Loading...</div>;
    if (!auth) return <Navigate to="/admin/login" />;
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/club/:slug" element={<ClubPage />} />

                {/* Admin Login */}
                <Route path="/admin/login" element={<Login />} />

                {/* Protected Admin */}
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="faculty" element={<Faculty />} />
                    <Route path="council" element={<Council />} />
                    <Route path="clubs" element={<Clubs />} />
                    <Route path="clubs/:id/members" element={<Members />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
