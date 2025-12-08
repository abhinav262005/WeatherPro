-- ============================================
-- WeatherPro Database Schema
-- Complete Database Setup with Admin Support
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS weather_dashboard;
USE weather_dashboard;

-- ============================================
-- Users Table (with Admin Support)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    profile_image VARCHAR(255) DEFAULT 'default-avatar.png',
    weather_checks INT DEFAULT 0,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_is_admin (is_admin)
);

-- ============================================
-- User Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    temperature_unit VARCHAR(10) DEFAULT 'celsius',
    theme VARCHAR(20) DEFAULT 'dark',
    default_location VARCHAR(100),
    default_lat DECIMAL(10, 8),
    default_lon DECIMAL(11, 8),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    -- Dashboard customization settings
    accent_color VARCHAR(20) DEFAULT 'purple',
    custom_color VARCHAR(7),
    card_style VARCHAR(20) DEFAULT 'glass',
    anim_speed DECIMAL(3, 1) DEFAULT 1.0,
    font_size INT DEFAULT 16,
    border_radius INT DEFAULT 16,
    particles_enabled BOOLEAN DEFAULT TRUE,
    weather_effects_enabled BOOLEAN DEFAULT TRUE,
    auto_refresh_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT FALSE,
    compact_mode BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ============================================
-- Saved Locations Table
-- ============================================
CREATE TABLE IF NOT EXISTS saved_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_favorite (is_favorite)
);

-- ============================================
-- Weather Alerts Table
-- ============================================
CREATE TABLE IF NOT EXISTS weather_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    threshold_value DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- ============================================
-- Landing Content Table (for dynamic content)
-- ============================================
CREATE TABLE IF NOT EXISTS landing_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_key VARCHAR(100) UNIQUE NOT NULL,
    content_value TEXT,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_content_key (content_key),
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default landing content
INSERT INTO landing_content (content_key, content_value) VALUES
    ('hero_title', 'Welcome to WeatherPro'),
    ('hero_subtitle', 'Your Ultimate Weather Dashboard'),
    ('hero_description', 'Get accurate weather forecasts, real-time updates, and personalized weather insights all in one beautiful dashboard.'),
    ('feature_1_title', 'Real-Time Weather'),
    ('feature_1_desc', 'Get up-to-the-minute weather updates for any location worldwide'),
    ('feature_2_title', 'Beautiful Dashboards'),
    ('feature_2_desc', 'Multiple stunning dashboard designs to choose from'),
    ('feature_3_title', 'Smart Alerts'),
    ('feature_3_desc', 'Receive notifications for weather changes that matter to you'),
    ('feature_4_title', 'Customizable'),
    ('feature_4_desc', 'Personalize your dashboard with themes, colors, and layouts')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);

-- ============================================
-- Create Default Admin User
-- Username: admin
-- Password: abhinav123 (hashed with bcrypt)
-- ============================================
INSERT INTO users (username, email, password, full_name, is_admin) 
VALUES (
    'admin', 
    'admin@weatherpro.com', 
    '$2a$10$W8RiMQ6iukj9O7riZgF.XeAlmv25OHz2NYWme/SaanhEUZkgcuf5G', 
    'Administrator', 
    TRUE
) ON DUPLICATE KEY UPDATE is_admin = TRUE;

-- Create default preferences for admin
INSERT INTO user_preferences (user_id, temperature_unit, theme, notifications_enabled)
SELECT id, 'celsius', 'auto', TRUE 
FROM users 
WHERE username = 'admin' 
AND NOT EXISTS (
    SELECT 1 FROM user_preferences WHERE user_id = (SELECT id FROM users WHERE username = 'admin')
);

-- ============================================
-- Verify Tables Created
-- ============================================
SHOW TABLES;

-- ============================================
-- Display Admin User Info
-- ============================================
SELECT 
    id,
    username,
    email,
    full_name,
    is_admin,
    created_at
FROM users 
WHERE username = 'admin';

-- ============================================
-- Database Statistics
-- ============================================
SELECT 
    'Users' as TableName, 
    COUNT(*) as RecordCount 
FROM users
UNION ALL
SELECT 
    'User Preferences' as TableName, 
    COUNT(*) as RecordCount 
FROM user_preferences
UNION ALL
SELECT 
    'Saved Locations' as TableName, 
    COUNT(*) as RecordCount 
FROM saved_locations
UNION ALL
SELECT 
    'Weather Alerts' as TableName, 
    COUNT(*) as RecordCount 
FROM weather_alerts
UNION ALL
SELECT 
    'Landing Content' as TableName, 
    COUNT(*) as RecordCount 
FROM landing_content;

-- ============================================
-- NOTES:
-- ============================================
-- Default Admin Credentials:
--   Username: admin
--   Password: abhinav123
--   Email: admin@weatherpro.com
--
-- IMPORTANT: Change the admin password after first login!
--
-- To manually create another admin user:
-- UPDATE users SET is_admin = TRUE WHERE username = 'your_username';
--
-- To remove admin privileges:
-- UPDATE users SET is_admin = FALSE WHERE username = 'username';
-- ============================================
