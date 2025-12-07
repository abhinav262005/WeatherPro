// ========================================
// WEATHERPRO ULTIMATE - BEST DASHBOARD EVER
// ========================================

// Global State
const state = {
    user: null,
    currentLocation: null, // Will be set by geolocation or default
    weatherData: null,
    forecastData: null,
    aqiData: null,
    map: null,
    mapSelector: null,
    chart: null,
    autoRefreshInterval: null,
    preferences: {
        theme: 'dark',
        accent: 'purple',
        cardStyle: 'glass',
        animSpeed: 1,
        fontSize: 16,
        borderRadius: 16,
        particles: true,
        weatherEffects: true,
        autoRefresh: true,
        sound: false,
        compact: false,
        timeFormat: '24'
    }
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Apply saved preferences immediately from localStorage before anything else
    const savedPrefs = localStorage.getItem('weatherProPrefs');
    if (savedPrefs) {
        try {
            const prefs = JSON.parse(savedPrefs);
            if (prefs.accent) {
                document.body.setAttribute('data-accent', prefs.accent);
            }
            if (prefs.theme) {
                document.body.setAttribute('data-theme', prefs.theme);
            }
            if (prefs.customColor) {
                const r = parseInt(prefs.customColor.substr(1, 2), 16);
                const g = parseInt(prefs.customColor.substr(3, 2), 16);
                const b = parseInt(prefs.customColor.substr(5, 2), 16);
                document.documentElement.style.setProperty('--accent-primary', prefs.customColor);
                document.documentElement.style.setProperty('--accent-secondary', prefs.customColor);
                document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
            }
        } catch (e) {
            console.error('Failed to apply cached preferences:', e);
        }
    }
    
    showLoading();
    await checkAuth();
    await loadPreferences();
    
    // Load profile preferences from localStorage AFTER server preferences
    // This ensures profile preferences override server defaults
    const profilePrefs = JSON.parse(localStorage.getItem('profilePreferences') || '{}');
    if (profilePrefs.timeFormat) {
        state.preferences.timeFormat = profilePrefs.timeFormat;
        console.log('✅ Applied saved time format:', profilePrefs.timeFormat);
    }
    
    setupEventListeners();
    
    // Try to get user's location first
    try {
        const position = await getCurrentPosition();
        state.currentLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
        console.log('Using your location:', state.currentLocation);
    } catch (error) {
        // If geolocation fails, use Hyderabad as default (since you're there)
        console.log('Geolocation failed, using Hyderabad as default');
        state.currentLocation = { lat: 17.3850, lon: 78.4867 }; // Hyderabad coordinates
    }
    
    await loadWeatherData();
    initializeParticles();
    updateGreeting();
    hideLoading();
    
    // Auto-refresh every 10 minutes
    startAutoRefresh();
});

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            state.user = await response.json();
            updateUserDisplay();
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login';
    }
}

function updateUserDisplay() {
    if (state.user) {
        const avatar = document.getElementById('avatarBtn');
        const initial = state.user.username ? state.user.username[0].toUpperCase() : 'U';
        avatar.querySelector('span').textContent = initial;
    }
}

// ========================================
// PREFERENCES
// ========================================

async function loadPreferences() {
    try {
        // Load from server
        const response = await fetch('/api/preferences');
        if (response.ok) {
            const serverPrefs = await response.json();
            
            // Map server preferences to state
            if (serverPrefs && serverPrefs.user_id) {
                state.preferences = {
                    theme: serverPrefs.theme || 'dark',
                    accent: serverPrefs.accent_color || 'purple',
                    customColor: serverPrefs.custom_color || null,
                    cardStyle: serverPrefs.card_style || 'glass',
                    animSpeed: serverPrefs.anim_speed || 1,
                    fontSize: serverPrefs.font_size || 16,
                    borderRadius: serverPrefs.border_radius || 16,
                    particles: serverPrefs.particles_enabled !== undefined ? serverPrefs.particles_enabled : true,
                    weatherEffects: serverPrefs.weather_effects_enabled !== undefined ? serverPrefs.weather_effects_enabled : true,
                    autoRefresh: serverPrefs.auto_refresh_enabled !== undefined ? serverPrefs.auto_refresh_enabled : true,
                    sound: serverPrefs.sound_enabled !== undefined ? serverPrefs.sound_enabled : false,
                    compact: serverPrefs.compact_mode !== undefined ? serverPrefs.compact_mode : false,
                    timeFormat: serverPrefs.time_format || '24'
                };
                console.log('Loaded preferences from server:', state.preferences);
            } else {
                // Use defaults if no server preferences
                console.log('No server preferences found, using defaults');
            }
        } else {
            console.log('Failed to load preferences from server, using defaults');
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
        // Fall back to localStorage if server fails
        const saved = localStorage.getItem('weatherProPrefs');
        if (saved) {
            state.preferences = { ...state.preferences, ...JSON.parse(saved) };
        }
    }
    
    applyPreferences();
}

async function savePreferences() {
    try {
        // Save to server
        const response = await fetch('/api/preferences', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                theme: state.preferences.theme,
                accentColor: state.preferences.accent,
                customColor: state.preferences.customColor,
                cardStyle: state.preferences.cardStyle,
                animSpeed: state.preferences.animSpeed,
                fontSize: state.preferences.fontSize,
                borderRadius: state.preferences.borderRadius,
                particlesEnabled: state.preferences.particles,
                weatherEffectsEnabled: state.preferences.weatherEffects,
                autoRefreshEnabled: state.preferences.autoRefresh,
                soundEnabled: state.preferences.sound,
                compactMode: state.preferences.compact,
                timeFormat: state.preferences.timeFormat
            })
        });
        
        if (response.ok) {
            console.log('Preferences saved to server successfully');
            // Also save to localStorage as backup
            localStorage.setItem('weatherProPrefs', JSON.stringify(state.preferences));
        } else {
            console.error('Failed to save preferences to server');
            showNotification('Failed to save settings', 'error');
        }
    } catch (error) {
        console.error('Error saving preferences:', error);
        // Fall back to localStorage
        localStorage.setItem('weatherProPrefs', JSON.stringify(state.preferences));
        showNotification('Settings saved locally only', 'warning');
    }
    
    applyPreferences();
}

