// Projectile management

function shootProjectile(player) {
    // Check if player already has maximum projectiles
    if (player.projectiles.length >= MAX_PROJECTILES_PER_PLAYER) {
        return; // Don't shoot if at limit
    }
    
    player.projectiles.push({
        x: player.x + player.width / 2 - player.currentProjectileWidth / 2,
        y: player.y,
        width: player.currentProjectileWidth,
        height: PROJECTILE_HEIGHT,
        dy: PROJECTILE_SPEED
    });
    player.lastShotTime = Date.now();
    playSound('shoot');
}

function updateProjectilesForAllPlayers() {
    players.forEach(player => {
        updateProjectilesForPlayer(player.projectiles, player);
    });
}

function updateProjectilesForPlayer(projectilesArray, playerObj) {
    for (let i = projectilesArray.length - 1; i >= 0; i--) {
        const p = projectilesArray[i];
        p.y -= p.dy;

        // Remove if off screen
        if (p.y < 0) {
            projectilesArray.splice(i, 1);
        }
    }
}

function drawProjectilesForAllPlayers() {
    players.forEach(player => {
        drawProjectilesForPlayer(player.projectiles, player.projectileColor);
    });
}

function drawProjectilesForPlayer(projectilesArray, color) {
    projectilesArray.forEach(p => {
        ctx.fillStyle = color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

// Main update and draw functions for projectiles
function updateProjectiles() {
    updateProjectilesForAllPlayers();
}

function drawProjectiles() {
    drawProjectilesForAllPlayers();
}