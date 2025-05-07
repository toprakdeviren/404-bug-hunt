/**
 * Modern 404 Page - Main Script
 * Handles theme switching, animations, and interactive elements
 */

// Sound Effects System
const SoundEffects = {
    sounds: {
        pop: new Audio('sounds/pop.mp3'),
        boing: new Audio('sounds/boing.mp3'),
        levelUp: new Audio('sounds/levelup.mp3'),
        theme: new Audio('sounds/theme-switch.mp3')
    },
    
    enabled: true,
    
    init() {
        // Set initial volume for all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.2;
            sound.preload = 'auto';
        });
        
        // Load user preferences
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        
        // Error handling for sound loading
        Object.values(this.sounds).forEach(sound => {
            sound.addEventListener('error', () => {
                console.warn('Sound file could not be loaded:', sound.src);
            });
        });
    },
    
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        sound.currentTime = 0;
        sound.play().catch(() => {
            // Ignore autoplay restrictions
            console.warn('Sound playback was blocked');
        });
    },
    
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        return this.enabled;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initThemeSelector();
    initReportModal();
    enhanceHeroSection();
    
    // Initialize sounds
    SoundEffects.init();
    
    // Initialize background effects
    initBackgroundEffects();
});

/**
 * Initialize theme selector dropdown functionality
 */
function initThemeSelector() {
    const themeButton = document.getElementById('theme-dropdown-button');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const themeMenu = document.getElementById('theme-dropdown-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    const currentThemeText = document.getElementById('current-theme-text');
    const mobileCurrentTheme = document.getElementById('mobile-current-theme');
    
    // Set initial theme from localStorage or default
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeName = savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);
    currentThemeText.textContent = themeName;
    if (mobileCurrentTheme) mobileCurrentTheme.textContent = themeName;
    
    // Toggle dropdown menu function (shared between desktop and mobile)
    const toggleThemeMenu = (button) => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !expanded);
        
        if (!expanded) {
            themeMenu.classList.remove('hidden');
            setTimeout(() => {
                themeMenu.classList.add('opacity-100', 'scale-100');
                themeMenu.classList.remove('opacity-0', 'scale-95');
            }, 10);
        } else {
            themeMenu.classList.remove('opacity-100', 'scale-100');
            themeMenu.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                themeMenu.classList.add('hidden');
            }, 200);
        }
    };
    
    // Desktop theme button click
    if (themeButton) {
        themeButton.addEventListener('click', () => {
            const expanded = themeButton.getAttribute('aria-expanded') === 'true';
            themeButton.setAttribute('aria-expanded', !expanded);
            
            const themeMenu = document.getElementById('theme-dropdown-menu');
            if (!expanded) {
                themeMenu.classList.remove('hidden');
                setTimeout(() => {
                    themeMenu.classList.add('opacity-100', 'scale-100');
                    themeMenu.classList.remove('opacity-0', 'scale-95');
                }, 10);
            } else {
                themeMenu.classList.remove('opacity-100', 'scale-100');
                themeMenu.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    themeMenu.classList.add('hidden');
                }, 200);
            }
        });
    }
    
    // Mobile hamburger menu button click - open fullscreen menu
    if (mobileMenuButton) {
        const mobileFullscreenMenu = document.getElementById('mobile-fullscreen-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const mobileCurrentThemeDisplay = document.getElementById('mobile-current-theme-display');
        const mobileThemeOptions = document.querySelectorAll('.mobile-theme-option');
        
        // Update current theme display
        if (mobileCurrentThemeDisplay) {
            const savedTheme = localStorage.getItem('theme') || 'default';
            mobileCurrentThemeDisplay.textContent = savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);
            
            // Mark current theme as active
            mobileThemeOptions.forEach(option => {
                if (option.getAttribute('data-theme') === savedTheme) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
        
        // Open mobile menu
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            if (mobileFullscreenMenu) {
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                mobileFullscreenMenu.classList.add('active');
            }
        });
        
        // Close mobile menu
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => {
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                mobileFullscreenMenu.classList.remove('active');
            });
        }
        
        // Handle mobile theme options
        mobileThemeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                applyTheme(theme);
                
                // Close mobile menu after short delay
                setTimeout(() => {
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                    mobileFullscreenMenu.classList.remove('active');
                }, 300);
            });
        });
    }
    
    // Handle desktop theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            applyTheme(theme);
            
            // Close desktop dropdown
            if (themeButton) {
                themeButton.setAttribute('aria-expanded', 'false');
                const themeMenu = document.getElementById('theme-dropdown-menu');
                themeMenu.classList.remove('opacity-100', 'scale-100');
                themeMenu.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    themeMenu.classList.add('hidden');
                }, 200);
            }
        });
    });
    
    // Shared function to apply theme across the app
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update theme text in all places
        const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
        if (currentThemeText) currentThemeText.textContent = themeName;
        
        // Update mobile theme display if it exists
        const mobileCurrentThemeDisplay = document.getElementById('mobile-current-theme-display');
        if (mobileCurrentThemeDisplay) mobileCurrentThemeDisplay.textContent = themeName;
        
        // Update active state in mobile menu
        const mobileThemeOptions = document.querySelectorAll('.mobile-theme-option');
        mobileThemeOptions.forEach(opt => {
            if (opt.getAttribute('data-theme') === theme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if ((!themeButton || !themeButton.contains(e.target)) && 
            (!mobileMenuButton || !mobileMenuButton.contains(e.target)) && 
            !themeMenu.contains(e.target)) {
            
            // Reset both buttons
            if (themeButton) themeButton.setAttribute('aria-expanded', 'false');
            if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
            
            themeMenu.classList.remove('opacity-100', 'scale-100');
            themeMenu.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                themeMenu.classList.add('hidden');
            }, 200);
        }
    });
    
    // Handle window resize to ensure proper button state
    window.addEventListener('resize', () => {
        if (themeMenu.classList.contains('hidden')) return;
        
        // If menu is open, update the appropriate button based on screen width
        if (window.innerWidth >= 768) {
            if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
            if (themeButton) themeButton.setAttribute('aria-expanded', 'true');
        } else {
            if (themeButton) themeButton.setAttribute('aria-expanded', 'false');
            if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'true');
        }
    });
}

