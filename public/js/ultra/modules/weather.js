// ========================================
// WEATHER ENGINE - API Integration
// ========================================

export class WeatherEngine {
    constructor() {
        this.apiKey = 'YOUR_API_KEY'; // Will use backend API
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    async fetchWeather(lat, lon) {
        const cacheKey = `${lat},${lon}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        try {
            const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('Weather fetch failed');
            
            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Weather API error:', error);
            throw error;
        }
    }

    async fetchForecast(lat, lon) {
        try {
            const response = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('Forecast fetch failed');
            
            return await response.json();
        } catch (error) {
            console.error('Forecast API error:', error);
            throw error;
        }
    }

    async searchLocation(query) {
        try {
            const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Geocode failed');
            
            return await response.json();
        } catch (error) {
            console.error('Geocode error:', error);
            return [];
        }
    }

    async fetchAirQuality(lat, lon) {
        try {
            const response = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('Air quality fetch failed');
            
            return await response.json();
        } catch (error) {
            console.error('Air quality error:', error);
            return null;
        }
    }

    getWeatherIcon(condition) {
        const iconMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        
        return iconMap[condition] || '🌤️';
    }

    getWeatherAdvice(weather) {
        const temp = weather.main.temp;
        const condition = weather.weather[0].main;
        const windSpeed = weather.wind.speed;
        const humidity = weather.main.humidity;
        
        const advice = [];
        
        // Temperature advice
        if (temp < 10) {
            advice.push('🧥 Wear a warm jacket - it\'s cold outside!');
        } else if (temp > 30) {
            advice.push('🌡️ Stay hydrated - it\'s hot today!');
        } else if (temp >= 15 && temp <= 25) {
            advice.push('👕 Perfect weather for outdoor activities!');
        }
        
        // Weather condition advice
        if (condition === 'Rain' || condition === 'Drizzle') {
            advice.push('☔ Don\'t forget your umbrella!');
        } else if (condition === 'Thunderstorm') {
            advice.push('⚠️ Stay indoors - thunderstorm warning!');
        } else if (condition === 'Snow') {
            advice.push('❄️ Drive carefully - snowy conditions!');
        }
        
        // Wind advice
        if (windSpeed > 20) {
            advice.push('💨 Strong winds expected - secure loose objects!');
        }
        
        // Humidity advice
        if (humidity > 80) {
            advice.push('💧 High humidity - may feel uncomfortable!');
        }
        
        // UV advice (simplified - would need actual UV data)
        const hour = new Date().getHours();
        if (hour >= 10 && hour <= 16 && condition === 'Clear') {
            advice.push('🧴 Apply sunscreen - UV levels are high!');
        }
        
        return advice;
    }

    getOutfitRecommendation(weather) {
        const temp = weather.main.temp;
        const condition = weather.weather[0].main;
        const windSpeed = weather.wind.speed;
        
        let outfit = {
            top: '',
            bottom: '',
            outerwear: '',
            accessories: []
        };
        
        // Temperature-based recommendations
        if (temp < 0) {
            outfit.top = 'Thermal shirt + Sweater';
            outfit.bottom = 'Thermal pants + Jeans';
            outfit.outerwear = 'Heavy winter coat';
            outfit.accessories.push('Gloves', 'Scarf', 'Winter hat');
        } else if (temp < 10) {
            outfit.top = 'Long sleeve shirt + Light sweater';
            outfit.bottom = 'Jeans or pants';
            outfit.outerwear = 'Jacket';
            outfit.accessories.push('Light scarf');
        } else if (temp < 20) {
            outfit.top = 'T-shirt + Light jacket';
            outfit.bottom = 'Jeans or casual pants';
            outfit.outerwear = 'Light jacket (optional)';
        } else if (temp < 30) {
            outfit.top = 'T-shirt or polo';
            outfit.bottom = 'Shorts or light pants';
            outfit.outerwear = 'None';
            outfit.accessories.push('Sunglasses');
        } else {
            outfit.top = 'Light breathable shirt';
            outfit.bottom = 'Shorts';
            outfit.outerwear = 'None';
            outfit.accessories.push('Sunglasses', 'Hat', 'Sunscreen');
        }
        
        // Weather condition adjustments
        if (condition === 'Rain' || condition === 'Drizzle') {
            outfit.accessories.push('Umbrella', 'Waterproof jacket');
        }
        
        if (windSpeed > 15) {
            outfit.accessories.push('Windbreaker');
        }
        
        return outfit;
    }

    getActivityRecommendations(weather) {
        const temp = weather.main.temp;
        const condition = weather.weather[0].main;
        const windSpeed = weather.wind.speed;
        
        const activities = {
            outdoor: [],
            indoor: []
        };
        
        // Good weather activities
        if (condition === 'Clear' && temp >= 15 && temp <= 28 && windSpeed < 15) {
            activities.outdoor.push(
                { name: 'Running', icon: '🏃', suitability: 'Excellent' },
                { name: 'Cycling', icon: '🚴', suitability: 'Excellent' },
                { name: 'Picnic', icon: '🧺', suitability: 'Perfect' },
                { name: 'Photography', icon: '📸', suitability: 'Great' }
            );
        }
        
        // Moderate weather
        if (temp >= 10 && temp < 15 || temp > 28 && temp < 35) {
            activities.outdoor.push(
                { name: 'Walking', icon: '🚶', suitability: 'Good' },
                { name: 'Hiking', icon: '🥾', suitability: 'Moderate' }
            );
        }
        
        // Bad weather alternatives
        if (condition === 'Rain' || condition === 'Thunderstorm' || temp < 5 || temp > 35) {
            activities.indoor.push(
                { name: 'Gym', icon: '🏋️', suitability: 'Recommended' },
                { name: 'Swimming (indoor)', icon: '🏊', suitability: 'Good' },
                { name: 'Museum', icon: '🏛️', suitability: 'Perfect' },
                { name: 'Cinema', icon: '🎬', suitability: 'Great' }
            );
        }
        
        return activities;
    }
}
