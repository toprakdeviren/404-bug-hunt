/**
 * Modern 404 Page - Bug Hunt Game
 * Interactive bug-catching game for the 404 page
 */

// Define scoreAnnouncer in global scope
let scoreAnnouncer;

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Game state variables
    const gameState = {
        active: false,
        score: 0,
        level: 1,
        bestScore: parseInt(localStorage.getItem('bestScore')) || 0,
        bugSpawnInterval: 2000, // Base spawn rate
        combo: 0,
        lastCatchTime: 0,
        progressToNextLevel: 0,
        pointsToNextLevel: 100
    };

    // Initialize score announcer for screen readers
    scoreAnnouncer = document.createElement('div');
    scoreAnnouncer.setAttribute('role', 'status');
    scoreAnnouncer.setAttribute('aria-live', 'polite');
    scoreAnnouncer.className = 'sr-only';
    document.body.appendChild(scoreAnnouncer);

    // Enhanced bug configuration with special types
    const bugOptions = [
        { iconId: 'bug-ladybug', color: 'text-red-500', points: 10, type: 'normal' },
        { iconId: 'bug-caterpillar', color: 'text-green-400', points: 5, type: 'normal' },
        { iconId: 'bug-beetle', color: 'text-emerald-500', points: 15, type: 'normal' },
        { iconId: 'bug-mosquito', color: 'text-gray-400', points: 20, type: 'speed', effect: 'slow' },
        { iconId: 'bug-cricket', color: 'text-lime-400', points: 25, type: 'bonus' },
        { iconId: 'bug-scorpion', color: 'text-amber-500', points: -30, type: 'danger' }
    ];

    // Initialize DOM elements
    const elements = {
        gameScore: document.getElementById('game-score'),
        contentArea: document.getElementById('content-area-404'),
        reportLink: document.getElementById('report-bug-link'),
        bugsContainer: document.getElementById('bugs-container'),
        scoreElement: document.getElementById('score-count'),
        bestScoreElement: document.getElementById('best-score'),
        levelElement: document.getElementById('level-count'),
        homeButton: document.querySelector('a[href="/"]'),
        progressBar: document.querySelector('.level-progress-bar'),
        soundToggle: document.getElementById('sound-toggle'),
        soundOnIcon: document.querySelector('.sound-on'),
        soundOffIcon: document.querySelector('.sound-off')
    };
    
    // Exit early if required elements don't exist
    if (!elements.contentArea || !elements.bugsContainer) return;
    
    // Initialize sound toggle
    if (elements.soundToggle) {
        elements.soundToggle.addEventListener('click', () => {
            const isEnabled = SoundEffects.toggle();
            elements.soundOnIcon.classList.toggle('hidden', !isEnabled);
            elements.soundOffIcon.classList.toggle('hidden', isEnabled);
        });

        // Set initial state
        const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        elements.soundOnIcon.classList.toggle('hidden', !soundEnabled);
        elements.soundOffIcon.classList.toggle('hidden', soundEnabled);
    }

    // Initialize the game
    initGame(gameState, elements);
});

/**
 * Initialize the bug hunt game
 * @param {Object} gameState - Game state variables
 * @param {Object} elements - DOM elements
 */