function applyPreferences() {
    document.body.setAttribute('data-theme', state.preferences.theme);
    document.body.setAttribute('data-accent', state.preferences.accent);
    document.body.setAttribute('data-card-style', state.preferences.cardStyle);
    document.body.setAttribute('data-compact', state.preferences.compact);
    document.documentElement.style.setProperty('--anim-speed', state.preferences.animSpeed);
    document.documentElement.style.setProperty('--radius', state.preferences.borderRadius + 'px');
    document.body.style.fontSize = state.preferences.fontSize + 'px';
    
    // Apply custom color if set, otherwise apply preset accent color
    if (state.preferences.customColor) {
        const customColor = state.preferences.customColor;
        const r = parseInt(customColor.substr(1, 2), 16);
        const g = parseInt(customColor.substr(3, 2), 16);
        const b = parseInt(customColor.substr(5, 2), 16);
        
        document.documentElement.style.setProperty('--accent-primary', customColor);
        document.documentElement.style.setProperty('--accent-secondary', customColor);
        document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
        
        // Update color picker value
        const colorPicker = document.getElementById('customColorPicker');
        if (colorPicker) {
            colorPicker.value = customColor;
        }
    } else {
        // Apply preset accent colors
        const accentColors = {
            'purple': { primary: '#8b5cf6', secondary: '#a78bfa', glow: 'rgba(139, 92, 246, 0.5)' },
            'blue': { primary: '#3b82f6', secondary: '#60a5fa', glow: 'rgba(59, 130, 246, 0.5)' },
            'green': { primary: '#10b981', secondary: '#34d399', glow: 'rgba(16, 185, 129, 0.5)' },
            'red': { primary: '#ef4444', secondary: '#f87171', glow: 'rgba(239, 68, 68, 0.5)' },
            'orange': { primary: '#f59e0b', secondary: '#fbbf24', glow: 'rgba(245, 158, 11, 0.5)' },
            'pink': { primary: '#ec4899', secondary: '#f472b6', glow: 'rgba(236, 72, 153, 0.5)' }
        };
        
        const colors = accentColors[state.preferences.accent] || accentColors['purple'];
        document.documentElement.style.setProperty('--accent-primary', colors.primary);
        document.documentElement.style.setProperty('--accent-secondary', colors.secondary);
        document.documentElement.style.setProperty('--accent-glow', colors.glow);
    }
    
    // Update UI controls
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === state.preferences.theme);
    });
    
    document.querySelectorAll('.color-swatch').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === state.preferences.accent && !state.preferences.customColor);
    });
    
    document.querySelectorAll('.style-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === state.preferences.cardStyle);
    });
    
    document.getElementById('animSpeedSlider').value = state.preferences.animSpeed;
    document.getElementById('fontSizeSlider').value = state.preferences.fontSize;
    document.getElementById('borderRadiusSlider').value = state.preferences.borderRadius;
    document.getElementById('particleToggle').checked = state.preferences.particles;
    document.getElementById('weatherEffectsToggle').checked = state.preferences.weatherEffects;
    document.getElementById('autoRefreshToggle').checked = state.preferences.autoRefresh;
    document.getElementById('soundToggle').checked = state.preferences.sound;
    document.getElementById('compactToggle').checked = state.preferences.compact;
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Navigation buttons
    document.getElementById('locationBtn').addEventListener('click', () => {
        document.getElementById('locationModal').classList.add('show');
        initializeMapSelector();
    });
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('customizationPanel').classList.add('open');
    });
    
    document.getElementById('avatarBtn').addEventListener('click', () => {
        document.getElementById('profileModal').classList.add('show');
        loadProfileData();
    });
    
    document.getElementById('editLayoutBtn').addEventListener('click', () => {
        document.getElementById('editLayoutModal').classList.add('show');
        loadLayoutSettings();
    });
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Modal controls
    document.getElementById('closeLocationModal').addEventListener('click', () => {
        document.getElementById('locationModal').classList.remove('show');
    });
    
    document.getElementById('closeCustomPanel').addEventListener('click', () => {
        document.getElementById('customizationPanel').classList.remove('open');
    });
    
    document.getElementById('closeProfileModal').addEventListener('click', () => {
        document.getElementById('profileModal').classList.remove('show');
    });
    
    // Save Profile Button
    document.getElementById('saveProfileBtn').addEventListener('click', () => {
        saveProfilePreferences();
    });
    
    document.getElementById('closeEditLayoutModal').addEventListener('click', () => {
        document.getElementById('editLayoutModal').classList.remove('show');
        exitEditMode();
    });
    
    // Click outside to close modals
    setupModalClickOutside();
    
    // Location modal buttons
    document.getElementById('searchCityBtn').addEventListener('click', searchCityAndLoadWeather);
    document.getElementById('useCoordinatesBtn').addEventListener('click', useCoordinatesAndLoadWeather);
    
    // Top action buttons
    document.getElementById('useCurrentLocationBtnTop').addEventListener('click', useCurrentLocationAndLoadWeather);
    document.getElementById('cancelLocationBtnTop').addEventListener('click', () => {
        document.getElementById('locationModal').classList.remove('show');
    });
    document.getElementById('getWeatherBtnTop').addEventListener('click', async () => {
        // Check if location is set
        if (!state.currentLocation || !state.currentLocation.lat || !state.currentLocation.lon) {
            showNotification('Please select a location first', 'error');
            return;
        }
        
        document.getElementById('locationModal').classList.remove('show');
        await loadWeatherData();
    });
    
    // City buttons - auto-load weather and close modal
    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const city = btn.dataset.city;
            await selectCityAndLoadWeather(city);
        });
    });
    
    // Enter key support for search - auto-load weather and close modal
    document.getElementById('citySearch').addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await searchCityAndLoadWeather();
        }
    });
    
    // Hourly forecast navigation
    document.getElementById('hourlyPrev').addEventListener('click', () => {
        document.getElementById('hourlyScroll').scrollBy({ left: -300, behavior: 'smooth' });
    });
    
    document.getElementById('hourlyNext').addEventListener('click', () => {
        document.getElementById('hourlyScroll').scrollBy({ left: 300, behavior: 'smooth' });
    });
    
    // Customization controls
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            state.preferences.theme = btn.dataset.theme;
            savePreferences();
        });
    });
    
    document.querySelectorAll('.color-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            state.preferences.accent = btn.dataset.color;
            state.preferences.customColor = null; // Clear custom color when preset is selected
            savePreferences();
        });
    });
    
    // Custom color picker
    document.getElementById('applyCustomColor').addEventListener('click', () => {
        const colorPicker = document.getElementById('customColorPicker');
        const customColor = colorPicker.value;
        
        // Convert hex to RGB for glow effect
        const r = parseInt(customColor.substr(1, 2), 16);
        const g = parseInt(customColor.substr(3, 2), 16);
        const b = parseInt(customColor.substr(5, 2), 16);
        
        // Apply custom color
        document.documentElement.style.setProperty('--accent-primary', customColor);
        document.documentElement.style.setProperty('--accent-secondary', customColor);
        document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
        
        // Save to preferences
        state.preferences.customColor = customColor;
        state.preferences.accent = 'custom';
        
        // Remove active class from preset swatches
        document.querySelectorAll('.color-swatch').forEach(btn => {
            btn.classList.remove('active');
        });
        
        savePreferences();
        showNotification('Custom color applied!', 'success');
    });
    
    document.querySelectorAll('.style-option').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            state.preferences.cardStyle = btn.dataset.style;
            savePreferences();
            
            // Show notification with style name
            const styleNames = {
                'glass': 'Glass Morphism',
                'neuro': 'Neumorphism',
                'flat': 'Flat Design',
                'gradient': 'Gradient Style'
            };
            showNotification(`Card style changed to ${styleNames[btn.dataset.style]}`, 'success');
        });
    });
    
    document.getElementById('animSpeedSlider').addEventListener('input', (e) => {
        state.preferences.animSpeed = parseFloat(e.target.value);
        savePreferences();
    });
    
    document.getElementById('fontSizeSlider').addEventListener('input', (e) => {
        state.preferences.fontSize = parseInt(e.target.value);
        savePreferences();
    });
    
    document.getElementById('borderRadiusSlider').addEventListener('input', (e) => {
        state.preferences.borderRadius = parseInt(e.target.value);
        savePreferences();
    });
    
    document.getElementById('particleToggle').addEventListener('change', (e) => {
        state.preferences.particles = e.target.checked;
        savePreferences();
        if (e.target.checked) {
            initializeParticles();
        } else {
            clearParticles();
        }
    });
    
    document.getElementById('weatherEffectsToggle').addEventListener('change', (e) => {
        state.preferences.weatherEffects = e.target.checked;
        savePreferences();
        if (e.target.checked) {
            updateWeatherEffects();
        } else {
            clearWeatherEffects();
        }
    });
    
    document.getElementById('autoRefreshToggle').addEventListener('change', (e) => {
        state.preferences.autoRefresh = e.target.checked;
        savePreferences();
        if (e.target.checked) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    });
    
    document.getElementById('soundToggle').addEventListener('change', (e) => {
        state.preferences.sound = e.target.checked;
        savePreferences();
        if (e.target.checked) {
            playSound('toggle');
            showNotification('Sound effects enabled', 'success');
        } else {
            showNotification('Sound effects disabled', 'info');
        }
    });
    
    document.getElementById('compactToggle').addEventListener('change', (e) => {
        state.preferences.compact = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        savePreferences();
        showNotification('Settings saved successfully!', 'success');
    });
}

// ========================================
// WEATHER DATA
// ========================================

async function loadWeatherData() {
    if (!state.currentLocation) {
        console.error('No location set');
        showNotification('Location not available', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const { lat, lon } = state.currentLocation;
        
        console.log('Fetching weather for:', lat, lon);
        
        // Fetch all data
        const [weather, forecast, airQuality] = await Promise.all([
            fetchWeather(lat, lon),
            fetchForecast(lat, lon),
            fetchAirQuality(lat, lon).catch(err => {
                console.log('Air quality not available:', err);
                return null;
            })
        ]);
        
        console.log('Weather data received:', weather);
        
        state.weatherData = weather;
        state.forecastData = forecast;
        state.aqiData = airQuality;
        
        // Update all displays
        updateHeroCard();
        updateHourlyForecast();
        updateWeeklyForecast();
        updateAirQuality();
        updateChart();
        updateWeatherAlerts();
        updateWeatherComparison();
        updateTime(); // Update time for new location
        
        // Update smart recommendations with a slight delay to ensure DOM is ready
        setTimeout(() => {
            updateSmartRecommendations();
        }, 100);
        
        initializeMap();
        updateWeatherEffects();
        startSunCountdown();
        
        showNotification('Weather data loaded successfully!', 'success');
        
        // Show dramatic foreground weather effect for 5 seconds
        if (weather && weather.weather && weather.weather[0]) {
            showForegroundWeatherEffect(weather.weather[0].main);
        }
        
    } catch (error) {
        console.error('Failed to load weather data:', error);
        showNotification('Failed to load weather data: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function fetchWeather(lat, lon) {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return response.json();
}

async function fetchForecast(lat, lon) {
    const response = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return response.json();
}

async function fetchAirQuality(lat, lon) {
    const response = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Failed to fetch air quality');
    return response.json();
}

async function searchCity() {
    const query = document.getElementById('citySearch').value.trim();
    if (!query) {
        showNotification('Please enter a city name', 'error');
        return;
    }
    
    await selectCityOnMap(query);
}

async function searchCityAndLoadWeather() {
    const query = document.getElementById('citySearch').value.trim();
    if (!query) {
        showNotification('Please enter a city name', 'error');
        return;
    }
    
    await selectCityOnMap(query);
    
    // Close modal and load weather
    document.getElementById('locationModal').classList.remove('show');
    await loadWeatherData();
}

async function selectCityAndLoadWeather(cityName) {
    await selectCityOnMap(cityName);
    
    // Close modal and load weather
    document.getElementById('locationModal').classList.remove('show');
    await loadWeatherData();
}

async function useCoordinatesAndLoadWeather() {
    const lat = parseFloat(document.getElementById('latInput').value);
    const lon = parseFloat(document.getElementById('lonInput').value);
    
    if (isNaN(lat) || isNaN(lon)) {
        showNotification('Invalid coordinates', 'error');
        return;
    }
    
    state.currentLocation = { lat, lon };
    
    // Close modal and load weather
    document.getElementById('locationModal').classList.remove('show');
    await loadWeatherData();
}

async function useCurrentLocationAndLoadWeather() {
    try {
        const position = await getCurrentPosition();
        state.currentLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
        
        // Close modal and load weather
        document.getElementById('locationModal').classList.remove('show');
        await loadWeatherData();
    } catch (error) {
        console.error('Geolocation error:', error);
        showNotification('Could not get your location', 'error');
    }
}

async function selectCityOnMap(cityName) {
    try {
        // Predefined coordinates for popular cities
        const cityCoordinates = {
            'Hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad' },
            'Mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
            'Delhi': { lat: 28.7041, lon: 77.1025, name: 'Delhi' },
            'Bangalore': { lat: 12.9716, lon: 77.5946, name: 'Bangalore' },
            'Chennai': { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
            'Kolkata': { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
            'London': { lat: 51.5074, lon: -0.1278, name: 'London' },
            'New York': { lat: 40.7128, lon: -74.0060, name: 'New York' },
            'Tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
            'Paris': { lat: 48.8566, lon: 2.3522, name: 'Paris' },
            'Dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai' },
            'Sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney' }
        };
        
        let cityData = null;
        
        // Check if it's a predefined city
        if (cityCoordinates[cityName]) {
            cityData = cityCoordinates[cityName];
        } else {
            // Otherwise, use geocoding API
            const response = await fetch(`/api/geocode?q=${encodeURIComponent(cityName)}`);
            const results = await response.json();
            
            if (results && results.length > 0) {
                cityData = {
                    lat: results[0].lat,
                    lon: results[0].lon,
                    name: results[0].name
                };
            } else {
                // Don't show notification here, will be caught below
                return;
            }
        }
        
        // Update lat/lon inputs
        document.getElementById('latInput').value = cityData.lat.toFixed(4);
        document.getElementById('lonInput').value = cityData.lon.toFixed(4);
        
        // Animate map to new location if map selector exists
        if (state.mapSelector) {
            animateMapToLocation(cityData.lat, cityData.lon);
        }
        
        // Update state
        state.currentLocation = { lat: cityData.lat, lon: cityData.lon };
        
        showNotification(`Selected: ${cityData.name}`, 'success');
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Failed to find city', 'error');
    }
}

function animateMapToLocation(lat, lon) {
    if (!state.mapSelector) return;
    
    // Get the marker (assuming it's the first marker)
    const markers = [];
    state.mapSelector.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            markers.push(layer);
        }
    });
    
    if (markers.length > 0) {
        const marker = markers[0];
        const currentPos = marker.getLatLng();
        const newPos = L.latLng(lat, lon);
        
        // Animate marker movement
        const duration = 1000; // 1 second
        const frames = 60;
        const frameTime = duration / frames;
        let frame = 0;
        
        const animate = () => {
            frame++;
            const progress = frame / frames;
            
            // Easing function (ease-in-out)
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Interpolate position
            const lat = currentPos.lat + (newPos.lat - currentPos.lat) * eased;
            const lng = currentPos.lng + (newPos.lng - currentPos.lng) * eased;
            
            marker.setLatLng([lat, lng]);
            
            if (frame < frames) {
                setTimeout(animate, frameTime);
            }
        };
        
        animate();
    }
    
    // Smoothly pan and zoom the map to the new location
    state.mapSelector.flyTo([lat, lon], 8, {
        duration: 1.5,
        easeLinearity: 0.25
    });
}

