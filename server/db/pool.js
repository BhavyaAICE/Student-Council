const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'db.dnkighfqynguttjryznj.supabase.co',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
