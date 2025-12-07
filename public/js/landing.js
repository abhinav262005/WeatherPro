// ========================================
// WEATHERPRO LANDING PAGE JAVASCRIPT
// ========================================

// Optimized navbar scroll effect with throttling for smooth performance
let ticking = false;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Animate hamburger
        const spans = hamburger.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Animate stats counter
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Counter animation DISABLED - using database values instead
// const statsObserver = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
//             entry.target.classList.add('animated');
//             const stats = document.querySelectorAll('.stat h3');
//             
//             // Animate each stat
//             if (stats[0] && stats[0].textContent.includes('K')) {
//                 const value = parseInt(stats[0].textContent);
//                 animateCounter(stats[0], value, 2000);
//                 setTimeout(() => {
//                     stats[0].textContent = value + 'K+';
//                 }, 2000);
//             }
//         }
//     });
// }, { threshold: 0.5 });

// const heroStats = document.querySelector('.hero-stats');
// if (heroStats) {
//     statsObserver.observe(heroStats);
// }



// Parallax effect removed for buttery smooth scrolling

// Mouse move parallax effect - DISABLED for stability
// document.addEventListener('mousemove', (e) => {
//     const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
//     const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
//     const heroContent = document.querySelector('.hero-content');
//     if (heroContent && window.pageYOffset < window.innerHeight) {
//         heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
//     }
// });

// Add button ripple effect
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Scroll animations removed for buttery smooth scrolling - using CSS animations instead

// Add floating animation to stats
const stats = document.querySelectorAll('.stat');
stats.forEach((stat, index) => {
    stat.style.animation = `float 3s ease-in-out ${index * 0.2}s infinite`;
});

const floatStyle = document.createElement('style');
floatStyle.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(floatStyle);

// Load dynamic content from database
async function loadDynamicContent() {
    try {
        const response = await fetch('/api/content');
        if (response.ok) {
            const content = await response.json();
            console.log('📊 Loaded content from database:', content);
            
            // Update statistics - with exact targeting
            const heroStats = document.querySelector('.hero-stats');
            if (heroStats) {
                const statElements = heroStats.querySelectorAll('.stat h3');
                console.log('Found stat elements:', statElements.length);
                
                // Force update Active Users
                if (statElements[0]) {
                    const activeUsers = content.statUsers || content.stat_users || '10K+';
                    statElements[0].textContent = activeUsers;
                    console.log('✅ Updated Active Users to:', activeUsers);
                }
                
                // Force update Accuracy
                if (statElements[1]) {
                    const accuracy = content.statAccuracy || content.stat_accuracy || '99.9%';
                    statElements[1].textContent = accuracy;
                    console.log('✅ Updated Accuracy to:', accuracy);
                }
                
                // Force update Live Updates
                if (statElements[2]) {
                    const liveUpdates = content.statUpdates || content.stat_updates || '24/7';
                    statElements[2].textContent = liveUpdates;
                    console.log('✅ Updated Live Updates to:', liveUpdates);
                }
            } else {
                console.error('❌ Hero stats container not found');
            }
            
            // Update hero titles
            const heroTitle = document.querySelector('.hero-content h1');
            if (heroTitle && content.heroTitle1 && content.heroTitle2) {
                heroTitle.innerHTML = `${content.heroTitle1}<br><span class="gradient-text">${content.heroTitle2}</span>`;
            }
            
            // Update hero subtitle
            const heroSubtitle = document.querySelector('.hero-content p');
            if (heroSubtitle && content.heroSubtitle) {
                heroSubtitle.textContent = content.heroSubtitle;
            }
            
            // Update buttons
            const primaryBtn = document.querySelector('.btn-primary');
            if (primaryBtn && content.heroBtnPrimary) {
                primaryBtn.textContent = content.heroBtnPrimary;
            }
            
            const secondaryBtn = document.querySelector('.btn-secondary');
            if (secondaryBtn && content.heroBtnSecondary) {
                secondaryBtn.textContent = content.heroBtnSecondary;
            }
            
            // Update features section
            const featuresTitle = document.querySelector('#features h2');
            if (featuresTitle && content.featuresTitle) {
                featuresTitle.textContent = content.featuresTitle;
            }
            
            const featuresSubtitle = document.querySelector('#features .section-subtitle');
            if (featuresSubtitle && content.featuresSubtitle) {
                featuresSubtitle.textContent = content.featuresSubtitle;
            }
            
            // Update about section
            const aboutTitle = document.querySelector('#about h2');
            if (aboutTitle && content.aboutTitle) {
                aboutTitle.textContent = content.aboutTitle;
            }
            
            const aboutDesc = document.querySelector('#about .about-text p');
            if (aboutDesc && content.aboutDesc) {
                aboutDesc.textContent = content.aboutDesc;
            }
            
            // Update CTA section
            const ctaTitle = document.querySelector('.cta-content h2');
            if (ctaTitle && content.ctaTitle) {
                ctaTitle.textContent = content.ctaTitle;
            }
            
            const ctaSubtitle = document.querySelector('.cta-content p');
            if (ctaSubtitle && content.ctaSubtitle) {
                ctaSubtitle.textContent = content.ctaSubtitle;
            }
            
            const ctaButton = document.querySelector('.cta-content .btn-primary');
            if (ctaButton && content.ctaButton) {
                ctaButton.textContent = content.ctaButton;
            }
            
            // Update footer contact info
            const footerEmail = document.querySelector('.footer-contact a[href^="mailto"]');
            if (footerEmail && content.contactEmail) {
                footerEmail.textContent = content.contactEmail;
                footerEmail.href = `mailto:${content.contactEmail}`;
            }
            
            const footerPhone = document.querySelector('.footer-contact a[href^="tel"]');
            if (footerPhone && content.contactPhone) {
                footerPhone.textContent = content.contactPhone;
                footerPhone.href = `tel:${content.contactPhone}`;
            }
            
            const footerAddress = document.querySelectorAll('.footer-contact p');
            if (footerAddress[2] && content.contactAddress) {
                footerAddress[2].textContent = content.contactAddress;
            }
            
            // Update social media links
            if (content.socialFacebook) {
                const fbLink = document.querySelector('.social-links a[href*="facebook"]');
                if (fbLink) fbLink.href = content.socialFacebook;
            }
            if (content.socialTwitter) {
                const twLink = document.querySelector('.social-links a[href*="twitter"]');
                if (twLink) twLink.href = content.socialTwitter;
            }
            if (content.socialInstagram) {
                const igLink = document.querySelector('.social-links a[href*="instagram"]');
                if (igLink) igLink.href = content.socialInstagram;
            }
            if (content.socialLinkedin) {
                const liLink = document.querySelector('.social-links a[href*="linkedin"]');
                if (liLink) liLink.href = content.socialLinkedin;
            }
            
            console.log('✅ Dynamic content loaded successfully');
        }
    } catch (error) {
        console.error('Failed to load dynamic content:', error);
    }
}

