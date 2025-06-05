// Player definitions and management

// Player 1 variables
const player1 = {
    id: 1,
    width: 60,
    height: 20,
    x: 0, // Will be set in startNewGame
    y: 0,
    dx: 0,
    speed: 5,
    score: 0,
    lives: 3,
    color: '#48bb78',
    projectileColor: '#f6e05e',
    projectiles: [],
    lastShotTime: 0,
    shootCooldown: 500,
    currentProjectileWidth: PROJECTILE_WIDTH,
    activePowerUp: null,
    active: true
};

// Player 2 variables
const player2 = {
    id: 2,
    width: 60,
    height: 20,
    x: 0, // Will be set in startNewGame
    y: 0,
    dx: 0,
    speed: 5,
    score: 0,
    lives: 3,
    color: '#ed8936',
    projectileColor: '#63b3ed',
    projectiles: [],
    lastShotTime: 0,
    shootCooldown: 500,
    currentProjectileWidth: PROJECTILE_WIDTH,
    activePowerUp: null,
    active: true
};

const players = [player1, player2];

// Draw player
function drawPlayer(playerObj) {
    if (!playerObj.active) return;

    ctx.fillStyle = playerObj.color;
    ctx.fillRect(playerObj.x, playerObj.y, playerObj.width, playerObj.height);
    ctx.beginPath();
    ctx.arc(playerObj.x + playerObj.width / 2, playerObj.y, playerObj.width / 4, 0, Math.PI * 2);
    ctx.fillStyle = playerObj.color;
    ctx.fill();
    ctx.closePath();
}

// Update player position
function updatePlayer(playerObj) {
    if (!playerObj.active) return;

    playerObj.x += playerObj.dx;

    // Wall detection
    if (playerObj.x < 0) {
        playerObj.x = 0;
    }
    if (playerObj.x + playerObj.width > canvas.width) {
        playerObj.x = canvas.width - playerObj.width;
    }
}

// Update and draw all players
function updatePlayers() {
    players.forEach(player => updatePlayer(player));
}

function drawPlayers() {
    players.forEach(player => drawPlayer(player));
}

// Lose a life
function loseLife(playerObj) {
    console.log(`loseLife called for player ${playerObj.id}, current lives: ${playerObj.lives}`);
    
    // Play hit sound immediately when player gets hit
    playSound('hit');
    
    playerObj.lives--;
    
    // Update the HTML display
    const livesElement = document.getElementById(`lives${playerObj.id}`);
    if (livesElement) {
        livesElement.textContent = playerObj.lives;
        console.log(`Updated lives display for player ${playerObj.id}: ${playerObj.lives}`);
    } else {
        console.error(`Lives element not found: lives${playerObj.id}`);
    }

    if (playerObj.lives <= 0) {
        playerObj.active = false;
        playerObj.dx = 0;
        playerObj.projectiles = [];
        removePowerUp(playerObj);
        
        console.log(`Player ${playerObj.id} is out of lives`);
        
        // Don't immediately show game over - let checkGameOver() handle it
        // This allows for proper score comparison and winner determination
        
    } else {
        // Reset player position after losing a life
        playerObj.x = canvas.width / 2 - playerObj.width / 2 + (playerObj.id === 1 ? -canvas.width / 4 : canvas.width / 4);
        playerObj.y = canvas.height - playerObj.height - 10;
        playerObj.dx = 0;
    }
}

console.log("=== PLAYER.JS LOADED ===");