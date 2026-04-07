-- Create database
-- Run this first: CREATE DATABASE aac_council;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    site_title VARCHAR(255) DEFAULT 'Anand Activity Council',
    site_year VARCHAR(20) DEFAULT '2025 — 26',
    hero_tagline VARCHAR(500) DEFAULT 'Shaping Leaders. Building Community. Driving Change.',
    about_text TEXT,
    about_text_2 TEXT,
    college_name VARCHAR(255) DEFAULT 'Anand International College of Engineering',
    college_address VARCHAR(500) DEFAULT 'Near Kanota, Agra Road, Jaipur, Rajasthan',
    college_email VARCHAR(255) DEFAULT 'info@anandice.ac.in',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Faculty heads
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    department VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    photo_url VARCHAR(500),
    is_head BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Council heads (President, VP, etc.)
CREATE TABLE IF NOT EXISTS council_heads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    enrollment_id VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(100),
    year VARCHAR(10),
    photo_url VARCHAR(500),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Clubs
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    hero_gradient VARCHAR(255) DEFAULT 'linear-gradient(135deg, #002147 0%, #1a3a6b 50%, #42a5f5 100%)',
    bg_tint VARCHAR(20) DEFAULT '#f5f5f7',
    icon_svg TEXT,
    display_order INT DEFAULT 0,
    is_large BOOLEAN DEFAULT FALSE,
    is_wide BOOLEAN DEFAULT FALSE,
    banner_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Club members (captains, vice-captains, and regular members)
CREATE TABLE IF NOT EXISTS club_members (
    id SERIAL PRIMARY KEY,
    club_id INT REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    photo_url VARCHAR(500),
    position VARCHAR(50) DEFAULT 'member',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Club faculty advisors
CREATE TABLE IF NOT EXISTS club_advisors (
    id SERIAL PRIMARY KEY,
    club_id INT REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admins
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