// Load content IMMEDIATELY - before any animations
loadDynamicContent();

// Also load when DOM is ready
document.addEventListener('DOMContentLoaded', loadDynamicContent);

// ========================================
// THEME TOGGLE
// ========================================

// Check for saved theme preference or default to light
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        
        if (document.body.classList.contains('dark-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
}

console.log('🌤️ WeatherPro Landing Page Loaded with Theme Toggle');


// ========================================
// ULTIMATE STUNNING INTERACTIONS
// ========================================

// Scroll indicator removed for cleaner design

// Magnetic effect for buttons
document.querySelectorAll('.btn, .nav-links a').forEach(element => {
    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        element.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0, 0)';
    });
});

// 3D tilt effect for feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px) scale(1.03)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
});

// Cloud parallax removed for buttery smooth scrolling

// Cursor trail effect removed for better performance

// Number counter animation disabled to preserve exact stat values (99.9%, 24/7, etc.)

// Scroll reveal animations removed for buttery smooth scrolling

// Confetti effect on CTA button click
function createConfetti() {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const startX = Math.random() * window.innerWidth;
        
        confetti.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: -20px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            pointer-events: none;
            z-index: 10000;
            animation: confetti-fall ${2 + Math.random() * 2}s ease-out forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
}

const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Add confetti to CTA button
document.querySelectorAll('.cta .btn-primary').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!e.target.href || e.target.href.includes('#')) {
            e.preventDefault();
            createConfetti();
        }
    });
});

// Typing effect for hero title (optional - can be enabled)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Smooth page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Add glow effect to logo on hover
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('mouseenter', () => {
        logo.style.filter = 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))';
    });
    
    logo.addEventListener('mouseleave', () => {
        logo.style.filter = 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.5))';
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'H' to scroll to top
    if (e.key === 'h' || e.key === 'H') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Press 'F' to scroll to features
    if (e.key === 'f' || e.key === 'F') {
        const features = document.getElementById('features');
        if (features) {
            features.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Performance monitoring
console.log('%c🚀 Landing Page Enhanced!', 'color: #8b5cf6; font-size: 24px; font-weight: bold;');
console.log('%c✨ Beautiful animations loaded', 'color: #10b981; font-size: 16px;');
console.log('%c💫 Micro-interactions active', 'color: #3b82f6; font-size: 16px;');
console.log('%c🎨 3D effects enabled', 'color: #f59e0b; font-size: 16px;');

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        createConfetti();
        alert('🎉 You found the secret! Enjoy the confetti!');
        konamiCode = [];
    }
});
