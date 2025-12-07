-- ============================================
-- Update User Preferences Table
-- Add Dashboard Customization Settings
-- ============================================

USE weather_dashboard;

-- Add new columns for dashboard customization
-- Check if columns exist before adding them
SET @dbname = DATABASE();
SET @tablename = 'user_preferences';

-- Add accent_color column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'accent_color');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN accent_color VARCHAR(20) DEFAULT ''purple'' AFTER theme', 
    'SELECT ''Column accent_color already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add custom_color column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'custom_color');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN custom_color VARCHAR(7) AFTER accent_color', 
    'SELECT ''Column custom_color already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add card_style column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'card_style');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN card_style VARCHAR(20) DEFAULT ''glass'' AFTER custom_color', 
    'SELECT ''Column card_style already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add anim_speed column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'anim_speed');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN anim_speed DECIMAL(3, 1) DEFAULT 1.0 AFTER card_style', 
    'SELECT ''Column anim_speed already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add font_size column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'font_size');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN font_size INT DEFAULT 16 AFTER anim_speed', 
    'SELECT ''Column font_size already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add border_radius column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'border_radius');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN border_radius INT DEFAULT 16 AFTER font_size', 
    'SELECT ''Column border_radius already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add particles_enabled column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'particles_enabled');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN particles_enabled BOOLEAN DEFAULT TRUE AFTER border_radius', 
    'SELECT ''Column particles_enabled already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add weather_effects_enabled column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'weather_effects_enabled');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN weather_effects_enabled BOOLEAN DEFAULT TRUE AFTER particles_enabled', 
    'SELECT ''Column weather_effects_enabled already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add auto_refresh_enabled column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'auto_refresh_enabled');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN auto_refresh_enabled BOOLEAN DEFAULT TRUE AFTER weather_effects_enabled', 
    'SELECT ''Column auto_refresh_enabled already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add sound_enabled column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'sound_enabled');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN sound_enabled BOOLEAN DEFAULT FALSE AFTER auto_refresh_enabled', 
    'SELECT ''Column sound_enabled already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add compact_mode column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'compact_mode');
SET @query = IF(@col_exists = 0, 
    'ALTER TABLE user_preferences ADD COLUMN compact_mode BOOLEAN DEFAULT FALSE AFTER sound_enabled', 
    'SELECT ''Column compact_mode already exists'' AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update theme default from 'auto' to 'dark' for existing records
UPDATE user_preferences SET theme = 'dark' WHERE theme = 'auto' OR theme IS NULL;

-- Verify the changes
DESCRIBE user_preferences;

-- Show sample data
SELECT 
    user_id,
    theme,
    accent_color,
    card_style,
    particles_enabled,
    weather_effects_enabled,
    auto_refresh_enabled
FROM user_preferences
LIMIT 5;

-- ============================================
-- NOTES:
-- ============================================
-- This script adds dashboard customization settings to the user_preferences table.
-- All new columns have default values, so existing users will get sensible defaults.
-- Run this script after updating your database.sql file.
-- ============================================