async function searchCityByName(cityName) {
    try {
        // Predefined coordinates for popular cities
        const cityCoordinates = {
            'Hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad' },
            'Mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
            'Delhi': { lat: 28.7041, lon: 77.1025, name: 'Delhi' },
            'Bangalore': { lat: 12.9716, lon: 77.5946, name: 'Bangalore' },
            'Chennai': { lat: 13.0827, lon: 80.2707, name: 'Chennai' },
            'Kolkata': { lat: 22.5726, lon: 88.3639, name: 'Kolkata' },
            'London': { lat: 51.5074, lon: -0.1278, name: 'London' },
            'New York': { lat: 40.7128, lon: -74.0060, name: 'New York' },
            'Tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
            'Paris': { lat: 48.8566, lon: 2.3522, name: 'Paris' },
            'Dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai' },
            'Sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney' }
        };
        
        // Check if it's a predefined city
        if (cityCoordinates[cityName]) {
            const city = cityCoordinates[cityName];
            state.currentLocation = { lat: city.lat, lon: city.lon };
            document.getElementById('currentCity').textContent = city.name;
            await loadWeatherData();
            return;
        }
        
        // Otherwise, use geocoding API
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(cityName)}`);
        const results = await response.json();
        
        if (results && results.length > 0) {
            state.currentLocation = {
                lat: results[0].lat,
                lon: results[0].lon
            };
            document.getElementById('currentCity').textContent = results[0].name;
            await loadWeatherData();
        } else {
            showNotification('City not found', 'error');
        }
    } catch (error) {
        console.error('Search error:', error);
        // Don't show duplicate notification
    }
}



function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// ========================================
// DISPLAY UPDATES
// ========================================

function updateHeroCard() {
    if (!state.weatherData) return;
    
    const { name, main, weather, wind, visibility, clouds, sys } = state.weatherData;
    
    console.log('Raw weather data:', main); // Debug log
    
    // Update location
    document.getElementById('currentCity').textContent = name;
    
    // Update main weather - with proper conversion
    const temp = convertTemperature(main.temp);
    const feelsLike = convertTemperature(main.feels_like);
    
    document.getElementById('mainTemp').textContent = Math.round(temp);
    document.getElementById('weatherCondition').textContent = weather[0].description;
    
    // Update weather icon
    const iconClass = getWeatherIconClass(weather[0].main);
    document.getElementById('mainWeatherIcon').className = `fas ${iconClass}`;
    
    // Update metrics
    document.getElementById('feelsLike').textContent = Math.round(feelsLike) + '°C';
    document.getElementById('humidity').textContent = main.humidity + '%';
    document.getElementById('windSpeed').textContent = wind.speed.toFixed(2) + ' m/s';
    document.getElementById('visibility').textContent = (visibility / 1000).toFixed(1) + ' km';
    document.getElementById('pressure').textContent = main.pressure + ' hPa';
    document.getElementById('cloudiness').textContent = clouds.all + '%';
    
    // Update sun times
    document.getElementById('sunrise').textContent = formatTime(sys.sunrise);
    document.getElementById('sunset').textContent = formatTime(sys.sunset);
    
    // Update greeting subtext based on weather
    updateGreetingSubtext(weather[0].main);
}

function updateHourlyForecast() {
    if (!state.forecastData || !state.forecastData.list) return;
    
    const container = document.getElementById('hourlyScroll');
    container.innerHTML = '';
    
    // Show next 24 hours (8 items at 3-hour intervals = 24 hours coverage)
    // OpenWeatherMap free API provides data in 3-hour intervals
    const hourlyData = state.forecastData.list.slice(0, 8);
    
    hourlyData.forEach((item, index) => {
        const time = new Date(item.dt * 1000);
        const temp = Math.round(convertTemperature(item.main.temp));
        const iconClass = getWeatherIconClass(item.weather[0].main);
        
        // Format time display
        const hours = time.getHours();
        const timeStr = hours === 0 ? '12 AM' : hours < 12 ? `${hours} AM` : hours === 12 ? '12 PM' : `${hours - 12} PM`;
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hourly-time">${timeStr}</div>
            <div class="hourly-icon"><i class="fas ${iconClass}"></i></div>
            <div class="hourly-temp">${temp}°</div>
            <div class="hourly-desc" style="font-size: 0.7rem; opacity: 0.7; margin-top: 0.25rem;">${item.weather[0].description}</div>
        `;
        
        container.appendChild(hourlyItem);
    });
}

function updateWeeklyForecast() {
    if (!state.forecastData || !state.forecastData.list) return;
    
    const container = document.getElementById('weeklyList');
    container.innerHTML = '';
    
    // Group by day
    const dailyData = {};
    state.forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weather: item.weather[0]
            };
        }
        dailyData[date].temps.push(convertTemperature(item.main.temp));
    });
    
    // Create weekly items
    Object.entries(dailyData).slice(0, 7).forEach(([date, data]) => {
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const tempMax = Math.round(Math.max(...data.temps));
        const tempMin = Math.round(Math.min(...data.temps));
        const iconClass = getWeatherIconClass(data.weather.main);
        
        const weeklyItem = document.createElement('div');
        weeklyItem.className = 'weekly-item';
        weeklyItem.innerHTML = `
            <div class="weekly-day">${dayName}</div>
            <div class="weekly-icon"><i class="fas ${iconClass}"></i></div>
            <div class="weekly-temps">
                <span class="temp-high">${tempMax}°</span>
                <span class="temp-low">${tempMin}°</span>
            </div>
        `;
        
        container.appendChild(weeklyItem);
    });
}

function updateAirQuality() {
    if (!state.aqiData || !state.aqiData.list || !state.aqiData.list[0]) {
        document.getElementById('aqiValue').textContent = '--';
        document.getElementById('aqiLabel').textContent = 'No data';
        return;
    }
    
    const aqi = state.aqiData.list[0].main.aqi;
    const components = state.aqiData.list[0].components;
    
    document.getElementById('aqiValue').textContent = aqi;
    
    const levels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const colors = ['#10b981', '#fbbf24', '#f59e0b', '#ef4444', '#9333ea'];
    
    document.getElementById('aqiLabel').textContent = levels[aqi - 1] || 'Unknown';
    document.getElementById('aqiCircle').style.borderColor = colors[aqi - 1] || '#8b5cf6';
    
    // Update details
    const detailsContainer = document.getElementById('aqiDetails');
    detailsContainer.innerHTML = `
        <div class="aqi-component">PM2.5: ${components.pm2_5.toFixed(1)}</div>
        <div class="aqi-component">PM10: ${components.pm10.toFixed(1)}</div>
        <div class="aqi-component">O₃: ${components.o3.toFixed(1)}</div>
        <div class="aqi-component">NO₂: ${components.no2.toFixed(1)}</div>
    `;
}

