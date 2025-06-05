// Collision detection system

function detectCollisions() {
    players.forEach(playerObj => {
        if (!playerObj.active) return;

        // Projectile vs Bubble collision
        for (let i = playerObj.projectiles.length - 1; i >= 0; i--) {
            const p = playerObj.projectiles[i];
            let projectileHit = false;
            
            for (let j = bubbles.length - 1; j >= 0; j--) {
                const b = bubbles[j];
                const closestX = Math.max(p.x, Math.min(b.x, p.x + p.width));
                const closestY = Math.max(p.y, Math.min(b.y, p.y + p.height));
                const distance = Math.sqrt((b.x - closestX) ** 2 + (b.y - closestY) ** 2);

                if (distance < b.radius) {
                    popBubble(b, j, playerObj);
                    playerObj.projectiles.splice(i, 1);
                    projectileHit = true;
                    break;
                }
            }
            
            if (projectileHit) break;
        }
    });

    // Player vs Bubble collision
    players.forEach(playerObj => {
        if (!playerObj.active) return;

        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            const dx = Math.abs(playerObj.x + playerObj.width / 2 - b.x);
            const dy = Math.abs(playerObj.y + playerObj.height / 2 - b.y);

            if (dx < (playerObj.width / 2 + b.radius) && dy < (playerObj.height / 2 + b.radius)) {
                const testX = Math.max(playerObj.x, Math.min(b.x, playerObj.x + playerObj.width));
                const testY = Math.max(playerObj.y, Math.min(b.y, playerObj.y + playerObj.height));
                const distance = Math.sqrt((b.x - testX) * (b.x - testX) + (b.y - testY) * (b.y - testY));

                if (distance < b.radius) {
                    console.log(`Player ${playerObj.id} hit by bubble! Lives before: ${playerObj.lives}`);
                    
                    if (!playerObj.hasShield) {
                        loseLife(playerObj);
                        console.log(`Player ${playerObj.id} lives after: ${playerObj.lives}`);
                    } else {
                        console.log(`Player ${playerObj.id} protected by shield!`);
                    }
                    
                    // Bubble bounce back
                    b.dx *= -1;
                    b.dy = -Math.abs(b.dy);
                    b.x += b.dx * 5;
                    b.y += b.dy * 5;
                }
            }
        }
    });

    // Player vs Power-up collision (only if powerUps exist)
    if (typeof powerUps !== 'undefined' && powerUps.length > 0) {
        players.forEach(playerObj => {
            if (!playerObj.active) return;

            for (let i = powerUps.length - 1; i >= 0; i--) {
                const pu = powerUps[i];

                if (playerObj.x < pu.x + pu.width &&
                    playerObj.x + playerObj.width > pu.x &&
                    playerObj.y < pu.y + pu.height &&
                    playerObj.y + playerObj.height > pu.y) {
                    
                    // Only apply power-up if the function exists
                    if (typeof applyPowerUp === 'function') {
                        applyPowerUp(playerObj, pu.type);
                    }
                    powerUps.splice(i, 1);
                }
            }
        });
    }
}

function checkCollisions() {
    detectCollisions();
}

function popBubble(bubble, bubbleIndex, playerObj) {
    console.log(`Bubble popped! Remaining bubbles: ${bubbles.length - 1}`);
    
    // Create particle effects
    createParticles(bubble.x, bubble.y, bubble.color, 12);
    
    // Play pop sound
    playSound('pop');
    
    // Add score to player
    const scoreValue = Math.floor(1000 / bubble.radius * 10);
    playerObj.score += scoreValue;
    document.getElementById(`score${playerObj.id}`).textContent = playerObj.score;
    
    // Create smaller bubbles if this one is big enough
    if (bubble.radius > 15) {
        const newRadius = bubble.radius * 0.6;
        const newSpeed = bubble.speed * 1.2;
        
        // Create two smaller bubbles
        const bubble1 = new Bubble(bubble.x - 20, bubble.y, newRadius, newSpeed);
        const bubble2 = new Bubble(bubble.x + 20, bubble.y, newRadius, newSpeed);
        
        bubble1.dx = -Math.abs(bubble.dx);
        bubble2.dx = Math.abs(bubble.dx);
        bubble1.dy = bubble.dy;
        bubble2.dy = bubble.dy;
        
        bubbles.push(bubble1, bubble2);
        console.log(`Split bubble into 2 smaller ones. Total bubbles: ${bubbles.length + 1}`);
    }
    
    // Remove the original bubble
    bubbles.splice(bubbleIndex, 1);
    
    // Only try to create power-up if the function exists
    if (typeof createPowerUp === 'function' && Math.random() < POWER_UP_DROP_CHANCE) {
        createPowerUp(bubble.x, bubble.y);
    } else {
        console.log('createPowerUp function not available, skipping power-up drop');
    }
}

console.log("=== COLLISION.JS LOADED ===");