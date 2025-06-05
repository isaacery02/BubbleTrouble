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
    
    // Check for power-up collisions
    checkPowerUpCollisions();
    
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
    switch (type) {
        case 'rapid_fire':
            player.shootCooldown = 100;
            player.maxProjectiles = RAPID_FIRE_MAX_PROJECTILES;
            break;
        case 'wide_shot':
            player.currentProjectileWidth = PROJECTILE_WIDTH * 3;
            break;
        case 'shield':
            player.hasShield = true;
            break;
        case 'extra_life':
            player.lives++;
            player.activePowerUp = null;
            player.powerUpEndTime = null;
            return;
        case 'slowBubbles':
            slowAllBubbles();
            setTimeout(resetBubbleSpeedEffect, POWER_UP_DURATION);
            break;
        case 'fastBullets':
            player.projectileSpeedMultiplier = 10; // 10x faster bullets
            setTimeout(() => { player.projectileSpeedMultiplier = 1; }, POWER_UP_DURATION);
            break;
    }
    player.activePowerUp = type;
    player.powerUpEndTime = Date.now() + POWER_UP_DURATION;
}

function removePowerUp(player) {
    player.activePowerUp = null;
    player.powerUpEndTime = null;
    player.hasShield = false;
    player.shootCooldown = 500;
    player.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    player.currentProjectileWidth = PROJECTILE_WIDTH;
    if (player.powerUpTimer) {
        clearTimeout(player.powerUpTimer);
        player.powerUpTimer = null;
    }
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

console.log("=== POWERUPS.JS LOADED ===");