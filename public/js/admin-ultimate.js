// ========================================
// WEATHERPRO ADMIN PANEL - JAVASCRIPT
// ========================================

// Global state
let pendingSaveFunction = null;
let pendingSaveData = null;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after a short delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1000);
    
    initializeAdmin();
    loadDashboardData();
    loadLandingPageContent();
    setupEventListeners();
});

function initializeAdmin() {
    // Check authentication
    checkAdminAuth();
    
    // Setup navigation
    setupNavigation();
    
    // Setup tabs
    setupTabs();
    
    // Setup sidebar toggle
    setupSidebarToggle();
}

async function checkAdminAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/admin-login.html';
            return;
        }
        
        const user = await response.json();
        if (!user.is_admin) {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/login';
            return;
        }
        
        document.getElementById('adminName').textContent = user.username || 'Admin';
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin-login.html';
    }
}

// ========================================
// NAVIGATION
// ========================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.getAttribute('href') && !item.getAttribute('href').startsWith('#')) {
                return; // Allow normal navigation for external links
            }
            
            e.preventDefault();
            const section = item.dataset.section;
            
            if (section) {
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Show corresponding section
                document.querySelectorAll('.content-section').forEach(sec => {
                    sec.classList.remove('active');
                });
                document.getElementById(`${section}-section`).classList.add('active');
                
                // Update page title
                const titles = {
                    'dashboard': 'Dashboard',
                    'landing': 'Landing Page Management',
                    'users': 'User Management',
                    'analytics': 'Analytics & Insights',
                    'settings': 'System Settings'
                };
                document.getElementById('pageTitle').textContent = titles[section] || 'Admin Panel';
            }
        });
    });
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('adminSidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const icon = toggleBtn.querySelector('i');
            icon.classList.toggle('fa-chevron-left');
            icon.classList.toggle('fa-chevron-right');
        });
    }
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Password modal
    document.getElementById('confirmPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('confirmSaveBtn').click();
        }
    });
    
    document.getElementById('confirmSaveBtn').addEventListener('click', confirmPasswordAndSave);
}

// ========================================
// DASHBOARD DATA
// ========================================

async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
            const stats = await response.json();
            updateDashboardStats(stats);
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

function updateDashboardStats(stats) {
    document.getElementById('totalUsers').textContent = stats.totalUsers || '0';
    document.getElementById('pageViews').textContent = stats.pageViews || '0';
    document.getElementById('activeLocations').textContent = stats.activeLocations || '0';
}

// ========================================
// LANDING PAGE CONTENT MANAGEMENT
// ========================================

async function loadLandingPageContent() {
    try {
        const response = await fetch('/api/content');
        if (response.ok) {
            const content = await response.json();
            populateContentFields(content);
        }
    } catch (error) {
        console.error('Failed to load content:', error);
    }
}

function populateContentFields(content) {
    // Hero Section
    if (content.heroTitle1) document.getElementById('heroTitle1').value = content.heroTitle1;
    if (content.heroTitle2) document.getElementById('heroTitle2').value = content.heroTitle2;
    if (content.heroSubtitle) document.getElementById('heroSubtitle').value = content.heroSubtitle;
    if (content.heroBtnPrimary) document.getElementById('heroBtnPrimary').value = content.heroBtnPrimary;
    if (content.heroBtnSecondary) document.getElementById('heroBtnSecondary').value = content.heroBtnSecondary;
    
    // Stats
    if (content.statUsers) document.getElementById('statUsers').value = content.statUsers;
    if (content.statUsersLabel) document.getElementById('statUsersLabel').value = content.statUsersLabel;
    if (content.statAccuracy) document.getElementById('statAccuracy').value = content.statAccuracy;
    if (content.statAccuracyLabel) document.getElementById('statAccuracyLabel').value = content.statAccuracyLabel;
    if (content.statUpdates) document.getElementById('statUpdates').value = content.statUpdates;
    if (content.statUpdatesLabel) document.getElementById('statUpdatesLabel').value = content.statUpdatesLabel;
    
    // Features
    if (content.featuresTitle) document.getElementById('featuresTitle').value = content.featuresTitle;
    if (content.featuresSubtitle) document.getElementById('featuresSubtitle').value = content.featuresSubtitle;
    
    // About
    if (content.aboutTitle) document.getElementById('aboutTitle').value = content.aboutTitle;
    if (content.aboutDesc) document.getElementById('aboutDesc').value = content.aboutDesc;
    
    // CTA
    if (content.ctaTitle) document.getElementById('ctaTitle').value = content.ctaTitle;
    if (content.ctaSubtitle) document.getElementById('ctaSubtitle').value = content.ctaSubtitle;
    if (content.ctaButton) document.getElementById('ctaButton').value = content.ctaButton;
    
    // Footer
    if (content.contactEmail) document.getElementById('contactEmail').value = content.contactEmail;
    if (content.contactPhone) document.getElementById('contactPhone').value = content.contactPhone;
    if (content.contactAddress) document.getElementById('contactAddress').value = content.contactAddress;
}

