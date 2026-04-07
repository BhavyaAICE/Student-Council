const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Home page data
router.get('/home', async (req, res) => {
    try {
        const [settingsRes, facultyRes, councilRes, clubsRes] = await Promise.all([
            pool.query('SELECT * FROM settings LIMIT 1'),
            pool.query('SELECT * FROM faculty ORDER BY display_order'),
            pool.query('SELECT * FROM council_heads ORDER BY display_order'),
            pool.query('SELECT * FROM clubs ORDER BY display_order')
        ]);

        const settings = settingsRes.rows[0] || {};
        const clubs = clubsRes.rows;

        for (const club of clubs) {
            const membersRes = await pool.query(
                'SELECT * FROM club_members WHERE club_id = $1 ORDER BY display_order', [club.id]
            );
            const advisorsRes = await pool.query(
                'SELECT * FROM club_advisors WHERE club_id = $1', [club.id]
            );
            club.captain = membersRes.rows.find(m => m.position === 'captain') || null;
            club.vice_captain = membersRes.rows.find(m => m.position === 'vice_captain') || null;
            club.members = membersRes.rows.filter(m => m.position === 'member');
            club.advisors = advisorsRes.rows;
        }

        res.json({
            settings,
            faculty: facultyRes.rows,
            councilHeads: councilRes.rows,
            clubs
        });
    } catch (err) {
        console.error('Home API error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Club detail
router.get('/clubs/:slug', async (req, res) => {
    try {
        const clubRes = await pool.query('SELECT * FROM clubs WHERE slug = $1', [req.params.slug]);
        if (clubRes.rows.length === 0) return res.status(404).json({ error: 'Club not found' });

        const club = clubRes.rows[0];
        const [membersRes, advisorsRes, settingsRes] = await Promise.all([
            pool.query('SELECT * FROM club_members WHERE club_id = $1 ORDER BY display_order', [club.id]),
            pool.query('SELECT * FROM club_advisors WHERE club_id = $1', [club.id]),
            pool.query('SELECT * FROM settings LIMIT 1')
        ]);

        club.captain = membersRes.rows.find(m => m.position === 'captain') || null;
        club.vice_captain = membersRes.rows.find(m => m.position === 'vice_captain') || null;
        club.members = membersRes.rows.filter(m => m.position === 'member');
        club.advisors = advisorsRes.rows;

        res.json({
            club,
            settings: settingsRes.rows[0] || {}
        });
    } catch (err) {
        console.error('Club API error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
