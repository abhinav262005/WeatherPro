# 🌤️ Hyper-Advanced Cinematic Weather Dashboard

A next-generation weather dashboard built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript**. No frameworks, just raw performance and stunning visuals.

## ✨ Features

### 🎨 Visual Excellence
- **6 Animated Gradient Presets**: Dawn, Sunrise, Day, Twilight, Storm, Aurora
- **Glassmorphism UI**: Frosted glass panels with dynamic blur
- **Particle System**: Animated background with 50+ floating particles
- **Weather-Reactive Effects**: Rain, snow, and lightning animations
- **Smooth Transitions**: GSAP-powered animations throughout

### 📊 Weather Intelligence
- **Real-time Weather Data**: Current conditions, hourly, and 7-day forecasts
- **Air Quality Index**: Complete AQI monitoring with pollutant breakdown
- **UV Index Tracking**: Real-time UV levels with safety recommendations
- **Smart Alerts**: AI-style weather insights and recommendations
- **Outfit Suggestions**: Temperature and weather-based clothing advice
- **Activity Planner**: Recommendations for outdoor activities

### 🧩 Modular Widget System
- **16+ Widgets Available**:
  - Current Weather
  - Hourly Forecast Chart
  - 7-Day Forecast Cards
  - Radar Map (lazy-loaded)
  - Air Quality Suite
  - Wind Rose
  - UV Index
  - Humidity & Comfort
  - Pressure Trend
  - Visibility
  - Sunrise/Sunset
  - Moon Phases
  - Precipitation
  - Feels Like
  - Dew Point
  - Cloud Cover

- **Drag & Drop**: Rearrange widgets freely
- **Add/Remove**: Customize your dashboard
- **Save Layout**: Persistent layout storage

### 🎛️ Advanced Theme Customizer
- **Live Preview**: See changes in real-time
- **Gradient Editor**: Create custom gradients
- **Glass Effect Controls**: Adjust blur and opacity
- **Typography Settings**: Font size, family, spacing
- **Animation Controls**: Speed, intensity, reduced motion
- **Export/Import**: Share themes as JSON
- **Built-in Presets**: 6 professional gradient themes

### 🚀 Performance & PWA
- **Service Worker**: Offline support
- **IndexedDB**: Local weather history
- **Lazy Loading**: Maps and heavy modules load on demand
- **Optimized Rendering**: GPU-accelerated animations
- **Responsive Design**: Mobile, tablet, desktop
- **Accessibility**: WCAG 2.1 AA compliant

## 🛠️ Installation

### 1. Clone or Download
```bash
git clone https://github.com/yourusername/weather-dashboard.git
cd weather-dashboard
```

### 2. Get API Key
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Open `js/config.js`
4. Replace `YOUR_API_KEY_HERE` with your actual key

```javascript
API: {
    OPENWEATHER_KEY: 'your_actual_api_key_here',
    // ...
}
```

