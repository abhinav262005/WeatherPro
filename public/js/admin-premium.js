// ========================================
// PREMIUM ADMIN PANEL ENHANCEMENTS
// ========================================

// Animated Number Counter
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (element) {
            element.textContent = Math.floor(current).toLocaleString();
            element.classList.add('counting');
        }
    }, 16);
}

// Initialize stat counters on page load
function initializeStatCounters() {
    setTimeout(() => {
        const totalUsers = document.getElementById('totalUsers');
        const pageViews = document.getElementById('pageViews');
        const activeLocations = document.getElementById('activeLocations');
        
        if (totalUsers) animateValue(totalUsers, 0, 1247, 2000);
        if (pageViews) animateValue(pageViews, 0, 45892, 2000);
        if (activeLocations) animateValue(activeLocations, 0, 89, 2000);
    }, 500);
}

// Refresh Data Function
function refreshData() {
    const btn = event.currentTarget;
    const icon = btn.querySelector('i');
    
    // Animate icon
    icon.style.animation = 'spin 1s linear';
    
    // Show notification
    showToast('Refreshing data...', 'info');
    
    // Simulate data refresh
    setTimeout(() => {
        icon.style.animation = '';
        showToast('Data refreshed successfully!', 'success');
        initializeStatCounters();
    }, 1500);
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

// Export Data Function
function exportData() {
    showToast('Preparing export...', 'info');
    
    setTimeout(() => {
        // Create sample CSV data
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Metric,Value\n"
            + "Total Users,1247\n"
            + "Page Views,45892\n"
            + "Active Locations,89\n"
            + "Uptime,99.9%\n";
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "admin_report_" + new Date().toISOString().split('T')[0] + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Report exported successfully!', 'success');
    }, 1000);
}

// Enhanced Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon based on type
    const icon = toast.querySelector('i');
    if (icon) {
        icon.className = '';
        switch(type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                toast.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                toast.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                toast.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                break;
            case 'info':
                icon.className = 'fas fa-info-circle';
                toast.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                break;
        }
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Real-time Activity Feed Simulation
function simulateActivityFeed() {
    const activities = [
        { icon: 'fa-user-plus', type: 'success', title: 'New user registered', time: 'Just now' },
        { icon: 'fa-edit', type: 'info', title: 'Content updated', time: '2 minutes ago' },
        { icon: 'fa-download', type: 'info', title: 'Report downloaded', time: '5 minutes ago' },
        { icon: 'fa-check-circle', type: 'success', title: 'Backup completed', time: '10 minutes ago' },
        { icon: 'fa-exclamation-triangle', type: 'warning', title: 'High traffic detected', time: '15 minutes ago' }
    ];
    
    let currentIndex = 0;
    
    setInterval(() => {
        const feed = document.getElementById('activityFeed');
        if (!feed) return;
        
        const activity = activities[currentIndex % activities.length];
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        
        // Add to top of feed
        feed.insertBefore(activityItem, feed.firstChild);
        
        // Remove last item if more than 5
        if (feed.children.length > 5) {
            feed.removeChild(feed.lastChild);
        }
        
        currentIndex++;
    }, 30000); // Every 30 seconds
}

// System Health Animation
function animateSystemHealth() {
    const metrics = document.querySelectorAll('.health-progress-fill');
    
    metrics.forEach((metric, index) => {
        setTimeout(() => {
            const width = metric.style.width;
            metric.style.width = '0%';
            setTimeout(() => {
                metric.style.width = width;
            }, 100);
        }, index * 200);
    });
}

// Parallax Effect for Cards
function initParallaxEffect() {
    const cards = document.querySelectorAll('.stat-card, .dashboard-card, .content-card');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        cards.forEach((card, index) => {
            const speed = (index % 3 + 1) * 0.5;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            
            card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
        });
    });
}

// Smooth Scroll Enhancement
function initSmoothScroll() {
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
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const search = document.getElementById('userSearch');
            if (search) search.focus();
        }
        
        // Ctrl/Cmd + R: Refresh data
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshData();
        }
        
        // Ctrl/Cmd + E: Export data
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportData();
        }
    });
}