function updateWeatherAlerts() {
    if (!state.weatherData) return;
    
    const container = document.getElementById('alertsContainer');
    const { weather, main } = state.weatherData;
    const condition = weather[0].main;
    const temp = convertTemperature(main.temp);
    
    const alerts = [];
    
    // Check for various weather conditions
    if (condition === 'Rain' || condition === 'Drizzle') {
        alerts.push({
            icon: 'fa-cloud-rain',
            title: 'Rain Detected',
            message: "Rain detected in your area. Don't forget your umbrella!"
        });
    }
    
    if (condition === 'Thunderstorm') {
        alerts.push({
            icon: 'fa-bolt',
            title: 'Thunderstorm Warning',
            message: 'Severe thunderstorm in your area. Stay indoors and avoid travel.'
        });
    }
    
    if (condition === 'Snow') {
        alerts.push({
            icon: 'fa-snowflake',
            title: 'Snow Alert',
            message: 'Snowfall detected. Roads may be slippery. Drive carefully.'
        });
    }
    
    if (temp > 35) {
        alerts.push({
            icon: 'fa-temperature-high',
            title: 'High Temperature Alert',
            message: 'Temperature is very high. Stay hydrated and avoid direct sunlight.'
        });
    }
    
    if (temp < 5) {
        alerts.push({
            icon: 'fa-temperature-low',
            title: 'Cold Weather Alert',
            message: 'Temperature is very low. Dress warmly and protect yourself from cold.'
        });
    }
    
    if (condition === 'Haze' || condition === 'Fog' || condition === 'Mist') {
        alerts.push({
            icon: 'fa-smog',
            title: 'Visibility Alert',
            message: 'Low visibility due to ' + condition.toLowerCase() + '. Drive carefully.'
        });
    }
    
    // Check air quality
    if (state.aqiData && state.aqiData.list && state.aqiData.list[0]) {
        const aqi = state.aqiData.list[0].main.aqi;
        if (aqi >= 4) {
            alerts.push({
                icon: 'fa-smog',
                title: 'Poor Air Quality',
                message: 'Air quality is poor. Limit outdoor activities and wear a mask if going out.'
            });
        }
    }
    
    // If no alerts, show all clear
    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="alert-item" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <div>
                    <strong>All Clear</strong>
                    <p>No weather alerts for your area. Conditions are normal.</p>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <i class="fas ${alert.icon}"></i>
                <div>
                    <strong>${alert.title}</strong>
                    <p>${alert.message}</p>
                </div>
            </div>
        `).join('');
    }
}

function updateWeatherComparison() {
    if (!state.weatherData) return;
    
    const currentTemp = Math.round(convertTemperature(state.weatherData.main.temp));
    const currentCondition = state.weatherData.weather[0].main;
    const currentCity = state.weatherData.name;
    
    // Update current location
    document.getElementById('currentLocationName').textContent = currentCity;
    document.getElementById('currentLocationTemp').textContent = currentTemp + '°C';
    document.getElementById('currentLocationCondition').textContent = currentCondition;
    
    // Mumbai comparison stays the same (you can make this dynamic too if needed)
    const mumbaiTemp = 28; // This could be fetched from API
    const diff = mumbaiTemp - currentTemp;
    const diffText = diff > 0 ? `+${diff}° warmer` : `${Math.abs(diff)}° cooler`;
    
    // Update the comparison text
    const comparisonLocation = document.querySelector('.comparison-location:last-child .location-diff');
    if (comparisonLocation) {
        comparisonLocation.textContent = diffText;
        comparisonLocation.style.color = diff > 0 ? '#10b981' : '#3b82f6';
    }
}

function updateChart() {
    if (!state.forecastData || !state.forecastData.list) return;
    
    const ctx = document.getElementById('tempChart');
    if (!ctx) return;
    
    if (state.chart) {
        state.chart.destroy();
    }
    
    const data = state.forecastData.list.slice(0, 8).map(item => ({
        x: new Date(item.dt * 1000),
        y: Math.round(convertTemperature(item.main.temp))
    }));
    
    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Temperature (°C)',
                data: data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#fff'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#fff'
                    }
                }
            }
        }
    });
}

// ========================================
// MAP FUNCTIONALITY
// ========================================

function initializeMap() {
    const container = document.getElementById('mapContainer');
    
    if (state.map) {
        state.map.remove();
    }
    
    state.map = L.map(container, {
        scrollWheelZoom: false // Disable scroll zoom by default
    }).setView(
        [state.currentLocation.lat, state.currentLocation.lon],
        10
    );
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(state.map);
    
    L.marker([state.currentLocation.lat, state.currentLocation.lon])
        .addTo(state.map)
        .bindPopup(state.weatherData.name)
        .openPopup();
    
    // Enable scroll zoom on click
    state.map.on('click', function() {
        state.map.scrollWheelZoom.enable();
    });
    
    // Show message to click for zoom
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        pointer-events: none;
        z-index: 1000;
        font-size: 0.85rem;
    `;
    messageDiv.innerHTML = '<i class="fas fa-mouse-pointer"></i> Click to enable zoom';
    container.style.position = 'relative';
    container.appendChild(messageDiv);
    
    // Remove message after first click
    state.map.once('click', function() {
        messageDiv.remove();
    });
}

function initializeMapSelector() {
    const container = document.getElementById('mapSelector');
    
    if (state.mapSelector) {
        state.mapSelector.remove();
    }
    
    state.mapSelector = L.map(container, {
        scrollWheelZoom: false // Disable scroll zoom by default
    }).setView(
        [state.currentLocation.lat, state.currentLocation.lon],
        5
    );
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(state.mapSelector);
    
    const marker = L.marker([state.currentLocation.lat, state.currentLocation.lon], {
        draggable: true
    }).addTo(state.mapSelector);
    
    marker.on('dragend', async function(e) {
        const pos = e.target.getLatLng();
        state.currentLocation = { lat: pos.lat, lon: pos.lng };
        document.getElementById('latInput').value = pos.lat.toFixed(4);
        document.getElementById('lonInput').value = pos.lng.toFixed(4);
        
        // Reverse geocode to get city name
        await reverseGeocode(pos.lat, pos.lng);
    });
    
    // Add a message overlay to indicate click to select location
    const messageDiv = document.createElement('div');
    messageDiv.id = 'mapMessage';
    messageDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        pointer-events: none;
        z-index: 1000;
        font-size: 1rem;
        text-align: center;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        transition: opacity 0.3s ease;
    `;
    messageDiv.innerHTML = '<i class="fas fa-hand-pointer"></i> Click on map to select location';
    container.style.position = 'relative';
    container.appendChild(messageDiv);
    
    // Remove message on any map interaction
    const removeMessage = () => {
        const msg = document.getElementById('mapMessage');
        if (msg && msg.parentNode) {
            msg.style.opacity = '0';
            setTimeout(() => {
                if (msg && msg.parentNode) {
                    msg.parentNode.removeChild(msg);
                }
            }, 300);
        }
    };
    
    // Remove message on first click
    state.mapSelector.once('click', removeMessage);
    
    // Also remove on drag or zoom
    state.mapSelector.once('drag', removeMessage);
    state.mapSelector.once('zoom', removeMessage);
    
    state.mapSelector.on('click', async function(e) {
        marker.setLatLng(e.latlng);
        state.currentLocation = { lat: e.latlng.lat, lon: e.latlng.lng };
        document.getElementById('latInput').value = e.latlng.lat.toFixed(4);
        document.getElementById('lonInput').value = e.latlng.lng.toFixed(4);
        
        // Reverse geocode to get city name
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
        
        // Enable scroll zoom after first click
        state.mapSelector.scrollWheelZoom.enable();
    });
}

async function reverseGeocode(lat, lon) {
    try {
        // Use Nominatim reverse geocoding with higher zoom level for more precise results
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data && data.address) {
            // Priority order for location name (most specific to least specific)
            const cityName = data.address.neighbourhood ||  // Most specific - neighborhood/suburb
                           data.address.suburb ||           // Suburb name
                           data.address.hamlet ||           // Small settlement
                           data.address.village ||          // Village
                           data.address.town ||             // Town
                           data.address.city ||             // City
                           data.address.municipality ||     // Municipality
                           data.address.county ||           // County/District
                           data.address.state_district ||   // State district
                           data.display_name.split(',')[0]; // Fallback to first part of display name
            
            console.log('Reverse geocode result:', {
                lat, lon,
                neighbourhood: data.address.neighbourhood,
                suburb: data.address.suburb,
                city: data.address.city,
                selected: cityName,
                fullAddress: data.display_name
            });
            
            // Update search box
            document.getElementById('citySearch').value = cityName;
            
            showNotification(`Location: ${cityName}`, 'info');
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Don't show error to user, just log it
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function convertTemperature(temp) {
    // Handle invalid input
    if (temp === null || temp === undefined || isNaN(temp)) {
        console.error('Invalid temperature value:', temp);
        return 0;
    }
    
    // If temperature is already in Celsius range (-100 to 60), return as is
    if (temp > -100 && temp < 60) {
        console.log('Temperature already in Celsius:', temp);
        return temp;
    }
    
    // If temperature is in Kelvin range (173 to 333), convert to Celsius
    if (temp > 173 && temp < 333) {
        return temp - 273.15;
    }
    
    // Otherwise, assume it's Kelvin and convert
    return temp - 273.15;
}

function getWeatherIconClass(condition) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Fog': 'fa-smog',
        'Haze': 'fa-smog'
    };
    return iconMap[condition] || 'fa-cloud-sun';
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    
    if (hour >= 5 && hour < 12) {
        greeting = 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
        greeting = 'Good Afternoon';
    }
    
    document.getElementById('greetingText').textContent = greeting;
}

function updateGreetingSubtext(condition) {
    const subtexts = {
        'Rain': "Don't forget your umbrella!",
        'Drizzle': "Light rain expected today",
        'Thunderstorm': "Stay safe indoors!",
        'Snow': "Bundle up, it's snowing!",
        'Clear': "Perfect day to go outside!",
        'Clouds': "Cloudy but pleasant",
        'Mist': "Visibility might be low",
        'Fog': "Drive carefully today",
        'Haze': "Air quality might be affected"
    };
    
    document.getElementById('greetingSubtext').textContent = subtexts[condition] || "Have a great day!";
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    // Add loaded class to body to show content
    document.body.classList.add('loaded');
    
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.remove('show');
    }, 500);
}

function showNotification(message, type = 'info') {
    // Get or create notification container
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        padding: 1rem 1.5rem;
        background: var(--bg-card);
        border: var(--card-border);
        border-radius: 12px;
        color: var(--text-primary);
        animation: slideIn 0.3s ease;
        box-shadow: var(--card-glow);
        pointer-events: auto;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    // Add color based on type
    if (type === 'success') {
        notification.style.borderLeft = '4px solid var(--accent-primary)';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid #ef4444';
    } else if (type === 'warning') {
        notification.style.borderLeft = '4px solid #f59e0b';
    } else {
        notification.style.borderLeft = '4px solid var(--accent-primary)';
    }
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
            // Remove container if empty
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 3000);
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = '/login';
    }
}

function startAutoRefresh() {
    // Clear any existing interval
    stopAutoRefresh();
    
    if (state.preferences.autoRefresh) {
        // Refresh every 10 minutes (600000 ms)
        state.autoRefreshInterval = setInterval(() => {
            console.log('Auto-refreshing weather data...');
            loadWeatherData();
            showNotification('Weather data refreshed', 'info');
        }, 600000);
        console.log('Auto-refresh enabled (every 10 minutes)');
    }
}

function stopAutoRefresh() {
    if (state.autoRefreshInterval) {
        clearInterval(state.autoRefreshInterval);
        state.autoRefreshInterval = null;
        console.log('Auto-refresh disabled');
    }
}

function playSound(type) {
    if (!state.preferences.sound) return;
    
    // Create audio context for simple beep sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds for different actions
    switch (type) {
        case 'toggle':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            break;
        case 'success':
            oscillator.frequency.value = 1000;
            gainNode.gain.value = 0.15;
            break;
        case 'click':
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.08;
            break;
        default:
            oscillator.frequency.value = 700;
            gainNode.gain.value = 0.1;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function setupModalClickOutside() {
    // Handle click outside for all modals
    const modals = [
        { id: 'locationModal', exitFunc: null },
        { id: 'profileModal', exitFunc: null },
        { id: 'editLayoutModal', exitFunc: exitEditMode }
    ];
    
    modals.forEach(({ id, exitFunc }) => {
        const modal = document.getElementById(id);
        if (!modal) return;
        
        modal.addEventListener('click', (e) => {
            // Check if click is on the modal backdrop (not the content)
            if (e.target === modal) {
                modal.classList.remove('show');
                if (exitFunc) exitFunc();
            }
        });
    });
    
    // Handle customization panel click outside
    const customPanel = document.getElementById('customizationPanel');
    if (customPanel) {
        document.addEventListener('click', (e) => {
            if (customPanel.classList.contains('open')) {
                // Check if click is outside panel and not on settings button
                if (!customPanel.contains(e.target) && 
                    !document.getElementById('settingsBtn').contains(e.target)) {
                    customPanel.classList.remove('open');
                }
            }
        });
    }
}

function resetSettings() {
    if (confirm('Reset all settings to default?')) {
        state.preferences = {
            theme: 'dark',
            accent: 'purple',
            cardStyle: 'glass',
            animSpeed: 1,
            fontSize: 16,
            borderRadius: 16,
            particles: true,
            weatherEffects: true,
            autoRefresh: true,
            sound: false,
            compact: false
        };
        savePreferences();
        showNotification('Settings reset to default', 'success');
    }
}

// ========================================
// PARTICLE SYSTEM
// ========================================

function initializeParticles() {
    if (!state.preferences.particles) return;
    
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function clearParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearWeatherEffects() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Stop all ongoing animation frames
    if (window.rainAnimationId) {
        cancelAnimationFrame(window.rainAnimationId);
        window.rainAnimationId = null;
    }
    if (window.snowAnimationId) {
        cancelAnimationFrame(window.snowAnimationId);
        window.snowAnimationId = null;
    }
    if (window.thunderAnimationId) {
        cancelAnimationFrame(window.thunderAnimationId);
        window.thunderAnimationId = null;
    }
    if (window.starsAnimationId) {
        cancelAnimationFrame(window.starsAnimationId);
        window.starsAnimationId = null;
    }
    if (window.cloudsAnimationId) {
        cancelAnimationFrame(window.cloudsAnimationId);
        window.cloudsAnimationId = null;
    }
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateWeatherEffects() {
    // Clear any existing weather effects first
    clearWeatherEffects();
    
    // Add weather-specific visual effects
    if (!state.preferences.weatherEffects || !state.weatherData) {
        return;
    }
    
    const condition = state.weatherData.weather[0].main;
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Store current weather condition globally
    window.currentWeatherCondition = condition;
    
    // Apply weather-specific effects
    switch (condition) {
        case 'Rain':
        case 'Drizzle':
            createRainEffect(ctx, canvas);
            break;
        case 'Snow':
            createSnowEffect(ctx, canvas);
            break;
        case 'Thunderstorm':
            createThunderstormEffect(ctx, canvas);
            break;
        case 'Clear':
            if (!isDaytime()) {
                createStarsEffect(ctx, canvas);
            }
            break;
        case 'Clouds':
        case 'Mist':
        case 'Haze':
        case 'Fog':
            createCloudsEffect(ctx, canvas);
            break;
        default:
            // For any other condition, just clear effects
            break;
    }
    
    // Update background gradient based on time and weather
    updateDynamicBackground(condition);
}

function createRainEffect(ctx, canvas) {
    const raindrops = [];
    const dropCount = 100;
    
    for (let i = 0; i < dropCount; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 5 + 5
        });
    }
    
    function animateRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        ctx.lineWidth = 2;
        
        raindrops.forEach(drop => {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
            
            drop.y += drop.speed;
            if (drop.y > canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * canvas.width;
            }
        });
        
        if (state.preferences.weatherEffects && state.weatherData && 
            (state.weatherData.weather[0].main === 'Rain' || state.weatherData.weather[0].main === 'Drizzle')) {
            window.rainAnimationId = requestAnimationFrame(animateRain);
        }
    }
    
    animateRain();
}

function createSnowEffect(ctx, canvas) {
    const snowflakes = [];
    const flakeCount = 50;
    
    for (let i = 0; i < flakeCount; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 1 + 0.5,
            drift: Math.random() * 2 - 1
        });
    }
    
    function animateSnow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        snowflakes.forEach(flake => {
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fill();
            
            flake.y += flake.speed;
            flake.x += flake.drift;
            
            if (flake.y > canvas.height) {
                flake.y = -flake.radius;
                flake.x = Math.random() * canvas.width;
            }
        });
        
        if (state.preferences.weatherEffects && state.weatherData && 
            (state.weatherData.weather[0].main === 'Snow')) {
            window.snowAnimationId = requestAnimationFrame(animateSnow);
        }
    }
    
    animateSnow();
}

function createThunderstormEffect(ctx, canvas) {
    createRainEffect(ctx, canvas);
    
    // Add lightning flashes
    setInterval(() => {
        if (Math.random() > 0.95 && state.preferences.weatherEffects) {
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                pointer-events: none;
                z-index: 9998;
                animation: lightning 0.2s ease;
            `;
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 200);
        }
    }, 3000);
}

