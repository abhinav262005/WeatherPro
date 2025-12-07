# ⚡ Quick Start Guide - WeatherPro

Get up and running in 5 minutes!

## 🎯 Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed (`node --version`)
- ✅ MySQL installed and running (`mysql --version`)
- ✅ npm installed (`npm --version`)

## 🚀 5-Minute Setup

### 1️⃣ Install Dependencies (1 min)
```bash
npm install
```

### 2️⃣ Setup Database (2 min)
```bash
# Login to MySQL
mysql -u root -p

# Run this in MySQL:
CREATE DATABASE weather_dashboard;
USE weather_dashboard;
source database.sql;
EXIT;
```

### 3️⃣ Configure Environment (1 min)
Edit `.env` file:
```env
DB_PASSWORD=your_mysql_password
WEATHER_API_KEY=get_from_openweathermap.org
SESSION_SECRET=any_random_string_here
```

### 4️⃣ Start Server (30 sec)
```bash
npm start
```

### 5️⃣ Open Browser (30 sec)
Go to: **http://localhost:3000**

## 🎊 Done!

You should now see the WeatherPro landing page!

## 📝 First Time Usage

1. **Click "Get Started"** or "Register"
2. **Create your account** with username, email, password
3. **Login** with your credentials
4. **Allow location access** when prompted
5. **Enjoy your weather dashboard!**

## 🔑 Get Weather API Key

1. Go to [openweathermap.org/api](https://openweathermap.org/api)
2. Sign up for free account
3. Get your API key from dashboard
4. Add to `.env` file
5. Wait 10 minutes for activation

## ⚠️ Common Issues

**Can't connect to database?**
```bash
# Start MySQL
# Windows: net start MySQL80
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

**Port 3000 in use?**
```bash
# Change PORT in .env to 3001
```

**API not working?**
- Wait 10-120 minutes after creating key
- Check for typos in .env
- Verify key is active on OpenWeatherMap

## 📖 Full Documentation

For detailed setup, see:
- `README.md` - Complete documentation
- `install.md` - Step-by-step installation guide

## 🎨 Features to Try

- ✨ View current weather with beautiful animations
- 📊 Check 7-day forecast
- 📍 Save multiple locations
- ⚙️ Customize settings (theme, units)
- 🔔 Set up weather alerts
- 🌓 Toggle dark/light mode

## 🆘 Need Help?

Check the troubleshooting section in `install.md` or review error messages in:
- Browser console (F12)
- Terminal/command prompt
- MySQL logs

---

**Enjoy WeatherPro! 🌤️**
