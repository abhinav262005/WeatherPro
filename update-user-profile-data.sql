-- Update User Profile Data to Match Actual Values
-- This script adds the weather_checks column and updates user data

USE weather_dashboard;

-- Add weather_checks column (skip if already exists)
-- Note: If column already exists, this will show an error but won't break anything
ALTER TABLE users 
ADD COLUMN weather_checks INT DEFAULT 0 AFTER profile_image;

-- Update existing users with default weather checks value
UPDATE users SET weather_checks = 0 WHERE weather_checks IS NULL;

-- If you want to set specific values for testing, uncomment and modify:
-- UPDATE users SET weather_checks = 254 WHERE username = 'abhi';
-- UPDATE users SET weather_checks = 150 WHERE username = 'admin';

-- Verify the changes
SELECT 
    id,
    username,
    email,
    full_name,
    is_admin,
    weather_checks,
    created_at,
    DATE_FORMAT(created_at, '%b %Y') as member_since
FROM users;

-- Show user stats with location counts
SELECT 
    u.id,
    u.username,
    u.email,
    u.weather_checks,
    DATE_FORMAT(u.created_at, '%b %Y') as member_since,
    COUNT(sl.id) as saved_locations_count
FROM users u
LEFT JOIN saved_locations sl ON u.id = sl.user_id
GROUP BY u.id, u.username, u.email, u.weather_checks, u.created_at;
