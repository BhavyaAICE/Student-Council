import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function Council() {
    const [heads, setHeads] = useState([]);
    const [success, setSuccess] = useState(false);
    const [editId, setEditId] = useState(null);

    const load = () => api.getCouncil().then(d => setHeads(d.heads));
    useEffect(() => { load(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.addCouncil(fd);
        e.target.reset();
        setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleUpdate = async (e, id) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.updateCouncil(id, fd);
        setEditId(null); setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete?')) return;
        await api.deleteCouncil(id);
        load();
    };

    const ini = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2) : '??';

    return (
        <>
            <h1>Council Heads</h1>
            {success && <div className="alert alert-success">Changes saved!</div>}

            <div className="card">
                <h2>Add Council Head</h2>
                <form onSubmit={handleAdd} className="form-grid" encType="multipart/form-data">
                    <div className="form-group"><label>Name *</label><input type="text" name="name" required /></div>
                    <div className="form-group"><label>Role *</label><input type="text" name="role" required placeholder="e.g. President" /></div>
                    <div className="form-group"><label>Enrollment ID</label><input type="text" name="enrollment_id" /></div>
                    <div className="form-group"><label>Email</label><input type="email" name="email" /></div>
                    <div className="form-group"><label>Phone</label><input type="text" name="phone" /></div>
                    <div className="form-group"><label>Department</label><input type="text" name="department" /></div>
                    <div className="form-group"><label>Year</label><input type="text" name="year" /></div>
                    <div className="form-group"><label>Photo</label><input type="file" name="photo" accept="image/*" /></div>
                    <div className="form-group"><label>Order</label><input type="number" name="display_order" defaultValue="0" /></div>
                    <button type="submit" className="btn btn-primary">Add</button>
                </form>
            </div>

            <div className="card">
                <h2>Current Heads ({heads.length})</h2>
                <div className="table-wrap"><table className="admin-table">
                    <thead><tr><th>Photo</th><th>Name</th><th>Role</th><th>Email</th><th>ID</th><th>Actions</th></tr></thead>
                    <tbody>
                        {heads.map(h => (
                            <tr key={h.id}>
                                <td>
                                    {h.photo_url
                                        ? <div style={{display:'flex',alignItems:'center',gap:6}}>
                                            <img src={h.photo_url} className="table-thumb" alt="" />
                                            <button className="btn btn-sm btn-danger" style={{fontSize:'0.6rem',padding:'2px 6px'}} onClick={async () => { if(confirm('Remove photo?')) { await api.removePhoto('council', h.id); load(); }}}>✕</button>
                                          </div>
                                        : <span className="table-initials">{ini(h.name)}</span>
                                    }
                                </td>
                                <td><strong>{h.name}</strong></td>
                                <td>{h.role}</td>
                                <td>{h.email || '—'}</td>
                                <td>{h.enrollment_id || '—'}</td>
                                <td className="actions">
                                    <button className="btn btn-sm" onClick={() => setEditId(editId === h.id ? null : h.id)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(h.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {heads.map(h => editId === h.id && (
                            <tr className="edit-row" key={`edit-${h.id}`}><td colSpan="6">
                                <form onSubmit={(e) => handleUpdate(e, h.id)} className="form-grid" encType="multipart/form-data">
                                    <input type="hidden" name="existing_photo" defaultValue={h.photo_url || ''} />
                                    <div className="form-group"><label>Name</label><input type="text" name="name" defaultValue={h.name} required /></div>
                                    <div className="form-group"><label>Role</label><input type="text" name="role" defaultValue={h.role} required /></div>
                                    <div className="form-group"><label>Enrollment ID</label><input type="text" name="enrollment_id" defaultValue={h.enrollment_id || ''} /></div>
                                    <div className="form-group"><label>Email</label><input type="email" name="email" defaultValue={h.email || ''} /></div>
                                    <div className="form-group"><label>Phone</label><input type="text" name="phone" defaultValue={h.phone || ''} /></div>
                                    <div className="form-group"><label>Department</label><input type="text" name="department" defaultValue={h.department || ''} /></div>
                                    <div className="form-group"><label>Year</label><input type="text" name="year" defaultValue={h.year || ''} /></div>
                                    <div className="form-group"><label>New Photo</label><input type="file" name="photo" accept="image/*" /></div>
                                    <div className="form-group"><label>Order</label><input type="number" name="display_order" defaultValue={h.display_order} /></div>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </form>
                            </td></tr>
                        ))}
                    </tbody>
                </table></div>
            </div>
        </>
    );
}
