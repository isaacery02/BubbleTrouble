// Power-up system

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.dy = 2;
        this.color = this.getColorByType(type);
        this.symbol = this.getSymbolByType(type);
    }

    getColorByType(type) {
        const colors = {
            'widerShot': '#f093fb',
            'rapidFire': '#fbbf24',
            'multiShot': '#34d399',
            'shield': '#60a5fa',
            'slowTime': '#a78bfa'
        };
        return colors[type] || '#cbd5e0';
    }

    getSymbolByType(type) {
        const symbols = {
            'widerShot': 'W',
            'rapidFire': 'R',
            'multiShot': 'M',
            'shield': 'S',
            'slowTime': 'T'
        };
        return symbols[type] || '?';
    }

    update() {
        this.y += this.dy;
    }

    draw() {
        // Draw power-up box
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Draw symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.symbol, this.x + this.width / 2, this.y + this.height / 2 + 6);
    }
}

function getRandomPowerUpType() {
    const types = ['widerShot', 'rapidFire', 'multiShot', 'shield', 'slowTime'];
    return types[Math.floor(Math.random() * types.length)];
}

function applyPowerUp(playerObj, type) {
    playerObj.activePowerUp = { type: type, endTime: Date.now() + POWER_UP_DURATION };
    playSound('powerup');

    switch (type) {
        case 'widerShot':
            playerObj.currentProjectileWidth = PROJECTILE_WIDTH * 3;
            break;
        case 'rapidFire':
            playerObj.shootCooldown = 50;
            break;
        case 'multiShot':
            playerObj.multiShot = true;
            break;
        case 'shield':
            playerObj.hasShield = true;
            break;
        case 'slowTime':
            bubbles.forEach(b => {
                b.dx *= 0.3;
                b.dy *= 0.3;
            });
            break;
    }
}

function removePowerUp(playerObj) {
    if (playerObj.activePowerUp) {
        switch (playerObj.activePowerUp.type) {
            case 'widerShot':
                playerObj.currentProjectileWidth = PROJECTILE_WIDTH;
                break;
            case 'rapidFire':
                playerObj.shootCooldown = 500;
                break;
            case 'multiShot':
                playerObj.multiShot = false;
                break;
            case 'shield':
                playerObj.hasShield = false;
                break;
        }
        playerObj.activePowerUp = null;
    }
}

function updatePowerUps() {
    // Update existing power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        pu.update();
        if (pu.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }

    // Check for expired power-ups on players
    players.forEach(player => {
        if (player.activePowerUp && Date.now() > player.activePowerUp.endTime) {
            removePowerUp(player);
        }
    });
}

function drawPowerUps() {
    powerUps.forEach(pu => pu.draw());
}