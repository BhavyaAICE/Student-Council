const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Pool } = require('pg');

// ===== CONFIG =====
const JWT_SECRET = process.env.SESSION_SECRET || 'aac_council_secret_key_2026_xkT9mP';

// Lazy-init pool (avoids crash if env vars not set during build)
let pool;
function getPool() {
    if (!pool) {
        pool = new Pool({
            host: process.env.DB_HOST?.trim(),
            port: parseInt(process.env.DB_PORT?.trim() || '5432'),
            database: process.env.DB_NAME?.trim() || 'postgres',
            user: process.env.DB_USER?.trim() || 'postgres',
            password: process.env.DB_PASSWORD?.trim(),
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000
        });
    }
    return pool;
}

// Lazy-init Supabase client
let supabase;
function getSupabase() {
    if (!supabase) {
        const { createClient } = require('@supabase/supabase-js');
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    }
    return supabase;
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// bcrypt - try native, fallback to JS
let bcryptLib;
try { bcryptLib = require('bcrypt'); } catch { bcryptLib = require('bcryptjs'); }

// ===== EXPRESS APP =====
const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== AUTH HELPERS =====
function signToken(admin) {
    return jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
}

function requireAdmin(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.admin = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

function parseCookies(req) {
    if (req.cookies) return;
    const cookieHeader = req.headers.cookie || '';
    req.cookies = {};
    cookieHeader.split(';').forEach(c => {
        const [key, ...v] = c.trim().split('=');
        if (key) req.cookies[key] = decodeURIComponent(v.join('='));
    });
}
app.use((req, res, next) => { parseCookies(req); next(); });

// ===== UPLOAD HELPER =====
async function uploadToSupabase(buffer, filename) {
    const ext = filename.split('.').pop();
    const name = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await getSupabase().storage.from('uploads').upload(name, buffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: true
    });
    if (error) throw error;
    const { data } = getSupabase().storage.from('uploads').getPublicUrl(name);
    return data.publicUrl;
}

// ===================================
// PUBLIC ROUTES
// ===================================

// Health check / debug
app.get('/api/health', async (req, res) => {
    const info = {
        env: {
            DB_HOST_RAW: process.env.DB_HOST ? `"${process.env.DB_HOST}"` : 'MISSING',
            DB_PASSWORD: process.env.DB_PASSWORD ? 'set' : 'MISSING',
            DB_NAME: process.env.DB_NAME || 'default:postgres',
            DB_PORT: process.env.DB_PORT || '5432',
            SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'MISSING',
            SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'set' : 'MISSING',
            NODE_ENV: process.env.NODE_ENV || 'not set'
        },
        db: 'not tested'
    };
    try {
        const result = await getPool().query('SELECT NOW() as time');
        info.db = 'connected: ' + result.rows[0].time;
    } catch (e) {
        info.db = 'ERROR: ' + e.message;
    }
    res.json(info);
});

// Home page data
app.get('/api/home', async (req, res) => {
    try {
        const [settingsRes, facultyRes, councilRes, clubsRes] = await Promise.all([
            getPool().query('SELECT * FROM settings LIMIT 1'),
            getPool().query('SELECT * FROM faculty ORDER BY display_order'),
            getPool().query('SELECT * FROM council_heads ORDER BY display_order'),
            getPool().query('SELECT * FROM clubs ORDER BY display_order')
        ]);
        const clubs = clubsRes.rows;
        for (const club of clubs) {
            const [membersRes, advisorsRes] = await Promise.all([
                getPool().query('SELECT * FROM club_members WHERE club_id = $1 ORDER BY display_order', [club.id]),
                getPool().query('SELECT * FROM club_advisors WHERE club_id = $1', [club.id])
            ]);
            club.captain = membersRes.rows.find(m => m.position === 'captain') || null;
            club.vice_captain = membersRes.rows.find(m => m.position === 'vice_captain') || null;
            club.members = membersRes.rows.filter(m => m.position === 'member');
            club.advisors = advisorsRes.rows;
        }
        res.json({ settings: settingsRes.rows[0] || {}, faculty: facultyRes.rows, councilHeads: councilRes.rows, clubs });
    } catch (err) {
        console.error('Home API error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Club detail
app.get('/api/clubs/:slug', async (req, res) => {
    try {
        const clubRes = await getPool().query('SELECT * FROM clubs WHERE slug = $1', [req.params.slug]);
        if (clubRes.rows.length === 0) return res.status(404).json({ error: 'Club not found' });
        const club = clubRes.rows[0];
        const [membersRes, advisorsRes, settingsRes] = await Promise.all([
            getPool().query('SELECT * FROM club_members WHERE club_id = $1 ORDER BY display_order', [club.id]),
            getPool().query('SELECT * FROM club_advisors WHERE club_id = $1', [club.id]),
            getPool().query('SELECT * FROM settings LIMIT 1')
        ]);
        club.captain = membersRes.rows.find(m => m.position === 'captain') || null;
        club.vice_captain = membersRes.rows.find(m => m.position === 'vice_captain') || null;
        club.members = membersRes.rows.filter(m => m.position === 'member');
        club.advisors = advisorsRes.rows;
        res.json({ club, settings: settingsRes.rows[0] || {} });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ===================================
// ADMIN AUTH
// ===================================

app.get('/api/admin/me', requireAdmin, (req, res) => {
    res.json({ admin: req.admin });
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await getPool().query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await bcryptLib.compare(password, result.rows[0].password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        const token = signToken(result.rows[0]);
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
        res.json({ success: true, admin: { id: result.rows[0].id, username } });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
    res.json({ success: true });
});

// ===================================
// ADMIN DASHBOARD
// ===================================

app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
    const [faculty, council, clubs, members] = await Promise.all([
        getPool().query('SELECT COUNT(*) FROM faculty'),
        getPool().query('SELECT COUNT(*) FROM council_heads'),
        getPool().query('SELECT COUNT(*) FROM clubs'),
        getPool().query('SELECT COUNT(*) FROM club_members')
    ]);
    res.json({ counts: { faculty: +faculty.rows[0].count, council: +council.rows[0].count, clubs: +clubs.rows[0].count, members: +members.rows[0].count } });
});

// ===================================
// ADMIN SETTINGS
// ===================================

app.get('/api/admin/settings', requireAdmin, async (req, res) => {
    const result = await getPool().query('SELECT * FROM settings LIMIT 1');
    res.json({ settings: result.rows[0] || {} });
});

app.post('/api/admin/settings', requireAdmin, async (req, res) => {
    const { site_title, site_year, hero_tagline, about_text, about_text_2, college_name, college_address, college_email } = req.body;
    await getPool().query(
        'UPDATE settings SET site_title=$1, site_year=$2, hero_tagline=$3, about_text=$4, about_text_2=$5, college_name=$6, college_address=$7, college_email=$8, updated_at=NOW()',
        [site_title, site_year, hero_tagline, about_text, about_text_2, college_name, college_address, college_email]
    );
    res.json({ success: true });
});

// ===================================
// ADMIN FACULTY CRUD
// ===================================

app.get('/api/admin/faculty', requireAdmin, async (req, res) => {
    const result = await getPool().query('SELECT * FROM faculty ORDER BY display_order');
    res.json({ faculty: result.rows });
});

app.post('/api/admin/faculty', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, designation, department, email, phone, is_head, display_order } = req.body;
    let photo_url = null;
    if (req.file) photo_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'INSERT INTO faculty (name, designation, department, email, phone, photo_url, is_head, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [name, designation, department, email, phone, photo_url, is_head === 'true' || is_head === 'on', display_order || 0]
    );
    res.json({ success: true });
});

app.put('/api/admin/faculty/:id', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, designation, department, email, phone, is_head, display_order, existing_photo } = req.body;
    let photo_url = existing_photo || null;
    if (req.file) photo_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'UPDATE faculty SET name=$1, designation=$2, department=$3, email=$4, phone=$5, photo_url=$6, is_head=$7, display_order=$8 WHERE id=$9',
        [name, designation, department, email, phone, photo_url, is_head === 'true' || is_head === 'on', display_order || 0, req.params.id]
    );
    res.json({ success: true });
});

app.delete('/api/admin/faculty/:id', requireAdmin, async (req, res) => {
    await getPool().query('DELETE FROM faculty WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===================================
// ADMIN COUNCIL CRUD
// ===================================

app.get('/api/admin/council', requireAdmin, async (req, res) => {
    const result = await getPool().query('SELECT * FROM council_heads ORDER BY display_order');
    res.json({ heads: result.rows });
});

app.post('/api/admin/council', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, role, enrollment_id, email, phone, department, year, display_order } = req.body;
    let photo_url = null;
    if (req.file) photo_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'INSERT INTO council_heads (name, role, enrollment_id, email, phone, department, year, photo_url, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [name, role, enrollment_id, email, phone, department, year, photo_url, display_order || 0]
    );
    res.json({ success: true });
});

app.put('/api/admin/council/:id', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, role, enrollment_id, email, phone, department, year, display_order, existing_photo } = req.body;
    let photo_url = existing_photo || null;
    if (req.file) photo_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'UPDATE council_heads SET name=$1, role=$2, enrollment_id=$3, email=$4, phone=$5, department=$6, year=$7, photo_url=$8, display_order=$9 WHERE id=$10',
        [name, role, enrollment_id, email, phone, department, year, photo_url, display_order || 0, req.params.id]
    );
    res.json({ success: true });
});

