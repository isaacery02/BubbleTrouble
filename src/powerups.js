// Power-up system

const POWER_UP_TYPES = [
    'rapid_fire',
    'wide_shot',
    'shield',
    'extra_life',
    'slowBubbles',
    'fastBullets'
];

function createPowerUp(x, y) {
    const type = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
    const powerUp = {
        x: x - 15,
        y: y - 15,
        width: 30,
        height: 30,
        type,
        dx: (Math.random() - 0.5) * 4,
        dy: -Math.random() * 3 - 1,
        pulsePhase: Math.random() * Math.PI * 2,
        fadeStartTime: null,
        createdAt: Date.now(),
        lifeTime: 15000
    };
    powerUps.push(powerUp);
    console.log(`Created ${type} power-up at (${x}, ${y})`);
}

function updatePowerUps() {
    // Update power-up physics and animations
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        
        // Update animation
        if (powerUp.pulsePhase !== undefined) {
            powerUp.pulsePhase += 0.1;
        }
        
        // Apply physics - movement and gravity
        powerUp.x += powerUp.dx;
        powerUp.y += powerUp.dy;
        powerUp.dy += 0.5; // Gravity
        powerUp.dx *= 0.98; // Air resistance
        
        // Bounce off canvas edges
        if (powerUp.x <= 0 || powerUp.x + powerUp.width >= canvas.width) {
            powerUp.dx *= -0.7;
            powerUp.x = Math.max(0, Math.min(canvas.width - powerUp.width, powerUp.x));
        }
        
        // Bounce off ground
        if (powerUp.y + powerUp.height >= canvas.height) {
            powerUp.y = canvas.height - powerUp.height;
            powerUp.dy *= -0.6;
            powerUp.dx *= 0.8;
            
            // Stop bouncing if velocity is too low
            if (Math.abs(powerUp.dy) < 1) {
                powerUp.dy = 0;
            }
        }
        
        // Remove power-ups that are too old
        if (Date.now() - powerUp.createdAt > powerUp.lifeTime) {
            powerUps.splice(i, 1);
            continue;
        }
    }
    
    // REMOVE THIS LINE - collision detection happens in collision.js
    // checkPowerUpCollisions();
    
    // Handle power-up expiration for players
    players.forEach(player => {
        if (player.powerUpEndTime && Date.now() > player.powerUpEndTime) {
            removePowerUp(player);
            console.log(`Power-up ${player.activePowerUp} expired for player ${player.id}`);
        }
    });
}

