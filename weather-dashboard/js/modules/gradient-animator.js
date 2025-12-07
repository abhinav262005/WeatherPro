/* ============================================
   GRADIENT ANIMATOR MODULE
   Handles animated backgrounds and particles
   ============================================ */

import CONFIG from '../config.js';

class GradientAnimator {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.animationFrame = null;
        this.isRunning = false;
    }
    
    start() {
        if (!this.canvas || !this.ctx) return;
        
        this.setupCanvas();
        this.createParticles();
        this.animate();
        this.isRunning = true;
        
        // Handle window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.isRunning = false;
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        const count = CONFIG.ANIMATION.PARTICLE_COUNT;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * CONFIG.ANIMATION.PARTICLE_SPEED,
                speedY: (Math.random() - 0.5) * CONFIG.ANIMATION.PARTICLE_SPEED,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        // Draw connections between nearby particles
        this.drawConnections();
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        const maxDistance = 150;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    // Add special effects based on weather
    addWeatherEffect(weatherType) {
        switch(weatherType) {
            case 'rain':
                this.addRainEffect();
                break;
            case 'snow':
                this.addSnowEffect();
                break;
            case 'storm':
                this.addLightningEffect();
                break;
        }
    }
    
    addRainEffect() {
        // Create rain particles
        const rainCount = 100;
        for (let i = 0; i < rainCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 1,
                speedX: -2,
                speedY: 10,
                opacity: 0.6,
                type: 'rain'
            });
        }
    }
    
    addSnowEffect() {
        // Create snow particles
        const snowCount = 50;
        for (let i = 0; i < snowCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: Math.random() * 2 + 1,
                opacity: 0.8,
                type: 'snow'
            });
        }
    }
    
    addLightningEffect() {
        // Flash effect
        const flash = () => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            setTimeout(() => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }, 100);
        };
        
        // Random lightning flashes
        if (Math.random() < 0.01) {
            flash();
        }
    }
}

export default GradientAnimator;