/**
 * Toggle dropdown menu visibility
 * @param {HTMLElement} dropdown - The dropdown element
 * @param {HTMLElement} arrow - The dropdown arrow icon
 */
function toggleDropdown(dropdown, arrow) {
    const isHidden = dropdown.classList.contains('hidden');
    
    if (isHidden) {
        dropdown.classList.remove('hidden');
        setTimeout(() => {
            dropdown.classList.remove('scale-95', 'opacity-0');
            dropdown.classList.add('scale-100', 'opacity-100');
            arrow?.classList.add('rotate-180');
        }, 10);
    } else {
        closeDropdown(dropdown, arrow);
    }
}

/**
 * Close dropdown menu
 * @param {HTMLElement} dropdown - The dropdown element
 * @param {HTMLElement} arrow - The dropdown arrow icon
 */
function closeDropdown(dropdown, arrow) {
    dropdown.classList.remove('scale-100', 'opacity-100');
    dropdown.classList.add('scale-95', 'opacity-0');
    arrow?.classList.remove('rotate-180');
    setTimeout(() => {
        dropdown.classList.add('hidden');
    }, 200);
}

/**
 * Initialize report modal functionality
 */
function initReportModal() {
    const reportBugLink = document.getElementById('report-bug-link');
    const reportModal = document.getElementById('report-modal');
    const closeModal = document.getElementById('close-modal');
    const submitReport = document.getElementById('submit-report');
    const brokenUrl = document.getElementById('broken-url');

    // Ensure reportModal exists before adding event listeners
    if (!reportModal || !reportBugLink) return;
    
    // Set current URL in the form
    if (brokenUrl) {
        brokenUrl.value = window.location.pathname;
    }

    // Open modal
    reportBugLink.addEventListener('click', (e) => {
        e.preventDefault();
        reportModal.classList.remove('hidden');
        setTimeout(() => brokenUrl?.focus(), 100);
    });

    // Close modal handlers
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            reportModal.classList.add('hidden');
        });
    }

    if (submitReport) {
        submitReport.addEventListener('click', () => {
            alert('Thank you for your report! We\'ll look into this issue.');
            reportModal.classList.add('hidden');
        });
    }

    // Close when clicking outside
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            reportModal.classList.add('hidden');
        }
    });
}

/**
 * Enhance the 404 hero section with interactive animations
 */