// FORCE numbers to be visible - aggressive approach
function forceNumbersVisible() {
    const isLightTheme = document.body.classList.contains('light-theme');
    const statNumbers = document.querySelectorAll('.stat-details h3');
    const statLabels = document.querySelectorAll('.stat-details p');
    
    const numberColor = isLightTheme ? '#1f2937' : '#ffffff';
    const labelColor = isLightTheme ? '#1f2937' : '#ffffff';
    
    statNumbers.forEach(num => {
        num.style.setProperty('color', numberColor, 'important');
        num.style.setProperty('font-size', '2.5rem', 'important');
        num.style.setProperty('font-weight', '800', 'important');
        num.style.setProperty('opacity', '1', 'important');
        num.style.setProperty('display', 'block', 'important');
        num.style.setProperty('visibility', 'visible', 'important');
        num.style.setProperty('text-shadow', 'none', 'important');
        num.style.setProperty('-webkit-text-fill-color', numberColor, 'important');
        num.style.setProperty('background', 'none', 'important');
    });
    
    statLabels.forEach(label => {
        label.style.setProperty('color', labelColor, 'important');
        label.style.setProperty('opacity', '1', 'important');
        label.style.setProperty('display', 'block', 'important');
        label.style.setProperty('visibility', 'visible', 'important');
        label.style.setProperty('font-weight', '600', 'important');
    });
    
    console.log('✅ FORCED', statNumbers.length, 'numbers to be visible! Theme:', isLightTheme ? 'Light' : 'Dark');
}

// Update text colors based on theme
function updateTextColors() {
    const isLightTheme = document.body.classList.contains('light-theme');
    
    // Stat card numbers and labels
    const statNumbers = document.querySelectorAll('.stat-details h3');
    const statLabels = document.querySelectorAll('.stat-details p');
    
    statNumbers.forEach(num => {
        const color = isLightTheme ? '#1f2937' : '#ffffff';
        num.style.setProperty('color', color, 'important');
        num.style.setProperty('-webkit-text-fill-color', color, 'important');
    });
    
    statLabels.forEach(label => {
        const color = isLightTheme ? '#1f2937' : '#ffffff';
        label.style.setProperty('color', color, 'important');
        label.style.setProperty('font-weight', '600', 'important');
    });
    
    // Quick action card text
    const actionTitles = document.querySelectorAll('.quick-action-title');
    const actionDescs = document.querySelectorAll('.quick-action-desc');
    
    actionTitles.forEach(title => {
        const color = isLightTheme ? '#1f2937' : '#ffffff';
        title.style.setProperty('color', color, 'important');
    });
    
    actionDescs.forEach(desc => {
        const color = isLightTheme ? '#6b7280' : '#9ca3af';
        desc.style.setProperty('color', color, 'important');
    });
    
    console.log('Theme updated:', isLightTheme ? 'Light' : 'Dark');
}

// Add hover effects to quick action cards
function initQuickActionHovers() {
    const cards = document.querySelectorAll('.quick-action-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            const arrow = this.querySelector('.quick-action-arrow');
            if (arrow) {
                arrow.style.transform = 'translateX(5px)';
                arrow.style.color = '#ffffff';
            }
            const icon = this.querySelector('.quick-action-icon');
            if (icon) {
                icon.style.transform = 'rotate(5deg) scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
            const arrow = this.querySelector('.quick-action-arrow');
            if (arrow) {
                arrow.style.transform = 'translateX(0)';
                arrow.style.color = '#9ca3af';
            }
            const icon = this.querySelector('.quick-action-icon');
            if (icon) {
                icon.style.transform = 'rotate(0deg) scale(1)';
            }
        });
    });
}

// Initialize all premium features
document.addEventListener('DOMContentLoaded', () => {
    // IMMEDIATELY force numbers visible
    forceNumbersVisible();
    
    // Force again after a short delay
    setTimeout(() => {
        forceNumbersVisible();
    }, 100);
    
    // And again after 500ms
    setTimeout(() => {
        forceNumbersVisible();
    }, 500);
    
    // Wait for loading screen to hide
    setTimeout(() => {
        forceNumbersVisible(); // Force one more time
        initializeStatCounters();
        animateSystemHealth();
        simulateActivityFeed();
        initSmoothScroll();
        initKeyboardShortcuts();
        initQuickActionHovers();
        updateTextColors(); // Apply correct colors on load
        
        // Optional: Disable parallax on mobile for performance
        if (window.innerWidth > 768) {
            initParallaxEffect();
        }
        
        console.log('%c✨ Premium Admin Features Loaded!', 'color: #8b5cf6; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);');
        console.log('%c🎨 Quick Actions | Glass Effects | Sparklines | Animations', 'color: #10b981; font-size: 14px;');
        console.log('%c⌨️  Shortcuts: Ctrl+K (Search) | Ctrl+R (Refresh) | Ctrl+E (Export)', 'color: #3b82f6; font-size: 12px;');
    }, 1000);
    
    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                updateTextColors();
                forceNumbersVisible();
            }
        });
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
});