function createStarsEffect(ctx, canvas) {
    const stars = [];
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            opacity: Math.random()
        });
    }
    
    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
            
            star.opacity += (Math.random() - 0.5) * 0.02;
            star.opacity = Math.max(0.3, Math.min(1, star.opacity));
        });
        
        if (state.preferences.weatherEffects) {
            requestAnimationFrame(animateStars);
        }
    }
    
    animateStars();
}

function createCloudsEffect(ctx, canvas) {
    const clouds = [];
    const cloudCount = 5;
    
    for (let i = 0; i < cloudCount; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 2),
            width: Math.random() * 200 + 100,
            height: Math.random() * 60 + 40,
            speed: Math.random() * 0.5 + 0.2
        });
    }
    
    function animateClouds() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        
        clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width, cloud.height, 0, 0, Math.PI * 2);
            ctx.fill();
            
            cloud.x += cloud.speed;
            if (cloud.x > canvas.width + cloud.width) {
                cloud.x = -cloud.width;
            }
        });
        
        if (state.preferences.weatherEffects) {
            requestAnimationFrame(animateClouds);
        }
    }
    
    animateClouds();
}

function updateDynamicBackground(condition) {
    const hour = new Date().getHours();
    const bg = document.querySelector('.animated-background');
    
    let gradient;
    
    // Check if it's night time first
    const isNight = hour < 5 || hour >= 20;
    
    if (isNight) {
        // Night time backgrounds based on weather
        if (condition === 'Clear') {
            gradient = 'linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%)';
        } else if (condition === 'Rain' || condition === 'Drizzle') {
            gradient = 'linear-gradient(180deg, #1a1d2e 0%, #252a3d 50%, #2f3548 100%)';
        } else if (condition === 'Thunderstorm') {
            gradient = 'linear-gradient(180deg, #0f1419 0%, #1c1f2e 50%, #2a2d3d 100%)';
        } else if (condition === 'Snow') {
            gradient = 'linear-gradient(180deg, #2d3561 0%, #3d4574 50%, #4d5587 100%)';
        } else if (condition === 'Mist' || condition === 'Fog' || condition === 'Haze' || condition === 'Smoke') {
            gradient = 'linear-gradient(180deg, #1e2433 0%, #2d3444 50%, #3c4455 100%)';
        } else {
            gradient = 'linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #2a2f4a 100%)';
        }
    } else if (hour >= 5 && hour < 8) {
        // Sunrise - adjust based on weather
        if (condition === 'Clear') {
            gradient = 'linear-gradient(180deg, #FF6B6B 0%, #FFD93D 50%, #6BCF7F 100%)';
        } else if (condition === 'Snow') {
            gradient = 'linear-gradient(180deg, #A8B8D8 0%, #C5D5E7 50%, #E0E8F2 100%)';
        } else if (condition === 'Rain' || condition === 'Thunderstorm' || condition === 'Drizzle') {
            gradient = 'linear-gradient(180deg, #5a5a6b 0%, #7a7a8b 50%, #9a9aab 100%)';
        } else if (condition === 'Mist' || condition === 'Fog' || condition === 'Haze' || condition === 'Smoke') {
            gradient = 'linear-gradient(180deg, #8a8a9b 0%, #aaaabb 50%, #cacadb 100%)';
        } else if (condition === 'Clouds') {
            gradient = 'linear-gradient(180deg, #9a8a9b 0%, #baaadb 50%, #dacafb 100%)';
        } else {
            gradient = 'linear-gradient(180deg, #FF8B8B 0%, #FFE93D 50%, #8BCF9F 100%)';
        }
    } else if (hour >= 8 && hour < 17) {
        // Daytime - weather-specific backgrounds
        if (condition === 'Clear') {
            gradient = 'linear-gradient(180deg, #4A90E2 0%, #87CEEB 50%, #B0E0E6 100%)';
        } else if (condition === 'Clouds') {
            gradient = 'linear-gradient(180deg, #7B8FA3 0%, #A8B8C8 50%, #D0DCE8 100%)';
        } else if (condition === 'Rain' || condition === 'Drizzle') {
            gradient = 'linear-gradient(180deg, #4A5568 0%, #6B7280 50%, #9CA3AF 100%)';
        } else if (condition === 'Thunderstorm') {
            gradient = 'linear-gradient(180deg, #2C3E50 0%, #34495E 50%, #546E7A 100%)';
        } else if (condition === 'Snow') {
            gradient = 'linear-gradient(180deg, #B8C6DB 0%, #D5DEE7 50%, #E8EEF2 100%)';
        } else if (condition === 'Mist' || condition === 'Fog' || condition === 'Haze' || condition === 'Smoke') {
            gradient = 'linear-gradient(180deg, #8B9AA8 0%, #A8B5C2 50%, #C5D0DC 100%)';
        } else {
            gradient = 'linear-gradient(180deg, #95A5A6 0%, #BDC3C7 50%, #ECF0F1 100%)';
        }
    } else if (hour >= 17 && hour < 20) {
        // Sunset - adjust based on weather
        if (condition === 'Clear') {
            gradient = 'linear-gradient(180deg, #FF6B9D 0%, #FFA07A 50%, #FFD700 100%)';
        } else if (condition === 'Snow') {
            gradient = 'linear-gradient(180deg, #B8C8E8 0%, #D5E5F7 50%, #E8F0FA 100%)';
        } else if (condition === 'Rain' || condition === 'Thunderstorm' || condition === 'Drizzle') {
            gradient = 'linear-gradient(180deg, #6a5a7b 0%, #8a7a9b 50%, #aa9abb 100%)';
        } else if (condition === 'Mist' || condition === 'Fog' || condition === 'Haze' || condition === 'Smoke') {
            gradient = 'linear-gradient(180deg, #9a8aab 0%, #baaacb 50%, #dacaeb 100%)';
        } else if (condition === 'Clouds') {
            gradient = 'linear-gradient(180deg, #aa7a9b 0%, #ca9abb 50%, #eabadb 100%)';
        } else {
            gradient = 'linear-gradient(180deg, #FF8B9D 0%, #FFB07A 50%, #FFE700 100%)';
        }
    }
    
    bg.style.background = gradient;
    bg.style.transition = 'background 2s ease';
}

