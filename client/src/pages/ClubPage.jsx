import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { initials } from '../components/Avatar';

export default function ClubPage() {
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getClub(slug).then(d => {
            setData(d);
            setLoading(false);
            window.scrollTo(0, 0);
        }).catch(() => setLoading(false));
    }, [slug]);

    if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Poppins,sans-serif',color:'#777'}}>Loading...</div>;
    if (!data) return null;

    const { club } = data;

    return (
        <>
            <Link to="/#clubs" className="club-back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Clubs
            </Link>

            {/* Hero Banner - now supports banner image */}
            <section className="club-hero" style={{
                background: club.banner_image_url
                    ? `linear-gradient(135deg, rgba(0,33,71,0.85), rgba(0,33,71,0.7)), url(${club.banner_image_url}) center/cover no-repeat`
                    : club.hero_gradient
            }}>
                <div className="club-hero-content container">
                    <span className="club-hero-label">Anand Activity Council · Club</span>
                    <h1 className="club-hero-title">{club.name}</h1>
                    <p className="club-hero-desc">{club.description || ''}</p>
                    <div className="club-hero-meta">
                        {club.captain && (
                            <div className="club-meta-item">
                                <span className="club-meta-label">Captain</span>
                                <span className="club-meta-value">{club.captain.name}</span>
                            </div>
                        )}
                        {club.vice_captain && (
                            <div className="club-meta-item">
                                <span className="club-meta-label">Vice Captain</span>
                                <span className="club-meta-value">{club.vice_captain.name}</span>
                            </div>
                        )}
                        <div className="club-meta-item">
                            <span className="club-meta-label">Members</span>
                            <span className="club-meta-value">{(club.members ? club.members.length : 0) + 2}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership */}
            <section className="club-section">
                <div className="container">
                    <div className="club-section-header">
                        <span className="club-section-num">01</span>
                        <h2 className="club-section-title">Club <em>Leadership</em></h2>
                    </div>
                    <div className="leadership-grid">
                        {club.captain && (
                            <div className="leadership-card captain">
                                {club.captain.photo_url
                                    ? <img src={club.captain.photo_url} alt={club.captain.name} className="leadership-avatar" style={{objectFit:'cover'}} />
                                    : <div className="leadership-avatar" style={{background:'var(--green)'}}>{initials(club.captain.name)}</div>
                                }
                                <span className="role-badge">Captain</span>
                                <h3>{club.captain.name}</h3>
                                {club.captain.email && <p style={{fontSize:'0.8rem',color:'var(--green)',marginTop:4}}>{club.captain.email}</p>}
                                {club.captain.phone && <p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{club.captain.phone}</p>}
                            </div>
                        )}
                        {club.vice_captain && (
                            <div className="leadership-card">
                                {club.vice_captain.photo_url
                                    ? <img src={club.vice_captain.photo_url} alt={club.vice_captain.name} className="leadership-avatar" style={{objectFit:'cover'}} />
                                    : <div className="leadership-avatar">{initials(club.vice_captain.name)}</div>
                                }
                                <span className="role-badge">Vice Captain</span>
                                <h3>{club.vice_captain.name}</h3>
                                {club.vice_captain.email && <p style={{fontSize:'0.8rem',color:'var(--green)',marginTop:4}}>{club.vice_captain.email}</p>}
                                {club.vice_captain.phone && <p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{club.vice_captain.phone}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Members */}
            {club.members && club.members.length > 0 && (
                <section className="club-section">
                    <div className="container">
                        <div className="club-section-header">
                            <span className="club-section-num">02</span>
                            <h2 className="club-section-title">Our <em>Members</em></h2>
                        </div>
                        <table className="members-table">
                            <thead><tr><th>Name</th><th>Roll No.</th><th>Email</th></tr></thead>
                            <tbody>
                                {club.members.map(m => (
                                    <tr key={m.id}>
                                        <td className="member-name">
                                            {m.photo_url
                                                ? <img src={m.photo_url} className="mini-avatar" style={{borderRadius:'50%',objectFit:'cover'}} alt="" />
                                                : <span className="mini-avatar">{initials(m.name)}</span>
                                            }
                                            {m.name}
                                        </td>
                                        <td className="member-roll">{m.roll_no || '—'}</td>
                                        <td style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{m.email || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Advisors */}
            <section className="club-section">
                <div className="container">
                    <div className="club-section-header">
                        <span className="club-section-num">03</span>
                        <h2 className="club-section-title">Faculty <em>Advisors</em></h2>
                    </div>
                    <div className="faculty-advisors">
                        {club.advisors.map(a => (
                            <div className="advisor-card" key={a.id}>
                                {a.photo_url
                                    ? <img src={a.photo_url} className="advisor-avatar" style={{borderRadius:'50%',objectFit:'cover'}} alt="" />
                                    : <div className="advisor-avatar">{initials(a.name)}</div>
                                }
                                <div className="advisor-info">
                                    <h4>{a.name}</h4>
                                    <p>{a.designation || 'Faculty Advisor'}</p>
                                    {a.email && <p style={{fontSize:'0.75rem',color:'var(--green)'}}>{a.email}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section className="club-section">
                <div className="container">
                    <div className="club-section-header">
                        <span className="club-section-num">04</span>
                        <h2 className="club-section-title">Club <em>Gallery</em></h2>
                    </div>
                    <div className="gallery-grid">
                        <div className="gallery-item gallery-large"><div className="gallery-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Photo</span></div></div>
                        <div className="gallery-item"><div className="gallery-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Photo</span></div></div>
                        <div className="gallery-item"><div className="gallery-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Photo</span></div></div>
                    </div>
                </div>
            </section>

            <section className="club-footer-cta">
                <h2>Explore More Clubs</h2>
                <p>Discover the vibrant community at Anand ICE</p>
                <Link to="/#clubs" className="btn-back">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    All Clubs
                </Link>
            </section>
        </>
    );
}
