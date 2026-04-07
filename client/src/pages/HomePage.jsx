import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar, { initials } from '../components/Avatar';
import { useParallax } from '../hooks/useScrollReveal';

export default function HomePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getHome().then(d => {
            setData(d);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useParallax();

    // Run all scroll animations once data loads
    useEffect(() => {
        if (!data) return;

        // Tiny delay to ensure DOM has rendered
        const timer = setTimeout(() => {
            // 1. Reveal animations
            const reveals = document.querySelectorAll('.reveal');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
            reveals.forEach(el => revealObserver.observe(el));

            // 2. Bento grid stagger
            const bentoItems = document.querySelectorAll('.bento-item');
            bentoItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                item.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            });
            const bentoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = Array.from(bentoItems).indexOf(entry.target);
                        entry.target.style.transitionDelay = `${idx * 0.08}s`;
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        bentoObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05 });
            bentoItems.forEach(item => bentoObserver.observe(item));

            // 3. Kinetic team stagger
            const kineticItems = document.querySelectorAll('.kinetic-item');
            kineticItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-30px)';
                item.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
            });
            const kineticObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = Array.from(kineticItems).indexOf(entry.target);
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateX(0)';
                        }, idx * 120);
                        kineticObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            kineticItems.forEach(item => kineticObserver.observe(item));

            // 4. Counter animation
            const counters = document.querySelectorAll('.stat-number');
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.getAttribute('data-count'));
                        const duration = 1500;
                        const increment = target / (duration / 16);
                        let current = 0;
                        const update = () => {
                            current += increment;
                            if (current < target) {
                                entry.target.textContent = Math.ceil(current);
                                requestAnimationFrame(update);
                            } else {
                                entry.target.textContent = target + '+';
                            }
                        };
                        update();
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            counters.forEach(c => counterObserver.observe(c));

            // 5. Hero entrance
            document.querySelectorAll('.hero-content .reveal').forEach((el, i) => {
                el.style.transitionDelay = `${0.3 + i * 0.15}s`;
                el.classList.add('revealed');
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [data]);

    if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
    if (!data) return null;

    const { settings, faculty, councilHeads, clubs } = data;
    const head = faculty.find(f => f.is_head);
    const otherFaculty = faculty.filter(f => !f.is_head);

    return (
        <>
            <Navbar settings={settings} />

            {/* Hero */}
            <section className="hero" id="hero">
                <div className="hero-bg"><img src="/uploads/hero-bg.png" alt="Anand ICE Campus" className="hero-bg-img" onError={(e)=>{e.target.style.display='none'}} /></div>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-badge reveal">{settings.college_name || 'ANAND INTERNATIONAL COLLEGE OF ENGINEERING'}</div>
                    <h1 className="hero-title reveal">
                        <span className="hero-line">Student</span>
                        <span className="hero-line">Council</span>
                    </h1>
                    <div className="hero-year reveal">
                        <span className="year-line"></span>
                        <span className="year-text">{settings.site_year || '2025 — 26'}</span>
                        <span className="year-line"></span>
                    </div>
                    <p className="hero-tagline reveal">{settings.hero_tagline || 'Shaping Leaders. Building Community. Driving Change.'}</p>
                </div>
                <div className="scroll-indicator">
                    <span>Scroll</span>
                    <span className="scroll-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></span>
                </div>
            </section>

            {/* About */}
            <section className="about" id="about">
                <div className="container">
                    <div className="about-grid">
                        <div className="about-text reveal">
                            <span className="section-label">About the Council</span>
                            <h2 className="section-title">Leading with <em>Purpose</em></h2>
                            <p>{settings.about_text || 'The Anand Activity Council (AAC) is the heartbeat of student life at Anand International College of Engineering.'}</p>
                            <p>{settings.about_text_2 || 'Through our diverse clubs, we provide every student with a platform to discover their passion.'}</p>
                            <div className="about-stats">
                                <div className="stat"><span className="stat-number" data-count={clubs.length}>0</span><span className="stat-label">Active Clubs</span></div>
                                <div className="stat"><span className="stat-number" data-count="50">0</span><span className="stat-label">Office Bearers</span></div>
                                <div className="stat"><span className="stat-number" data-count={faculty.length}>0</span><span className="stat-label">Faculty Mentors</span></div>
                            </div>
                        </div>
                        <div className="about-visual reveal">
                            <div className="visual-mosaic">
                                <div className="mosaic-item mosaic-large" style={{background:'var(--navy)'}}><div className="mosaic-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg><span>Council Events</span></div></div>
                                <div className="mosaic-item" style={{background:'var(--green)'}}><div className="mosaic-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Teamwork</span></div></div>
                                <div className="mosaic-item" style={{background:'var(--navy-deep)'}}><div className="mosaic-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>Excellence</span></div></div>
                                <div className="mosaic-item" style={{background:'var(--navy)'}}><div className="mosaic-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg><span>Celebrations</span></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Faculty */}
            <section className="faculty" id="faculty">
                <div className="container">
                    <span className="section-label reveal">Guiding Force</span>
                    <h2 className="section-title reveal">Faculty <em>Leadership</em></h2>
                    <p className="section-subtitle reveal">The mentors who lead and inspire our council's vision</p>

                    {head && (
                        <div className="faculty-head reveal">
                            <div className="faculty-head-card">
                                <div className="faculty-avatar">
                                    <Avatar name={head.name} photoUrl={head.photo_url} size="large" />
                                </div>
                                <div className="faculty-head-info">
                                    <span className="faculty-role-badge">Head of Council</span>
                                    <h3>{head.name}</h3>
                                    <p>{head.designation}{head.department ? ', ' + head.department : ''}</p>
                                    {head.email && <p className="email-line">{head.email}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="faculty-grid">
                        {otherFaculty.map(f => (
                            <div className="faculty-card reveal" key={f.id}>
                                <div className="faculty-avatar">
                                    <Avatar name={f.name} photoUrl={f.photo_url} />
                                </div>
                                <h4>{f.name}</h4>
                                <p>{f.designation}{f.department ? ', ' + f.department : ''}</p>
                                {f.email && <p className="email-line">{f.email}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Council */}
            <section className="council" id="council">
                <div className="container">
                    <span className="section-label reveal light">The Leadership</span>
                    <h2 className="section-title reveal light">Student <em>Council</em></h2>
                </div>
                <div className="kinetic-team">
                    {councilHeads.map((h, i) => (
                        <div className="kinetic-item" key={h.id}>
                            <div className="kinetic-content">
                                <span className="kinetic-index">{String(i + 1).padStart(2, '0')}</span>
                                <div className="kinetic-name-wrap">
                                    <h3 className="kinetic-name">{h.name}</h3>
                                    <span className="kinetic-id">{h.email || h.enrollment_id || ''}</span>
                                </div>
                                <span className="kinetic-role">{h.role}</span>
                            </div>
                            <div className="kinetic-image">
                                {h.photo_url
                                    ? <img src={h.photo_url} alt={h.name} className="kinetic-avatar" style={{borderRadius:'50%',objectFit:'cover'}} />
                                    : <div className="avatar-placeholder kinetic-avatar">{initials(h.name)}</div>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Clubs */}
            <section className="clubs" id="clubs">
                <div className="container">
                    <span className="section-label reveal">Life at Anand ICE</span>
                    <h2 className="section-title reveal">Our <em>Clubs</em></h2>
                    <p className="section-subtitle reveal">{clubs.length} vibrant clubs. One powerful community.</p>
                </div>
                <div className="bento-grid">
                    {clubs.map(club => (
                        <Link to={`/club/${club.slug}`} className={`bento-item${club.is_large ? ' bento-large' : ''}${club.is_wide ? ' bento-wide' : ''}`} key={club.id} style={{background: club.bg_tint}}>
                            <div className="club-icon" dangerouslySetInnerHTML={{__html: club.icon_svg}}></div>
                            <h3 className="club-name">{club.name}</h3>
                            <div className="club-leaders">
                                {club.captain && (
                                    <div className="leader">
                                        {club.captain.photo_url
                                            ? <img src={club.captain.photo_url} className="avatar-placeholder small" style={{borderRadius:'50%',objectFit:'cover'}} alt="" />
                                            : <div className="avatar-placeholder small">{initials(club.captain.name)}</div>
                                        }
                                        <div><span className="leader-name">{club.captain.name}</span><span className="leader-role">Captain</span></div>
                                    </div>
                                )}
                                {club.vice_captain && (
                                    <div className="leader">
                                        {club.vice_captain.photo_url
                                            ? <img src={club.vice_captain.photo_url} className="avatar-placeholder small" style={{borderRadius:'50%',objectFit:'cover'}} alt="" />
                                            : <div className="avatar-placeholder small">{initials(club.vice_captain.name)}</div>
                                        }
                                        <div><span className="leader-name">{club.vice_captain.name}</span><span className="leader-role">Vice Captain</span></div>
                                    </div>
                                )}
                            </div>
                            <div className="club-advisor"><span>Faculty: {club.advisors.map(a => a.name).join(' & ')}</span></div>
                            {club.members && club.members.length > 0 && (
                                <div className="club-members-overlay">
                                    <h4>Members</h4>
                                    <ul>{club.members.map(m => <li key={m.id}>{m.name} <span>{m.roll_no || ''}</span></li>)}</ul>
                                </div>
                            )}
                            <span className="club-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg></span>
                        </Link>
                    ))}
                </div>
            </section>

            <Footer settings={settings} />
        </>
    );
}
