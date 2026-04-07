import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';

export default function Members() {
    const { id } = useParams();
    const [club, setClub] = useState(null);
    const [members, setMembers] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [success, setSuccess] = useState(false);
    const [editId, setEditId] = useState(null);

    const load = () => api.getMembers(id).then(d => {
        setClub(d.club);
        setMembers(d.members);
        setAdvisors(d.advisors);
    });
    useEffect(() => { load(); }, [id]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.addMember(id, fd);
        e.target.reset();
        setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleUpdateMember = async (e, mid) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.updateMember(mid, fd);
        setEditId(null); setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleDeleteMember = async (mid) => {
        if (!confirm('Delete?')) return;
        await api.deleteMember(mid);
        load();
    };

    const handleAddAdvisor = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.addAdvisor(id, fd);
        e.target.reset();
        setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleDeleteAdvisor = async (aid) => {
        if (!confirm('Remove?')) return;
        await api.deleteAdvisor(aid);
        load();
    };

    const ini = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2) : '??';

    if (!club) return <p>Loading...</p>;

    return (
        <>
            <Link to="/admin/clubs" className="back-link">← Back to Clubs</Link>
            <h1>{club.name}</h1>
            <p className="admin-subtitle">Manage members and faculty advisors</p>
            {success && <div className="alert alert-success">Changes saved!</div>}

            <div className="card">
                <h2>Add Member</h2>
                <form onSubmit={handleAddMember} className="form-grid" encType="multipart/form-data">
                    <div className="form-group"><label>Name *</label><input type="text" name="name" required /></div>
                    <div className="form-group"><label>Position</label>
                        <select name="position"><option value="member">Member</option><option value="captain">Captain</option><option value="vice_captain">Vice Captain</option></select>
                    </div>
                    <div className="form-group"><label>Roll No.</label><input type="text" name="roll_no" /></div>
                    <div className="form-group"><label>Email</label><input type="email" name="email" /></div>
                    <div className="form-group"><label>Phone</label><input type="text" name="phone" /></div>
                    <div className="form-group"><label>Photo</label><input type="file" name="photo" accept="image/*" /></div>
                    <div className="form-group"><label>Order</label><input type="number" name="display_order" defaultValue="0" /></div>
                    <button type="submit" className="btn btn-primary">Add Member</button>
                </form>
            </div>

            <div className="card">
                <h2>Members ({members.length})</h2>
                <div className="table-wrap"><table className="admin-table">
                    <thead><tr><th>Photo</th><th>Name</th><th>Position</th><th>Roll No.</th><th>Email</th><th>Actions</th></tr></thead>
                    <tbody>
                        {members.map(m => (
                            <tr key={m.id}>
                                <td>
                                    {m.photo_url
                                        ? <div style={{display:'flex',alignItems:'center',gap:6}}>
                                            <img src={m.photo_url} className="table-thumb" alt="" />
                                            <button className="btn btn-sm btn-danger" style={{fontSize:'0.6rem',padding:'2px 6px'}} onClick={async () => { if(confirm('Remove photo?')) { await api.removePhoto('members', m.id); load(); }}}>✕</button>
                                          </div>
                                        : <span className="table-initials">{ini(m.name)}</span>
                                    }
                                </td>
                                <td><strong>{m.name}</strong></td>
                                <td><span className={`badge badge-${m.position}`}>{m.position.replace('_', ' ')}</span></td>
                                <td>{m.roll_no || '—'}</td>
                                <td>{m.email || '—'}</td>
                                <td className="actions">
                                    <button className="btn btn-sm" onClick={() => setEditId(editId === m.id ? null : m.id)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteMember(m.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {members.map(m => editId === m.id && (
                            <tr className="edit-row" key={`edit-${m.id}`}><td colSpan="6">
                                <form onSubmit={(e) => handleUpdateMember(e, m.id)} className="form-grid" encType="multipart/form-data">
                                    <input type="hidden" name="existing_photo" defaultValue={m.photo_url || ''} />
                                    <div className="form-group"><label>Name</label><input type="text" name="name" defaultValue={m.name} required /></div>
                                    <div className="form-group"><label>Position</label>
                                        <select name="position" defaultValue={m.position}>
                                            <option value="member">Member</option><option value="captain">Captain</option><option value="vice_captain">Vice Captain</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Roll No.</label><input type="text" name="roll_no" defaultValue={m.roll_no || ''} /></div>
                                    <div className="form-group"><label>Email</label><input type="email" name="email" defaultValue={m.email || ''} /></div>
                                    <div className="form-group"><label>Phone</label><input type="text" name="phone" defaultValue={m.phone || ''} /></div>
                                    <div className="form-group"><label>New Photo</label><input type="file" name="photo" accept="image/*" /></div>
                                    <div className="form-group"><label>Order</label><input type="number" name="display_order" defaultValue={m.display_order} /></div>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </form>
                            </td></tr>
                        ))}
                    </tbody>
                </table></div>
            </div>

            <div className="card">
                <h2>Faculty Advisors ({advisors.length})</h2>
                <form onSubmit={handleAddAdvisor} className="form-grid" encType="multipart/form-data" style={{marginBottom: 24}}>
                    <div className="form-group"><label>Name *</label><input type="text" name="name" required /></div>
                    <div className="form-group"><label>Designation</label><input type="text" name="designation" defaultValue="Faculty Advisor" /></div>
                    <div className="form-group"><label>Email</label><input type="email" name="email" /></div>
                    <div className="form-group"><label>Photo</label><input type="file" name="photo" accept="image/*" /></div>
                    <button type="submit" className="btn btn-primary">Add Advisor</button>
                </form>
                {advisors.map(a => (
                    <div className="advisor-row" key={a.id}>
                        <strong>{a.name}</strong> — {a.designation || ''} {a.email && `(${a.email})`}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAdvisor(a.id)}>Remove</button>
                    </div>
                ))}
            </div>
        </>
    );
}