function isDaytime() {
    if (!state.weatherData || !state.weatherData.sys) return true;
    const now = Date.now() / 1000;
    return now >= state.weatherData.sys.sunrise && now <= state.weatherData.sys.sunset;
}

// ========================================
// WINDOW EVENTS
// ========================================

window.addEventListener('resize', () => {
    if (state.map) state.map.invalidateSize();
    if (state.mapSelector) state.mapSelector.invalidateSize();
});

// Close modal when clicking outside
document.getElementById('locationModal').addEventListener('click', (e) => {
    if (e.target.id === 'locationModal') {
        document.getElementById('locationModal').classList.remove('show');
    }
});

// Close customization panel when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('customizationPanel');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (panel.classList.contains('open') && 
        !panel.contains(e.target) && 
        !settingsBtn.contains(e.target)) {
        panel.classList.remove('open');
    }
});

function updateSmartRecommendations() {
    if (!state.weatherData) {
        console.log('No weather data available for recommendations');
        return;
    }
    
    const temp = convertTemperature(state.weatherData.main.temp);
    const condition = state.weatherData.weather[0].main;
    const windSpeed = state.weatherData.wind.speed;
    const humidity = state.weatherData.main.humidity;
    
    console.log('Updating recommendations for:', { temp, condition, windSpeed });
    
    // Clothing suggestions based on weather condition and temperature
    let clothing = '';
    
    if (condition === 'Snow') {
        clothing = 'Heavy winter coat, insulated gloves, warm scarf, winter boots, and thermal layers';
    } else if (condition === 'Thunderstorm') {
        clothing = 'Waterproof jacket, rain boots, and stay indoors if possible';
    } else if (condition === 'Rain' || condition === 'Drizzle') {
        if (temp < 10) {
            clothing = 'Waterproof jacket, warm layers, rain boots, and umbrella';
        } else {
            clothing = 'Light rain jacket, waterproof shoes, and umbrella';
        }
    } else if (temp < -10) {
        clothing = 'Extreme cold gear: heavy parka, insulated gloves, face mask, and winter boots';
    } else if (temp < 0) {
        clothing = 'Heavy winter coat, warm gloves, scarf, thermal underwear, and insulated boots';
    } else if (temp < 10) {
        clothing = 'Warm jacket, long pants, sweater, and closed shoes';
    } else if (temp < 15) {
        clothing = 'Light jacket or hoodie, jeans, and comfortable shoes';
    } else if (temp < 20) {
        clothing = 'Long-sleeve shirt or light sweater, comfortable pants';
    } else if (temp < 25) {
        clothing = 'T-shirt, jeans or light pants, comfortable shoes';
    } else if (temp < 30) {
        clothing = 'Light t-shirt, shorts or light pants, breathable shoes';
    } else {
        clothing = 'Light, breathable clothing, hat, sunglasses, and sunscreen';
    }
    
    // Add wind warning
    if (windSpeed > 10) {
        clothing += '. Strong winds - wear windproof layers!';
    }
    
    const clothingElement = document.getElementById('clothingSuggestion');
    if (clothingElement) {
        clothingElement.textContent = clothing;
        console.log('Updated clothing:', clothing);
    } else {
        console.error('clothingSuggestion element not found');
    }
    
    // Best time to go out
    let bestTime = '';
    const hour = new Date().getHours();
    
    if (condition === 'Snow') {
        bestTime = 'Avoid travel if possible. If you must go out, midday is safest when visibility is better.';
    } else if (condition === 'Thunderstorm') {
        bestTime = 'Stay indoors! Thunderstorms are dangerous. Wait until it passes.';
    } else if (condition === 'Rain' || condition === 'Drizzle') {
        bestTime = 'Check hourly forecast for breaks in the rain. Carry an umbrella.';
    } else if (condition === 'Clear') {
        if (temp > 35) {
            bestTime = 'Early morning (before 10 AM) or evening (after 6 PM) to avoid extreme heat.';
        } else if (temp < 0) {
            bestTime = 'Midday (11 AM - 2 PM) when it\'s warmest. Limit outdoor exposure.';
        } else if (hour < 10) {
            bestTime = 'Morning is perfect! Fresh air and comfortable temperature.';
        } else if (hour < 16) {
            bestTime = 'Afternoon is great for outdoor activities!';
        } else {
            bestTime = 'Evening is pleasant for a walk or outdoor dining.';
        }
    } else if (condition === 'Clouds' || condition === 'Mist' || condition === 'Haze') {
        bestTime = 'Anytime is good! Clouds provide natural shade and comfortable conditions.';
    } else if (condition === 'Fog') {
        bestTime = 'Wait for fog to clear (usually by late morning). Drive carefully if necessary.';
    } else {
        bestTime = 'Check hourly forecast for the best window.';
    }
    
    const bestTimeElement = document.getElementById('bestTimeSuggestion');
    if (bestTimeElement) {
        bestTimeElement.textContent = bestTime;
        console.log('Updated best time:', bestTime);
    } else {
        console.error('bestTimeSuggestion element not found');
    }
    
    // Activity suggestions
    let activity = '';
    
    if (condition === 'Snow') {
        activity = 'Winter sports: skiing, snowboarding, ice skating, or building a snowman!';
    } else if (condition === 'Thunderstorm') {
        activity = 'Indoor activities only: reading, movies, board games, or cooking.';
    } else if (condition === 'Rain' || condition === 'Drizzle') {
        activity = 'Indoor activities: gym, shopping mall, museums, or cozy café time.';
    } else if (condition === 'Clear' && temp > 15 && temp < 28) {
        activity = 'Perfect for jogging, cycling, hiking, or outdoor sports!';
    } else if (condition === 'Clear' && temp > 28) {
        activity = 'Swimming, water sports, or air-conditioned indoor activities.';
    } else if (condition === 'Clear' && temp < 0) {
        activity = 'Brief outdoor walks with proper gear, or warm indoor activities.';
    } else if ((condition === 'Clouds' || condition === 'Mist') && temp > 10 && temp < 25) {
        activity = 'Great for hiking, walking in the park, or outdoor photography.';
    } else if (temp < 5) {
        activity = 'Indoor activities: gym, yoga, or winter sports if you\'re equipped.';
    } else if (temp > 35) {
        activity = 'Stay cool: swimming, indoor sports, or air-conditioned venues.';
    } else {
        activity = 'Light outdoor activities or covered outdoor spaces recommended.';
    }
    
    const activityElement = document.getElementById('activitySuggestion');
    if (activityElement) {
        activityElement.textContent = activity;
        console.log('Updated activity:', activity);
    } else {
        console.error('activitySuggestion element not found');
    }
}

function startSunCountdown() {
    if (!state.weatherData || !state.weatherData.sys) return;
    
    function updateCountdown() {
        const now = Date.now() / 1000;
        const sunrise = state.weatherData.sys.sunrise;
        const sunset = state.weatherData.sys.sunset;
        
        let targetTime, label, icon;
        
        if (now < sunrise) {
            targetTime = sunrise;
            label = 'Next Sunrise in';
            icon = 'fa-sunrise';
        } else if (now < sunset) {
            targetTime = sunset;
            label = 'Sunset in';
            icon = 'fa-sunset';
        } else {
            // Next day's sunrise
            targetTime = sunrise + 86400;
            label = 'Next Sunrise in';
            icon = 'fa-sunrise';
        }
        
        const diff = targetTime - now;
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = Math.floor(diff % 60);
        
        document.getElementById('sunEventLabel').textContent = label;
        document.getElementById('sunCountdownTime').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update icon
        const iconElement = document.querySelector('.countdown-item i');
        if (iconElement) {
            iconElement.className = `fas ${icon}`;
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

console.log('🌤️ WeatherPro Ultimate Dashboard initialized');


// ========================================
// PROFILE MODAL FUNCTIONS
// ========================================

function loadProfileData() {
    if (!state.user) return;
    
    // Update profile display
    const initial = state.user.username ? state.user.username[0].toUpperCase() : 'U';
    document.getElementById('profileInitial').textContent = initial;
    document.getElementById('profileUsername').textContent = state.user.username || 'User';
    document.getElementById('profileEmail').textContent = state.user.email || 'user@example.com';
    
    // Load stats from localStorage or generate
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    document.getElementById('savedLocations').textContent = stats.savedLocations || '5';
    document.getElementById('weatherChecks').textContent = stats.weatherChecks || '254';
    
    // Load saved profile preferences
    const profilePrefs = JSON.parse(localStorage.getItem('profilePreferences') || '{}');
    document.getElementById('tempUnitSelect').value = profilePrefs.tempUnit || 'celsius';
    document.getElementById('windUnitSelect').value = profilePrefs.windUnit || 'ms';
    document.getElementById('timeFormatSelect').value = profilePrefs.timeFormat || '24';
    
    // Setup profile event listeners
    setupProfileEventListeners();
}

// Save Profile Preferences
function saveProfilePreferences() {
    const preferences = {
        tempUnit: document.getElementById('tempUnitSelect').value,
        windUnit: document.getElementById('windUnitSelect').value,
        timeFormat: document.getElementById('timeFormatSelect').value
    };
    
    // Apply preferences to state immediately
    state.preferences.timeFormat = preferences.timeFormat;
    
    // Save to localStorage
    localStorage.setItem('profilePreferences', JSON.stringify(preferences));
    
    // Update time display immediately
    updateTime();
    
    // Reload weather data to apply temperature and wind unit changes
    if (state.weatherData) {
        updateHeroCard();
        updateHourlyForecast();
        updateWeeklyForecast();
    }
    
    // Also save to server
    fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timeFormat: preferences.timeFormat
        })
    }).then(response => {
        if (response.ok) {
            showNotification('✅ Preferences saved successfully!', 'success');
            playSound('success');
        } else {
            showNotification('✅ Saved locally', 'success');
        }
    }).catch(() => {
        showNotification('✅ Saved locally', 'success');
    });
}

