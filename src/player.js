// Player management and update functions

function updatePlayers() {
    players.forEach(updatePlayer);
}

function updatePlayer(playerObj) {
    if (!playerObj.active) return;
    
    // Update position with delta time for frame-rate independence
    playerObj.x += playerObj.dx * deltaTime;
    
    // Keep player within canvas bounds
    if (playerObj.x < 0) {
        playerObj.x = 0;
    } else if (playerObj.x + playerObj.width > canvas.width) {
        playerObj.x = canvas.width - playerObj.width;
    }
    
    // Update animation frame
    if (!playerObj.animationFrame) playerObj.animationFrame = 0;
    if (!playerObj.lastFrameTime) playerObj.lastFrameTime = Date.now();
    
    const currentTime = Date.now();
    if (currentTime - playerObj.lastFrameTime > 150) { // Animation speed
        playerObj.animationFrame = (playerObj.animationFrame + 1) % 4;
        playerObj.lastFrameTime = currentTime;
    }
}

function drawPlayers() {
    players.forEach(drawPlayer);
}

function drawPlayer(playerObj) {
    if (!playerObj.active) return;
    
    const centerX = playerObj.x + playerObj.width / 2;
    const centerY = playerObj.y + playerObj.height / 2;
    
    ctx.save();
    
    // Draw shield effect first (behind player)
    if (playerObj.hasShield) {
        drawShieldEffect(playerObj, centerX, centerY);
    }
    
    // Draw shadow
    drawPlayerShadow(playerObj);
    
    // Draw main player body with gradient
    drawPlayerBody(playerObj, centerX, centerY);
    
    // Draw player details
    drawPlayerDetails(playerObj, centerX, centerY);
    
    // Draw movement trail effect
    if (Math.abs(playerObj.dx) > 0) {
        drawMovementTrail(playerObj);
    }
    
    // Draw invincibility effect
    if (playerObj.invincible) {
        drawInvincibilityEffect(playerObj, centerX, centerY);
    }
    
    ctx.restore();
}

function drawShieldEffect(playerObj, centerX, centerY) {
    const time = Date.now() * 0.01;
    const pulseSize = 5 + Math.sin(time) * 3;
    
    // Outer shield glow
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, playerObj.width + pulseSize
    );
    gradient.addColorStop(0, 'rgba(78, 205, 196, 0.4)');
    gradient.addColorStop(0.7, 'rgba(78, 205, 196, 0.2)');
    gradient.addColorStop(1, 'rgba(78, 205, 196, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, playerObj.width + pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Shield hexagon pattern
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8 + Math.sin(time * 2) * 0.2;
    
    const hexRadius = playerObj.width / 2 + pulseSize;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = centerX + Math.cos(angle) * hexRadius;
        const y = centerY + Math.sin(angle) * hexRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    ctx.globalAlpha = 1;
}

function drawPlayerShadow(playerObj) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(
        playerObj.x + playerObj.width / 2,
        playerObj.y + playerObj.height + 3,
        playerObj.width / 2,
        6,
        0, 0, Math.PI * 2
    );
    ctx.fill();
}

function drawPlayerBody(playerObj, centerX, centerY) {
    // Main body gradient
    const bodyGradient = ctx.createRadialGradient(
        centerX - 5, centerY - 5, 0,
        centerX, centerY, playerObj.width / 2
    );
    bodyGradient.addColorStop(0, lightenColor(playerObj.color, 40));
    bodyGradient.addColorStop(0.7, playerObj.color);
    bodyGradient.addColorStop(1, darkenColor(playerObj.color, 30));
    
    ctx.fillStyle = bodyGradient;
    
    // Draw rounded rectangle body
    const radius = 8;
    ctx.beginPath();
    ctx.roundRect(playerObj.x, playerObj.y, playerObj.width, playerObj.height, radius);
    ctx.fill();
    
    // Add highlight
    ctx.fillStyle = lightenColor(playerObj.color, 60);
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.roundRect(playerObj.x + 2, playerObj.y + 2, playerObj.width - 8, playerObj.height / 3, radius);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Add border
    ctx.strokeStyle = darkenColor(playerObj.color, 20);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(playerObj.x, playerObj.y, playerObj.width, playerObj.height, radius);
    ctx.stroke();
}

function drawPlayerDetails(playerObj, centerX, centerY) {
    // Draw player number with glow effect
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'white';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(playerObj.id.toString(), centerX, centerY + 5);
    ctx.restore();
    
    // Draw direction indicator (improved arrow)
    drawDirectionArrow(playerObj, centerX);
    
    // Draw power-up indicators
    if (playerObj.activePowerUp) {
        drawPowerUpIndicator(playerObj, centerX, centerY);
    }
    
    // Draw animated eyes
    drawPlayerEyes(playerObj, centerX, centerY);
}

