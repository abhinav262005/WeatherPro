-- ============================================
-- Simple Update Script for User Preferences
-- Run this to add dashboard customization settings
-- ============================================

USE weather_dashboard;

-- Add new columns one by one (ignore errors if they already exist)

ALTER TABLE user_preferences ADD COLUMN accent_color VARCHAR(20) DEFAULT 'purple';
ALTER TABLE user_preferences ADD COLUMN custom_color VARCHAR(7);
ALTER TABLE user_preferences ADD COLUMN card_style VARCHAR(20) DEFAULT 'glass';
ALTER TABLE user_preferences ADD COLUMN anim_speed DECIMAL(3, 1) DEFAULT 1.0;
ALTER TABLE user_preferences ADD COLUMN font_size INT DEFAULT 16;
ALTER TABLE user_preferences ADD COLUMN border_radius INT DEFAULT 16;
ALTER TABLE user_preferences ADD COLUMN particles_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_preferences ADD COLUMN weather_effects_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_preferences ADD COLUMN auto_refresh_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_preferences ADD COLUMN sound_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user_preferences ADD COLUMN compact_mode BOOLEAN DEFAULT FALSE;

-- Update theme default
UPDATE user_preferences SET theme = 'dark' WHERE theme = 'auto' OR theme IS NULL;

-- Show results
SELECT 'Update complete!' AS status;
DESCRIBE user_preferences;
