const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer (temp storage, sharp will process)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'), false);
    }
});

// Image optimization with sharp
async function optimizeImage(buffer, filename) {
    const webpName = filename.replace(/\.[^.]+$/, '') + '.webp';
    const outputPath = path.join(uploadsDir, webpName);

    await sharp(buffer)
        .resize(400, 400, { fit: 'cover', position: 'top' })
        .webp({ quality: 80 })
        .toFile(outputPath);

    const thumbName = 'thumb_' + webpName;
    await sharp(buffer)
        .resize(80, 80, { fit: 'cover', position: 'top' })
        .webp({ quality: 70 })
        .toFile(path.join(uploadsDir, thumbName));

    return '/uploads/' + webpName;
}

// Banner image optimization (wider aspect ratio)
async function optimizeBannerImage(buffer, filename) {
    const webpName = 'banner_' + filename.replace(/\.[^.]+$/, '') + '.webp';
    const outputPath = path.join(uploadsDir, webpName);

    await sharp(buffer)
        .resize(1200, 400, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toFile(outputPath);

    return '/uploads/' + webpName;
}

// Auth middleware
function requireAdmin(req, res, next) {
    if (req.session.admin) return next();
    res.status(401).json({ error: 'Unauthorized' });
}

// Auth check
router.get('/me', (req, res) => {
    if (req.session.admin) {
        res.json({ admin: req.session.admin });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, result.rows[0].password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        req.session.admin = { id: result.rows[0].id, username };
        res.json({ success: true, admin: req.session.admin });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ===== DASHBOARD =====
router.get('/dashboard', requireAdmin, async (req, res) => {
    const [faculty, council, clubs, members] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM faculty'),
        pool.query('SELECT COUNT(*) FROM council_heads'),
        pool.query('SELECT COUNT(*) FROM clubs'),
        pool.query('SELECT COUNT(*) FROM club_members')
    ]);
    res.json({
        counts: {
            faculty: parseInt(faculty.rows[0].count),
            council: parseInt(council.rows[0].count),
            clubs: parseInt(clubs.rows[0].count),
            members: parseInt(members.rows[0].count)
        }
    });
});

// ===== SETTINGS =====
router.get('/settings', requireAdmin, async (req, res) => {
    const result = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json({ settings: result.rows[0] || {} });
});

router.post('/settings', requireAdmin, async (req, res) => {
    const { site_title, site_year, hero_tagline, about_text, about_text_2, college_name, college_address, college_email } = req.body;
    await pool.query(
        `UPDATE settings SET site_title=$1, site_year=$2, hero_tagline=$3, about_text=$4, about_text_2=$5, college_name=$6, college_address=$7, college_email=$8, updated_at=NOW()`,
        [site_title, site_year, hero_tagline, about_text, about_text_2, college_name, college_address, college_email]
    );
    res.json({ success: true });
});

// ===== FACULTY CRUD =====
router.get('/faculty', requireAdmin, async (req, res) => {
    const result = await pool.query('SELECT * FROM faculty ORDER BY display_order');
    res.json({ faculty: result.rows });
});

router.post('/faculty', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, designation, department, email, phone, is_head, display_order } = req.body;
    let photo_url = null;
    if (req.file) photo_url = await optimizeImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `INSERT INTO faculty (name, designation, department, email, phone, photo_url, is_head, display_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [name, designation, department, email, phone, photo_url, is_head === 'true' || is_head === 'on', display_order || 0]
    );
    res.json({ success: true });
});

router.put('/faculty/:id', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, designation, department, email, phone, is_head, display_order, existing_photo } = req.body;
    let photo_url = existing_photo || null;
    if (req.file) photo_url = await optimizeImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `UPDATE faculty SET name=$1, designation=$2, department=$3, email=$4, phone=$5, photo_url=$6, is_head=$7, display_order=$8 WHERE id=$9`,
        [name, designation, department, email, phone, photo_url, is_head === 'true' || is_head === 'on', display_order || 0, req.params.id]
    );
    res.json({ success: true });
});

router.delete('/faculty/:id', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM faculty WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===== COUNCIL HEADS CRUD =====
router.get('/council', requireAdmin, async (req, res) => {
    const result = await pool.query('SELECT * FROM council_heads ORDER BY display_order');
    res.json({ heads: result.rows });
});

router.post('/council', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, role, enrollment_id, email, phone, department, year, display_order } = req.body;
    let photo_url = null;
    if (req.file) photo_url = await optimizeImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `INSERT INTO council_heads (name, role, enrollment_id, email, phone, department, year, photo_url, display_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [name, role, enrollment_id, email, phone, department, year, photo_url, display_order || 0]
    );
    res.json({ success: true });
});

