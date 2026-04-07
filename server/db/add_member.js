const pool = require('./pool');

async function addMember() {
    try {
        const res = await pool.query("SELECT id FROM clubs WHERE slug = 'robotics'");
        const clubId = res.rows[0].id;
        console.log('Robotics club ID:', clubId);
        
        await pool.query(
            "INSERT INTO club_members (club_id, name, roll_no, email, position, display_order) VALUES ($1, $2, $3, $4, $5, $6)",
            [clubId, 'Shubham Sharma', '25AI060', 'shubham.sharma@anandice.ac.in', 'member', 5]
        );
        console.log('✅ Shubham Sharma added to Robotics Club!');
    } catch(e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
}

addMember();