app.delete('/api/admin/council/:id', requireAdmin, async (req, res) => {
    await getPool().query('DELETE FROM council_heads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===================================
// ADMIN CLUBS CRUD
// ===================================

app.get('/api/admin/clubs', requireAdmin, async (req, res) => {
    const result = await getPool().query('SELECT * FROM clubs ORDER BY display_order');
    res.json({ clubs: result.rows });
});

app.post('/api/admin/clubs', requireAdmin, upload.single('banner'), async (req, res) => {
    const { name, slug, description, hero_gradient, bg_tint, icon_svg, display_order, is_large, is_wide } = req.body;
    let banner_image_url = null;
    if (req.file) banner_image_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'INSERT INTO clubs (name, slug, description, hero_gradient, bg_tint, icon_svg, display_order, is_large, is_wide, banner_image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [name, slug, description, hero_gradient, bg_tint, icon_svg, display_order || 0, is_large === 'true' || is_large === 'on', is_wide === 'true' || is_wide === 'on', banner_image_url]
    );
    res.json({ success: true });
});

app.put('/api/admin/clubs/:id', requireAdmin, upload.single('banner'), async (req, res) => {
    const { name, slug, description, hero_gradient, bg_tint, icon_svg, display_order, is_large, is_wide, existing_banner } = req.body;
    let banner_image_url = existing_banner || null;
    if (req.file) banner_image_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'UPDATE clubs SET name=$1, slug=$2, description=$3, hero_gradient=$4, bg_tint=$5, icon_svg=$6, display_order=$7, is_large=$8, is_wide=$9, banner_image_url=$10 WHERE id=$11',
        [name, slug, description, hero_gradient, bg_tint, icon_svg, display_order || 0, is_large === 'true' || is_large === 'on', is_wide === 'true' || is_wide === 'on', banner_image_url, req.params.id]
    );
    res.json({ success: true });
});

app.delete('/api/admin/clubs/:id', requireAdmin, async (req, res) => {
    await getPool().query('DELETE FROM clubs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===================================
// ADMIN CLUB MEMBERS CRUD
// ===================================

app.get('/api/admin/clubs/:id/members', requireAdmin, async (req, res) => {
    const club = await getPool().query('SELECT * FROM clubs WHERE id = $1', [req.params.id]);
    if (club.rows.length === 0) return res.status(404).json({ error: 'Club not found' });
    const members = await getPool().query('SELECT * FROM club_members WHERE club_id = $1 ORDER BY display_order', [req.params.id]);
    const advisors = await getPool().query('SELECT * FROM club_advisors WHERE club_id = $1', [req.params.id]);
    res.json({ club: club.rows[0], members: members.rows, advisors: advisors.rows });
});

app.post('/api/admin/clubs/:id/members', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, roll_no, email, phone, position, display_order } = req.body;
    let photo_url = null;
    if (req.file) photo_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'INSERT INTO club_members (club_id, name, roll_no, email, phone, photo_url, position, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [req.params.id, name, roll_no, email, phone, photo_url, position, display_order || 0]
    );
    res.json({ success: true });
});

app.put('/api/admin/members/:id', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, roll_no, email, phone, position, display_order, existing_photo } = req.body;
    let photo_url = existing_photo || null;
    if (req.file) photo_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'UPDATE club_members SET name=$1, roll_no=$2, email=$3, phone=$4, photo_url=$5, position=$6, display_order=$7 WHERE id=$8',
        [name, roll_no, email, phone, photo_url, position, display_order || 0, req.params.id]
    );
    res.json({ success: true });
});

