// Power-up system

const powerUpTypes = ['WIDE_SHOT', 'RAPID_FIRE', 'SHIELD'];

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type || powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        this.dy = 2; // Fall speed
        this.color = this.getColor();
        this.lifetime = 10000; // 10 seconds
        this.created = Date.now();
    }

    getColor() {
        switch (this.type) {
            case 'WIDE_SHOT': return '#f6e05e';
            case 'RAPID_FIRE': return '#f093fb';
            case 'SHIELD': return '#4ecdc4';
            default: return '#white';
        }
    }

    update() {
        this.y += this.dy;
        
        // Remove if fallen off screen or expired
        if (this.y > canvas.height || Date.now() - this.created > this.lifetime) {
            return false; // Mark for removal
        }
        return true; // Keep
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw icon based on type
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        let icon = '';
        switch (this.type) {
            case 'WIDE_SHOT': icon = 'W'; break;
            case 'RAPID_FIRE': icon = 'R'; break;
            case 'SHIELD': icon = 'S'; break;
        }
        
        ctx.fillText(icon, this.x + this.width/2, this.y + this.height/2 + 4);
    }
}

function createPowerUp(x, y, type) {
    if (typeof powerUps !== 'undefined') {
        const powerUp = new PowerUp(x, y, type);
        powerUps.push(powerUp);
        console.log(`Created power-up: ${powerUp.type} at (${x}, ${y})`);
    }
}

function updatePowerUps() {
    if (typeof powerUps !== 'undefined') {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            if (!powerUps[i].update()) {
                powerUps.splice(i, 1);
            }
        }
    }
}

function drawPowerUps() {
    if (typeof powerUps !== 'undefined') {
        powerUps.forEach(powerUp => powerUp.draw());
    }
}

function applyPowerUp(playerObj, type) {
    console.log(`Applying power-up ${type} to player ${playerObj.id}`);
    
    // Remove existing power-up
    removePowerUp(playerObj);
    
    playerObj.activePowerUp = {
        type: type,
        endTime: Date.now() + POWER_UP_DURATION
    };
    
    switch (type) {
        case 'WIDE_SHOT':
            playerObj.currentProjectileWidth = PROJECTILE_WIDTH * 3;
            break;
        case 'RAPID_FIRE':
            playerObj.shootCooldown = 150;
            break;
        case 'SHIELD':
            playerObj.hasShield = true;
            break;
    }
    
    playSound('powerup');
}

function removePowerUp(playerObj) {
    if (playerObj.activePowerUp) {
        console.log(`Removing power-up ${playerObj.activePowerUp.type} from player ${playerObj.id}`);
        
        // Reset player stats
        playerObj.currentProjectileWidth = PROJECTILE_WIDTH;
        playerObj.shootCooldown = 500;
        playerObj.hasShield = false;
        playerObj.activePowerUp = null;
    }
}

function updatePlayerPowerUps() {
    players.forEach(playerObj => {
        if (playerObj.activePowerUp && Date.now() > playerObj.activePowerUp.endTime) {
            removePowerUp(playerObj);
        }
    });
}

console.log("=== POWERUPS.JS LOADED ===");