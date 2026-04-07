import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [success, setSuccess] = useState(false);
    const [editId, setEditId] = useState(null);

    const load = () => api.getFaculty().then(d => setFaculty(d.faculty));
    useEffect(() => { load(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.addFaculty(fd);
        e.target.reset();
        setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleUpdate = async (e, id) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.updateFaculty(id, fd);
        setEditId(null); setSuccess(true); setTimeout(() => setSuccess(false), 3000);
        load();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete?')) return;
        await api.deleteFaculty(id);
        load();
    };

    const ini = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2) : '??';

    return (
        <>
            <h1>Faculty Heads</h1>
            {success && <div className="alert alert-success">Changes saved successfully!</div>}

            <div className="card">
                <h2>Add Faculty</h2>
                <form onSubmit={handleAdd} className="form-grid" encType="multipart/form-data">
                    <div className="form-group"><label>Name *</label><input type="text" name="name" required /></div>
                    <div className="form-group"><label>Designation</label><input type="text" name="designation" placeholder="e.g. Associate Professor" /></div>
                    <div className="form-group"><label>Department</label><input type="text" name="department" /></div>
                    <div className="form-group"><label>Email</label><input type="email" name="email" /></div>
                    <div className="form-group"><label>Phone</label><input type="text" name="phone" /></div>
                    <div className="form-group"><label>Photo</label><input type="file" name="photo" accept="image/*" /></div>
                    <div className="form-group"><label>Order</label><input type="number" name="display_order" defaultValue="0" /></div>
                    <div className="form-group checkbox-group"><label><input type="checkbox" name="is_head" value="true" /> Head of Council</label></div>
                    <button type="submit" className="btn btn-primary">Add Faculty</button>
                </form>
            </div>

            <div className="card">
                <h2>Current Faculty ({faculty.length})</h2>
                <div className="table-wrap"><table className="admin-table">
                    <thead><tr><th>Photo</th><th>Name</th><th>Designation</th><th>Email</th><th>Head?</th><th>Actions</th></tr></thead>
                    <tbody>
                        {faculty.map(f => (
                            <tr key={f.id}>
                                <td>
                                    {f.photo_url
                                        ? <div style={{display:'flex',alignItems:'center',gap:6}}>
                                            <img src={f.photo_url} className="table-thumb" alt="" />
                                            <button className="btn btn-sm btn-danger" style={{fontSize:'0.6rem',padding:'2px 6px'}} onClick={async () => { if(confirm('Remove photo?')) { await api.removePhoto('faculty', f.id); load(); }}}>✕</button>
                                          </div>
                                        : <span className="table-initials">{ini(f.name)}</span>
                                    }
                                </td>
                                <td><strong>{f.name}</strong></td>
                                <td>{f.designation || '—'}{f.department ? ', ' + f.department : ''}</td>
                                <td>{f.email || '—'}</td>
                                <td>{f.is_head ? '✓' : ''}</td>
                                <td className="actions">
                                    <button className="btn btn-sm" onClick={() => setEditId(editId === f.id ? null : f.id)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {faculty.map(f => editId === f.id && (
                            <tr className="edit-row" key={`edit-${f.id}`}><td colSpan="6">
                                <form onSubmit={(e) => handleUpdate(e, f.id)} className="form-grid" encType="multipart/form-data">
                                    <input type="hidden" name="existing_photo" defaultValue={f.photo_url || ''} />
                                    <div className="form-group"><label>Name</label><input type="text" name="name" defaultValue={f.name} required /></div>
                                    <div className="form-group"><label>Designation</label><input type="text" name="designation" defaultValue={f.designation || ''} /></div>
                                    <div className="form-group"><label>Department</label><input type="text" name="department" defaultValue={f.department || ''} /></div>
                                    <div className="form-group"><label>Email</label><input type="email" name="email" defaultValue={f.email || ''} /></div>
                                    <div className="form-group"><label>Phone</label><input type="text" name="phone" defaultValue={f.phone || ''} /></div>
                                    <div className="form-group"><label>New Photo</label><input type="file" name="photo" accept="image/*" /></div>
                                    <div className="form-group"><label>Order</label><input type="number" name="display_order" defaultValue={f.display_order} /></div>
                                    <div className="form-group checkbox-group"><label><input type="checkbox" name="is_head" value="true" defaultChecked={f.is_head} /> Head</label></div>
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
