/* ============================================
   INTELLIGENCE MODULE
   AI-style weather insights and recommendations
   ============================================ */

class Intelligence {
    analyze(weatherData) {
        const insights = {
            suggestions: [],
            outfit: this.getOutfitRecommendation(weatherData.current),
            activities: this.getActivityRecommendations(weatherData),
            alerts: this.generateSmartAlerts(weatherData),
        };
        
        return insights;
    }
    
    getOutfitRecommendation(current) {
        const temp = current.temp;
        const feelsLike = current.feels_like;
        const weather = current.weather[0].main.toLowerCase();
        const windSpeed = current.wind_speed;
        
        let outfit = [];
        let accessories = [];
        
        // Temperature-based recommendations
        if (temp < 0) {
            outfit.push('Heavy winter coat', 'Thermal layers', 'Warm pants');
            accessories.push('Gloves', 'Scarf', 'Winter hat');
        } else if (temp < 10) {
            outfit.push('Jacket', 'Long sleeves', 'Jeans');
            accessories.push('Light scarf');
        } else if (temp < 20) {
            outfit.push('Light jacket', 'Long sleeves or t-shirt', 'Comfortable pants');
        } else if (temp < 30) {
            outfit.push('T-shirt', 'Shorts or light pants');
            accessories.push('Sunglasses');
        } else {
            outfit.push('Light breathable clothing', 'Shorts');
            accessories.push('Sunglasses', 'Hat for sun protection');
        }
        
        // Weather-based additions
        if (weather.includes('rain')) {
            accessories.push('Umbrella', 'Waterproof jacket');
        }
        
        if (weather.includes('snow')) {
            accessories.push('Waterproof boots', 'Warm socks');
        }
        
        // Wind consideration
        if (windSpeed > 20) {
            accessories.push('Windbreaker');
            outfit.push('Wind-resistant layers');
        }
        
        // Feels like adjustment
        if (Math.abs(temp - feelsLike) > 5) {
            if (feelsLike < temp) {
                outfit.push('Extra layer (feels colder than actual temp)');
            } else {
                outfit.push('Lighter than usual (feels warmer)');
            }
        }
        
        return {
            outfit,
            accessories,
            summary: this.generateOutfitSummary(temp, weather)
        };
    }
    
    generateOutfitSummary(temp, weather) {
        if (temp < 0) return 'Bundle up! It\'s freezing outside.';
        if (temp < 10) return 'Dress warmly with layers.';
        if (temp < 20) return 'Comfortable weather, light jacket recommended.';
        if (temp < 30) return 'Pleasant weather, dress casually.';
        return 'Hot weather! Stay cool and hydrated.';
    }
    
    getActivityRecommendations(weatherData) {
        const current = weatherData.current;
        const temp = current.temp;
        const weather = current.weather[0].main.toLowerCase();
        const windSpeed = current.wind_speed;
        const uvi = current.uvi || 0;
        
        const activities = {
            recommended: [],
            notRecommended: [],
            tips: []
        };
        
        // Good weather activities
        if (temp >= 15 && temp <= 28 && !weather.includes('rain') && !weather.includes('storm')) {
            activities.recommended.push(
                '🏃 Running or jogging',
                '🚴 Cycling',
                '⚽ Outdoor sports',
                '🎨 Outdoor photography'
            );
        }
        
        // Indoor activities for bad weather
        if (weather.includes('rain') || weather.includes('storm')) {
            activities.recommended.push(
                '🏛️ Visit museums',
                '🎬 Watch movies',
                '📚 Indoor activities',
                '☕ Cozy café time'
            );
            activities.notRecommended.push('Outdoor sports', 'Hiking', 'Beach activities');
        }
        
        // UV warnings
        if (uvi > 7) {
            activities.tips.push('⚠️ High UV index - use sunscreen and seek shade during peak hours');
            activities.notRecommended.push('Extended sun exposure without protection');
        }
        
        // Wind warnings
        if (windSpeed > 30) {
            activities.notRecommended.push('Cycling', 'Outdoor dining');
            activities.tips.push('🌬️ Strong winds - secure loose items');
        }
        
        // Temperature extremes
        if (temp > 35) {
            activities.tips.push('🌡️ Extreme heat - stay hydrated and avoid midday sun');
            activities.notRecommended.push('Intense outdoor exercise');
        }
        
        if (temp < -5) {
            activities.tips.push('❄️ Very cold - limit outdoor exposure');
            activities.recommended.push('❄️ Winter sports (if equipped)');
        }
        
        return activities;
    }
    
    generateSmartAlerts(weatherData) {
        const alerts = [];
        const current = weatherData.current;
        const hourly = weatherData.hourly;
        
        // Temperature change alerts
        if (hourly && hourly.length > 6) {
            const tempChange = hourly[6].temp - current.temp;
            if (Math.abs(tempChange) > 5) {
                alerts.push({
                    type: 'info',
                    message: `Temperature will ${tempChange > 0 ? 'rise' : 'drop'} by ${Math.abs(Math.round(tempChange))}° in the next 6 hours`,
                    icon: '🌡️'
                });
            }
        }
        
        // Rain alerts
        if (hourly) {
            const rainSoon = hourly.slice(0, 3).some(h => h.pop > 0.5);
            if (rainSoon && !current.weather[0].main.toLowerCase().includes('rain')) {
                alerts.push({
                    type: 'warning',
                    message: 'Rain expected within the next 3 hours - carry an umbrella',
                    icon: '☔'
                });
            }
        }
        
        // Wind alerts
        if (current.wind_speed > 25) {
            alerts.push({
                type: 'warning',
                message: `Strong winds at ${Math.round(current.wind_speed)} km/h - secure loose objects`,
                icon: '💨'
            });
        }
        
        // UV alerts
        if (current.uvi > 7) {
            const hour = new Date().getHours();
            if (hour >= 10 && hour <= 16) {
                alerts.push({
                    type: 'warning',
                    message: 'High UV index - apply sunscreen and wear protective clothing',
                    icon: '☀️'
                });
            }
        }
        
        // Air quality alerts
        if (weatherData.aqi && weatherData.aqi.aqi > 3) {
            alerts.push({
                type: 'warning',
                message: 'Poor air quality - consider limiting outdoor activities',
                icon: '😷'
            });
        }
        
        return alerts;
    }
}

export default Intelligence;
