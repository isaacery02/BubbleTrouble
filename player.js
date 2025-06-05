// Player management and update functions

function updatePlayers() {
    players.forEach(updatePlayer);
}

function updatePlayer(playerObj) {
    if (!playerObj.active) return;
    
    // Update position
    playerObj.x += playerObj.dx;
    
    // Keep player within canvas bounds
    if (playerObj.x < 0) {
        playerObj.x = 0;
    } else if (playerObj.x + playerObj.width > canvas.width) {
        playerObj.x = canvas.width - playerObj.width;
    }
}

function drawPlayers() {
    players.forEach(drawPlayer);
}

function drawPlayer(playerObj) {
    if (!playerObj.active) return;
    
    // Draw player body
    ctx.fillStyle = playerObj.color;
    
    // Draw player with shield effect if active
    if (playerObj.hasShield) {
        // Draw shield glow
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#4ecdc4';
        ctx.fillRect(playerObj.x, playerObj.y, playerObj.width, playerObj.height);
        ctx.restore();
        
        // Draw shield border
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.strokeRect(playerObj.x - 2, playerObj.y - 2, playerObj.width + 4, playerObj.height + 4);
    } else {
        // Normal player drawing
        ctx.fillRect(playerObj.x, playerObj.y, playerObj.width, playerObj.height);
    }
    
    // Draw player number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(playerObj.id.toString(), 
        playerObj.x + playerObj.width / 2, 
        playerObj.y + playerObj.height / 2 + 6);
    
    // Draw a small arrow on top to show direction
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(playerObj.x + playerObj.width / 2, playerObj.y - 5);
    ctx.lineTo(playerObj.x + playerObj.width / 2 - 5, playerObj.y - 15);
    ctx.lineTo(playerObj.x + playerObj.width / 2 + 5, playerObj.y - 15);
    ctx.closePath();
    ctx.fill();
}

function resetPlayerPositions() {
    player1.x = canvas.width / 4 - PLAYER_WIDTH / 2;
    player1.y = canvas.height - PLAYER_HEIGHT - 10;
    player1.dx = 0;
    
    player2.x = canvas.width * 3 / 4 - PLAYER_WIDTH / 2;
    player2.y = canvas.height - PLAYER_HEIGHT - 10;
    player2.dx = 0;
}

function handlePlayerHit(playerObj) {
    if (playerObj.hasShield) {
        // Shield protects player
        console.log(`Player ${playerObj.id} protected by shield!`);
        return false; // No damage taken
    }
    
    // Only reduce lives if player is active
    if (!playerObj.active) return false;
    
    playerObj.lives--;
    console.log(`Player ${playerObj.id} hit! Lives remaining: ${playerObj.lives}`);
    
    // Create hit particles
    if (typeof createParticles === 'function') {
        createParticles(
            playerObj.x + playerObj.width / 2,
            playerObj.y + playerObj.height / 2,
            '#ff6b6b',
            12
        );
    }
    
    // Play hit sound
    if (typeof playSound === 'function') {
        playSound('hit');
    }
    
    // Check if player is out
    if (playerObj.lives <= 0) {
        playerObj.active = false;
        console.log(`Player ${playerObj.id} is out!`);
        
        // Clear projectiles when player is out
        playerObj.projectiles = [];
        
        return true; // Player eliminated
    }
    
    // Give player brief invincibility
    playerObj.invincible = true;
    setTimeout(() => {
        playerObj.invincible = false;
    }, 1000); // 1 second of invincibility
    
    return false; // Player still active
}

console.log("=== PLAYER.JS LOADED ===");