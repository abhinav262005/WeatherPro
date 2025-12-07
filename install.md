# 🚀 Complete Installation Guide - WeatherPro

This guide will walk you through every step of setting up the WeatherPro weather dashboard.

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Database Setup](#database-setup)
4. [Application Setup](#application-setup)
5. [API Configuration](#api-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## 1. System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 500MB free space
- **Internet**: Stable connection for API calls

### Software Requirements
- Node.js v14.0.0 or higher
- MySQL v5.7 or higher
- npm v6.0.0 or higher (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## 2. Installing Prerequisites

### Windows

#### Install Node.js
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (.msi file)
3. Follow the installation wizard
4. Verify installation:
```cmd
node --version
npm --version
```

#### Install MySQL
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer
3. Choose "Developer Default" setup
4. Set root password (remember this!)
5. Complete installation
6. Verify installation:
```cmd
mysql --version
```

### macOS

#### Install Node.js
Using Homebrew (recommended):
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify
node --version
npm --version
```

#### Install MySQL
```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation

# Verify
mysql --version
```

### Linux (Ubuntu/Debian)

#### Install Node.js
```bash
# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### Install MySQL
```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Verify
mysql --version
```

---

## 3. Database Setup

### Step 1: Access MySQL

**Windows:**
```cmd
mysql -u root -p
```

**macOS/Linux:**
```bash
mysql -u root -p
```

Enter your root password when prompted.

### Step 2: Create Database

```sql
-- Create the database
CREATE DATABASE weather_dashboard;

-- Use the database
USE weather_dashboard;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    profile_image VARCHAR(255) DEFAULT 'default-avatar.png'
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    temperature_unit VARCHAR(10) DEFAULT 'celsius',
    theme VARCHAR(20) DEFAULT 'auto',
    default_location VARCHAR(100),
    default_lat DECIMAL(10, 8),
    default_lon DECIMAL(11, 8),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create saved locations table
CREATE TABLE IF NOT EXISTS saved_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create weather alerts table
CREATE TABLE IF NOT EXISTS weather_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    threshold_value DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verify tables were created
SHOW TABLES;

-- Exit MySQL
EXIT;
```

### Step 3: Verify Database

```bash
mysql -u root -p -e "USE weather_dashboard; SHOW TABLES;"
```

You should see 4 tables listed.

---

## 4. Application Setup

### Step 1: Download/Clone Project

If you have the project files:
```bash
cd path/to/weather-dashboard
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- express
- mysql2
- bcryptjs
- express-session
- dotenv
- axios

### Step 3: Configure Environment Variables

Edit the `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=weather_dashboard

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (change this to a random string)
SESSION_SECRET=your_super_secret_random_string_here

# Weather API Key (get from OpenWeatherMap)
WEATHER_API_KEY=your_api_key_here
```

**Important**: Replace the placeholder values with your actual credentials!

---

## 5. API Configuration

### Get OpenWeatherMap API Key

1. **Sign Up**
   - Go to [OpenWeatherMap](https://openweathermap.org/api)
   - Click "Sign Up" (top right)
   - Fill in your details
   - Verify your email

2. **Generate API Key**
   - Log in to your account
   - Go to "API keys" tab
   - Copy your default API key (or create a new one)
   - The key looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

3. **Add to .env File**
   ```env
   WEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

4. **Wait for Activation**
   - New API keys take 10-120 minutes to activate
   - You'll receive an email when it's ready

### Test API Key

```bash
curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY"
```

If you see weather data, your key is working!

---

## 6. Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Verify Server is Running

You should see:
```
🌤️  Weather Dashboard server running on http://localhost:3000
📊 Make sure MySQL is running and database is created
```

### Access the Application

Open your browser and go to:
```
http://localhost:3000
```

---

## 7. Troubleshooting

### Problem: "Cannot connect to MySQL"

**Solution:**
```bash
# Check if MySQL is running
# Windows:
net start MySQL80

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql

# Verify connection
mysql -u root -p -e "SELECT 1;"
```

### Problem: "Database does not exist"

**Solution:**
```bash
mysql -u root -p -e "CREATE DATABASE weather_dashboard;"
```

### Problem: "API key not working"

**Solutions:**
1. Wait 10-120 minutes for activation
2. Check for typos in .env file
3. Verify key at [OpenWeatherMap API keys page](https://home.openweathermap.org/api_keys)
4. Try generating a new key

### Problem: "Port 3000 already in use"

**Solution:**
```bash
# Change port in .env file
PORT=3001

# Or kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Problem: "Module not found"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Session secret error"

**Solution:**
Edit .env and add a strong secret:
```env
SESSION_SECRET=my_super_secret_key_12345_change_this
```

### Problem: "Location permission denied"

**Solution:**
1. Enable location services in browser settings
2. Use HTTPS in production (required for geolocation)
3. Manually search for a city instead

---

## 🎉 Success!

If everything is working, you should see:
1. ✅ Landing page loads at http://localhost:3000
2. ✅ Can register a new account
3. ✅ Can login successfully
4. ✅ Dashboard shows weather data
5. ✅ Location detection works

---

## 📚 Next Steps

1. **Customize the App**
   - Edit colors in CSS files
   - Add your own features
   - Modify the database schema

2. **Deploy to Production**
   - Use a hosting service (Heroku, DigitalOcean, AWS)
   - Set up HTTPS
   - Configure production database
   - Set environment to production

3. **Add More Features**
   - Weather maps
   - Historical data
   - Social sharing
   - Mobile app

---

## 🆘 Still Having Issues?

1. Check the console for error messages
2. Review the logs in terminal
3. Verify all prerequisites are installed
4. Double-check .env configuration
5. Ensure MySQL is running
6. Test API key separately

---

## 📞 Support

For additional help:
- Check README.md for more details
- Review server.js for backend logic
- Inspect browser console for frontend errors
- Check MySQL logs for database issues

**Happy Weather Tracking! 🌤️**