function setupProfileEventListeners() {
    // Change Avatar
    document.getElementById('changeAvatarBtn').addEventListener('click', () => {
        const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.getElementById('profileAvatarLarge').style.background = randomColor;
        document.getElementById('avatarBtn').style.background = randomColor;
        playSound('success');
        showNotification('Avatar color changed!', 'success');
    });
    
    // Change Password
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        playSound('click');
        showNotification('Password change feature coming soon!', 'info');
    });
    
    // Export Data
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        playSound('click');
        const data = {
            user: state.user,
            preferences: state.preferences,
            stats: JSON.parse(localStorage.getItem('userStats') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weatherpro-data-${Date.now()}.json`;
        a.click();
        
        showNotification('Data exported successfully!', 'success');
    });
    
    // Share Profile
    document.getElementById('shareProfileBtn').addEventListener('click', async () => {
        playSound('click');
        const shareData = {
            title: 'WeatherPro Dashboard',
            text: `Check out my WeatherPro dashboard! I've checked the weather ${document.getElementById('weatherChecks').textContent} times!`,
            url: window.location.href
        };
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showNotification('Profile shared!', 'success');
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareData.url);
            showNotification('Link copied to clipboard!', 'success');
        }
    });
    
    // Notification Settings
    document.getElementById('notificationSettingsBtn').addEventListener('click', () => {
        playSound('click');
        showNotification('Notification settings coming soon!', 'info');
    });
    
    // Temperature Unit
    document.getElementById('tempUnitSelect').addEventListener('change', (e) => {
        playSound('click');
        state.preferences.tempUnit = e.target.value;
        savePreferences();
        showNotification(`Temperature unit changed to ${e.target.value}`, 'success');
    });
    
    // Wind Unit
    document.getElementById('windUnitSelect').addEventListener('change', (e) => {
        playSound('click');
        state.preferences.windUnit = e.target.value;
        savePreferences();
        showNotification(`Wind speed unit changed to ${e.target.value}`, 'success');
    });
    
    // Time Format
    document.getElementById('timeFormatSelect').addEventListener('change', (e) => {
        playSound('click');
        state.preferences.timeFormat = e.target.value;
        savePreferences();
        updateTime(); // Update time display immediately
        showNotification(`Time format changed to ${e.target.value}-hour`, 'success');
    });
    
    // Delete Account
    document.getElementById('deleteAccountBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
            if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
                playSound('click');
                showNotification('Account deletion feature is disabled in demo mode', 'error');
            }
        }
    });
}

// ========================================
// EDIT LAYOUT MODAL FUNCTIONS
// ========================================

function loadLayoutSettings() {
    // Load saved layout preferences
    const layoutPrefs = JSON.parse(localStorage.getItem('layoutPrefs') || '{}');
    
    // Apply saved layout on load
    if (layoutPrefs.gridColumns) {
        applyGridColumns(layoutPrefs.gridColumns);
        document.querySelectorAll('.grid-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cols == layoutPrefs.gridColumns);
        });
    }
    
    // Set card visibility toggles and apply saved visibility
    document.querySelectorAll('.visibility-item input[type="checkbox"]').forEach(checkbox => {
        const cardId = checkbox.dataset.card;
        const isVisible = layoutPrefs[cardId] !== false;
        checkbox.checked = isVisible;
        
        // Apply visibility immediately
        toggleCardVisibility(cardId, isVisible, false);
        
        // Remove old listeners
        checkbox.replaceWith(checkbox.cloneNode(true));
    });
    
    // Re-attach listeners after cloning
    document.querySelectorAll('.visibility-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            playSound('toggle');
            const cardId = e.target.dataset.card;
            toggleCardVisibility(cardId, e.target.checked, true);
        });
    });
    
    // Setup layout preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);
        newBtn.addEventListener('click', () => {
            playSound('click');
            applyLayoutPreset(newBtn.dataset.layout);
            showNotification(`${newBtn.textContent.trim()} layout applied!`, 'success');
        });
    });
    
    // Setup grid size buttons
    document.querySelectorAll('.grid-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);
        newBtn.addEventListener('click', () => {
            playSound('click');
            document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            
            const cols = newBtn.dataset.cols;
            applyGridColumns(cols);
            showNotification(`Grid set to ${cols} columns`, 'success');
        });
    });
    
    // Save Layout - remove old listener
    const saveBtn = document.getElementById('saveLayoutBtn');
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.replaceWith(newSaveBtn);
    newSaveBtn.addEventListener('click', () => {
        playSound('success');
        saveLayoutPreferences();
        document.getElementById('editLayoutModal').classList.remove('show');
        exitEditMode();
        showNotification('Layout saved successfully!', 'success');
    });
    
    // Reset Layout - remove old listener
    const resetBtn = document.getElementById('resetLayoutBtn');
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.replaceWith(newResetBtn);
    newResetBtn.addEventListener('click', () => {
        if (confirm('Reset layout to default?')) {
            playSound('click');
            resetLayout();
            showNotification('Layout reset to default', 'success');
        }
    });
    
    // Enable edit mode
    enterEditMode();
}

function toggleCardVisibility(cardId, visible, save = true) {
    // Map data-card IDs to actual card class names
    const cardMap = {
        'hero': '.weather-hero-card',
        'hourly': '.hourly-forecast-card',
        'weekly': '.weekly-forecast-card',
        'aqi': '.air-quality-card',
        'alerts': '.weather-alerts-card',
        'chart': '.temp-trend-card',
        'map': '.radar-map-card',
        'recommendations': '.recommendations-card'
    };
    
    const card = document.querySelector(cardMap[cardId]);
    if (card) {
        if (visible) {
            card.style.display = '';
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease';
                card.style.opacity = '1';
            }, 10);
        } else {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    }
    
    // Save preference
    if (save) {
        const layoutPrefs = JSON.parse(localStorage.getItem('layoutPrefs') || '{}');
        layoutPrefs[cardId] = visible;
        localStorage.setItem('layoutPrefs', JSON.stringify(layoutPrefs));
    }
}

function applyLayoutPreset(preset) {
    const presets = {
        default: {
            hero: true,
            hourly: true,
            weekly: true,
            aqi: true,
            alerts: true,
            chart: true,
            map: true,
            recommendations: true,
            columns: 12
        },
        compact: {
            hero: true,
            hourly: true,
            weekly: true,
            aqi: false,
            alerts: true,
            chart: false,
            map: false,
            recommendations: false,
            columns: 12
        },
        detailed: {
            hero: true,
            hourly: true,
            weekly: true,
            aqi: true,
            alerts: true,
            chart: true,
            map: true,
            recommendations: true,
            columns: 12
        },
        minimal: {
            hero: true,
            hourly: true,
            weekly: false,
            aqi: false,
            alerts: false,
            chart: false,
            map: false,
            recommendations: false,
            columns: 12
        }
    };
    
    const layout = presets[preset];
    if (!layout) return;
    
    // Apply visibility
    Object.keys(layout).forEach(key => {
        if (key !== 'columns') {
            toggleCardVisibility(key, layout[key], false);
            const checkbox = document.querySelector(`input[data-card="${key}"]`);
            if (checkbox) checkbox.checked = layout[key];
        }
    });
    
    // Apply grid columns
    applyGridColumns(layout.columns);
    
    // Update active grid button
    document.querySelectorAll('.grid-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cols == layout.columns);
    });
    
    // Save all preferences
    saveLayoutPreferences();
}

function applyGridColumns(cols) {
    const grid = document.querySelector('.dashboard-grid');
    if (grid) {
        // The grid is already 12 columns, we don't need to change it
        // Just save the preference for future use
        console.log(`Grid columns preference set to: ${cols}`);
    }
    
    // Save preference
    const layoutPrefs = JSON.parse(localStorage.getItem('layoutPrefs') || '{}');
    layoutPrefs.gridColumns = cols;
    localStorage.setItem('layoutPrefs', JSON.stringify(layoutPrefs));
}

function saveLayoutPreferences() {
    const layoutPrefs = JSON.parse(localStorage.getItem('layoutPrefs') || '{}');
    
    // Save current visibility states
    document.querySelectorAll('.visibility-item input[type="checkbox"]').forEach(checkbox => {
        layoutPrefs[checkbox.dataset.card] = checkbox.checked;
    });
    
    // Save grid columns
    const activeGridBtn = document.querySelector('.grid-btn.active');
    if (activeGridBtn) {
        layoutPrefs.gridColumns = activeGridBtn.dataset.cols;
    }
    
    localStorage.setItem('layoutPrefs', JSON.stringify(layoutPrefs));
    console.log('Layout preferences saved:', layoutPrefs);
}

function resetLayout() {
    localStorage.removeItem('layoutPrefs');
    
    // Reset all cards to visible
    document.querySelectorAll('.visibility-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
        toggleCardVisibility(checkbox.dataset.card, true, false);
    });
    
    // Reset grid to default (12 columns)
    applyGridColumns(12);
    document.querySelectorAll('.grid-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cols == '2');
    });
    
    showNotification('Layout reset to default', 'success');
}

function enterEditMode() {
    document.body.classList.add('edit-mode');
    
    // Make cards draggable
    const cards = document.querySelectorAll('.card-glow');
    cards.forEach(card => {
        card.draggable = true;
        card.style.cursor = 'move';
        
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    showNotification('Edit mode enabled - Drag cards to rearrange', 'info');
}

function exitEditMode() {
    document.body.classList.remove('edit-mode');
    
    // Remove draggable
    const cards = document.querySelectorAll('.card-glow');
    cards.forEach(card => {
        card.draggable = false;
        card.style.cursor = '';
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dragover', handleDragOver);
        card.removeEventListener('drop', handleDrop);
        card.removeEventListener('dragend', handleDragEnd);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
    
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        // Swap elements
        const parent = this.parentNode;
        const draggedIndex = Array.from(parent.children).indexOf(draggedElement);
        const targetIndex = Array.from(parent.children).indexOf(this);
        
        if (draggedIndex < targetIndex) {
            parent.insertBefore(draggedElement, this.nextSibling);
        } else {
            parent.insertBefore(draggedElement, this);
        }
        
        playSound('click');
        showNotification('Card position updated', 'success');
    }
    
    this.classList.remove('drag-over');
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.opacity = '1';
    
    document.querySelectorAll('.card-glow').forEach(card => {
        card.classList.remove('drag-over');
    });
}

// Load saved layout on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        const layoutPrefs = JSON.parse(localStorage.getItem('layoutPrefs') || '{}');
        
        // Apply saved visibility
        Object.keys(layoutPrefs).forEach(key => {
            if (key !== 'gridColumns' && typeof layoutPrefs[key] === 'boolean') {
                toggleCardVisibility(key, layoutPrefs[key], false);
            }
        });
        
        // Apply saved grid columns
        if (layoutPrefs.gridColumns) {
            applyGridColumns(layoutPrefs.gridColumns);
        }
        
        console.log('Layout preferences applied on page load:', layoutPrefs);
    }, 500);
});


