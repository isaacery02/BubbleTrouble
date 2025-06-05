// Power-up system

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.dy = 2; // Fall speed
        this.lifeTime = 10000; // 10 seconds before disappearing
        this.createdAt = Date.now();
        this.color = this.getColorForType(type);
    }

    getColorForType(type) {
        switch (type) {
            case 'rapid_fire': return '#ff6b6b';
            case 'wide_shot': return '#4ecdc4';
            case 'shield': return '#45b7d1';
            case 'extra_life': return '#f9ca24';
            default: return '#ffffff';
        }
    }

    update() {
        // Fall down
        this.y += this.dy;
        
        // Remove if off screen or expired
        if (this.y > canvas.height || Date.now() - this.createdAt > this.lifeTime) {
            return false; // Mark for removal
        }
        
        return true; // Keep alive
    }

    draw() {
        // Draw power-up icon
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add glow effect
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
        
        // Draw type indicator
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        let symbol = '';
        switch (this.type) {
            case 'rapid_fire': symbol = 'R'; break;
            case 'wide_shot': symbol = 'W'; break;
            case 'shield': symbol = 'S'; break;
            case 'extra_life': symbol = '+'; break;
        }
        
        ctx.fillText(symbol, this.x + this.width/2, this.y + this.height/2 + 4);
    }
}

function createPowerUp(x, y) {
    const types = ['rapid_fire', 'wide_shot', 'shield', 'extra_life'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const powerUp = new PowerUp(x, y, randomType);
    powerUps.push(powerUp);
    console.log(`Created ${randomType} power-up at (${x}, ${y})`);
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (!powerUps[i].update()) {
            powerUps.splice(i, 1); // Remove expired power-ups
        }
    }
}

function drawPowerUps() {
    powerUps.forEach(powerUp => powerUp.draw());
}

function updatePlayerPowerUps() {
    const currentTime = Date.now();
    
    players.forEach(playerObj => {
        // Check if power-up duration has expired
        if (playerObj.activePowerUp && playerObj.powerUpEndTime && currentTime > playerObj.powerUpEndTime) {
            console.log(`Player ${playerObj.id} power-up ${playerObj.activePowerUp} expired`);
            
            // Reset to defaults
            playerObj.activePowerUp = null;
            playerObj.currentProjectileWidth = PROJECTILE_WIDTH;
            playerObj.shootCooldown = 500;
            playerObj.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
            playerObj.hasShield = false;
            playerObj.powerUpEndTime = null;
        }
    });
}

function applyPowerUp(playerObj, type) {
    console.log(`Applying ${type} power-up to Player ${playerObj.id}`);
    
    // Set the power-up
    playerObj.activePowerUp = type;
    
    switch (type) {
        case 'rapid_fire':
            playerObj.shootCooldown = 100;
            playerObj.maxProjectiles = RAPID_FIRE_MAX_PROJECTILES;
            playerObj.powerUpEndTime = Date.now() + POWER_UP_DURATION;
            break;
            
        case 'wide_shot':
            playerObj.currentProjectileWidth = PROJECTILE_WIDTH * 3;
            playerObj.powerUpEndTime = Date.now() + POWER_UP_DURATION;
            break;
            
        case 'shield':
            playerObj.hasShield = true;
            playerObj.powerUpEndTime = Date.now() + POWER_UP_DURATION;
            break;
            
        case 'extra_life':
            playerObj.lives++;
            playerObj.activePowerUp = null; // Instant effect, no duration
            playerObj.powerUpEndTime = null;
            console.log(`Player ${playerObj.id} gained extra life! Lives: ${playerObj.lives}`);
            return; // Don't set timer for instant effects
    }
    
    console.log(`Player ${playerObj.id} power-up ${type} will expire in ${POWER_UP_DURATION}ms`);
    
    // Play power-up sound
    if (typeof playSound === 'function') {
        playSound('powerup');
    }
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

console.log("=== POWERUPS.JS LOADED ===");