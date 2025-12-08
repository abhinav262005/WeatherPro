-- Safe way to add weather_checks column
-- This version checks if the column exists before adding it

USE weather_dashboard;

-- Method 1: Try to add the column (will error if exists, but that's okay)
-- Just ignore the error if you see "Duplicate column name 'weather_checks'"
ALTER TABLE users ADD COLUMN weather_checks INT DEFAULT 0 AFTER profile_image;

-- Method 2: Update any NULL values to 0
UPDATE users SET weather_checks = 0 WHERE weather_checks IS NULL;

-- Verify the result
SELECT 
    id,
    username,
    email,
    weather_checks,
    DATE_FORMAT(created_at, '%b %Y') as member_since,
    created_at
FROM users;

-- Show user stats with location counts
SELECT 
    u.id,
    u.username,
    u.email,
    u.weather_checks as checks,
    DATE_FORMAT(u.created_at, '%b %Y') as member_since,
    COUNT(sl.id) as locations
FROM users u
LEFT JOIN saved_locations sl ON u.id = sl.user_id
GROUP BY u.id, u.username, u.email, u.weather_checks, u.created_at;