function drawPowerUps() {
    powerUps.forEach(p => {
        if (p.x === undefined || p.y === undefined || !p.width || !p.height || !p.type) return;
        const centerX = p.x + p.width / 2, centerY = p.y + p.height / 2;
        const pulseSize = 2 + Math.sin(p.pulsePhase) * 3;
        const baseSize = p.width / 2, currentRadius = baseSize + pulseSize;
        if (!isFinite(centerX) || !isFinite(centerY) || !isFinite(currentRadius) || currentRadius <= 0) return;

        // Color and symbol
        let color = '#4ecdc4', glowColor = 'rgba(78,205,196,0.5)', symbol = '?';
        switch (p.type) {
            case 'rapid_fire': color = '#ff6b6b'; glowColor = 'rgba(255,107,107,0.5)'; symbol = 'R'; break;
            case 'wide_shot': color = '#4ecdc4'; glowColor = 'rgba(78,205,196,0.5)'; symbol = 'W'; break;
            case 'shield': color = '#45b7d1'; glowColor = 'rgba(69,183,209,0.5)'; symbol = 'S'; break;
            case 'extra_life': color = '#f9ca24'; glowColor = 'rgba(249,202,36,0.5)'; symbol = 'L'; break;
            case 'slowBubbles': color = '#b388ff'; glowColor = 'rgba(179,136,255,0.5)'; symbol = '⏳'; break;
            case 'fastBullets': color = '#ffb300'; glowColor = 'rgba(255,179,0,0.5)'; symbol = 'F'; break;
        }

        try {
            const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius + 8);
            glowGradient.addColorStop(0, glowColor);
            glowGradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius + 8, 0, Math.PI * 2);
            ctx.fill();

            const bodyGradient = ctx.createRadialGradient(centerX - currentRadius * 0.3, centerY - currentRadius * 0.3, 0, centerX, centerY, currentRadius);
            bodyGradient.addColorStop(0, color);
            bodyGradient.addColorStop(1, color + '88');
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            ctx.fill();
        } catch {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.fillText(symbol, centerX, centerY);
        ctx.restore();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function checkPowerUpCollisions() {
    players.forEach(playerObj => {
        if (!playerObj.active) return;
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const p = powerUps[i];
            if (playerCollidesWithPowerUp(playerObj, p)) {
                collectPowerUp(playerObj, p);
                powerUps.splice(i, 1);
            }
        }
    });
}

function playerCollidesWithPowerUp(player, p) {
    return player.x < p.x + p.width && player.x + player.width > p.x &&
           player.y < p.y + p.height && player.y + player.height > p.y;
}

function collectPowerUp(player, powerUp) {
    console.log('Powerup collected:', powerUp.type); // Debug line
    
    // Add debugging for sound function
    console.log('playSound function exists:', typeof playSound);
    console.log('playSound function:', playSound);
    
    applyPowerUp(player, powerUp.type);
    
    if (typeof playSound === 'function') {
        console.log('Attempting to play powerup sound...');
        playSound('powerup');
        console.log('playSound called');
    } else {
        console.error('playSound is not a function!', typeof playSound);
    }
}

function applyPowerUp(player, type) {
    console.log(`Applying powerup ${type} to Player ${player.id}`);
    
    // Clear any existing power-up first
    if (player.activePowerUp) {
        removePowerUp(player);
    }
    
    switch (type) {
        case 'rapid_fire':
            player.shootCooldown = 80;
            player.maxProjectiles = RAPID_FIRE_MAX_PROJECTILES;
            player.activePowerUp = type;
            player.powerUpEndTime = Date.now() + POWER_UP_DURATION;
            break;
            
        case 'wide_shot':
            player.currentProjectileWidth = PROJECTILE_WIDTH * 5;
            player.activePowerUp = type;
            player.powerUpEndTime = Date.now() + POWER_UP_DURATION;
            break;
            
        case 'shield':
            player.hasShield = true;
            player.activePowerUp = type;
            player.powerUpEndTime = Date.now() + POWER_UP_DURATION;
            break;
            
        case 'extra_life':
            player.lives++;
            // Extra life is instant, no timer needed
            console.log(`Player ${player.id} gained extra life, now has ${player.lives} lives`);
            return; // Exit early for instant powerup
            
        case 'slowBubbles':
            slowAllBubbles();
            setTimeout(resetBubbleSpeedEffect, POWER_UP_DURATION);
            player.activePowerUp = type;
            player.powerUpEndTime = Date.now() + POWER_UP_DURATION;
            break;
            
        case 'fastBullets':
            player.projectileSpeedMultiplier = 10; // 10x faster bullets
            setTimeout(() => { player.projectileSpeedMultiplier = 1; }, POWER_UP_DURATION);
            player.activePowerUp = type;
            player.powerUpEndTime = Date.now() + POWER_UP_DURATION;
            break;
    }
    
    // Show power-up timer if it has duration
    if (player.powerUpEndTime && typeof showPowerUpTimer === 'function') {
        showPowerUpTimer(player, type);
        console.log(`Timer shown for ${type} powerup`);
    } else {
        console.log('No timer shown - either no end time or showPowerUpTimer function missing');
    }
}

function removePowerUp(player) {
    const powerUpType = player.activePowerUp;
    console.log(`Removing powerup ${powerUpType} from Player ${player.id}`);
    
    player.activePowerUp = null;
    player.powerUpEndTime = null;
    player.hasShield = false;
    player.shootCooldown = 250;
    player.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    player.currentProjectileWidth = PROJECTILE_WIDTH;
    player.projectileSpeedMultiplier = 1;
    
    // Clear timer interval
    if (player.timerInterval) {
        clearInterval(player.timerInterval);
        player.timerInterval = null;
    }
    
    // Clear any existing timer
    if (player.powerUpTimer) {
        clearTimeout(player.powerUpTimer);
        player.powerUpTimer = null;
    }
    
    // Hide powerup timer UI
    hidePowerUpTimer(player.id);
    
    console.log(`Powerup ${powerUpType} removed and timer cleared for Player ${player.id}`);
}

function slowAllBubbles() {
    bubbles.forEach(b => {
        b.dx *= 0.4;
        b.dy *= 0.4;
    });
    window._bubblesSlowed = true;
}

function resetBubbleSpeedEffect() {
    if (window._bubblesSlowed) {
        bubbles.forEach(b => {
            b.dx *= 2.5;
            b.dy *= 2.5;
        });
        window._bubblesSlowed = false;
    }
}

function showPowerUpTimer(player, powerUpType) {
    console.log(`=== Showing powerup timer for Player ${player.id}: ${powerUpType} ===`);
    
    // Remove any existing timer for this player first
    hidePowerUpTimer(player.id);
    
    const timerElement = document.createElement('div');
    timerElement.className = 'powerup-timer';
    timerElement.id = `powerup-timer-${player.id}`;
    
    const powerUpName = getPowerUpDisplayName(powerUpType);
    const powerUpColor = getPowerUpColor(powerUpType);
    
    timerElement.innerHTML = `
        <div class="powerup-timer-content">
            <div class="powerup-details">
                <div class="powerup-name">${powerUpName}</div>
                <div class="powerup-time">10.0s</div>
            </div>
            <div class="powerup-player">Player ${player.id}</div>
            <div class="powerup-progress">
                <div class="powerup-progress-bar" style="width: 100%; background: ${powerUpColor};"></div>
            </div>
        </div>
    `;
    
    // Add to document body - positioning is handled by CSS
    document.body.appendChild(timerElement);
    
    // Force reflow to ensure element is rendered
    timerElement.offsetHeight;
    
    console.log('Timer element created and positioned:');
    console.log('- Element:', timerElement);
    console.log('- Position:', timerElement.getBoundingClientRect());
    console.log('- Computed styles:', {
        position: window.getComputedStyle(timerElement).position,
        top: window.getComputedStyle(timerElement).top,
        left: window.getComputedStyle(timerElement).left,
        right: window.getComputedStyle(timerElement).right,
        zIndex: window.getComputedStyle(timerElement).zIndex,
        display: window.getComputedStyle(timerElement).display,
        visibility: window.getComputedStyle(timerElement).visibility
    });
    
    // Start the timer update interval
    player.timerInterval = setInterval(() => {
        updatePowerUpTimerDisplay(player, powerUpType);
    }, 100);
    
    return timerElement;
}

// Add this debug function to test the timer display
function debugPowerUpTimer() {
    console.log('=== Debug Powerup Timer ===');
    
    // Create a test timer without needing a real powerup
    const testPlayer = { id: 1, powerUpEndTime: Date.now() + 10000 };
    
    const timerElement = document.createElement('div');
    timerElement.className = 'powerup-timer';
    timerElement.id = 'debug-timer';
    
    timerElement.innerHTML = `
        <div class="powerup-timer-content">
            <div class="powerup-details">
                <div class="powerup-name">Debug Timer</div>
                <div class="powerup-time">10.0s</div>
                <div class="powerup-player">Player 1</div>
            </div>
            <div class="powerup-progress">
                <div class="powerup-progress-bar" style="width: 100%; background: #ff6b6b;"></div>
            </div>
        </div>
    `;
    
    timerElement.style.cssText = `
        position: fixed !important;
        top: 120px !important;
        left: 20px !important;
        background: linear-gradient(135deg, rgba(22, 33, 62, 0.95) 0%, rgba(83, 52, 131, 0.95) 100%) !important;
        border: 2px solid rgba(83, 52, 131, 0.8) !important;
        border-radius: 12px !important;
        padding: 12px 16px !important;
        color: white !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        z-index: 999 !important;
        backdrop-filter: blur(10px) !important;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6) !important;
        min-width: 200px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    
    document.body.appendChild(timerElement);
    
    console.log('Debug timer created:', timerElement);
    console.log('Timer in DOM:', document.getElementById('debug-timer'));
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (timerElement.parentNode) {
            timerElement.parentNode.removeChild(timerElement);
        }
    }, 5000);
}

function createTestTimer() {
    console.log('Creating test timers for both players...');
    
    // Remove any existing test timers
    document.querySelectorAll('[id^="test-timer"]').forEach(el => el.remove());
    
    // Create test timer for Player 1 (left side)
    const testTimer1 = document.createElement('div');
    testTimer1.id = 'test-timer-1';
    testTimer1.className = 'powerup-timer';
    testTimer1.innerHTML = `
        <div class="powerup-timer-content">
            <div class="powerup-details">
                <div class="powerup-name">🔥 Test Timer</div>
                <div class="powerup-time">5.0s</div>
            </div>
            <div class="powerup-player">Player 1</div>
            <div class="powerup-progress">
                <div class="powerup-progress-bar" style="width: 100%; background: #ff6b6b;"></div>
            </div>
        </div>
    `;
    
    testTimer1.style.cssText = `
        position: fixed !important;
        top: 140px !important;
        left: 20px !important;
        background: linear-gradient(135deg, rgba(22, 33, 62, 0.95), rgba(83, 52, 131, 0.95)) !important;
        border: 2px solid rgba(83, 52, 131, 0.8) !important;
        border-radius: 20px !important;
        padding: 16px 20px !important;
        color: white !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        z-index: 9999 !important;
        backdrop-filter: blur(15px) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(83, 52, 131, 0.4) !important;
        min-width: 240px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    
    // Create test timer for Player 2 (right side)
    const testTimer2 = document.createElement('div');
    testTimer2.id = 'test-timer-2';
    testTimer2.className = 'powerup-timer';
    testTimer2.innerHTML = `
        <div class="powerup-timer-content">
            <div class="powerup-details">
                <div class="powerup-name">⚡ Test Timer</div>
                <div class="powerup-time">5.0s</div>
            </div>
            <div class="powerup-player">Player 2</div>
            <div class="powerup-progress">
                <div class="powerup-progress-bar" style="width: 100%; background: #4ecdc4;"></div>
            </div>
        </div>
    `;
    
    testTimer2.style.cssText = `
        position: fixed !important;
        top: 140px !important;
        right: 20px !important;
        background: linear-gradient(135deg, rgba(22, 33, 62, 0.95), rgba(83, 52, 131, 0.95)) !important;
        border: 2px solid rgba(83, 52, 131, 0.8) !important;
        border-radius: 20px !important;
        padding: 16px 20px !important;
        color: white !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        z-index: 9999 !important;
        backdrop-filter: blur(15px) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(83, 52, 131, 0.4) !important;
        min-width: 240px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    
    document.body.appendChild(testTimer1);
    document.body.appendChild(testTimer2);
    
    console.log('Test timers created:');
    console.log('- Left timer (Player 1):', testTimer1.getBoundingClientRect());
    console.log('- Right timer (Player 2):', testTimer2.getBoundingClientRect());
    
    // Remove after 5 seconds
    setTimeout(() => {
        testTimer1.remove();
        testTimer2.remove();
        console.log('Test timers removed');
    }, 5000);
    
    return { testTimer1, testTimer2 };
}

function hidePowerUpTimer(playerId = null) {
    if (playerId) {
        // Hide specific player's timer
        const timer = document.getElementById(`powerup-timer-${playerId}`);
        if (timer) {
            timer.style.opacity = '0';
            timer.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                if (timer.parentNode) {
                    timer.parentNode.removeChild(timer);
                }
            }, 300);
        }
    } else {
        // Hide all timers
        const timers = document.querySelectorAll('.powerup-timer:not([id^="test-timer"])');
        timers.forEach(timer => {
            timer.style.opacity = '0';
            timer.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                if (timer.parentNode) {
                    timer.parentNode.removeChild(timer);
                }
            }, 300);
        });
    }
    
    // Clear intervals for players
    if (typeof player1 !== 'undefined' && player1.timerInterval) {
        clearInterval(player1.timerInterval);
        player1.timerInterval = null;
    }
    if (typeof player2 !== 'undefined' && player2.timerInterval) {
        clearInterval(player2.timerInterval);
        player2.timerInterval = null;
    }
}

function updatePowerUpTimerDisplay(player, powerUpType) {
    const timerElement = document.getElementById(`powerup-timer-${player.id}`);
    if (!timerElement || !player.powerUpEndTime) {
        if (player.timerInterval) {
            clearInterval(player.timerInterval);
            player.timerInterval = null;
        }
        return;
    }
    
    const timeLeft = Math.max(0, (player.powerUpEndTime - Date.now()) / 1000);
    
    // Get the total duration for this powerup type
    let totalDuration = POWER_UP_DURATION / 1000; // Convert to seconds
    
    const progress = Math.max(0, (timeLeft / totalDuration) * 100);
    
    const timeDisplay = timerElement.querySelector('.powerup-time');
    const progressBar = timerElement.querySelector('.powerup-progress-bar');
    
    if (timeDisplay) {
        timeDisplay.textContent = `${timeLeft.toFixed(1)}s`;
    }
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        
        // Change color when time is running out
        if (timeLeft < 3) {
            progressBar.style.background = '#ef4444';
            timerElement.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.6)';
        } else {
            progressBar.style.background = getPowerUpColor(powerUpType);
            timerElement.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(83, 52, 131, 0.4)';
        }
    }
    
    // Hide when expired
    if (timeLeft <= 0) {
        clearInterval(player.timerInterval);
        player.timerInterval = null;
        hidePowerUpTimer(player.id);
    }
}

function getPowerUpDisplayName(type) {
    const names = {
        'rapid_fire': 'Rapid Fire',
        'wide_shot': 'Wide Shot',
        'shield': 'Shield',
        'extra_life': 'Extra Life',
        'slowBubbles': 'Slow Bubbles',
        'fastBullets': 'Fast Bullets'
    };
    return names[type] || 'Power Up';
}

function getPowerUpColor(type) {
    const colors = {
        'rapid_fire': '#ff6b6b',
        'wide_shot': '#4ecdc4',
        'shield': '#45b7d1',
        'extra_life': '#f9ca24',
        'slowBubbles': '#b388ff',
        'fastBullets': '#10b981'
    };
    return colors[type] || '#4ecdc4';
}

console.log("=== POWERUPS.JS LOADED ===");