// Auto-refresh system health every 5 seconds
setInterval(() => {
    const healthMetrics = document.querySelectorAll('.health-metric-value');
    healthMetrics.forEach(metric => {
        const currentValue = parseInt(metric.textContent);
        const variation = Math.floor(Math.random() * 10) - 5;
        const newValue = Math.max(0, Math.min(100, currentValue + variation));
        metric.textContent = newValue + '%';
        
        const progressBar = metric.closest('.health-metric').querySelector('.health-progress-fill');
        if (progressBar) {
            progressBar.style.width = newValue + '%';
        }
    });
}, 5000);


// Ripple Effect on Buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple to all buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button, .btn-add, .btn-save, .btn-preview, .quick-action-card');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
});

// Confetti Celebration
function triggerConfetti() {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

// Celebrate on successful save
function celebrateSave() {
    triggerConfetti();
    showToast('🎉 Changes saved successfully!', 'success');
}

// Enhanced Search with Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
const searchInput = document.getElementById('userSearch');
if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // Add your search logic here
        showToast(`Searching for: ${searchTerm}`, 'info');
    }, 500));
}

// Keyboard Navigation for Tables
function initTableKeyboardNav() {
    const table = document.querySelector('.data-table');
    if (!table) return;
    
    let selectedRow = null;
    
    document.addEventListener('keydown', (e) => {
        if (!table.contains(document.activeElement)) return;
        
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const currentIndex = rows.indexOf(selectedRow);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < rows.length - 1) {
                    selectedRow = rows[currentIndex + 1];
                    selectedRow.focus();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    selectedRow = rows[currentIndex - 1];
                    selectedRow.focus();
                }
                break;
        }
    });
}

// Auto-save Draft Feature
let autoSaveTimer;
function enableAutoSave() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                // Save draft to localStorage
                const formData = {};
                inputs.forEach(inp => {
                    if (inp.id) {
                        formData[inp.id] = inp.value;
                    }
                });
                localStorage.setItem('admin_draft', JSON.stringify(formData));
                console.log('Draft auto-saved');
            }, 2000);
        });
    });
}

// Load Draft on Page Load
function loadDraft() {
    const draft = localStorage.getItem('admin_draft');
    if (draft) {
        try {
            const formData = JSON.parse(draft);
            Object.keys(formData).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = formData[key];
                }
            });
            console.log('Draft loaded');
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
    }
}

// Clear Draft After Save
function clearDraft() {
    localStorage.removeItem('admin_draft');
    console.log('Draft cleared');
}

// Theme Persistence
function saveTheme(theme) {
    localStorage.setItem('admin_theme', theme);
    document.body.setAttribute('data-theme', theme);
}

function loadTheme() {
    const theme = localStorage.getItem('admin_theme') || 'dark';
    document.body.setAttribute('data-theme', theme);
}

// Initialize theme
loadTheme();

// Copy to Clipboard Function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
    });
}

// Add copy buttons to code blocks
document.querySelectorAll('pre, code').forEach(block => {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-copy"></i>';
    button.className = 'copy-btn';
    button.onclick = () => copyToClipboard(block.textContent);
    block.style.position = 'relative';
    block.appendChild(button);
});

// Performance Monitor
function monitorPerformance() {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page Load Time:', pageLoadTime + 'ms');
        
        if (pageLoadTime > 3000) {
            console.warn('Slow page load detected');
        }
    }
}

// Initialize performance monitoring
window.addEventListener('load', monitorPerformance);

// Accessibility: Focus Trap for Modals
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
        
        if (e.key === 'Escape') {
            element.classList.remove('show');
        }
    });
}

// Apply focus trap to modals
document.querySelectorAll('.modal, .password-modal').forEach(modal => {
    trapFocus(modal);
});

// Lazy Load Images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// Network Status Indicator
function monitorNetworkStatus() {
    window.addEventListener('online', () => {
        showToast('Connection restored', 'success');
    });
    
    window.addEventListener('offline', () => {
        showToast('No internet connection', 'error');
    });
}

monitorNetworkStatus();

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    enableAutoSave();
    loadDraft();
    initTableKeyboardNav();
    
    console.log('🚀 All premium features initialized!');
    console.log('Keyboard shortcuts:');
    console.log('  Ctrl/Cmd + K: Focus search');
    console.log('  Ctrl/Cmd + R: Refresh data');
    console.log('  Ctrl/Cmd + E: Export data');
});
