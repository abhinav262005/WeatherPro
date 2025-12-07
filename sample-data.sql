-- Sample Data for Testing WeatherPro
-- This file contains sample data to help you test the application

USE weather_dashboard;

-- Note: Passwords are hashed with bcrypt
-- Sample password for all users: "password123"
-- Hash: $2a$10$rQ3qKx5qP5qP5qP5qP5qP.5qP5qP5qP5qP5qP5qP5qP5qP5qP5qP

-- Sample Users
INSERT INTO users (username, email, password, full_name) VALUES
('john_doe', 'john@example.com', '$2a$10$rQ3qKx5qP5qP5qP5qP5qP.5qP5qP5qP5qP5qP5qP5qP5qP5qP5qP', 'John Doe'),
('jane_smith', 'jane@example.com', '$2a$10$rQ3qKx5qP5qP5qP5qP5qP.5qP5qP5qP5qP5qP5qP5qP5qP5qP5qP', 'Jane Smith'),
('weather_fan', 'fan@example.com', '$2a$10$rQ3qKx5qP5qP5qP5qP5qP.5qP5qP5qP5qP5qP5qP5qP5qP5qP5qP', 'Weather Enthusiast');

-- Sample User Preferences
INSERT INTO user_preferences (user_id, temperature_unit, theme, default_location, default_lat, default_lon) VALUES
(1, 'celsius', 'light', 'New York', 40.7128, -74.0060),
(2, 'fahrenheit', 'dark', 'London', 51.5074, -0.1278),
(3, 'celsius', 'auto', 'Tokyo', 35.6762, 139.6503);

-- Sample Saved Locations for User 1 (john_doe)
INSERT INTO saved_locations (user_id, location_name, latitude, longitude, is_favorite) VALUES
(1, 'New York', 40.7128, -74.0060, TRUE),
(1, 'Los Angeles', 34.0522, -118.2437, FALSE),
(1, 'Chicago', 41.8781, -87.6298, FALSE),
(1, 'Miami', 25.7617, -80.1918, FALSE);

-- Sample Saved Locations for User 2 (jane_smith)
INSERT INTO saved_locations (user_id, location_name, latitude, longitude, is_favorite) VALUES
(2, 'London', 51.5074, -0.1278, TRUE),
(2, 'Paris', 48.8566, 2.3522, TRUE),
(2, 'Berlin', 52.5200, 13.4050, FALSE),
(2, 'Rome', 41.9028, 12.4964, FALSE),
(2, 'Madrid', 40.4168, -3.7038, FALSE);

-- Sample Saved Locations for User 3 (weather_fan)
INSERT INTO saved_locations (user_id, location_name, latitude, longitude, is_favorite) VALUES
(3, 'Tokyo', 35.6762, 139.6503, TRUE),
(3, 'Sydney', -33.8688, 151.2093, TRUE),
(3, 'Dubai', 25.2048, 55.2708, FALSE),
(3, 'Singapore', 1.3521, 103.8198, FALSE),
(3, 'Hong Kong', 22.3193, 114.1694, FALSE),
(3, 'Mumbai', 19.0760, 72.8777, FALSE);

-- Sample Weather Alerts for User 1
INSERT INTO weather_alerts (user_id, alert_type, threshold_value, is_active) VALUES
(1, 'temperature_high', 35.0, TRUE),
(1, 'temperature_low', 0.0, TRUE),
(1, 'wind_speed', 50.0, TRUE);

-- Sample Weather Alerts for User 2
INSERT INTO weather_alerts (user_id, alert_type, threshold_value, is_active) VALUES
(2, 'temperature_high', 30.0, TRUE),
(2, 'rain_probability', 80.0, TRUE);

-- Sample Weather Alerts for User 3
INSERT INTO weather_alerts (user_id, alert_type, threshold_value, is_active) VALUES
(3, 'temperature_high', 40.0, TRUE),
(3, 'temperature_low', -10.0, TRUE),
(3, 'humidity', 90.0, TRUE),
(3, 'wind_speed', 60.0, TRUE);

-- Verify data was inserted
SELECT 'Users:' as 'Table';
SELECT COUNT(*) as 'Count' FROM users;

SELECT 'User Preferences:' as 'Table';
SELECT COUNT(*) as 'Count' FROM user_preferences;

SELECT 'Saved Locations:' as 'Table';
SELECT COUNT(*) as 'Count' FROM saved_locations;

SELECT 'Weather Alerts:' as 'Table';
SELECT COUNT(*) as 'Count' FROM weather_alerts;

-- Display sample user info
SELECT 
    u.username,
    u.email,
    u.full_name,
    up.temperature_unit,
    up.theme,
    up.default_location,
    COUNT(sl.id) as saved_locations_count
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
LEFT JOIN saved_locations sl ON u.id = sl.user_id
GROUP BY u.id;

-- Note: To login with sample users, use:
-- Username: john_doe, jane_smith, or weather_fan
-- Password: password123
-- 
-- IMPORTANT: Change these passwords in production!
-- These are for testing purposes only.
