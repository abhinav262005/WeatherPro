-- Add weather_checks column to users table
USE weather_dashboard;

-- Add column to track number of weather checks
-- Note: If column already exists, this will show an error but won't break anything
ALTER TABLE users 
ADD COLUMN weather_checks INT DEFAULT 0 AFTER profile_image;

-- Update existing users with a default value
UPDATE users SET weather_checks = 0 WHERE weather_checks IS NULL;

-- Verify the column was added
DESCRIBE users;

-- Show current user data
SELECT 
    id,
    username,
    email,
    weather_checks,
    DATE_FORMAT(created_at, '%b %Y') as member_since
FROM users;
