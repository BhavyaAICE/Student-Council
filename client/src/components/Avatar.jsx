const TITLE_PREFIXES = ['mr.', 'ms.', 'mrs.', 'dr.', 'er.', 'prof.', 'shri', 'smt.'];

export function initials(name) {
    if (!name) return '??';
    const words = name.split(/\s+/).filter(w => !TITLE_PREFIXES.includes(w.toLowerCase()));
    if (words.length === 0) return name[0]?.toUpperCase() || '??';
    return words.map(w => w[0]).join('').substring(0, 2).toUpperCase();
}


export default function Avatar({ name, photoUrl, size = 'medium', className = '' }) {
    const sizeClass = size === 'large' ? 'large' : size === 'small' ? 'small' : '';

    if (photoUrl) {
        return <img src={photoUrl} alt={name} className={`avatar-img ${sizeClass} ${className}`} style={{ borderRadius: '50%', objectFit: 'cover', width: size === 'large' ? 120 : size === 'small' ? 40 : 80, height: size === 'large' ? 120 : size === 'small' ? 40 : 80 }} />;
    }

    return (
        <div className={`avatar-placeholder ${sizeClass} ${className}`}>
            {initials(name)}
        </div>
    );
}