function initGame(gameState, elements) {
    // Display best score
    elements.bestScoreElement.textContent = gameState.bestScore;
    
    // Calculate safe zone (area around 404 content where bugs shouldn't spawn)
    const safeZone = calculateSafeZone(elements);
    
    // Bug configuration
    const bugOptions = [
        { iconId: 'bug-ladybug', color: 'text-red-500', points: 10, type: 'normal' },
        { iconId: 'bug-caterpillar', color: 'text-green-400', points: 5, type: 'normal' },
        { iconId: 'bug-beetle', color: 'text-emerald-500', points: 15, type: 'normal' },
        { iconId: 'bug-mosquito', color: 'text-gray-400', points: 20, type: 'speed', effect: 'slow' },
        { iconId: 'bug-cricket', color: 'text-lime-400', points: 25, type: 'bonus' },
        { iconId: 'bug-scorpion', color: 'text-amber-500', points: -30, type: 'danger' }
    ];
    
    // Calculate number of bugs based on screen width
    const numBugs = Math.min(15, Math.max(8, Math.floor(window.innerWidth / 80)));
    
    // Create initial bugs
    for (let i = 0; i < numBugs; i++) {
        createBug(elements.bugsContainer, bugOptions, safeZone, gameState, elements);
    }
    
    // Set up event listeners
    setupEventListeners(elements, safeZone, gameState, bugOptions);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const updatedSafeZone = calculateSafeZone(elements);
        Object.assign(safeZone, updatedSafeZone);
    });
}

/**
 * Calculate the safe zone where bugs shouldn't spawn
 * @param {Object} elements - DOM elements
 * @returns {Object} Safe zone boundaries
 */
function calculateSafeZone(elements) {
    const contentRect = elements.contentArea.getBoundingClientRect();
    const safeZoneExtension = 80;
    
    const safeZone = {
        top: Math.max(0, contentRect.top - safeZoneExtension),
        bottom: Math.min(window.innerHeight, contentRect.bottom + safeZoneExtension),
        left: Math.max(0, contentRect.left - safeZoneExtension),
        right: Math.min(window.innerWidth, contentRect.right + safeZoneExtension),
    };
    
    // Extend safe zone to include report link
    if (elements.reportLink) {
        const reportRect = elements.reportLink.getBoundingClientRect();
        safeZone.bottom = Math.max(safeZone.bottom, reportRect.bottom + 30);
    }
    
    return safeZone;
}

/**
 * Check if a position is within the safe zone
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} safeZone - Safe zone boundaries
 * @returns {boolean} True if position is in safe zone
 */
function isInSafeZone(x, y, safeZone) {
    return (
        x > safeZone.left && 
        x < safeZone.right && 
        y > safeZone.top && 
        y < safeZone.bottom
    );
}

/**
 * Create a bug element and add it to the container
 * @param {HTMLElement} container - Container for bugs
 * @param {Array} bugOptions - Bug configuration options
 * @param {Object} safeZone - Safe zone boundaries
 * @param {Object} gameState - Game state variables
 * @param {Object} elements - DOM elements
 */
function createBug(container, bugOptions, safeZone, gameState, elements) {
    // Create bug element
    const bug = document.createElement('div');
    
    // Select bug type (rare bug has 5% chance)
    const randomOption = bugOptions[Math.random() < 0.05 ? 5 : Math.floor(Math.random() * 5)];
    bug.dataset.points = randomOption.points;
    bug.dataset.type = randomOption.iconId;
    
    // Find position outside safe zone
    let xPos, yPos;
    do {
        xPos = Math.random() * window.innerWidth;
        yPos = Math.random() * window.innerHeight;
    } while (isInSafeZone(xPos, yPos, safeZone));
    
    // Randomize appearance
    const size = Math.random() * 1.2 + 0.6; 
    const delay = Math.random() * 2; 
    
    // Set bug properties
    bug.className = `bug absolute ${randomOption.color} opacity-70 transition-transform duration-300 pointer-events-auto`;
    bug.style.left = `${xPos}px`;
    bug.style.top = `${yPos}px`;
    bug.style.width = `${size * 24}px`;
    bug.style.height = `${size * 24}px`;
    bug.style.transform = `rotate(${Math.random() * 360}deg)`;
    bug.style.animationDelay = `${delay}s`;
    bug.style.zIndex = Math.floor(size * 10);
    
    // Create SVG icon
    bug.innerHTML = `
        <svg width="100%" height="100%" class="bug-svg">
            <use href="sprite.svg#${randomOption.iconId}" />
        </svg>
    `;
    
    // Add click handler
    bug.addEventListener('click', (e) => handleBugClick(e, bug, container, bugOptions, safeZone, gameState, elements));
    
    // Add to container and start animation
    container.appendChild(bug);
    animateBug(bug, safeZone);
}