function enhanceHeroSection() {
    // Get hero section elements
    const heroElements = {
        title: document.querySelector('.animated-underline'),
        numbers: document.querySelectorAll('.text-404'),
        emoji: document.querySelector('.emoji-container'),
        description: document.querySelectorAll('.animate-slide-up'),
        homeButton: document.querySelector('a[href="/"]'),
        reportButton: document.querySelector('#report-bug-link')
    };

    // Add hover effects to buttons
    addButtonEffects(heroElements.homeButton);
    addButtonEffects(heroElements.reportButton);
    
    // Add text scramble effect to 404 on click
    if (heroElements.numbers.length > 0) {
        heroElements.numbers.forEach(number => {
            number.addEventListener('click', () => {
                playSound();
                applyGlitchEffect(number);
                createParticles(number, 10, 'accent');
            });
        });
    }
}

/**
 * Add hover effects to buttons
 * @param {HTMLElement} button - The button element
 */
function addButtonEffects(button) {
    if (!button) return;
    
    button.addEventListener('mouseenter', () => {
        // Create particle effects on hover
        const isHomeButton = button.classList.contains('home-button');
        createParticles(button, 5, isHomeButton ? 'yellow' : 'accent');
        
        // Play subtle sound if available
        playSound();
    });
}

/**
 * Create particle effects
 * @param {HTMLElement} element - The source element
 * @param {number} count - Number of particles to create
 * @param {string} color - Color theme for particles
 */
function createParticles(element, count = 5, color = 'yellow') {
    const rect = element.getBoundingClientRect();
    const root = document.documentElement;
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Get color from CSS variables based on current theme
        let particleColor;
        if (color === 'yellow') {
            const textColorRgb = getComputedStyle(root).getPropertyValue('--text-color-rgb').trim();
            particleColor = `rgba(${textColorRgb}, ${Math.random() * 0.5 + 0.5})`;
        } else {
            const accentRgb = getComputedStyle(root).getPropertyValue('--color-accent-rgb').trim();
            particleColor = `rgba(${accentRgb}, ${Math.random() * 0.5 + 0.5})`;
        }
        
        particle.style.background = particleColor;
        
        // Random position around the element
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        
        // Set size and position
        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.position = 'fixed';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.zIndex = '50';
        particle.style.pointerEvents = 'none';
        
        // Add animation
        particle.style.animation = `float ${Math.random() * 1 + 1}s ease-out forwards`;
        particle.style.opacity = '0.8';
        
        // Add to body
        document.body.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
}

/**
 * Apply glitch text effect
 * @param {HTMLElement} element - The text element to apply effect to
 */
function applyGlitchEffect(element) {
    const originalText = element.textContent;
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\"\`~';
    let iterations = 0;
    
    // Add glitch class temporarily
    element.classList.add('animate-pulse');
    
    const interval = setInterval(() => {
        element.textContent = originalText
            .split('')
            .map((char, index) => {
                if (index < iterations) {
                    return originalText[index];
                }
                return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            })
            .join('');
        
        iterations += 1 / 3;
        
        if (iterations >= originalText.length) {
            clearInterval(interval);
            element.textContent = originalText;
            element.classList.remove('animate-pulse');
        }
    }, 50);
}

/**
 * Play sound effect (placeholder function)
 */
function playSound() {
    // Sound functionality could be implemented here
    return;
}

/**
 * Initialize background particle effects
 */
function initBackgroundEffects() {
    const starContainer = document.getElementById('star-background');
    if (!starContainer) return;

    // Create stars
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random size between 1-3px
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        star.style.animationDelay = `${Math.random() * 4}s`;
        
        starContainer.appendChild(star);
    }

    // Initialize gradient shift effect
    const body = document.body;
    let gradientPosition = { x: 0, y: 0 };
    let targetPosition = { x: 0, y: 0 };

    document.addEventListener('mousemove', (e) => {
        targetPosition = {
            x: (e.clientX / window.innerWidth) * 100,
            y: (e.clientY / window.innerHeight) * 100
        };
    });

    function updateGradient() {
        // Smooth transition to target position
        gradientPosition.x += (targetPosition.x - gradientPosition.x) * 0.1;
        gradientPosition.y += (targetPosition.y - gradientPosition.y) * 0.1;

        const gradient = `radial-gradient(circle at ${gradientPosition.x}% ${gradientPosition.y}%, var(--background-gradient-from) 0%, var(--background-gradient-to) 100%)`;
        body.style.background = gradient;

        requestAnimationFrame(updateGradient);
    }

    updateGradient();
}