// ========================================
// FOREGROUND WEATHER EFFECTS (Dramatic 5-second display)
// ========================================

function showForegroundWeatherEffect(condition) {
    if (!state.preferences.weatherEffects) return;
    
    const canvas = document.getElementById('foregroundEffectsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Fade in the canvas
    canvas.style.opacity = '1';
    
    // Stop any existing foreground animation
    if (window.foregroundAnimationId) {
        cancelAnimationFrame(window.foregroundAnimationId);
    }
    
    // Start the appropriate effect
    switch (condition) {
        case 'Snow':
            createForegroundSnow(ctx, canvas);
            break;
        case 'Rain':
        case 'Drizzle':
            createForegroundRain(ctx, canvas);
            break;
        case 'Thunderstorm':
            createForegroundThunderstorm(ctx, canvas);
            break;
        case 'Clear':
            createForegroundSunshine(ctx, canvas);
            break;
        case 'Clouds':
        case 'Mist':
        case 'Haze':
        case 'Fog':
            createForegroundClouds(ctx, canvas);
            break;
        default:
            // Fade out immediately for other conditions
            setTimeout(() => {
                canvas.style.opacity = '0';
            }, 100);
            return;
    }
    
    // Fade out after 5 seconds
    setTimeout(() => {
        canvas.style.opacity = '0';
        // Stop animation after fade completes
        setTimeout(() => {
            if (window.foregroundAnimationId) {
                cancelAnimationFrame(window.foregroundAnimationId);
                window.foregroundAnimationId = null;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 500);
        
        // Restore background to current weather condition
        if (state.weatherData && state.weatherData.weather && state.weatherData.weather[0]) {
            updateDynamicBackground(state.weatherData.weather[0].main);
        }
    }, 5000);
}

function createForegroundSnow(ctx, canvas) {
    const snowflakes = [];
    const count = 200; // More snowflakes for dramatic effect
    
    for (let i = 0; i < count; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            radius: Math.random() * 4 + 2,
            speed: Math.random() * 2 + 1,
            drift: Math.random() * 2 - 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        snowflakes.forEach(flake => {
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            
            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            
            flake.y += flake.speed;
            flake.x += flake.drift;
            
            if (flake.y > canvas.height) {
                flake.y = -10;
                flake.x = Math.random() * canvas.width;
            }
            
            if (flake.x > canvas.width) flake.x = 0;
            if (flake.x < 0) flake.x = canvas.width;
        });
        
        ctx.shadowBlur = 0;
        window.foregroundAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
}

function createForegroundRain(ctx, canvas) {
    const raindrops = [];
    const count = 300;
    
    for (let i = 0; i < count; i++) {
        raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            length: Math.random() * 30 + 20,
            speed: Math.random() * 10 + 10
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.7)';
        ctx.lineWidth = 2;
        
        raindrops.forEach(drop => {
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
            
            drop.y += drop.speed;
            if (drop.y > canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * canvas.width;
            }
        });
        
        window.foregroundAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
}

function createForegroundThunderstorm(ctx, canvas) {
    createForegroundRain(ctx, canvas);
    
    // Add lightning flashes
    let flashCount = 0;
    const maxFlashes = 3;
    
    function flash() {
        if (flashCount >= maxFlashes) return;
        
        // Create a separate flash element instead of using canvas
        const flashDiv = document.createElement('div');
        flashDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.6);
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(flashDiv);
        
        setTimeout(() => {
            flashDiv.remove();
        }, 100);
        
        flashCount++;
        if (flashCount < maxFlashes) {
            setTimeout(flash, Math.random() * 1000 + 500);
        }
    }
    
    setTimeout(flash, 500);
}

function createForegroundSunshine(ctx, canvas) {
    const rays = [];
    const count = 50;
    const centerX = canvas.width / 2;
    const centerY = -100;
    
    for (let i = 0; i < count; i++) {
        rays.push({
            angle: (Math.PI * 2 * i) / count,
            length: 0,
            maxLength: Math.random() * 500 + 300,
            speed: Math.random() * 10 + 5
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        rays.forEach(ray => {
            if (ray.length < ray.maxLength) {
                ray.length += ray.speed;
            }
            
            const gradient = ctx.createLinearGradient(
                centerX,
                centerY,
                centerX + Math.cos(ray.angle) * ray.length,
                centerY + Math.sin(ray.angle) * ray.length
            );
            gradient.addColorStop(0, 'rgba(255, 223, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 223, 0, 0)');
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(ray.angle) * ray.length,
                centerY + Math.sin(ray.angle) * ray.length
            );
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.stroke();
        });
        
        window.foregroundAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
}

function createForegroundClouds(ctx, canvas) {
    const clouds = [];
    const count = 8;
    
    for (let i = 0; i < count; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.5,
            width: Math.random() * 200 + 150,
            height: Math.random() * 80 + 60,
            speed: Math.random() * 2 + 1,
            opacity: Math.random() * 0.3 + 0.2
        });
    }
    
    function drawCloud(cloud) {
        ctx.fillStyle = `rgba(200, 200, 200, ${cloud.opacity})`;
        
        // Draw cloud shape with multiple circles
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.height / 2, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 4, cloud.y - cloud.height / 4, cloud.height / 1.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.height / 1.8, 0, Math.PI * 2);
        ctx.arc(cloud.x + (cloud.width * 3) / 4, cloud.y - cloud.height / 4, cloud.height / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        clouds.forEach(cloud => {
            drawCloud(cloud);
            cloud.x += cloud.speed;
            
            if (cloud.x > canvas.width + cloud.width) {
                cloud.x = -cloud.width;
            }
        });
        
        window.foregroundAnimationId = requestAnimationFrame(animate);
    }
    
    animate();
}


// ========================================
// CUSTOM CONTEXT MENU FOR TESTING WEATHER EFFECTS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const contextMenu = document.getElementById('weatherContextMenu');
    
    // Show context menu on right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        // Position the menu at cursor
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.classList.add('show');
        
        // Adjust if menu goes off screen
        setTimeout(() => {
            const rect = contextMenu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                contextMenu.style.left = (e.pageX - rect.width) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                contextMenu.style.top = (e.pageY - rect.height) + 'px';
            }
        }, 10);
    });
    
    // Hide context menu on click anywhere
    document.addEventListener('click', () => {
        contextMenu.classList.remove('show');
    });
    
    // Handle context menu item clicks
    document.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const weather = item.dataset.weather;
            
            if (weather === 'Random') {
                const effects = ['Snow', 'Rain', 'Thunderstorm', 'Clear', 'Clouds'];
                const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                showForegroundWeatherEffect(randomEffect);
                updateDynamicBackground(randomEffect);
                showNotification(`Random effect: ${randomEffect}!`, 'info');
            } else if (weather === 'Party') {
                startPartyMode();
            } else {
                showForegroundWeatherEffect(weather);
                updateDynamicBackground(weather);
                showNotification(`Testing ${weather} effect!`, 'info');
            }
            
            contextMenu.classList.remove('show');
        });
    });
});

// Party Mode - Cycles through all effects rapidly!
function startPartyMode() {
    const effects = ['Snow', 'Rain', 'Thunderstorm', 'Clear', 'Clouds'];
    let index = 0;
    let count = 0;
    const maxCycles = 10; // Show each effect twice
    
    showNotification('🎉 PARTY MODE ACTIVATED! 🎉', 'success');
    
    const interval = setInterval(() => {
        showForegroundWeatherEffect(effects[index]);
        updateDynamicBackground(effects[index]);
        index = (index + 1) % effects.length;
        count++;
        
        if (count >= maxCycles) {
            clearInterval(interval);
            showNotification('Party mode complete! 🎊', 'success');
        }
    }, 2000); // Change effect every 2 seconds
}

// ========================================
// TIME DISPLAY WITH SECONDS (LOCATION-BASED)
// ========================================

function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (!timeElement) return;
    
    // Check if 12-hour or 24-hour format
    const is12Hour = state.preferences.timeFormat === '12';
    
    // If we have weather data with timezone, use that location's time
    if (state.weatherData && state.weatherData.timezone !== undefined) {
        // OpenWeatherMap returns timezone offset in seconds from UTC
        const timezoneOffsetSeconds = state.weatherData.timezone;
        
        // Get current time in milliseconds since epoch
        const now = Date.now();
        
        // Calculate the location's time by adding timezone offset
        // Date.now() gives UTC time, so we just add the offset
        const locationTimeMs = now + (timezoneOffsetSeconds * 1000);
        const locationTime = new Date(locationTimeMs);
        
        // Use UTC methods since we've already applied the offset
        let hours = locationTime.getUTCHours();
        const minutes = locationTime.getUTCMinutes().toString().padStart(2, '0');
        const seconds = locationTime.getUTCSeconds().toString().padStart(2, '0');
        
        // Convert to 12-hour format if needed
        let period = '';
        if (is12Hour) {
            period = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12 || 12; // Convert 0 to 12 for midnight
        }
        
        const hoursStr = hours.toString().padStart(2, '0');
        timeElement.textContent = `${hoursStr}:${minutes}:${seconds}${period}`;
    } else {
        // Fallback to local time if no weather data yet
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        // Convert to 12-hour format if needed
        let period = '';
        if (is12Hour) {
            period = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12 || 12;
        }
        
        const hoursStr = hours.toString().padStart(2, '0');
        timeElement.textContent = `${hoursStr}:${minutes}:${seconds}${period}`;
    }
}

// Update time immediately and then every second
updateTime();
setInterval(updateTime, 1000);