/**
 * Handle bug click event
 * @param {Event} e - Click event
 * @param {HTMLElement} bug - Bug element
 * @param {HTMLElement} container - Container for bugs
 * @param {Array} bugOptions - Bug configuration options
 * @param {Object} safeZone - Safe zone boundaries
 * @param {Object} gameState - Game state variables
 * @param {Object} elements - DOM elements
 */
function handleBugClick(e, bug, container, bugOptions, safeZone, gameState, elements) {
    const now = Date.now();
    const timeSinceLastCatch = now - gameState.lastCatchTime;
    
    // Update combo system
    if (timeSinceLastCatch < 1000) { // 1 second window for combos
        gameState.combo++;
        if (gameState.combo > 2) {
            showComboMessage(gameState.combo);
        }
    } else {
        gameState.combo = 1;
    }
    gameState.lastCatchTime = now;

    // Handle bug effects based on type
    const bugType = bugOptions.find(opt => opt.iconId === bug.dataset.type);
    if (bugType) {
        switch(bugType.type) {
            case 'speed':
                applySpeedEffect(gameState);
                SoundEffects.play('boing');
                break;
            case 'bonus':
                const bonusPoints = gameState.combo > 2 ? bugType.points * gameState.combo : bugType.points;
                gameState.score += bonusPoints;
                showBonusMessage(bonusPoints);
                SoundEffects.play('levelUp');
                break;
            case 'danger':
                gameState.score = Math.max(0, gameState.score + bugType.points);
                showDangerMessage();
                break;
            default:
                const points = gameState.combo > 2 ? 
                    bugType.points * Math.min(gameState.combo, 5) : 
                    bugType.points;
                gameState.score += points;
                SoundEffects.play('pop');
        }
    }

    // Update display
    elements.scoreElement.textContent = gameState.score;
    scoreAnnouncer.textContent = `Score: ${gameState.score}. Level: ${gameState.level}.`;

    // Activate game if first click
    if (!gameState.active) {
        gameState.active = true;
        elements.gameScore.classList.add('active');
    }
    
    // Update progress to next level
    const points = parseInt(bug.dataset.points);
    gameState.progressToNextLevel = (gameState.score % 100);
    if (elements.progressBar) {
        elements.progressBar.style.width = `${gameState.progressToNextLevel}%`;
    }

    // Level up check with enhanced animation
    const newLevel = Math.floor(gameState.score / 100) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        elements.levelElement.textContent = gameState.level;
        showLevelUpAnimation();
        SoundEffects.play('levelUp');
        createConfetti();
    }

    // Update best score if needed
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('bestScore', gameState.bestScore);
        elements.bestScoreElement.textContent = gameState.bestScore;
    }

    // Squash animation
    bug.classList.add('squashed');
    
    // Remove bug and create a new one
    setTimeout(() => {
        if (container.contains(bug)) {
            container.removeChild(bug);
            createBug(container, bugOptions, safeZone, gameState, elements);
        }
    }, 1000);
    
    e.stopPropagation();
}

