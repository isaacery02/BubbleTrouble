// Power-up system - Fixed version

function createPowerUp(x, y) {
    const types = ['rapid_fire', 'wide_shot', 'shield'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const powerUp = {
        x: x - 15, // Center the power-up
        y: y - 15,
        width: 30,
        height: 30,
        type: randomType,
        dx: (Math.random() - 0.5) * 4, // Random horizontal velocity
        dy: -Math.random() * 3 - 1, // Upward initial velocity
        pulsePhase: Math.random() * Math.PI * 2,
        fadeStartTime: null,
        createdAt: Date.now(),
        lifeTime: 15000 // 15 seconds before disappearing
    };
    
    powerUps.push(powerUp);
    console.log(`Created ${randomType} power-up at (${x}, ${y})`);
}

function updatePowerUps() {
    // Update power-up timers for players
    [player1, player2].forEach(playerObj => {
        if (playerObj.activePowerUp && playerObj.powerUpEndTime) {
            const currentTime = Date.now();
            const timeLeft = playerObj.powerUpEndTime - currentTime;
            
            // Check if power-up has expired
            if (timeLeft <= 0) {
                console.log(`Power-up ${playerObj.activePowerUp} expired for player ${playerObj.id}`);
                removePowerUp(playerObj);
            }
        }
    });

    // Update power-up physics (make them fall and move)
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        
        // Ensure dx and dy exist (some power-ups might not have them)
        if (powerUp.dx === undefined) powerUp.dx = 0;
        if (powerUp.dy === undefined) powerUp.dy = 2;
        
        // Apply gravity to make power-ups fall
        powerUp.dy += 0.3; // Gravity
        
        // Update position
        powerUp.x += powerUp.dx;
        powerUp.y += powerUp.dy;
        
        // Bounce off floor
        if (powerUp.y + powerUp.height >= canvas.height) {
            powerUp.y = canvas.height - powerUp.height;
            powerUp.dy = -powerUp.dy * 0.6; // Bounce with some energy loss
            powerUp.dx *= 0.8; // Slow down horizontal movement
        }
        
        // Bounce off walls - ensure power-ups stay within bounds
        if (powerUp.x <= 0) {
            powerUp.x = 1; // Keep it slightly away from the edge to avoid validation issues
            powerUp.dx = Math.abs(powerUp.dx) * 0.7; // Ensure positive direction
        } else if (powerUp.x + powerUp.width >= canvas.width) {
            powerUp.x = canvas.width - powerUp.width - 1; // Keep it slightly away from the edge
            powerUp.dx = -Math.abs(powerUp.dx) * 0.7; // Ensure negative direction
        }
        
        // Remove power-ups that are expired or off-screen
        if (powerUp.y > canvas.height + 50 || 
            (powerUp.createdAt && Date.now() - powerUp.createdAt > powerUp.lifeTime)) {
            powerUps.splice(i, 1);
            console.log('Power-up removed (expired or off-screen)');
            continue;
        }
        
        // Remove power-ups that are moving too slowly and on the ground
        if (Math.abs(powerUp.dy) < 0.5 && powerUp.y + powerUp.height >= canvas.height - 5) {
            if (Math.abs(powerUp.dx) < 0.5) {
                // Power-up has settled, start fade timer if not already started
                if (!powerUp.fadeStartTime) {
                    powerUp.fadeStartTime = Date.now();
                }
                
                // Remove after 8 seconds of being settled
                if (Date.now() - powerUp.fadeStartTime > 8000) {
                    powerUps.splice(i, 1);
                    console.log('Power-up removed after settling');
                    continue;
                }
            }
        }
        
        // Update visual effects
        if (powerUp.pulsePhase !== undefined) {
            powerUp.pulsePhase += 0.1;
        } else {
            powerUp.pulsePhase = 0;
        }
    }
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        // Ensure all required properties exist - fix validation for x=0 and y=0
        if (powerUp.x === undefined || powerUp.y === undefined || 
            !powerUp.width || !powerUp.height || !powerUp.type) {
            console.warn('Invalid power-up properties:', powerUp);
            return;
        }
        
        const centerX = powerUp.x + powerUp.width / 2;
        const centerY = powerUp.y + powerUp.height / 2;
        
        // Ensure pulsePhase exists
        if (powerUp.pulsePhase === undefined) {
            powerUp.pulsePhase = 0;
        }
        
        // Pulsing effect
        const pulseSize = 2 + Math.sin(powerUp.pulsePhase) * 3;
        const baseSize = powerUp.width / 2;
        const currentRadius = baseSize + pulseSize;
        
        // Validate radius before creating gradient
        if (!isFinite(centerX) || !isFinite(centerY) || !isFinite(currentRadius) || currentRadius <= 0) {
            console.warn('Invalid gradient values:', { centerX, centerY, currentRadius });
            return;
        }
        
        // Get color based on type
        let color = '#4ecdc4'; // Default cyan
        let glowColor = 'rgba(78, 205, 196, 0.5)';
        
        switch (powerUp.type) {
            case 'rapid_fire':
                color = '#ff6b6b'; // Red
                glowColor = 'rgba(255, 107, 107, 0.5)';
                break;
            case 'wide_shot':
                color = '#4ecdc4'; // Cyan
                glowColor = 'rgba(78, 205, 196, 0.5)';
                break;
            case 'shield':
                color = '#45b7d1'; // Blue
                glowColor = 'rgba(69, 183, 209, 0.5)';
                break;
            case 'extra_life':
                color = '#f9ca24'; // Yellow
                glowColor = 'rgba(249, 202, 36, 0.5)';
                break;
        }
        
        try {
            // Draw outer glow
            const glowGradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, currentRadius + 8
            );
            glowGradient.addColorStop(0, glowColor);
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius + 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw main power-up body
            const bodyGradient = ctx.createRadialGradient(
                centerX - currentRadius * 0.3, centerY - currentRadius * 0.3, 0,
                centerX, centerY, currentRadius
            );
            bodyGradient.addColorStop(0, color);
            bodyGradient.addColorStop(1, color + '88');
            
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            ctx.fill();
            
        } catch (error) {
            console.error('Error drawing power-up gradients:', error);
            // Fallback to simple drawing
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw symbol based on type
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let symbol = '?';
        switch (powerUp.type) {
            case 'rapid_fire':
                symbol = 'R';
                break;
            case 'wide_shot':
                symbol = 'W';
                break;
            case 'shield':
                symbol = 'S';
                break;
            case 'extra_life':
                symbol = '+';
                break;
        }
        
        // Add text shadow for better visibility
        ctx.save();
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(symbol, centerX, centerY);
        ctx.restore();
        
        // Draw border
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
            const powerUp = powerUps[i];
            
            if (playerCollidesWithPowerUp(playerObj, powerUp)) {
                // Apply power-up effect
                applyPowerUp(playerObj, powerUp.type);
                
                // Remove power-up
                powerUps.splice(i, 1);
                console.log(`Player ${playerObj.id} collected ${powerUp.type} power-up!`);
                
                // Play power-up sound if available
                if (typeof playSound === 'function') {
                    playSound('powerup');
                }
            }
        }
    });
}