router.put('/council/:id', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, role, enrollment_id, email, phone, department, year, display_order, existing_photo } = req.body;
    let photo_url = existing_photo || null;
    if (req.file) photo_url = await optimizeImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `UPDATE council_heads SET name=$1, role=$2, enrollment_id=$3, email=$4, phone=$5, department=$6, year=$7, photo_url=$8, display_order=$9 WHERE id=$10`,
        [name, role, enrollment_id, email, phone, department, year, photo_url, display_order || 0, req.params.id]
    );
    res.json({ success: true });
});

router.delete('/council/:id', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM council_heads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===== CLUBS CRUD =====
router.get('/clubs', requireAdmin, async (req, res) => {
    const result = await pool.query('SELECT * FROM clubs ORDER BY display_order');
    res.json({ clubs: result.rows });
});

router.post('/clubs', requireAdmin, upload.single('banner'), async (req, res) => {
    const { name, slug, description, hero_gradient, bg_tint, icon_svg, display_order, is_large, is_wide } = req.body;
    let banner_image_url = null;
    if (req.file) banner_image_url = await optimizeBannerImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `INSERT INTO clubs (name, slug, description, hero_gradient, bg_tint, icon_svg, display_order, is_large, is_wide, banner_image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [name, slug, description, hero_gradient, bg_tint, icon_svg, display_order || 0, is_large === 'true' || is_large === 'on', is_wide === 'true' || is_wide === 'on', banner_image_url]
    );
    res.json({ success: true });
});

router.put('/clubs/:id', requireAdmin, upload.single('banner'), async (req, res) => {
    const { name, slug, description, hero_gradient, bg_tint, icon_svg, display_order, is_large, is_wide, existing_banner } = req.body;
    let banner_image_url = existing_banner || null;
    if (req.file) banner_image_url = await optimizeBannerImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `UPDATE clubs SET name=$1, slug=$2, description=$3, hero_gradient=$4, bg_tint=$5, icon_svg=$6, display_order=$7, is_large=$8, is_wide=$9, banner_image_url=$10 WHERE id=$11`,
        [name, slug, description, hero_gradient, bg_tint, icon_svg, display_order || 0, is_large === 'true' || is_large === 'on', is_wide === 'true' || is_wide === 'on', banner_image_url, req.params.id]
    );
    res.json({ success: true });
});

router.delete('/clubs/:id', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM clubs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===== CLUB MEMBERS CRUD =====
router.get('/clubs/:id/members', requireAdmin, async (req, res) => {
    const club = await pool.query('SELECT * FROM clubs WHERE id = $1', [req.params.id]);
    if (club.rows.length === 0) return res.status(404).json({ error: 'Club not found' });
    const members = await pool.query('SELECT * FROM club_members WHERE club_id = $1 ORDER BY display_order', [req.params.id]);
    const advisors = await pool.query('SELECT * FROM club_advisors WHERE club_id = $1', [req.params.id]);
    res.json({ club: club.rows[0], members: members.rows, advisors: advisors.rows });
});

router.post('/clubs/:id/members', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, roll_no, email, phone, position, display_order } = req.body;
    let photo_url = null;
    if (req.file) photo_url = await optimizeImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `INSERT INTO club_members (club_id, name, roll_no, email, phone, photo_url, position, display_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [req.params.id, name, roll_no, email, phone, photo_url, position, display_order || 0]
    );
    res.json({ success: true });
});

router.put('/members/:id', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, roll_no, email, phone, position, display_order, existing_photo } = req.body;
    let photo_url = existing_photo || null;
    if (req.file) photo_url = await optimizeImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `UPDATE club_members SET name=$1, roll_no=$2, email=$3, phone=$4, photo_url=$5, position=$6, display_order=$7 WHERE id=$8`,
        [name, roll_no, email, phone, photo_url, position, display_order || 0, req.params.id]
    );
    res.json({ success: true });
});

router.delete('/members/:id', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM club_members WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===== CLUB ADVISORS CRUD =====
router.post('/clubs/:id/advisors', requireAdmin, upload.single('photo'), async (req, res) => {
    const { name, designation, email, phone } = req.body;
    let photo_url = null;
    if (req.file) photo_url = await optimizeImage(req.file.buffer, Date.now() + '_' + req.file.originalname);
    await pool.query(
        `INSERT INTO club_advisors (club_id, name, designation, email, phone, photo_url) VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.params.id, name, designation, email, phone, photo_url]
    );
    res.json({ success: true });
});

router.delete('/advisors/:id', requireAdmin, async (req, res) => {
    await pool.query('DELETE FROM club_advisors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ===== REMOVE PHOTO =====
router.delete('/remove-photo/:table/:id', requireAdmin, async (req, res) => {
    const allowed = { faculty: 'faculty', council: 'council_heads', members: 'club_members' };
    const table = allowed[req.params.table];
    if (!table) return res.status(400).json({ error: 'Invalid table' });
    await pool.query(`UPDATE ${table} SET photo_url = NULL WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
});

module.exports = router;
