# 🌤️ WeatherPro - Ultimate Weather Dashboard

A stunning, feature-rich weather dashboard web application with beautiful UI/UX, smooth animations, and comprehensive weather data visualization.

## ✨ Features

### 🎨 Beautiful UI/UX
- **Stunning Landing Page** with animated backgrounds and smooth transitions
- **Modern Authentication** pages with real-time validation
- **Dynamic Dashboard** with weather-based themes
- **Responsive Design** that works perfectly on all devices
- **Dark/Light Mode** with smooth transitions
- **Smooth Animations** throughout the application

### 🌍 Weather Features
- **Real-time Weather Data** with automatic location detection
- **7-Day Forecast** with hourly breakdowns
- **Multiple Locations** - Save and track unlimited locations
- **Weather Alerts** - Get notified about severe conditions
- **Detailed Metrics** - Temperature, humidity, wind, pressure, visibility, UV index
- **Sunrise/Sunset Times** with beautiful visualizations
- **Air Quality Index** monitoring

### 👤 User Features
- **User Authentication** - Secure registration and login
- **User Profiles** - Personalized dashboard experience
- **Saved Locations** - Quick access to favorite places
- **Customizable Settings** - Temperature units, themes, notifications
- **Weather Preferences** - Set default locations and units

### 🎯 Technical Features
- **Location-Based** - Automatic geolocation with permission handling
- **RESTful API** - Clean backend architecture
- **Session Management** - Secure user sessions
- **MySQL Database** - Reliable data storage
- **Real-time Updates** - Live weather data refresh
- **Error Handling** - Graceful error management

## 🚀 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Advanced animations and transitions
- **JavaScript (ES6+)** - Modern JavaScript features
- **Font Awesome** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **axios** - HTTP client

### APIs
- **OpenWeatherMap API** - Weather data provider

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd weather-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and tables
source database.sql
```

Or manually create the database:
```sql
CREATE DATABASE weather_dashboard;
USE weather_dashboard;
-- Then run the SQL from database.sql
```

### 4. Configure Environment Variables
Edit the `.env` file with your credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=weather_dashboard
SESSION_SECRET=your_super_secret_key_change_this
PORT=3000
WEATHER_API_KEY=your_openweathermap_api_key
```

### 5. Get OpenWeatherMap API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env` file

### 6. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 7. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
weather-dashboard/
├── public/
│   ├── css/
│   │   ├── landing.css      # Landing page styles
│   │   ├── auth.css         # Authentication pages styles
│   │   └── dashboard.css    # Dashboard styles
│   ├── js/
│   │   ├── landing.js       # Landing page scripts
│   │   ├── register.js      # Registration logic
│   │   ├── login.js         # Login logic
│   │   └── dashboard.js     # Dashboard functionality
│   ├── index.html           # Landing page
│   ├── register.html        # Registration page
│   ├── login.html           # Login page
│   └── dashboard.html       # Main dashboard
├── server.js                # Express server
├── database.sql             # Database schema
├── package.json             # Dependencies
├── .env                     # Environment variables
└── README.md               # Documentation
```

## 🎯 Usage

### First Time Setup
1. **Visit Landing Page** - Navigate to `http://localhost:3000`
2. **Create Account** - Click "Get Started" or "Register"
3. **Fill Registration Form** - Provide username, email, and password
4. **Login** - Use your credentials to sign in
5. **Allow Location** - Grant location permission for accurate weather
6. **Explore Dashboard** - View weather, forecasts, and customize settings

### Dashboard Features

#### Overview Section
- View current weather conditions
- See detailed metrics (feels like, wind, humidity, etc.)
- Check sunrise/sunset times
- Browse hourly forecast

#### Forecast Section
- View 7-day weather forecast
- See daily high/low temperatures
- Check weather conditions for each day

#### Locations Section
- Add new locations
- View weather for saved locations
- Mark locations as favorites
- Quick switch between locations

#### Alerts Section
- Create custom weather alerts
- Get notified about severe weather
- Manage alert preferences

#### Settings Section
- Change temperature units (Celsius/Fahrenheit)
- Toggle dark/light theme
- Enable/disable notifications
- Configure location services

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `public/css/dashboard.css`:
```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --accent: #f093fb;
    /* Add your custom colors */
}
```

### Adding Weather Providers
Modify `server.js` to add additional weather API providers:
```javascript
// Add your weather API integration
const alternativeWeatherAPI = async (lat, lon) => {
    // Your implementation
};
```

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **Session Management** - Secure session cookies
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization
- **CSRF Protection** - Session-based tokens

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
sudo service mysql status

# Verify credentials in .env file
# Ensure database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### API Key Issues
- Verify your OpenWeatherMap API key is active
- Check API key has proper permissions
- Ensure you haven't exceeded rate limits

### Location Permission Denied
- Enable location services in browser settings
- Use HTTPS in production for geolocation
- Fallback to manual location search

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

## 🚀 Deployment

### Deploy to Production

1. **Set Environment to Production**
```env
NODE_ENV=production
```

2. **Use HTTPS**
- Configure SSL certificates
- Update session cookie settings

3. **Optimize Database**
- Add indexes for better performance
- Configure connection pooling

4. **Enable Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@weatherpro.com or open an issue in the repository.

## 🎉 Acknowledgments

- OpenWeatherMap for weather data
- Font Awesome for icons
- All contributors and users

---

**Made with ❤️ by WeatherPro Team**

Enjoy your ultimate weather dashboard experience! 🌤️
