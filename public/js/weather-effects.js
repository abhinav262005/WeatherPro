// Weather Animation Effects
class WeatherEffects {
    constructor() {
        this.canvas = document.getElementById('weatherCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.animationId = null;
        this.currentEffect = null;
        
        if (this.canvas) {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Rain Effect
    createRain() {
        this.stopEffect();
        this.currentEffect = 'rain';
        this.particles = [];
        
        for (let i = 0; i < 150; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 5 + 5,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        
        this.animateRain();
        this.showOverlay();
    }

    animateRain() {
        if (this.currentEffect !== 'rain') return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(drop => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.length);
            this.ctx.stroke();
            
            drop.y += drop.speed;
            
            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animateRain());
    }

    // Snow Effect
    createSnow() {
        this.stopEffect();
        this.currentEffect = 'snow';
        this.particles = [];
        
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 2,
                speed: Math.random() * 1 + 0.5,
                drift: Math.random() * 2 - 1,
                opacity: Math.random() * 0.6 + 0.4
            });
        }
        
        this.animateSnow();
        this.showOverlay();
    }

    animateSnow() {
        if (this.currentEffect !== 'snow') return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(flake => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            flake.y += flake.speed;
            flake.x += flake.drift;
            
            if (flake.y > this.canvas.height) {
                flake.y = -flake.radius;
                flake.x = Math.random() * this.canvas.width;
            }
            
            if (flake.x > this.canvas.width) flake.x = 0;
            if (flake.x < 0) flake.x = this.canvas.width;
        });
        
        this.animationId = requestAnimationFrame(() => this.animateSnow());
    }

    // Clouds Effect
    createClouds() {
        this.stopEffect();
        this.currentEffect = 'clouds';
        this.particles = [];
        
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height / 2),
                width: Math.random() * 150 + 100,
                height: Math.random() * 60 + 40,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.3 + 0.2
            });
        }
        
        this.animateClouds();
        this.showOverlay();
    }

    animateClouds() {
        if (this.currentEffect !== 'clouds') return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(cloud => {
            this.ctx.fillStyle = `rgba(200, 200, 200, ${cloud.opacity})`;
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x, cloud.y, cloud.width, cloud.height, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            cloud.x += cloud.speed;
            
            if (cloud.x - cloud.width > this.canvas.width) {
                cloud.x = -cloud.width;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animateClouds());
    }

    // Thunderstorm Effect
    createThunderstorm() {
        this.createRain();
        this.currentEffect = 'thunderstorm';
        this.addLightning();
    }

    addLightning() {
        if (this.currentEffect !== 'thunderstorm') return;
        
        if (Math.random() > 0.98) {
            const overlay = document.getElementById('weatherAnimation');
            overlay.style.background = 'rgba(255, 255, 255, 0.8)';
            
            setTimeout(() => {
                overlay.style.background = 'transparent';
            }, 100);
        }
        
        setTimeout(() => this.addLightning(), 100);
    }

    // Sunny Effect (particles)
    createSunny() {
        this.stopEffect();
        this.currentEffect = 'sunny';
        this.particles = [];
        
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        
        this.animateSunny();
        this.showOverlay();
    }

    animateSunny() {
        if (this.currentEffect !== 'sunny') return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
        });
        
        this.animationId = requestAnimationFrame(() => this.animateSunny());
    }

    // Fog/Mist Effect
    createFog() {
        this.stopEffect();
        this.currentEffect = 'fog';
        this.particles = [];
        
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: Math.random() * 300 + 200,
                height: Math.random() * 100 + 80,
                speed: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.2 + 0.1
            });
        }
        
        this.animateFog();
        this.showOverlay();
    }

    animateFog() {
        if (this.currentEffect !== 'fog') return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(fog => {
            this.ctx.fillStyle = `rgba(180, 180, 180, ${fog.opacity})`;
            this.ctx.beginPath();
            this.ctx.ellipse(fog.x, fog.y, fog.width, fog.height, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            fog.x += fog.speed;
            
            if (fog.x - fog.width > this.canvas.width) {
                fog.x = -fog.width;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animateFog());
    }

    // Show overlay
    showOverlay() {
        const overlay = document.getElementById('weatherAnimation');
        if (overlay) {
            overlay.style.display = 'block';
            overlay.style.opacity = '1';
        }
    }

    // Stop effect
    stopEffect() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.currentEffect = null;
        this.particles = [];
        
        const overlay = document.getElementById('weatherAnimation');
        if (overlay) {
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 500);
            }, 4000); // Show for 4 seconds
        }
    }

    // Trigger effect based on weather condition
    triggerWeatherEffect(condition) {
        const conditionLower = condition.toLowerCase();
        
        if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
            this.createRain();
        } else if (conditionLower.includes('snow')) {
            this.createSnow();
        } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
            this.createThunderstorm();
        } else if (conditionLower.includes('cloud')) {
            this.createClouds();
        } else if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
            this.createSunny();
        } else if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
            this.createFog();
        }
    }
}

// Initialize weather effects
const weatherEffects = new WeatherEffects();
