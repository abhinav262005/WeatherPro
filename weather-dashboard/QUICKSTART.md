# ⚡ Quick Start Guide

Get your weather dashboard running in **5 minutes**!

## 🚀 Step 1: Get the Code

Download or clone this repository to your computer.

## 🔑 Step 2: Get Your API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" (it's free!)
3. Verify your email
4. Go to "API Keys" section
5. Copy your API key

## ⚙️ Step 3: Configure

1. Open `js/config.js` in any text editor
2. Find this line:
   ```javascript
   OPENWEATHER_KEY: 'YOUR_API_KEY_HERE',
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   OPENWEATHER_KEY: 'abc123def456ghi789',
   ```
4. Save the file

## 🌐 Step 4: Run a Local Server

You **must** use a local server (can't open index.html directly).

### Option A: Python (Easiest)
```bash
# If you have Python 3
python -m http.server 8000

# If you have Python 2
python -m SimpleHTTPServer 8000
```

### Option B: Node.js
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run server
http-server -p 8000
```

### Option C: VS Code
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option D: PHP
```bash
php -S localhost:8000
```

## 🎉 Step 5: Open in Browser

Navigate to: `http://localhost:8000`

That's it! Your dashboard should now be running.

## 🎨 First Steps

### 1. Set Your Location
- Click the 📍 icon in the search bar
- Allow location access
- Or type your city name in the search bar

### 2. Customize Your Theme
- Click the 🎨 icon (top right)
- Try different gradient presets
- Adjust glass effect, fonts, animations
- Export your theme to save it!

### 3. Add Widgets
- Click the 📊 icon (top right)
- Toggle widgets on/off
- Drag to rearrange
- Your layout saves automatically

## 🐛 Troubleshooting

### "Weather data not loading"
- ✅ Check your API key is correct
- ✅ Make sure you're using a local server (not file://)
- ✅ Check browser console (F12) for errors
- ✅ Wait a few minutes (new API keys can take time to activate)

### "Blank page"
- ✅ Open browser console (F12)
- ✅ Look for JavaScript errors
- ✅ Make sure all files are in the correct folders
- ✅ Try a different browser

### "Animations are laggy"
- ✅ Open Theme Customizer (🎨)
- ✅ Enable "Reduce Motion"
- ✅ Or edit `js/config.js` and reduce `PARTICLE_COUNT` to 20

## 📱 Install as PWA

### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click "Install"
3. Dashboard opens as standalone app!

### Mobile
1. Open in mobile browser
2. Tap menu (⋮)
3. Select "Add to Home Screen"
4. Tap the new icon to launch

## 🎯 Next Steps

- Read the full [README.md](README.md) for advanced features
- Explore the [Widget System](#widgets)
- Create custom themes
- Check out [Advanced Configuration](#advanced)

## 💡 Pro Tips

1. **Keyboard Shortcuts**
   - `Ctrl/Cmd + K` - Focus search
   - `Esc` - Close panels
   - `Tab` - Navigate widgets

2. **Performance**
   - Reduce particle count for older devices
   - Enable "Reduce Motion" for better battery life
   - Use "Compact" layout mode on mobile

3. **Customization**
   - Export your theme and share with friends
   - Create multiple themes for different moods
   - Adjust refresh interval in config.js

## 🆘 Still Need Help?

- 📖 Read the full [README.md](README.md)
- 🐛 Check [GitHub Issues](https://github.com/yourusername/weather-dashboard/issues)
- 💬 Ask in [Discussions](https://github.com/yourusername/weather-dashboard/discussions)

---

**Enjoy your beautiful weather dashboard! 🌤️**
