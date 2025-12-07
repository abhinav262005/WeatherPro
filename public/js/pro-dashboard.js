// Professional Weather Dashboard - Main Module

let currentLocation = { lat: null, lon: null };
let weatherData = null;
let map = null;
let hourlyChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    checkAuth();
    setupEventListeners();
    loadSavedTheme();
    requestLocation();
}

// Auth Check
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/login';
        }
    } catch (error) {
        window.location.href = '/login';
    }
}

// Event Listeners
function setupEventListeners() {
    // Theme Panel
    document.getElementById('themePanelToggle').addEventListener('click', () => {
        document.querySelector('.theme-panel').classList.toggle('active');
    });

    // Theme Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Custom Gradient
    document.getElementById('applyCustom').addEventListener('click', () => {
        const color1 = document.getElementById('color1').value;
        const color2 = document.getElementById('color2').value;
        const color3 = document.getElementById('color3').value;
        applyCustomGradient(color1, color2, color3);
    });

    // Glass Blur
    document.getElementById('glassBlur').addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--glass-blur', e.target.value + 'px');
        document.getElementById('glassValue').textContent = e.target.value + 'px';
    });

    // Animation Speed
    document.getElementById('animSpeed').addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--anim-speed', e.target.value + 's');
    });

    // Export Theme
    document.getElementById('exportTheme').addEventListener('click', exportTheme);

    // Import Theme
    document.getElementById('importTheme').addEventListener('click', importTheme);

    // Reset Theme
    document.getElementById('resetTheme').addEventListener('click', resetTheme);

    // Search
    document.getElementById('searchCity').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCity(e.target.value);
        }
    });

    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        if (currentLocation.lat && currentLocation.lon) {
            loadWeather();
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}

// Theme Functions
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    saveTheme({ preset: theme });
}

function applyCustomGradient(color1, color2, color3) {
    document.documentElement.style.setProperty('--gradient-1', color1);
    document.documentElement.style.setProperty('--gradient-2', color2);
    document.documentElement.style.setProperty('--gradient-3', color3);
    saveTheme({ custom: { color1, color2, color3 } });
}

function saveTheme(theme) {
    localStorage.setItem('weatherpro_theme', JSON.stringify(theme));
}

function loadSavedTheme() {
    const saved = localStorage.getItem('weatherpro_theme');
    if (saved) {
        const theme = JSON.parse(saved);
        if (theme.preset) {
            applyTheme(theme.preset);
        } else if (theme.custom) {
            applyCustomGradient(theme.custom.color1, theme.custom.color2, theme.custom.color3);
        }
    }
}

function exportTheme() {
    const theme = {
        preset: document.body.getAttribute('data-theme'),
        glassBlur: getComputedStyle(document.documentElement).getPropertyValue('--glass-blur'),
        animSpeed: getComputedStyle(document.documentElement).getPropertyValue('--anim-speed')
    };
    
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'weatherpro-theme.json';
    link.click();
}

function importTheme() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const theme = JSON.parse(event.target.result);
                if (theme.preset) {
                    applyTheme(theme.preset);
                }
                alert('Theme imported successfully!');
            } catch (error) {
                alert('Invalid theme file');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetTheme() {
    localStorage.removeItem('weatherpro_theme');
    applyTheme('day');
    document.documentElement.style.setProperty('--glass-blur', '20px');
    document.documentElement.style.setProperty('--anim-speed', '0.3s');
    document.getElementById('glassBlur').value = 20;
    document.getElementById('glassValue').textContent = '20px';
    document.getElementById('animSpeed').value = '0.3';
}

// Location
function requestLocation() {
    if ('geolocation' in navigator) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation.lat = position.coords.latitude;
                currentLocation.lon = position.coords.longitude;
                loadWeather();
            },
            (error) => {
                console.error('Location error:', error);
                currentLocation.lat = 51.5074;
                currentLocation.lon = -0.1278;
                loadWeather();
            }
        );
    }
}

async function searchCity(city) {
    try {
        showLoading();
        const response = await fetch(`/api/weather?city=${city}`);
        const data = await response.json();
        currentLocation.lat = data.coord.lat;
        currentLocation.lon = data.coord.lon;
        loadWeather();
    } catch (error) {
        alert('City not found');
        hideLoading();
    }
}

// Weather
async function loadWeather() {
    try {
        showLoading();
        
        const [weather, forecast] = await Promise.all([
            fetch(`/api/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}`).then(r => r.json()),
            fetch(`/api/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}`).then(r => r.json())
        ]);
        
        weatherData = weather;
        
        displayCurrentWeather(weather);
        displayHourlyChart(forecast);
        displayDailyForecast(forecast);
        initMap();
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load weather:', error);
        hideLoading();
    }
}

function displayCurrentWeather(data) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Fog': 'fa-smog'
    };
    
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('mainIcon').innerHTML = `<i class="fas ${iconMap[data.weather[0].main] || 'fa-cloud'}"></i>`;
    document.getElementById('mainTemp').textContent = Math.round(data.main.temp);
    document.getElementById('condition').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(data.main.feels_like)}°`;
    document.getElementById('wind').textContent = Math.round(data.wind.speed * 3.6) + ' km/h';
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
}

function displayHourlyChart(data) {
    const ctx = document.getElementById('hourlyChart');
    if (!ctx) return;
    
    const hours = data.list.slice(0, 8).map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
    });
    
    const temps = data.list.slice(0, 8).map(item => Math.round(item.main.temp));
    
    if (hourlyChart) {
        hourlyChart.destroy();
    }
    
    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
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
                y: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function displayDailyForecast(data) {
    const container = document.getElementById('dailyList');
    container.innerHTML = '';
    
    const dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                weather: item.weather[0]
            };
        }
        dailyData[date].temps.push(item.main.temp);
    });
    
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Snow': 'fa-snowflake',
        'Thunderstorm': 'fa-bolt'
    };
    
    Object.keys(dailyData).slice(0, 7).forEach((day, index) => {
        const data = dailyData[day];
        const maxTemp = Math.round(Math.max(...data.temps));
        const minTemp = Math.round(Math.min(...data.temps));
        const dayName = index === 0 ? 'Today' : new Date(day).toLocaleDateString('en-US', { weekday: 'short' });
        
        const item = document.createElement('div');
        item.className = 'daily-item';
        item.innerHTML = `
            <div class="daily-day">${dayName}</div>
            <div class="daily-icon"><i class="fas ${iconMap[data.weather.main] || 'fa-cloud'}"></i></div>
            <div class="daily-temp">${maxTemp}° / ${minTemp}°</div>
        `;
        container.appendChild(item);
    });
}

function initMap() {
    if (!map) {
        map = L.map('weatherMap').setView([currentLocation.lat, currentLocation.lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    } else {
        map.setView([currentLocation.lat, currentLocation.lon], 10);
    }
    
    L.marker([currentLocation.lat, currentLocation.lon]).addTo(map)
        .bindPopup(weatherData.name)
        .openPopup();
}

// Loading
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}
