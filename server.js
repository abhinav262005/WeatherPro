require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ultimate-dashboard.html'));
});

app.get('/ultra', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ultra-dashboard.html'));
});

// API Routes
// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, fullName || username]
        );

        // Create default preferences
        await pool.execute(
            'INSERT INTO user_preferences (user_id) VALUES (?)',
            [result.insertId]
        );

        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({ 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                fullName: user.full_name 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
app.get('/api/user', isAuthenticated, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, full_name, profile_image, is_admin, created_at, weather_checks FROM users WHERE id = ?',
            [req.session.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Admin middleware
const isAdmin = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const [users] = await pool.execute(
            'SELECT is_admin FROM users WHERE id = ?',
            [req.session.userId]
        );
        
        if (users.length === 0 || !users[0].is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ error: 'Authorization failed' });
    }
};

// Admin login page
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Admin panel (protected) - Now serves the ultimate admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-ultimate.html'));
});

// Admin login endpoint (separate from regular login)
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get user and check if admin
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_admin = TRUE',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // Update last login
        await pool.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.isAdmin = true;

        res.json({ 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                fullName: user.full_name,
                isAdmin: true
            } 
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get admin stats
app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
        const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [locationCount] = await pool.execute('SELECT COUNT(*) as count FROM saved_locations');
        const [alertCount] = await pool.execute('SELECT COUNT(*) as count FROM weather_alerts WHERE is_active = TRUE');
        const [activeCount] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 1 DAY)');
        
        res.json({
            totalUsers: userCount[0].count,
            totalLocations: locationCount[0].count,
            totalAlerts: alertCount[0].count,
            activeUsers: activeCount[0].count
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Get recent users
app.get('/api/admin/recent-users', isAdmin, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10'
        );
        res.json(users);
    } catch (error) {
        console.error('Get recent users error:', error);
        res.status(500).json({ error: 'Failed to get recent users' });
    }
});

// Get all users
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, full_name, is_admin, created_at, last_login FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Get single user
app.get('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, full_name, is_admin FROM users WHERE id = ?',
            [req.params.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Update user
app.put('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        const { username, email, fullName, isAdmin } = req.body;
        
        await pool.execute(
            'UPDATE users SET username = ?, email = ?, full_name = ?, is_admin = ? WHERE id = ?',
            [username, email, fullName, isAdmin, req.params.id]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        // Prevent deleting yourself
        if (req.params.id == req.session.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all locations
app.get('/api/admin/locations', isAdmin, async (req, res) => {
    try {
        const [locations] = await pool.execute(
            'SELECT sl.*, u.username FROM saved_locations sl JOIN users u ON sl.user_id = u.id ORDER BY sl.created_at DESC'
        );
        res.json(locations);
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: 'Failed to get locations' });
    }
});

// Delete location (admin)
app.delete('/api/admin/locations/:id', isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM saved_locations WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete location error:', error);
        res.status(500).json({ error: 'Failed to delete location' });
    }
});

// Get all alerts
app.get('/api/admin/alerts', isAdmin, async (req, res) => {
    try {
        const [alerts] = await pool.execute(
            'SELECT wa.*, u.username FROM weather_alerts wa JOIN users u ON wa.user_id = u.id ORDER BY wa.created_at DESC'
        );
        res.json(alerts);
    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({ error: 'Failed to get alerts' });
    }
});

// Delete alert (admin)
app.delete('/api/admin/alerts/:id', isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM weather_alerts WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete alert error:', error);
        res.status(500).json({ error: 'Failed to delete alert' });
    }
});

// Verify admin password
app.post('/api/admin/verify-password', isAdmin, async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }
        
        // Get current admin user
        const [users] = await pool.execute(
            'SELECT password FROM users WHERE id = ?',
            [req.session.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify password
        const isValid = await bcrypt.compare(password, users[0].password);
        
        console.log('Password verification:', {
            userId: req.session.userId,
            passwordProvided: password,
            isValid: isValid
        });
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Password verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Get landing page content
app.get('/api/admin/content', isAdmin, async (req, res) => {
    try {
        const [content] = await pool.execute('SELECT content_key, content_value FROM landing_content');
        const contentObj = {};
        content.forEach(item => {
            contentObj[item.content_key] = item.content_value;
        });
        res.json(contentObj);
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ error: 'Failed to get content' });
    }
});

// Save landing page content
app.post('/api/admin/content', isAdmin, async (req, res) => {
    try {
        const content = req.body;
        
        for (const [key, value] of Object.entries(content)) {
            await pool.execute(
                'INSERT INTO landing_content (content_key, content_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content_value = ?, updated_by = ?',
                [key, value, req.session.userId, value, req.session.userId]
            );
        }
        
        res.json({ success: true, message: 'Content saved successfully' });
    } catch (error) {
        console.error('Save content error:', error);
        res.status(500).json({ error: 'Failed to save content' });
    }
});

