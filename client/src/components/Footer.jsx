export default function Footer({ settings }) {
    return (
        <footer className="footer" id="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <span className="footer-logo">AAC</span>
                        <h3>{settings?.site_title || 'Anand Activity Council'}</h3>
                        <p>{settings?.college_name || 'Anand International College of Engineering'}, Jaipur</p>
                    </div>
                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#about">About Council</a></li>
                            <li><a href="#faculty">Faculty Heads</a></li>
                            <li><a href="#council">Council Heads</a></li>
                            <li><a href="#clubs">Our Clubs</a></li>
                        </ul>
                    </div>
                    <div className="footer-contact">
                        <h4>Get in Touch</h4>
                        <p>{settings?.college_name || 'Anand International College of Engineering'}</p>
                        <p>{settings?.college_address || ''}</p>
                        <p>{settings?.college_email || ''}</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 {settings?.site_title || 'Anand Activity Council'}. All rights reserved.</p>
                    <p>List of Club Office Bearers — 2026</p>
                </div>
            </div>
        </footer>
    );
}