function drawDirectionArrow(playerObj, centerX) {
    const arrowY = playerObj.y - 8;
    const arrowSize = 6;
    
    // Arrow glow
    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowColor = playerObj.color;
    ctx.fillStyle = 'white';
    
    ctx.beginPath();
    ctx.moveTo(centerX, arrowY - arrowSize);
    ctx.lineTo(centerX - arrowSize, arrowY);
    ctx.lineTo(centerX - 2, arrowY);
    ctx.lineTo(centerX - 2, arrowY + arrowSize);
    ctx.lineTo(centerX + 2, arrowY + arrowSize);
    ctx.lineTo(centerX + 2, arrowY);
    ctx.lineTo(centerX + arrowSize, arrowY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawPowerUpIndicator(playerObj, centerX, centerY) {
    const time = Date.now() * 0.005;
    const orbRadius = 4;
    const orbitRadius = playerObj.width / 2 + 8;
    
    // Orbiting power-up indicator
    const orbX = centerX + Math.cos(time) * orbitRadius;
    const orbY = centerY + Math.sin(time) * orbitRadius;
    
    // Get power-up color
    let powerColor = '#4ecdc4';
    switch (playerObj.activePowerUp) {
        case 'rapid_fire': powerColor = '#ff6b6b'; break;
        case 'wide_shot': powerColor = '#4ecdc4'; break;
        case 'shield': powerColor = '#45b7d1'; break;
    }
    
    // Draw orbiting effect
    const orbGradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbRadius);
    orbGradient.addColorStop(0, powerColor);
    orbGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayerEyes(playerObj, centerX, centerY) {
    const eyeY = centerY - 3;
    const eyeSize = 2;
    const eyeOffset = 4;
    
    // Eye glow
    ctx.save();
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#00ffff';
    
    // Left eye
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(centerX + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawMovementTrail(playerObj) {
    const trailLength = 5;
    const trailSpacing = 4;
    
    for (let i = 0; i < trailLength; i++) {
        const alpha = (trailLength - i) / trailLength * 0.3;
        const trailX = playerObj.x - (playerObj.dx > 0 ? 1 : -1) * i * trailSpacing;
        
        ctx.fillStyle = `rgba(${hexToRgb(playerObj.color).r}, ${hexToRgb(playerObj.color).g}, ${hexToRgb(playerObj.color).b}, ${alpha})`;
        ctx.fillRect(trailX, playerObj.y, playerObj.width, playerObj.height);
    }
}

function drawInvincibilityEffect(playerObj, centerX, centerY) {
    const time = Date.now() * 0.01;
    const flashAlpha = 0.5 + Math.sin(time * 3) * 0.5;
    
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(playerObj.x, playerObj.y, playerObj.width, playerObj.height, 8);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Sparkle effects
    for (let i = 0; i < 3; i++) {
        const sparkleX = centerX + Math.cos(time + i * 2) * 20;
        const sparkleY = centerY + Math.sin(time + i * 2) * 20;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function resetPlayerPositions() {
    player1.x = canvas.width / 4 - PLAYER_WIDTH / 2;
    player1.y = canvas.height - PLAYER_HEIGHT - 10;
    player1.dx = 0;
    
    player2.x = canvas.width * 3 / 4 - PLAYER_WIDTH / 2;
    player2.y = canvas.height - PLAYER_HEIGHT - 10;
    player2.dx = 0;
}

function resetPlayers(mode = 'new-game') {
    // Comprehensive player reset for all scenarios
    // mode: 'new-game', 'level-transition', 'position-only'
    
    if (typeof player1 === 'undefined' || typeof player2 === 'undefined') {
        console.error('Players not initialized!');
        return;
    }
    
    const isNewGame = mode === 'new-game';
    const isLevelTransition = mode === 'level-transition';
    const isPositionOnly = mode === 'position-only';
    
    // Reset Player 1
    player1.y = canvas.height - 40;
    player1.projectiles = [];
    player1.speed = PLAYER_SPEED;
    player1.dx = 0;
    
    if (!isPositionOnly) {
        player1.activePowerUp = null;
        player1.powerUpTimer = null;
        player1.powerUpEndTime = null;
        player1.maxProjectiles = 6;
        player1.shootCooldown = 250;
        player1.hasShield = false;
        player1.invincible = false;
        player1.currentProjectileWidth = PROJECTILE_WIDTH;
    }
    
    if (isNewGame) {
        player1.score = 0;
        player1.lives = 3;
        player1.active = true;
    }
    
    // Reset Player 2 (common properties)
    player2.y = canvas.height - 40;
    player2.projectiles = [];
    player2.speed = PLAYER_SPEED;
    player2.dx = 0;
    
    if (!isPositionOnly) {
        player2.activePowerUp = null;
        player2.powerUpTimer = null;
        player2.powerUpEndTime = null;
        player2.maxProjectiles = 6;
        player2.shootCooldown = 250;
        player2.hasShield = false;
        player2.invincible = false;
        player2.currentProjectileWidth = PROJECTILE_WIDTH;
    }
    
    if (isNewGame) {
        player2.score = 0;
        player2.lives = 3;
    }
    
    // Position players based on game mode
    if (gameMode === 'single') {
        player1.x = canvas.width / 2 - player1.width / 2; // Center P1
        player1.active = isNewGame ? true : player1.active;
        
        if (isNewGame) {
            player2.active = false;
            player2.lives = 0;
            player2.score = 0;
        }
        player2.x = canvas.width / 4; // Default position (not used if inactive)
    } else if (gameMode === 'ai-coop') { // AI Co-Op mode
        player1.x = canvas.width / 3 - player1.width / 2;
        player2.x = canvas.width * 2 / 3 - player2.width / 2;
        
        if (isNewGame) {
            player1.active = true;
            player2.active = true; // AI controls P2
        }
    } else { // Multiplayer
        player1.x = canvas.width / 3 - player1.width / 2;
        player2.x = canvas.width * 2 / 3 - player2.width / 2;
        
        if (isNewGame) {
            player1.active = true;
            player2.active = true;
        }
    }
    
    console.log(`Players reset (mode: ${mode}). Max projectiles: 6, Shoot cooldown: 250ms`);
}

// Helper functions for color manipulation
function lightenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

console.log("=== PLAYER.JS LOADED ===");