### 3. Serve the Application
You need a local server (can't run directly from file:// due to CORS):

**Option A: Python**
```bash
python -m http.server 8000
```

**Option B: Node.js (http-server)**
```bash
npx http-server -p 8000
```

**Option C: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### 4. Open in Browser
Navigate to `http://localhost:8000`

## 📁 Project Structure

```
weather-dashboard/
├── index.html                 # Main entry point
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker
├── css/
│   ├── core.css              # Variables, reset, base styles
│   ├── gradients.css         # Animated gradient presets
│   ├── components.css        # UI components
│   ├── themes.css            # Theme system
│   └── animations.css        # Advanced animations
├── js/
│   ├── app.js                # Main application orchestrator
│   ├── config.js             # Configuration & constants
│   └── modules/
│       ├── weather-api.js    # Weather API integration
│       ├── gradient-animator.js  # Background animations
│       ├── theme-engine.js   # Theme customization
│       ├── widget-system.js  # Widget management
│       ├── storage.js        # LocalStorage & IndexedDB
│       ├── intelligence.js   # AI-style insights
│       └── alerts.js         # Alert system
└── assets/
    ├── icons/                # Weather icons (SVG)
    └── sounds/               # Ambient soundscapes
```

## 🎯 Usage Guide

### Basic Navigation
1. **Search Location**: Use the search bar to find any city
2. **Geolocation**: Click the location icon to use your current position
3. **Theme Customizer**: Click 🎨 to open theme controls
4. **Widget Manager**: Click 📊 to add/remove widgets
5. **Alerts**: Click 🔔 to view weather alerts

### Customizing Your Dashboard

#### Change Gradient
1. Open Theme Customizer (🎨)
2. Click any gradient preset
3. Or create custom gradients with the editor

#### Adjust Glass Effect
1. Open Theme Customizer
2. Adjust "Blur Strength" slider
3. Adjust "Opacity" slider
4. Changes apply instantly

#### Add/Remove Widgets
1. Open Widget Manager (📊)
2. Toggle widgets on/off
3. Drag widgets to rearrange
4. Layout saves automatically

#### Export Your Theme
1. Open Theme Customizer
2. Click "Export Theme"
3. Save JSON file
4. Share with others!

#### Import a Theme
1. Open Theme Customizer
2. Click "Import Theme"
3. Select JSON file
4. Theme applies instantly

## 🔧 Configuration

### API Settings
Edit `js/config.js`:

```javascript
export const CONFIG = {
    API: {
        OPENWEATHER_KEY: 'your_key',
        // Add other API keys here
    },
    DEFAULTS: {
        LOCATION: { lat: 40.7128, lon: -74.0060, name: 'New York' },
        UNITS: 'metric', // 'metric', 'imperial', 'standard'
        LANGUAGE: 'en',
        REFRESH_INTERVAL: 600000, // 10 minutes
    },
    // ...
};
```

### Widget Configuration
Enable/disable default widgets:

```javascript
WIDGETS: {
    DEFAULT_ENABLED: [
        'hourly-chart',
        'forecast-7day',
        'aqi-suite',
        // Add more widget IDs
    ],
}
```

### Animation Settings
Adjust performance:

```javascript
ANIMATION: {
    PARTICLE_COUNT: 50,        // Reduce for better performance
    PARTICLE_SPEED: 0.5,
    GRADIENT_TRANSITION_DURATION: 2000,
}
```

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 not supported

## 📱 PWA Installation

### Desktop
1. Open the dashboard in Chrome/Edge
2. Click the install icon in the address bar
3. Click "Install"

### Mobile
1. Open in mobile browser
2. Tap "Add to Home Screen"
3. Confirm installation

## 🎨 Gradient Presets

| Name | Colors | Best For |
|------|--------|----------|
| Dawn | Pink → Purple → Cyan | Early morning |
| Sunrise | Coral → Peach | Morning |
| Day | Blue → Light Blue | Daytime |
| Twilight | Dark Blue → Teal → Purple | Evening |
| Storm | Dark Gray → Blue Gray | Stormy weather |
| Aurora | Cyan → Purple → Cyan | Night |

## 🧪 Advanced Features

### Weather Intelligence
The dashboard analyzes weather data to provide:
- **Outfit recommendations** based on temperature, wind, and precipitation
- **Activity suggestions** for outdoor planning
- **Smart alerts** for temperature changes, rain, wind, UV
- **Comfort analysis** combining humidity and temperature

### Offline Support
- Service Worker caches essential files
- IndexedDB stores weather history
- Works offline with last known data
- Auto-syncs when connection restored

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- High contrast mode
- Reduced motion support
- ARIA labels throughout

## 🐛 Troubleshooting

### Weather data not loading
- Check your API key in `config.js`
- Verify internet connection
- Check browser console for errors
- Ensure you're using a local server (not file://)

### Animations laggy
- Reduce particle count in config
- Enable "Reduce Motion" in theme settings
- Close other browser tabs
- Update graphics drivers

### Widgets not appearing
- Check browser console for errors
- Clear localStorage and refresh
- Verify widget IDs in config
- Try resetting to default layout

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🙏 Credits

- Weather data: [OpenWeatherMap API](https://openweathermap.org/)
- Charts: [Chart.js](https://www.chartjs.org/)
- Animations: [GSAP](https://greensock.com/gsap/)
- Icons: Custom SVG animations

## 📞 Support

- 📧 Email: support@weatherdashboard.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/weather-dashboard/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/weather-dashboard/discussions)

---

**Built with ❤️ using pure HTML, CSS, and JavaScript**

No frameworks. No dependencies. Just beautiful, performant code.
