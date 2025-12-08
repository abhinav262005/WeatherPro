-- Check the actual created_at date for your user
USE weather_dashboard;

SELECT 
    id,
    username,
    email,
    created_at,
    DATE_FORMAT(created_at, '%b %Y') as member_since_formatted,
    weather_checks
FROM users 
WHERE username = 'abhi' OR email = 'abhinavnerusu@gmail.com';

-- If you want to update the created_at date to the current date:
-- UPDATE users SET created_at = NOW() WHERE username = 'abhi';

-- Or set it to a specific date (example: December 2024):
-- UPDATE users SET created_at = '2024-12-01 00:00:00' WHERE username = 'abhi';