// Get public landing page content (for displaying on landing page)
app.get('/api/content', async (req, res) => {
    try {
        const [content] = await pool.execute('SELECT content_key, content_value FROM landing_content');
        const contentObj = {};
        content.forEach(item => {
            contentObj[item.content_key] = item.content_value;
        });
        res.json(contentObj);
    } catch (error) {
        console.error('Get content error:', error);
        res.json({}); // Return empty object if no content
    }
});

// Get weather data
app.get('/api/weather', isAuthenticated, async (req, res) => {
    try {
        const { lat, lon, city } = req.query;
        const apiKey = process.env.WEATHER_API_KEY;

        let url;
        if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        } else if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        } else {
            return res.status(400).json({ error: 'Location required' });
        }

        const response = await axios.get(url);
        
        // Increment weather checks counter for the user
        try {
            await pool.execute(
                'UPDATE users SET weather_checks = weather_checks + 1 WHERE id = ?',
                [req.session.userId]
            );
        } catch (dbError) {
            console.error('Failed to update weather checks:', dbError);
            // Don't fail the request if counter update fails
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Get forecast data
app.get('/api/forecast', isAuthenticated, async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const apiKey = process.env.WEATHER_API_KEY;

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Forecast API error:', error);
        res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
});

// Geocoding API
app.get('/api/geocode', isAuthenticated, async (req, res) => {
    try {
        const { q } = req.query;
        const apiKey = process.env.WEATHER_API_KEY;

        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Geocode API error:', error);
        res.status(500).json({ error: 'Failed to geocode location' });
    }
});

// Air Quality API
app.get('/api/air-quality', isAuthenticated, async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const apiKey = process.env.WEATHER_API_KEY;

        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Air quality API error:', error);
        res.status(500).json({ error: 'Failed to fetch air quality data' });
    }
});

// Save location
app.post('/api/locations', isAuthenticated, async (req, res) => {
    try {
        const { locationName, latitude, longitude, isFavorite } = req.body;

        await pool.execute(
            'INSERT INTO saved_locations (user_id, location_name, latitude, longitude, is_favorite) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, locationName, latitude, longitude, isFavorite || false]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Save location error:', error);
        res.status(500).json({ error: 'Failed to save location' });
    }
});

// Get saved locations
app.get('/api/locations', isAuthenticated, async (req, res) => {
    try {
        const [locations] = await pool.execute(
            'SELECT * FROM saved_locations WHERE user_id = ? ORDER BY is_favorite DESC, created_at DESC',
            [req.session.userId]
        );

        res.json(locations);
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: 'Failed to get locations' });
    }
});

// Delete location
app.delete('/api/locations/:id', isAuthenticated, async (req, res) => {
    try {
        await pool.execute(
            'DELETE FROM saved_locations WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Delete location error:', error);
        res.status(500).json({ error: 'Failed to delete location' });
    }
});

// Get user preferences
app.get('/api/preferences', isAuthenticated, async (req, res) => {
    try {
        const [prefs] = await pool.execute(
            'SELECT * FROM user_preferences WHERE user_id = ?',
            [req.session.userId]
        );

        res.json(prefs[0] || {});
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

// Update user preferences
app.put('/api/preferences', isAuthenticated, async (req, res) => {
    try {
        const { 
            temperatureUnit, 
            theme, 
            defaultLocation, 
            defaultLat, 
            defaultLon,
            accentColor,
            customColor,
            cardStyle,
            animSpeed,
            fontSize,
            borderRadius,
            particlesEnabled,
            weatherEffectsEnabled,
            autoRefreshEnabled,
            soundEnabled,
            compactMode
        } = req.body;

        // Convert undefined to null for SQL
        await pool.execute(
            `UPDATE user_preferences SET 
                temperature_unit = ?, 
                theme = ?, 
                default_location = ?, 
                default_lat = ?, 
                default_lon = ?,
                accent_color = ?,
                custom_color = ?,
                card_style = ?,
                anim_speed = ?,
                font_size = ?,
                border_radius = ?,
                particles_enabled = ?,
                weather_effects_enabled = ?,
                auto_refresh_enabled = ?,
                sound_enabled = ?,
                compact_mode = ?
            WHERE user_id = ?`,
            [
                temperatureUnit || null, 
                theme || 'dark', 
                defaultLocation || null, 
                defaultLat || null, 
                defaultLon || null,
                accentColor || 'purple',
                customColor || null,
                cardStyle || 'glass',
                animSpeed || 1.0,
                fontSize || 16,
                borderRadius || 16,
                particlesEnabled !== undefined ? particlesEnabled : true,
                weatherEffectsEnabled !== undefined ? weatherEffectsEnabled : true,
                autoRefreshEnabled !== undefined ? autoRefreshEnabled : true,
                soundEnabled !== undefined ? soundEnabled : false,
                compactMode !== undefined ? compactMode : false,
                req.session.userId
            ]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update preferences error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({ error: 'Failed to update preferences', details: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🌤️  Weather Dashboard server running on http://localhost:${PORT}`);
    console.log(`📊 Make sure MySQL is running and database is created`);
});
