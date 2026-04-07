import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ settings }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    // Active section tracking
    const [activeSection, setActiveSection] = useState('hero');
    useEffect(() => {
        if (location.pathname !== '/') return;
        const onScroll = () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollY = window.scrollY + 100;
            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                if (scrollY >= top && scrollY < top + height) {
                    setActiveSection(section.id);
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [location.pathname]);

    const isHome = location.pathname === '/';

    return (
        <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <span className="logo-text">AAC</span>
                    <span className="logo-sub">{settings?.site_title || 'Anand Activity Council'}</span>
                </Link>
                {isHome && (
                    <ul className={`nav-links${mobileOpen ? ' mobile-open' : ''}`} id="nav-links">
                        <li><a href="#hero" className={activeSection === 'hero' ? 'active' : ''}>Home</a></li>
                        <li><a href="#about" className={activeSection === 'about' ? 'active' : ''}>About</a></li>
                        <li><a href="#faculty" className={activeSection === 'faculty' ? 'active' : ''}>Faculty</a></li>
                        <li><a href="#council" className={activeSection === 'council' ? 'active' : ''}>Council</a></li>
                        <li><a href="#clubs" className={activeSection === 'clubs' ? 'active' : ''}>Clubs</a></li>
                    </ul>
                )}
                <button
                    className={`nav-toggle${mobileOpen ? ' active' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    <span></span><span></span><span></span>
                </button>
            </div>
        </nav>
    );
}