// ========================================
// PASSWORD CONFIRMATION MODAL
// ========================================

function showPasswordModal(saveFunction, data) {
    pendingSaveFunction = saveFunction;
    pendingSaveData = data;
    
    const modal = document.getElementById('passwordModal');
    const input = document.getElementById('confirmPassword');
    const error = document.getElementById('passwordError');
    
    // Reset modal state
    input.value = '';
    input.classList.remove('error');
    error.classList.remove('show');
    
    // Show modal
    modal.classList.add('show');
    
    // Focus input
    setTimeout(() => input.focus(), 100);
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    modal.classList.remove('show');
    pendingSaveFunction = null;
    pendingSaveData = null;
}

async function confirmPasswordAndSave() {
    const password = document.getElementById('confirmPassword').value;
    const input = document.getElementById('confirmPassword');
    const error = document.getElementById('passwordError');
    const confirmBtn = document.getElementById('confirmSaveBtn');
    
    if (!password) {
        input.classList.add('error');
        error.querySelector('span').textContent = 'Please enter your password';
        error.classList.add('show');
        return;
    }
    
    // Disable button during verification
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    
    try {
        // Verify password
        const response = await fetch('/api/admin/verify-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        if (response.ok) {
            // Password correct - proceed with save
            closePasswordModal();
            
            if (pendingSaveFunction) {
                await pendingSaveFunction(pendingSaveData);
            }
        } else {
            // Password incorrect
            input.classList.add('error');
            error.querySelector('span').textContent = 'Incorrect password. Please try again.';
            error.classList.add('show');
            
            // Shake animation
            setTimeout(() => {
                input.classList.remove('error');
            }, 500);
        }
    } catch (error) {
        console.error('Password verification failed:', error);
        showToast('Verification failed. Please try again.', 'error');
    } finally {
        // Re-enable button
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm & Save';
    }
}

// ========================================
// SAVE FUNCTIONS
// ========================================

function saveHeroContent() {
    const data = {
        heroTitle1: document.getElementById('heroTitle1').value,
        heroTitle2: document.getElementById('heroTitle2').value,
        heroSubtitle: document.getElementById('heroSubtitle').value,
        heroBtnPrimary: document.getElementById('heroBtnPrimary').value,
        heroBtnSecondary: document.getElementById('heroBtnSecondary').value,
        statUsers: document.getElementById('statUsers').value,
        statUsersLabel: document.getElementById('statUsersLabel').value,
        statAccuracy: document.getElementById('statAccuracy').value,
        statAccuracyLabel: document.getElementById('statAccuracyLabel').value,
        statUpdates: document.getElementById('statUpdates').value,
        statUpdatesLabel: document.getElementById('statUpdatesLabel').value
    };
    
    showPasswordModal(performSave, data);
}

function saveFeaturesContent() {
    const data = {
        featuresTitle: document.getElementById('featuresTitle').value,
        featuresSubtitle: document.getElementById('featuresSubtitle').value,
        feature1Icon: document.getElementById('feature1Icon').value,
        feature1Title: document.getElementById('feature1Title').value,
        feature1Desc: document.getElementById('feature1Desc').value,
        feature2Icon: document.getElementById('feature2Icon').value,
        feature2Title: document.getElementById('feature2Title').value,
        feature2Desc: document.getElementById('feature2Desc').value
    };
    
    showPasswordModal(performSave, data);
}

