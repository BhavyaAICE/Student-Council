import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function Settings() {
    const [settings, setSettings] = useState({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.getSettings().then(d => setSettings(d.settings || {}));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.updateSettings(settings);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const update = (key, val) => setSettings({ ...settings, [key]: val });

    return (
        <>
            <h1>Site Settings</h1>
            {success && <div className="alert alert-success">Settings saved!</div>}
            <div className="card">
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group"><label>Site Title</label><input type="text" value={settings.site_title || ''} onChange={e => update('site_title', e.target.value)} /></div>
                    <div className="form-group"><label>Academic Year</label><input type="text" value={settings.site_year || ''} onChange={e => update('site_year', e.target.value)} /></div>
                    <div className="form-group full"><label>Hero Tagline</label><input type="text" value={settings.hero_tagline || ''} onChange={e => update('hero_tagline', e.target.value)} /></div>
                    <div className="form-group full"><label>About Text (Paragraph 1)</label><textarea rows="4" value={settings.about_text || ''} onChange={e => update('about_text', e.target.value)} /></div>
                    <div className="form-group full"><label>About Text (Paragraph 2)</label><textarea rows="4" value={settings.about_text_2 || ''} onChange={e => update('about_text_2', e.target.value)} /></div>
                    <div className="form-group"><label>College Name</label><input type="text" value={settings.college_name || ''} onChange={e => update('college_name', e.target.value)} /></div>
                    <div className="form-group full"><label>College Address</label><input type="text" value={settings.college_address || ''} onChange={e => update('college_address', e.target.value)} /></div>
                    <div className="form-group"><label>College Email</label><input type="email" value={settings.college_email || ''} onChange={e => update('college_email', e.target.value)} /></div>
                    <button type="submit" className="btn btn-primary">Save Settings</button>
                </form>
            </div>
        </>
    );
}