function showComboMessage(combo) {
    const message = document.createElement('div');
    message.className = 'fixed top-1/4 left-1/2 transform -translate-x-1/2 text-yellow-300 text-2xl font-bold z-50';
    message.textContent = `${combo}x COMBO!`;
    document.body.appendChild(message);

    message.animate([
        { transform: 'translate(-50%, 0) scale(0.8)', opacity: 0 },
        { transform: 'translate(-50%, -20px) scale(1.2)', opacity: 1 },
        { transform: 'translate(-50%, -40px) scale(1)', opacity: 0 }
    ], {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => message.remove();
}

/**
 * Animate a bug element with natural movement
 * @param {HTMLElement} bug - Bug element to animate
 * @param {Object} safeZone - Safe zone boundaries
 */
function animateBug(bug, safeZone) {
    // Initial position from current style
    let pos = {
        x: parseFloat(bug.style.left),
        y: parseFloat(bug.style.top)
    };
    
    // Random velocity
    let velocity = {
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5
    };
    
    // Size animation parameters
    const baseSize = parseFloat(bug.style.fontSize);
    let size = baseSize;
    let sizeDirection = Math.random() > 0.5 ? 0.005 : -0.005;
    
    // Rotation animation parameters
    let rotation = Math.random() * 360;
    let rotationSpeed = (Math.random() - 0.5) * 2;
    
    // Direction change parameters
    let directionChangeTimer = 0;
    let directionChangePeriod = Math.random() * 200 + 100; 
    
    // Animation frame function
    function applyMotion() {
        // Update position
        pos.x += velocity.x;
        pos.y += velocity.y;
        
        // Update rotation
        rotation += rotationSpeed;
        
        // Update size with breathing effect
        size += sizeDirection;
        if (size > baseSize * 1.15 || size < baseSize * 0.85) {
            sizeDirection *= -1;
        }
        
        // Bug collision box
        const bugRect = {
            left: pos.x,
            right: pos.x + 20, 
            top: pos.y,
            bottom: pos.y + 20 
        };
        
        // Bounce off screen edges
        if (pos.x < 0 || pos.x > window.innerWidth - 20) {
            velocity.x *= -1;
            rotationSpeed = (Math.random() - 0.5) * 2; 
        }
        
        if (pos.y < 0 || pos.y > window.innerHeight - 20) {
            velocity.y *= -1;
            rotationSpeed = (Math.random() - 0.5) * 2;
        }
        
        // Avoid safe zone
        if (
            bugRect.right > safeZone.left &&
            bugRect.left < safeZone.right &&
            bugRect.bottom > safeZone.top &&
            bugRect.top < safeZone.bottom
        ) {
            // Calculate distances to each edge of safe zone
            const distToLeft = Math.abs(bugRect.right - safeZone.left);
            const distToRight = Math.abs(bugRect.left - safeZone.right);
            const distToTop = Math.abs(bugRect.bottom - safeZone.top);
            const distToBottom = Math.abs(bugRect.top - safeZone.bottom);
            
            // Find closest edge and move away from it
            const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
            
            if (minDist === distToLeft) {
                velocity.x = -Math.abs(velocity.x) - 0.5;
            } else if (minDist === distToRight) {
                velocity.x = Math.abs(velocity.x) + 0.5;
            } else if (minDist === distToTop) {
                velocity.y = -Math.abs(velocity.y) - 0.5;
            } else if (minDist === distToBottom) {
                velocity.y = Math.abs(velocity.y) + 0.5;
            }
            
            // Limit maximum speed
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (speed > 3) {
                velocity.x = (velocity.x / speed) * 3;
                velocity.y = (velocity.y / speed) * 3;
            }
        }
        
        // Occasionally change direction for more natural movement
        directionChangeTimer++;
        if (directionChangeTimer > directionChangePeriod) {
            velocity.x += (Math.random() - 0.5) * 0.5;
            velocity.y += (Math.random() - 0.5) * 0.5;
            
            // Limit speed after direction change
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (speed > 2) {
                velocity.x = (velocity.x / speed) * 2;
                velocity.y = (velocity.y / speed) * 2;
            }
            
            directionChangeTimer = 0;
            directionChangePeriod = Math.random() * 200 + 100;
        }
        
        // Apply updated styles
        bug.style.left = `${pos.x}px`;
        bug.style.top = `${pos.y}px`;
        bug.style.transform = `rotate(${rotation}deg)`;
        bug.style.fontSize = `${size}em`;
        
        // Continue animation if bug is not squashed
        if (!bug.classList.contains('squashed') && bug.isConnected) {
            requestAnimationFrame(applyMotion);
        }
    }
    
    // Start animation
    requestAnimationFrame(applyMotion);
}

/**
 * Set up event listeners for game interactions
 * @param {Object} elements - DOM elements
 * @param {Object} safeZone - Safe zone boundaries
 * @param {Object} gameState - Game state variables
 * @param {Array} bugOptions - Bug configuration options
 */
function setupEventListeners(elements, safeZone, gameState, bugOptions) {
    // Home button hover effect to scare bugs away
    if (elements.homeButton) {
        elements.homeButton.addEventListener('mouseenter', () => {
            const bugs = document.querySelectorAll('#bugs-container .bug');
            const buttonRect = elements.homeButton.getBoundingClientRect();
            const buttonCenter = {
                x: buttonRect.left + buttonRect.width / 2,
                y: buttonRect.top + buttonRect.height / 2
            };
            
            bugs.forEach(bug => {
                if (bug.classList.contains('squashed')) return;
                
                const bugRect = bug.getBoundingClientRect();
                const bugCenter = {
                    x: bugRect.left + bugRect.width / 2,
                    y: bugRect.top + bugRect.height / 2
                };
                
                const dx = bugCenter.x - buttonCenter.x;
                const dy = bugCenter.y - buttonCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 300) {
                    const angle = Math.atan2(dy, dx);
                    const magnitude = Math.max(30, (300 - distance)) / 3;
                    
                    const moveX = Math.cos(angle) * magnitude;
                    const moveY = Math.sin(angle) * magnitude;
                    
                    bug.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
                    bug.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + magnitude/100})`;
                    
                    setTimeout(() => {
                        if (!bug.classList.contains('squashed')) {
                            bug.style.transition = 'transform 0.5s ease-out';
                            bug.style.transform = '';
                        }
                    }, 800);
                }
            });
        });
    }
    
    // Keyboard controls - Space to catch nearest bug
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameState.active) {
            e.preventDefault();
            catchNearestBug(elements.bugsContainer, bugOptions, safeZone, gameState, elements);
        }
    });
}

/**
 * Catch the nearest bug to the center of the screen
 * @param {HTMLElement} container - Container for bugs
 * @param {Array} bugOptions - Bug configuration options
 * @param {Object} safeZone - Safe zone boundaries
 * @param {Object} gameState - Game state variables
 * @param {Object} elements - DOM elements
 */
function catchNearestBug(container, bugOptions, safeZone, gameState, elements) {
    const bugs = document.querySelectorAll('#bugs-container .bug:not(.squashed)');
    if (bugs.length === 0) return;
    
    const screenCenter = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
    
    let nearestBug = null;
    let shortestDistance = Infinity;
    
    bugs.forEach(bug => {
        const rect = bug.getBoundingClientRect();
        const bugCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        const dx = bugCenter.x - screenCenter.x;
        const dy = bugCenter.y - screenCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestBug = bug;
        }
    });
    
    if (nearestBug) {
        // Simulate a click on the nearest bug
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        nearestBug.dispatchEvent(clickEvent);
    }
}

/**
 * Show level up animation
 */
function showLevelUpAnimation() {
    const levelUpMessage = document.createElement('div');
    levelUpMessage.className = 'level-up-message';
    levelUpMessage.textContent = 'LEVEL UP!';
    levelUpMessage.style.position = 'fixed';
    levelUpMessage.style.top = '50%';
    levelUpMessage.style.left = '50%';
    levelUpMessage.style.transform = 'translate(-50%, -50%)';
    levelUpMessage.style.color = 'var(--text-color)';
    levelUpMessage.style.fontSize = '3rem';
    levelUpMessage.style.fontWeight = 'bold';
    levelUpMessage.style.zIndex = '100';
    levelUpMessage.style.textShadow = '0 0 10px var(--text-glow-color)';
    levelUpMessage.style.animation = 'levelUp 1.5s ease-out forwards';
    
    document.body.appendChild(levelUpMessage);
    
    setTimeout(() => {
        document.body.removeChild(levelUpMessage);
    }, 1500);
}

/**
 * Play sound effect (placeholder function)
 */
function playSound() {
    // Sound functionality could be implemented here
    return;
}

/**
 * Apply speed effect to bugs
 * @param {Object} gameState - Game state variables
 */
function applySpeedEffect(gameState) {
    const bugs = document.querySelectorAll('.bug:not(.squashed)');
    bugs.forEach(bug => {
        bug.style.transition = 'all 0.5s ease-in-out';
        bug.style.animationDuration = '3s';
        
        setTimeout(() => {
            if (!bug.classList.contains('squashed')) {
                bug.style.animationDuration = '';
            }
        }, 3000);
    });
}

/**
 * Show bonus points message
 * @param {number} points - Number of bonus points earned
 */
function showBonusMessage(points) {
    const message = document.createElement('div');
    message.className = 'fixed top-1/3 left-1/2 transform -translate-x-1/2 text-green-400 text-2xl font-bold z-50';
    message.textContent = `+${points} BONUS!`;
    document.body.appendChild(message);

    message.animate([
        { transform: 'translate(-50%, 0) scale(0.8)', opacity: 0 },
        { transform: 'translate(-50%, -20px) scale(1.2)', opacity: 1, color: 'var(--text-color)' },
        { transform: 'translate(-50%, -40px) scale(1)', opacity: 0 }
    ], {
        duration: 1200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => message.remove();
}

/**
 * Show danger message when hitting dangerous bug
 */
function showDangerMessage() {
    const message = document.createElement('div');
    message.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-2xl font-bold z-50';
    message.textContent = 'OUCH!';
    document.body.appendChild(message);

    // Add screen shake effect
    document.body.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);

    message.animate([
        { transform: 'translate(-50%, 0) scale(0.8)', opacity: 0 },
        { transform: 'translate(-50%, -20px) scale(1.2)', opacity: 1 },
        { transform: 'translate(-50%, -40px) scale(1)', opacity: 0 }
    ], {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => message.remove();
}

// Add shake animation to styles if not present
if (!document.querySelector('#shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = `
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
    `;
    document.head.appendChild(style);
}

// Konami Code Easter Egg
let konamiCode = '';
const validCode = 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';

document.addEventListener('keydown', (e) => {
    konamiCode += e.key;
    if (konamiCode.length > validCode.length) {
        konamiCode = konamiCode.slice(1);
    }
    
    if (konamiCode.includes(validCode)) {
        activateKonamiCode();
        konamiCode = '';
    }
});

function activateKonamiCode() {
    document.body.classList.add('rainbow-mode');
    SoundEffects.play('levelUp');
    
    const message = document.createElement('div');
    message.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold z-50 rainbow-text';
    message.textContent = '🌈 RAINBOW MODE ACTIVATED! 🌈';
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 3000);
    
    // Double points for 30 seconds
    const originalPoints = [...bugOptions];
    bugOptions.forEach(bug => bug.points *= 2);
    
    setTimeout(() => {
        document.body.classList.remove('rainbow-mode');
        bugOptions.forEach((bug, i) => bug.points = originalPoints[i].points);
    }, 30000);
}

// Add confetti effect for level up
function createConfetti() {
    const colors = ['#fcd34d', '#a855f7', '#34d399', '#60a5fa'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'particle';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
        const endX = startX + (Math.random() - 0.5) * 400;
        
        confetti.style.backgroundColor = color;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.position = 'fixed';
        confetti.style.top = '50%';
        confetti.style.left = `${startX}px`;
        confetti.style.zIndex = '100';
        
        document.body.appendChild(confetti);
        
        confetti.animate([
            { 
                transform: 'translate(0, 0) rotate(0deg)', 
                opacity: 1 
            },
            { 
                transform: `translate(${endX - startX}px, ${Math.random() * 400 + 200}px) rotate(${Math.random() * 360}deg)`,
                opacity: 0
            }
        ], {
            duration: 1000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => confetti.remove();
    }
}
