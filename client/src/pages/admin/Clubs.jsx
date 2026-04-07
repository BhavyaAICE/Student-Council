import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

export default function Clubs() {
    const [clubs, setClubs] = useState([]);
    const [success, setSuccess] = useState(false);
    const [editId, setEditId] = useState(null);

    const load = () => api.getClubs().then(d => setClubs(d.clubs));
    useEffect(() => { load(); }, []);

    const editClub = clubs.find(c => c.id === editId);

    const handleAdd = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.addClub(fd);
        e.target.reset();
        setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleUpdate = async (e, id) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.updateClub(id, fd);
        setEditId(null); setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this club and ALL its members?')) return;
        await api.deleteClub(id);
        if (editId === id) setEditId(null);
        load();
    };

    return (
        <>
            <h1>Clubs</h1>
            {success && <div className="alert alert-success">Changes saved!</div>}

            {/* Club List */}
            <div className="card">
                <h2>All Clubs ({clubs.length})</h2>
                <div className="clubs-grid">
                    {clubs.map(c => (
                        <div className={`club-admin-card${editId === c.id ? ' editing' : ''}`} key={c.id} style={{borderLeft: `4px solid ${c.bg_tint}`}}>
                            <h3>{c.name}</h3>
                            <p className="club-slug">/{c.slug}</p>
                            <p className="club-desc">{(c.description || '').substring(0, 80)}...</p>
                            {c.banner_image_url && <p style={{fontSize:'0.7rem',color:'var(--green)',marginBottom:8}}>✓ Has banner image</p>}
                            <div className="club-admin-actions">
                                <Link to={`/admin/clubs/${c.id}/members`} className="btn btn-sm btn-primary">Members & Advisors</Link>
                                <button className="btn btn-sm" onClick={() => setEditId(editId === c.id ? null : c.id)}>
                                    {editId === c.id ? 'Cancel' : 'Edit Club'}
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Panel — shown below the grid, not inside a card */}
            {editClub && (
                <div className="card" style={{borderTop: '3px solid var(--green)'}}>
                    <h2>Edit: {editClub.name}</h2>
                    <form onSubmit={(e) => handleUpdate(e, editClub.id)} className="form-grid" encType="multipart/form-data">
                        <input type="hidden" name="existing_banner" defaultValue={editClub.banner_image_url || ''} />
                        <div className="form-group"><label>Name</label><input type="text" name="name" defaultValue={editClub.name} required key={`name-${editClub.id}`} /></div>
                        <div className="form-group"><label>Slug</label><input type="text" name="slug" defaultValue={editClub.slug} required key={`slug-${editClub.id}`} /></div>
                        <div className="form-group full"><label>Description</label><textarea name="description" rows="3" defaultValue={editClub.description || ''} key={`desc-${editClub.id}`} /></div>
                        <div className="form-group"><label>Hero Gradient</label><input type="text" name="hero_gradient" defaultValue={editClub.hero_gradient} key={`grad-${editClub.id}`} /></div>
                        <div className="form-group"><label>BG Tint</label><input type="color" name="bg_tint" defaultValue={editClub.bg_tint} key={`tint-${editClub.id}`} /></div>
                        <div className="form-group full">
                            <label>Banner Image</label>
                            <input type="file" name="banner" accept="image/*" />
                            {editClub.banner_image_url && <p style={{fontSize:'0.75rem',color:'var(--muted)',marginTop:4}}>Current: <a href={editClub.banner_image_url} target="_blank" rel="noreferrer">{editClub.banner_image_url}</a></p>}
                        </div>
                        <div className="form-group full"><label>Icon SVG</label><textarea name="icon_svg" rows="3" defaultValue={editClub.icon_svg || ''} key={`svg-${editClub.id}`} /></div>
                        <div className="form-group"><label>Display Order</label><input type="number" name="display_order" defaultValue={editClub.display_order} key={`ord-${editClub.id}`} /></div>
                        <div className="form-group checkbox-group"><label><input type="checkbox" name="is_large" value="true" defaultChecked={editClub.is_large} /> Large Card</label></div>
                        <div className="form-group checkbox-group"><label><input type="checkbox" name="is_wide" value="true" defaultChecked={editClub.is_wide} /> Wide Card</label></div>
                        <div style={{gridColumn:'span 2', display:'flex', gap:12}}>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                            <button type="button" className="btn" onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add New Club */}
            <div className="card">
                <h2>Add New Club</h2>
                <form onSubmit={handleAdd} className="form-grid" encType="multipart/form-data">
                    <div className="form-group"><label>Name *</label><input type="text" name="name" required /></div>
                    <div className="form-group"><label>Slug *</label><input type="text" name="slug" required placeholder="e.g. coding" /></div>
                    <div className="form-group full"><label>Description</label><textarea name="description" rows="2" /></div>
                    <div className="form-group"><label>Hero Gradient</label><input type="text" name="hero_gradient" defaultValue="linear-gradient(135deg, #002147 0%, #1a3a6b 50%, #42a5f5 100%)" /></div>
                    <div className="form-group"><label>BG Tint</label><input type="color" name="bg_tint" defaultValue="#f5f5f7" /></div>
                    <div className="form-group full"><label>Banner Image</label><input type="file" name="banner" accept="image/*" /></div>
                    <div className="form-group"><label>Display Order</label><input type="number" name="display_order" defaultValue="0" /></div>
                    <button type="submit" className="btn btn-primary">Add Club</button>
                </form>
            </div>
        </>
    );
}
