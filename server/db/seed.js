const pool = require('./pool');
const bcrypt = require('bcrypt');

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Settings
        await client.query(`DELETE FROM settings`);
        await client.query(`INSERT INTO settings (site_title, site_year, hero_tagline, about_text, about_text_2, college_name, college_address, college_email)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [
            'Anand Activity Council',
            '2025 — 26',
            'Shaping Leaders. Building Community. Driving Change.',
            'The Anand Activity Council (AAC) is the heartbeat of student life at Anand International College of Engineering. We are a dedicated body of students and faculty working together to foster leadership, creativity, and community engagement across the campus.',
            'Through our 10 diverse clubs, we provide every student with a platform to discover their passion — be it in technology, arts, sports, or social service. Our council ensures that the spirit of collaboration and innovation thrives at every level.',
            'Anand International College of Engineering',
            'Near Kanota, Agra Road, Jaipur, Rajasthan 303012',
            'info@anandice.ac.in'
        ]);

        // 2. Faculty (with emails)
        await client.query(`DELETE FROM faculty`);
        const faculty = [
            ['Er. Pramil Sinha', 'HoD', 'Electrical Engineering', 'pramil.sinha@anandice.ac.in', '9876543210', null, true, 1],
            ['Ms. Mansi Vijay', 'Associate Professor', 'Computer Science', 'mansi.vijay@anandice.ac.in', '9876543211', null, false, 2],
            ['Shiv Kumar S', 'Assistant Professor & HoD', 'Civil Engineering', 'shivkumar.s@anandice.ac.in', '9876543212', null, false, 3],
            ['Er. Noopur Shrivastava', 'Assistant Professor', 'Computer Science', 'noopur.shrivastava@anandice.ac.in', '9876543213', null, false, 4]
        ];
        for (const f of faculty) {
            await client.query(`INSERT INTO faculty (name, designation, department, email, phone, photo_url, is_head, display_order)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, f);
        }

        // 3. Council Heads (with emails replacing enrollment IDs)
        await client.query(`DELETE FROM council_heads`);
        const heads = [
            ['Rajeshwar Singh', 'President', '23CS076', 'rajeshwar.singh@anandice.ac.in', '9112233001', 'Computer Science', '3rd Year', null, 1],
            ['Abhishek Rajawat', 'Vice President', '23CS005', 'abhishek.rajawat@anandice.ac.in', '9112233002', 'Computer Science', '3rd Year', null, 2],
            ['Lakshita Gupta', 'General Secretary', '24AI029', 'lakshita.gupta@anandice.ac.in', '9112233003', 'AI & ML', '2nd Year', null, 3],
            ['Anjali Choudhary', 'Joint Secretary', '24CS015', 'anjali.choudhary@anandice.ac.in', '9112233004', 'Computer Science', '2nd Year', null, 4]
        ];
        for (const h of heads) {
            await client.query(`INSERT INTO council_heads (name, role, enrollment_id, email, phone, department, year, photo_url, display_order)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, h);
        }

        // 4. Clubs
        await client.query(`DELETE FROM club_advisors`);
        await client.query(`DELETE FROM club_members`);
        await client.query(`DELETE FROM clubs`);

        const clubs = [
            { name: 'Art & Craft Club', slug: 'art-craft', desc: 'Where creativity comes alive — through colors, crafts, and design.', gradient: 'linear-gradient(135deg, #002147 0%, #1a3a6b 50%, #d4956a 100%)', tint: '#fef7ec', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M20 12A8 8 0 0 0 12 4v8h8z"/><circle cx="7" cy="9" r="1.5" fill="currentColor"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="7" r="1.5" fill="currentColor"/></svg>', large: true, wide: false, order: 1 },
            { name: 'Coding Club', slug: 'coding', desc: 'Building tomorrow\'s tech leaders through competitive programming and hackathons.', gradient: 'linear-gradient(135deg, #002147 0%, #0a2f5c 50%, #1565c0 100%)', tint: '#eef6ff', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>', large: false, wide: false, order: 2 },
            { name: 'Dance Club', slug: 'dance', desc: 'Express yourself through movement, rhythm, and performance.', gradient: 'linear-gradient(135deg, #002147 0%, #4a1942 50%, #c62368 100%)', tint: '#fff0f5', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v4l3 4-2 5"/><path d="M12 10l-3 4 2 5"/><path d="M8 14l-2-1"/><path d="M16 14l2-1"/></svg>', large: false, wide: false, order: 3 },
            { name: 'Dramatics Club', slug: 'dramatics', desc: 'Theatre, acting, and performing arts at their finest.', gradient: 'linear-gradient(135deg, #002147 0%, #2d1b69 50%, #7c4dff 100%)', tint: '#f5f0ff', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 9.05v-.1"/><path d="M16 9.05v-.1"/><path d="M16 15c-.8 1-2.2 2-4 2s-3.2-1-4-2"/></svg>', large: true, wide: false, order: 4 },
            { name: 'Eco & Social Service Club', slug: 'eco-social', desc: 'Driving sustainability and community outreach.', gradient: 'linear-gradient(135deg, #002147 0%, #1b5e20 50%, #43a047 100%)', tint: '#edfcf0', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8c.7-1 1.4-2.5 1-5-2.5-.4-4 .3-5 1l-1 1c-1-.7-2.5-1.4-5-1-.4 2.5.3 4 1 5l1 1c-.7 1-1.4 2.5-1 5 2.5.4 4-.3 5-1"/><path d="M2 22l10-10"/><path d="M15 12.24a6 6 0 0 1-7.48 7.52"/></svg>', large: false, wide: false, order: 5 },
            { name: 'Literary, Speakers & Professionals Club', slug: 'literary', desc: 'Mastering the art of words — debates, public speaking, and workshops.', gradient: 'linear-gradient(135deg, #002147 0%, #4e342e 50%, #8d6e63 100%)', tint: '#fdf8ee', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="13" y2="11"/></svg>', large: false, wide: true, order: 6 },
            { name: 'Singing & Rhythm Club', slug: 'singing', desc: 'Music, vocals, and rhythm that move the soul.', gradient: 'linear-gradient(135deg, #002147 0%, #b71c1c 50%, #e57373 100%)', tint: '#fff5f0', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', large: false, wide: false, order: 7 },
            { name: 'Robotics Club', slug: 'robotics', desc: 'Engineering the future with automation, IoT, and robotics.', gradient: 'linear-gradient(135deg, #002147 0%, #1a237e 50%, #42a5f5 100%)', tint: '#eef3ff', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="8" y1="16" x2="8" y2="16.01"/><line x1="16" y1="16" x2="16" y2="16.01"/></svg>', large: true, wide: false, order: 8 },
            { name: 'Sports Adventure & Fitness Club', slug: 'sports', desc: 'Pushing limits through athletics, adventure, and fitness.', gradient: 'linear-gradient(135deg, #002147 0%, #1b5e20 50%, #66bb6a 100%)', tint: '#ecfdf5', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/><path d="M2 12h20"/></svg>', large: false, wide: false, order: 9 },
            { name: 'Photography, Design & Social Media Club', slug: 'photography', desc: 'Capturing moments, crafting designs, and building our digital presence.', gradient: 'linear-gradient(135deg, #002147 0%, #4a148c 50%, #ce93d8 100%)', tint: '#f8eeff', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>', large: false, wide: true, order: 10 }
        ];

        const clubIds = {};
        for (const c of clubs) {
            const res = await client.query(
                `INSERT INTO clubs (name, slug, description, hero_gradient, bg_tint, icon_svg, display_order, is_large, is_wide)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
                [c.name, c.slug, c.desc, c.gradient, c.tint, c.icon, c.order, c.large, c.wide]
            );
            clubIds[c.slug] = res.rows[0].id;
        }

        // 5. Club Members (with emails for captains and vice captains)
        const members = {
            'art-craft': [
                ['Sharma Ritu', null, 'sharma.ritu@anandice.ac.in', null, null, 'captain', 1],
                ['Priyanshu Sharma', null, 'priyanshu.sharma@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Ms. Tanisha Jangid', '25CS041', 'tanisha.jangid@anandice.ac.in', null, null, 'member', 3],
                ['Priyanshi Sharma', '25EE012', 'priyanshi.sharma@anandice.ac.in', null, null, 'member', 4],
                ['Poorvi Jain', '25AI047', 'poorvi.jain@anandice.ac.in', null, null, 'member', 5]
            ],
            'coding': [
                ['Ailish Singh', null, 'ailish.singh@anandice.ac.in', null, null, 'captain', 1],
                ['Mohammad Adnaan Gouri', null, 'adnaan.gouri@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Harshil Bhatnagar', '25CS019', 'harshil.bhatnagar@anandice.ac.in', null, null, 'member', 3],
                ['Yashi Bhardwaj', '25CS069', 'yashi.bhardwaj@anandice.ac.in', null, null, 'member', 4],
                ['Gourav Sharma', '25CS018', 'gourav.sharma@anandice.ac.in', null, null, 'member', 5]
            ],
            'dance': [
                ['Pallavi Jadoun', null, 'pallavi.jadoun@anandice.ac.in', null, null, 'captain', 1],
                ['Janvi Sharma', null, 'janvi.sharma@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Ashna Sharma', '25AI006', 'ashna.sharma@anandice.ac.in', null, null, 'member', 3],
                ['Devraj Sharma', '25AI013', 'devraj.sharma@anandice.ac.in', null, null, 'member', 4],
                ['Zahra', '25EE021', 'zahra@anandice.ac.in', null, null, 'member', 5]
            ],
            'dramatics': [
                ['Anjali Prajapati', null, 'anjali.prajapati@anandice.ac.in', null, null, 'captain', 1],
                ['Nikhil Lakhera', null, 'nikhil.lakhera@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Ritika Joshi', '25AI052', 'ritika.joshi@anandice.ac.in', null, null, 'member', 3],
                ['Hridyanshi Sharma', '25AI019', 'hridyanshi.sharma@anandice.ac.in', null, null, 'member', 4],
                ['Sneha Sinha', '25AI061', 'sneha.sinha@anandice.ac.in', null, null, 'member', 5]
            ],
            'eco-social': [
                ['Komal Goyal', null, 'komal.goyal@anandice.ac.in', null, null, 'captain', 1],
                ['Mohan Singh Shekhawat', null, 'mohan.shekhawat@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Yogendra Singh Naruka', '25EE020', 'yogendra.naruka@anandice.ac.in', null, null, 'member', 3],
                ['Anjali Jangid', '25CS030', 'anjali.jangid@anandice.ac.in', null, null, 'member', 4],
                ['Lokesh Tiwari', '25CE012', 'lokesh.tiwari@anandice.ac.in', null, null, 'member', 5]
            ],
            'literary': [
                ['Anushika Dutta', null, 'anushika.dutta@anandice.ac.in', null, null, 'captain', 1],
                ['Devanshu Meena', null, 'devanshu.meena@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Harshita Bhargava', '25CS019', 'harshita.bhargava@anandice.ac.in', null, null, 'member', 3],
                ['Bhavna Motiyani', '25CS015', 'bhavna.motiyani@anandice.ac.in', null, null, 'member', 4],
                ['Snehal Pandey', '25AI062', 'snehal.pandey@anandice.ac.in', null, null, 'member', 5]
            ],
            'singing': [
                ['Samit Kasotia', null, 'samit.kasotia@anandice.ac.in', null, null, 'captain', 1],
                ['Hardik Mathur', null, 'hardik.mathur@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Divyansh Saxena', '25AI014', 'divyansh.saxena@anandice.ac.in', null, null, 'member', 3],
                ['Tushar Sharma', '25EE018', 'tushar.sharma@anandice.ac.in', null, null, 'member', 4],
                ['Siddhi Sharma', '25CS058', 'siddhi.sharma@anandice.ac.in', null, null, 'member', 5]
            ],
            'robotics': [
                ['Bhavya Gupta', null, 'bhavya.gupta@anandice.ac.in', null, null, 'captain', 1],
                ['Kirti Swarnkar', null, 'kirti.swarnkar@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Taniya Baliyan', '25AI066', 'taniya.baliyan@anandice.ac.in', null, null, 'member', 3],
                ['Kapil Saini', '25AI023', 'kapil.saini@anandice.ac.in', null, null, 'member', 4]
            ],
            'sports': [
                ['Rimjhim Sharma', null, 'rimjhim.sharma@anandice.ac.in', null, null, 'captain', 1],
                ['Durlabh Kausal', null, 'durlabh.kausal@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Shubham Sharma', '25AI060', 'shubham.sharma@anandice.ac.in', null, null, 'member', 3],
                ['Uttam Jatolia', '25CS062', 'uttam.jatolia@anandice.ac.in', null, null, 'member', 4],
                ['Yuvraj Kumawat', '25AI073', 'yuvraj.kumawat@anandice.ac.in', null, null, 'member', 5],
                ['Harpreet Singh', '25DS007', 'harpreet.singh@anandice.ac.in', null, null, 'member', 6]
            ],
            'photography': [
                ['Mansvi Choudhary', null, 'mansvi.choudhary@anandice.ac.in', null, null, 'captain', 1],
                ['Akshita Kanwar Shekhawat', null, 'akshita.shekhawat@anandice.ac.in', null, null, 'vice_captain', 2],
                ['Karishma Choudhary', '25CS022', 'karishma.choudhary@anandice.ac.in', null, null, 'member', 3],
                ['Parvesh Khan', '25CS043', 'parvesh.khan@anandice.ac.in', null, null, 'member', 4],
                ['Vanshika Sharma', '25CS064', 'vanshika.sharma@anandice.ac.in', null, null, 'member', 5]
            ]
        };

        for (const [slug, mems] of Object.entries(members)) {
            for (const m of mems) {
                await client.query(
                    `INSERT INTO club_members (club_id, name, roll_no, email, phone, photo_url, position, display_order)
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                    [clubIds[slug], ...m]
                );
            }
        }

        // 6. Club Advisors (with emails)
        const advisors = {
            'art-craft': [['Mr. Prasoon Sharma', 'Faculty Advisor', 'prasoon.sharma@anandice.ac.in'], ['Ms. Kritika Pal Saini', 'Faculty Advisor', 'kritika.saini@anandice.ac.in']],
            'coding': [['Mr. Naresh Marwal', 'Faculty Advisor', 'naresh.marwal@anandice.ac.in']],
            'dance': [['Ms. Noopur Shrivastava', 'Faculty Advisor', 'noopur.shrivastava@anandice.ac.in']],
            'dramatics': [['Dr. Bhawna Mathur', 'Faculty Advisor', 'bhawna.mathur@anandice.ac.in'], ['Dr. Renu Saxena', 'Faculty Advisor', 'renu.saxena@anandice.ac.in']],
            'eco-social': [['Dr. Vivek Bhojak', 'Faculty Advisor', 'vivek.bhojak@anandice.ac.in'], ['Mr. Mehruddin Ahmad', 'Faculty Advisor', 'mehruddin.ahmad@anandice.ac.in']],
            'literary': [['Ms. Mansi Vijay', 'Faculty Advisor', 'mansi.vijay@anandice.ac.in'], ['Mr. Mohammad Uzair Ali', 'Faculty Advisor', 'uzair.ali@anandice.ac.in']],
            'singing': [['Dr. Sanjana Chugh', 'Faculty Advisor', 'sanjana.chugh@anandice.ac.in']],
            'robotics': [['Mr. Prashant Kumar', 'Faculty Advisor', 'prashant.kumar@anandice.ac.in']],
            'sports': [['Mr. Sunil R. Meena', 'Faculty Advisor', 'sunil.meena@anandice.ac.in'], ['Mr. Mukul Singh', 'Faculty Advisor', 'mukul.singh@anandice.ac.in'], ['Dr. Ajit', 'Faculty Advisor', 'ajit@anandice.ac.in']],
            'photography': [['Er. Pramil Sinha', 'Faculty Advisor', 'pramil.sinha@anandice.ac.in'], ['Ms. Mansi Vijay', 'Faculty Advisor', 'mansi.vijay@anandice.ac.in']]
        };

        for (const [slug, advs] of Object.entries(advisors)) {
            for (const a of advs) {
                await client.query(
                    `INSERT INTO club_advisors (club_id, name, designation, email) VALUES ($1,$2,$3,$4)`,
                    [clubIds[slug], a[0], a[1], a[2]]
                );
            }
        }

        // 7. Admin user
        await client.query(`DELETE FROM admins`);
        const hash = await bcrypt.hash('admin123', 10);
        await client.query(`INSERT INTO admins (username, password_hash) VALUES ($1,$2)`, ['admin', hash]);

        await client.query('COMMIT');
        console.log('✅ Database seeded successfully with emails!');
        console.log('📧 All faculty, council heads, captains, and members now have emails');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Seed error:', e.message);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