function playerCollidesWithPowerUp(playerObj, powerUp) {
    return playerObj.x < powerUp.x + powerUp.width &&
           playerObj.x + playerObj.width > powerUp.x &&
           playerObj.y < powerUp.y + powerUp.height &&
           playerObj.y + playerObj.height > powerUp.y;
}

function applyPowerUp(playerObj, powerUpType) {
    // Clear any existing power-up timer
    if (playerObj.powerUpTimer) {
        clearTimeout(playerObj.powerUpTimer);
        playerObj.powerUpTimer = null;
    }
    
    // Set the active power-up
    playerObj.activePowerUp = powerUpType;
    playerObj.powerUpEndTime = Date.now() + POWER_UP_DURATION;
    
    console.log(`Applying power-up: ${powerUpType} to player ${playerObj.id}`);
    
    switch (powerUpType) {
        case 'rapid_fire':
            playerObj.shootCooldown = 100; // Much faster shooting
            playerObj.maxProjectiles = RAPID_FIRE_MAX_PROJECTILES;
            break;
            
        case 'wide_shot':
            playerObj.currentProjectileWidth = PROJECTILE_WIDTH * 3; // Wider projectiles
            break;
            
        case 'shield':
            playerObj.hasShield = true;
            console.log(`Shield activated for player ${playerObj.id} until ${new Date(playerObj.powerUpEndTime).toLocaleTimeString()}`);
            break;
            
        case 'extra_life':
            playerObj.lives++;
            console.log(`Extra life granted to player ${playerObj.id}! Lives: ${playerObj.lives}`);
            // Extra life is instant, no timer needed
            playerObj.activePowerUp = null;
            playerObj.powerUpEndTime = null;
            return; // Don't set a timer for extra life
    }
    
    // Set timer to remove power-up (except for extra_life)
    playerObj.powerUpTimer = setTimeout(() => {
        removePowerUp(playerObj);
    }, POWER_UP_DURATION);
    
    console.log(`Power-up ${powerUpType} will expire in ${POWER_UP_DURATION/1000} seconds`);
}

function removePowerUp(playerObj) {
    const wasShielded = playerObj.hasShield;
    const powerUpType = playerObj.activePowerUp;
    
    console.log(`Removing power-up: ${powerUpType} from player ${playerObj.id}`);
    
    // Reset all power-up effects
    playerObj.activePowerUp = null;
    playerObj.powerUpEndTime = null;
    playerObj.hasShield = false;
    playerObj.shootCooldown = 500; // Default cooldown
    playerObj.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    playerObj.currentProjectileWidth = PROJECTILE_WIDTH;
    
    // Clear timer
    if (playerObj.powerUpTimer) {
        clearTimeout(playerObj.powerUpTimer);
        playerObj.powerUpTimer = null;
    }
    
    if (wasShielded) {
        console.log(`Shield removed from player ${playerObj.id}`);
    }
}

console.log("=== POWERUPS.JS LOADED ===");