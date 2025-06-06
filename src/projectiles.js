// Projectile system

function shootProjectile(playerObj) {
    const currentTime = Date.now();

    // Reduced cooldown from 500ms to 250ms (twice as fast)
    const shootCooldown = playerObj.shootCooldown || 250; // Was 500, now 250
    
    // Check cooldown
    if (currentTime - playerObj.lastShotTime < shootCooldown) {
        return;
    }

    // Check projectile limit (use player's current max projectiles)
    const maxProjectiles = playerObj.maxProjectiles || MAX_PROJECTILES_PER_PLAYER;
    if (playerObj.projectiles.length >= maxProjectiles) {
        return;
    }

    // Use projectileSpeedMultiplier for fast bullets powerup
    let speed = PROJECTILE_SPEED;
    if (playerObj.projectileSpeedMultiplier) {
        speed *= playerObj.projectileSpeedMultiplier;
    }

    // Create projectile shooting UPWARD
    const projectile = {
        x: playerObj.x + playerObj.width / 2 - playerObj.currentProjectileWidth / 2,
        y: playerObj.y,
        width: playerObj.currentProjectileWidth,
        height: PROJECTILE_HEIGHT,
        dy: -speed, // NEGATIVE for upward movement
        playerId: playerObj.id
    };

    playerObj.projectiles.push(projectile);
    playerObj.lastShotTime = currentTime;

    // Play shoot sound
    if (typeof playSound === 'function') {
        playSound('shoot');
    }

    // This will now show "Total: X/6" instead of "Total: X/3"
    console.log(`Player ${playerObj.id} shot projectile upward. Total: ${playerObj.projectiles.length}/${playerObj.maxProjectiles}`);
}

function updateProjectiles() {
    players.forEach(playerObj => {
        for (let i = playerObj.projectiles.length - 1; i >= 0; i--) {
            const projectile = playerObj.projectiles[i];

            // Move projectile upward
            projectile.y += projectile.dy;

            // Remove projectile if it goes off screen
            if (projectile.y + projectile.height < 0) {
                playerObj.projectiles.splice(i, 1);
                continue;
            }

            // Check collision with obstacles
            if (typeof checkProjectileObstacleCollision === 'function') {
                if (checkProjectileObstacleCollision(projectile)) {
                    playerObj.projectiles.splice(i, 1);
                    continue;
                }
            }
        }
    });
}

function drawProjectiles() {
    players.forEach(playerObj => {
        playerObj.projectiles.forEach(projectile => {
            // Draw projectile as a vertical line/rectangle
            ctx.fillStyle = playerObj.color;
            ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);

            // Add glow effect
            ctx.shadowBlur = 5;
            ctx.shadowColor = playerObj.color;
            ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
            ctx.shadowBlur = 0;
        });
    });
}

function createProjectile(player) {
    let speed = PROJECTILE_SPEED;
    if (player.projectileSpeedMultiplier) {
        speed *= player.projectileSpeedMultiplier;
    }
    const projectile = {
        x: player.x + player.width / 2 - PROJECTILE_WIDTH / 2,
        y: player.y,
        width: player.currentProjectileWidth || PROJECTILE_WIDTH,
        height: PROJECTILE_HEIGHT,
        dy: -speed // Negative for upward movement
    };
    player.projectiles.push(projectile);
    if (typeof playSound === 'function') playSound('shoot');
}

console.log("=== PROJECTILES.JS LOADED ===");