app.delete('/api/admin/members/:id', requireAdmin, async (req, res) => {
    await getPool().query('DELETE FROM club_members WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===================================
// ADMIN ADVISORS
// ===================================

app.post('/api/admin/clubs/:id/advisors', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, designation, email, phone } = req.body;
    let photo_url = null;
    if (req.file) photo_url = await uploadToSupabase(req.file.buffer, req.file.originalname);
    await getPool().query(
        'INSERT INTO club_advisors (club_id, name, designation, email, phone, photo_url) VALUES ($1,$2,$3,$4,$5,$6)',
        [req.params.id, name, designation, email, phone, photo_url]
    );
    res.json({ success: true });
});

app.delete('/api/admin/advisors/:id', requireAdmin, async (req, res) => {
    await getPool().query('DELETE FROM club_advisors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===== REMOVE PHOTO =====
app.delete('/api/admin/remove-photo/:table/:id', requireAdmin, async (req, res) => {
    const allowed = { faculty: 'faculty', council: 'council_heads', members: 'club_members' };
    const table = allowed[req.params.table];
    if (!table) return res.status(400).json({ error: 'Invalid table' });
    await getPool().query(`UPDATE ${table} SET photo_url = NULL WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
});

// ===== LOCAL DEV SERVER =====
if (process.env.NODE_ENV !== 'production') {
    const path = require('path');
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '..', 'server', 'uploads');
    if (fs.existsSync(uploadsDir)) {
        app.use('/uploads', express.static(uploadsDir));
    }
}

// Export for Vercel
module.exports = app;

// Local dev server (not triggered on Vercel)
if (require.main === module) {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
    const PORT = process.env.PORT || 3456;
    app.listen(PORT, () => {
        console.log(`🚀 API Server running at http://localhost:${PORT}`);
    });
}
