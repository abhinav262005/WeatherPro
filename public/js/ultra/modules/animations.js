// ========================================
// ANIMATION ENGINE - GSAP Animations
// ========================================

export class AnimationEngine {
    constructor() {
        this.weatherIcons = {
            Clear: this.createSunIcon,
            Clouds: this.createCloudIcon,
            Rain: this.createRainIcon,
            Snow: this.createSnowIcon,
            Thunderstorm: this.createThunderstormIcon,
            Mist: this.createMistIcon
        };
    }

    updateWeatherIcon(condition) {
        const svg = document.getElementById('weatherIcon');
        svg.innerHTML = '';
        
        const iconCreator = this.weatherIcons[condition] || this.weatherIcons.Clear;
        iconCreator.call(this, svg);
        
        // Animate icon entrance
        gsap.from(svg.children, {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        });
    }

    createSunIcon(svg) {
        // Sun circle
        const sun = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sun.setAttribute('cx', '100');
        sun.setAttribute('cy', '100');
        sun.setAttribute('r', '40');
        sun.setAttribute('fill', '#FFD700');
        sun.setAttribute('filter', 'url(#glow)');
        svg.appendChild(sun);
        
        // Sun rays
        for (let i = 0; i < 8; i++) {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = 100 + Math.cos(angle) * 55;
            const y1 = 100 + Math.sin(angle) * 55;
            const x2 = 100 + Math.cos(angle) * 75;
            const y2 = 100 + Math.sin(angle) * 75;
            
            const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            ray.setAttribute('x1', x1);
            ray.setAttribute('y1', y1);
            ray.setAttribute('x2', x2);
            ray.setAttribute('y2', y2);
            ray.setAttribute('stroke', '#FFD700');
            ray.setAttribute('stroke-width', '4');
            ray.setAttribute('stroke-linecap', 'round');
            svg.appendChild(ray);
        }
        
        // Add glow filter
        this.addGlowFilter(svg);
        
        // Animate rotation
        gsap.to(svg, {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: 'none'
        });
    }

    createCloudIcon(svg) {
        const cloud = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Cloud circles
        const circles = [
            { cx: 80, cy: 100, r: 25 },
            { cx: 100, cy: 90, r: 30 },
            { cx: 120, cy: 100, r: 25 },
            { cx: 110, cy: 110, r: 20 }
        ];
        
        circles.forEach(c => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', c.cx);
            circle.setAttribute('cy', c.cy);
            circle.setAttribute('r', c.r);
            circle.setAttribute('fill', '#FFFFFF');
            circle.setAttribute('opacity', '0.9');
            cloud.appendChild(circle);
        });
        
        svg.appendChild(cloud);
        
        // Animate floating
        gsap.to(cloud, {
            y: -10,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    createRainIcon(svg) {
        // Cloud
        this.createCloudIcon(svg);
        
        // Rain drops
        for (let i = 0; i < 5; i++) {
            const drop = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const x = 70 + i * 15;
            drop.setAttribute('x1', x);
            drop.setAttribute('y1', 120);
            drop.setAttribute('x2', x);
            drop.setAttribute('y2', 140);
            drop.setAttribute('stroke', '#4A90E2');
            drop.setAttribute('stroke-width', '2');
            drop.setAttribute('stroke-linecap', 'round');
            svg.appendChild(drop);
            
            // Animate drops
            gsap.to(drop, {
                y: 20,
                opacity: 0,
                duration: 0.8,
                repeat: -1,
                delay: i * 0.15,
                ease: 'none'
            });
        }
    }

    createSnowIcon(svg) {
        // Cloud
        this.createCloudIcon(svg);
        
        // Snowflakes
        for (let i = 0; i < 6; i++) {
            const snowflake = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            snowflake.setAttribute('x', 65 + i * 12);
            snowflake.setAttribute('y', 130);
            snowflake.setAttribute('fill', '#FFFFFF');
            snowflake.setAttribute('font-size', '16');
            snowflake.textContent = '❄';
            svg.appendChild(snowflake);
            
            // Animate falling
            gsap.to(snowflake, {
                y: 30,
                x: `+=${Math.random() * 10 - 5}`,
                opacity: 0,
                duration: 2 + Math.random(),
                repeat: -1,
                delay: i * 0.3,
                ease: 'none'
            });
        }
    }

    createThunderstormIcon(svg) {
        // Dark cloud
        const cloud = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const circles = [
            { cx: 80, cy: 90, r: 25 },
            { cx: 100, cy: 80, r: 30 },
            { cx: 120, cy: 90, r: 25 }
        ];
        
        circles.forEach(c => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', c.cx);
            circle.setAttribute('cy', c.cy);
            circle.setAttribute('r', c.r);
            circle.setAttribute('fill', '#555555');
            cloud.appendChild(circle);
        });
        svg.appendChild(cloud);
        
        // Lightning bolt
        const lightning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        lightning.setAttribute('d', 'M100,110 L95,130 L105,130 L100,150');
        lightning.setAttribute('fill', 'none');
        lightning.setAttribute('stroke', '#FFD700');
        lightning.setAttribute('stroke-width', '3');
        svg.appendChild(lightning);
        
        // Animate lightning
        gsap.to(lightning, {
            opacity: 0,
            duration: 0.1,
            repeat: -1,
            repeatDelay: 2,
            yoyo: true
        });
    }

    createMistIcon(svg) {
        // Mist lines
        for (let i = 0; i < 4; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '60');
            line.setAttribute('y1', 80 + i * 15);
            line.setAttribute('x2', '140');
            line.setAttribute('y2', 80 + i * 15);
            line.setAttribute('stroke', '#CCCCCC');
            line.setAttribute('stroke-width', '4');
            line.setAttribute('stroke-linecap', 'round');
            line.setAttribute('opacity', '0.6');
            svg.appendChild(line);
            
            // Animate mist
            gsap.to(line, {
                x: 10,
                duration: 3 + i * 0.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }
    }

    addGlowFilter(svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'glow');
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '3');
        feGaussianBlur.setAttribute('result', 'coloredBlur');
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'coloredBlur');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feMerge);
        defs.appendChild(filter);
        svg.appendChild(defs);
    }

    animateWeatherUpdate() {
        // Animate all weather elements
        gsap.from('.temperature', {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(1.7)'
        });
        
        gsap.from('.weather-description', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            delay: 0.2
        });
        
        gsap.from('.stat-item', {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.3,
            ease: 'power2.out'
        });
    }

    animateWidgetEntry(widget) {
        gsap.from(widget, {
            scale: 0.9,
            opacity: 0,
            y: 30,
            duration: 0.5,
            ease: 'back.out(1.7)'
        });
    }

    animateNotification(element) {
        gsap.from(element, {
            x: 100,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out'
        });
    }
}