function saveAboutContent() {
    const data = {
        aboutTitle: document.getElementById('aboutTitle').value,
        aboutDesc: document.getElementById('aboutDesc').value
    };
    
    showPasswordModal(performSave, data);
}

function saveCTAContent() {
    const data = {
        ctaTitle: document.getElementById('ctaTitle').value,
        ctaSubtitle: document.getElementById('ctaSubtitle').value,
        ctaButton: document.getElementById('ctaButton').value
    };
    
    showPasswordModal(performSave, data);
}

function saveFooterContent() {
    const data = {
        contactEmail: document.getElementById('contactEmail').value,
        contactPhone: document.getElementById('contactPhone').value,
        contactAddress: document.getElementById('contactAddress').value
    };
    
    showPasswordModal(performSave, data);
}

async function performSave(data) {
    try {
        const response = await fetch('/api/admin/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showToast('Changes saved successfully!', 'success');
        } else {
            showToast('Failed to save changes', 'error');
        }
    } catch (error) {
        console.error('Save failed:', error);
        showToast('Failed to save changes', 'error');
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    
    // Update icon and color based on type
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        toast.style.background = '#10b981';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toast.style.background = '#ef4444';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function previewChanges() {
    window.open('/', '_blank');
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/admin-login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = '/admin-login.html';
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.querySelector('#themeToggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

console.log('🛡️ Admin Panel Loaded');

// ========================================
// TIME DISPLAY
// ========================================

function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Update time immediately and then every second
updateTime();
setInterval(updateTime, 1000);


// ========================================
// BEAUTIFUL MICRO-INTERACTIONS
// ========================================

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
    addRippleEffect();
    addCardAnimations();
    addNumberCounters();
    addParallaxEffect();
    addSmoothScrolling();
});

function addRippleEffect() {
    const buttons = document.querySelectorAll('button, .btn-save, .btn-preview, .btn-add, .nav-item');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple CSS
    const style = document.createElement('style');
    style.textContent = `
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function addCardAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    const cards = document.querySelectorAll('.stat-card, .content-card, .dashboard-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(card);
    });
}

function addNumberCounters() {
    const counters = document.querySelectorAll('.stat-value');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, '')) || 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        // Start animation when element is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

function addParallaxEffect() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.stat-card, .dashboard-card');
                
                parallaxElements.forEach((el, index) => {
                    const speed = 0.05 + (index * 0.01);
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ========================================
// ENHANCED HOVER EFFECTS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    addMagneticEffect();
    addTiltEffect();
    addGlowEffect();
});

function addMagneticEffect() {
    const buttons = document.querySelectorAll('.btn-save, .btn-add, .topbar-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

function addTiltEffect() {
    const cards = document.querySelectorAll('.stat-card, .dashboard-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

function addGlowEffect() {
    const glowElements = document.querySelectorAll('.stat-icon');
    
    glowElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.filter = 'brightness(1.3) drop-shadow(0 0 20px currentColor)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.filter = 'brightness(1)';
        });
    });
}

// ========================================
// LOADING ANIMATIONS
// ========================================

function showLoadingAnimation(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    element.disabled = true;
    
    return () => {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// ========================================
// CONFETTI EFFECT ON SUCCESS
// ========================================

function showConfetti() {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10000';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { 
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1
            },
            { 
                transform: `translateY(${window.innerHeight + 10}px) rotate(${Math.random() * 360}deg)`,
                opacity: 0
            }
        ], {
            duration: 2000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// Override the original showToast to add confetti on success
const originalShowToast = showToast;
showToast = function(message, type = 'success') {
    originalShowToast(message, type);
    if (type === 'success') {
        showConfetti();
    }
};

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const saveBtn = activeTab.querySelector('.btn-save');
            if (saveBtn) saveBtn.click();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closePasswordModal();
    }
});

// ========================================
// PERFORMANCE MONITORING
// ========================================

console.log('%c🚀 Admin Panel Enhanced!', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');
console.log('%c✨ Beautiful animations loaded', 'color: #10b981; font-size: 14px;');
console.log('%c💫 Micro-interactions active', 'color: #3b82f6; font-size: 14px;');
