// Collision detection system

function checkCollisions() {
    // Check projectile-bubble collisions
    players.forEach(playerObj => {
        for (let i = playerObj.projectiles.length - 1; i >= 0; i--) {
            const projectile = playerObj.projectiles[i];
            
            for (let j = bubbles.length - 1; j >= 0; j--) {
                const bubble = bubbles[j];
                
                if (projectileHitsBubble(projectile, bubble)) {
                    // Remove projectile
                    playerObj.projectiles.splice(i, 1);
                    
                    // Handle bubble hit
                    handleBubbleHit(bubble, j, playerObj);
                    break; // Exit bubble loop since projectile is gone
                }
            }
        }
    });
    
    // Check player-bubble collisions
    detectCollisions();
    
    // Check power-up collisions
    if (typeof checkPowerUpCollisions === 'function') {
        checkPowerUpCollisions();
    }
}

function detectCollisions() {
    players.forEach(playerObj => {
        if (!playerObj.active || playerObj.invincible) return; // Skip if invincible
        
        bubbles.forEach(bubble => {
            if (playerCollidesWith(playerObj, bubble)) {
                // Use handlePlayerHit instead of loseLife
                handlePlayerHit(playerObj);
            }
        });
    });
}

function playerCollidesWith(playerObj, bubble) {
    const playerCenterX = playerObj.x + playerObj.width / 2;
    const playerCenterY = playerObj.y + playerObj.height / 2;
    
    const dx = playerCenterX - bubble.x;
    const dy = playerCenterY - bubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (Math.min(playerObj.width, playerObj.height) / 2 + bubble.radius);
}

function projectileHitsBubble(projectile, bubble) {
    const projectileCenterX = projectile.x + projectile.width / 2;
    const projectileCenterY = projectile.y + projectile.height / 2;
    
    const dx = projectileCenterX - bubble.x;
    const dy = projectileCenterY - bubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < bubble.radius + Math.max(projectile.width, projectile.height) / 2;
}

function handleBubbleHit(bubble, bubbleIndex, playerObj) {
    // Award points
    const points = Math.floor(100 / bubble.radius * 10);
    playerObj.score += points;
    
    // Update score display
    const scoreElement = document.getElementById(`score${playerObj.id}`);
    if (scoreElement) {
        scoreElement.textContent = playerObj.score;
    }
    
    // Create particles
    if (typeof createParticles === 'function') {
        createParticles(bubble.x, bubble.y, bubble.color, 15);
    }
    
    // Play pop sound
    if (typeof playSound === 'function') {
        playSound('pop');
    }
    
    // Split bubble if large enough
    if (bubble.radius > 15) {
        const newRadius = bubble.radius / 2;
        const newSpeed = bubble.speed * 1.2;
        
        // Create two smaller bubbles
        const bubble1 = new Bubble(
            bubble.x - newRadius,
            bubble.y,
            newRadius,
            newSpeed
        );
        bubble1.dx = -Math.abs(bubble.dx) - 1;
        bubble1.dy = bubble.dy - 2;
        
        const bubble2 = new Bubble(
            bubble.x + newRadius,
            bubble.y,
            newRadius,
            newSpeed
        );
        bubble2.dx = Math.abs(bubble.dx) + 1;
        bubble2.dy = bubble.dy - 2;
        
        bubbles.push(bubble1, bubble2);
    }
    
    // Chance to drop power-up
    if (Math.random() < POWER_UP_DROP_CHANCE) {
        if (typeof createPowerUp === 'function') {
            createPowerUp(bubble.x, bubble.y);
        }
    }
    
    // Remove the original bubble
    bubbles.splice(bubbleIndex, 1);
    
    console.log(`Bubble popped! Player ${playerObj.id} scored ${points} points. Score: ${playerObj.score}`);
}

function checkPowerUpCollisions() {
    if (typeof powerUps === 'undefined') return;
    
    players.forEach(playerObj => {
        if (!playerObj.active) return;
        
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            
            if (playerCollidesWithPowerUp(playerObj, powerUp)) {
                // Apply power-up effect
                if (typeof applyPowerUp === 'function') {
                    applyPowerUp(playerObj, powerUp.type);
                }
                
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

console.log("=== COLLISION.JS LOADED ===");