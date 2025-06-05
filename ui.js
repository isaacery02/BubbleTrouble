// UI management and game state functions

function showMessage(message, buttonText, buttonAction) {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    if (!messageBox || !messageText || !actionButton) {
        console.error("Message elements not found!");
        return;
    }
    
    messageText.textContent = message;
    actionButton.textContent = buttonText;
    actionButton.onclick = buttonAction;
    messageBox.style.display = 'block';
    gamePaused = true;
}

function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.style.display = 'none';
        gamePaused = false;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawLevelInfo() {
    const config = getLevelConfig(currentLevel);
    
    // Draw level progress indicator
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px Inter';
    ctx.textAlign = 'center';
    
    const progressText = `Level ${currentLevel} - ${bubbles.length} bubbles remaining`;
    ctx.fillText(progressText, canvas.width / 2, 30);
    
    // Draw difficulty indicators
    ctx.font = '12px Inter';
    ctx.fillStyle = '#cbd5e0';
    
    const difficultyText = `Speed: ${config.speed.toFixed(1)}x | Size: ${config.size}px`;
    ctx.fillText(difficultyText, canvas.width / 2, 50);
    
    // Draw bullet count for each player
    ctx.font = '10px Inter';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f6e05e';
    ctx.fillText(`P1 Bullets: ${player1.projectiles.length}/${MAX_PROJECTILES_PER_PLAYER}`, 10, 20);
    
    ctx.fillStyle = '#63b3ed';
    ctx.fillText(`P2 Bullets: ${player2.projectiles.length}/${MAX_PROJECTILES_PER_PLAYER}`, 10, 35);
}

function drawEverything() {
    drawBubbles();
    drawObstacles();
    drawPlayers();
    drawProjectiles();
    drawPowerUps();
    drawParticles();
    drawLevelInfo();
}

function startNewGame() {
    // Play start sound when game begins
    playSound('start');
    
    currentLevel = 1;
    levelStartTime = Date.now();
    levelTransitioning = false;
    
    // Reset player stats
    player1.score = 0;
    player1.lives = 3;
    player1.active = true;
    player1.projectiles = [];
    player1.activePowerUp = null;
    player1.currentProjectileWidth = PROJECTILE_WIDTH;
    player1.shootCooldown = 500;
    
    player2.score = 0;
    player2.lives = 3;
    player2.active = true;
    player2.projectiles = [];
    player2.activePowerUp = null;
    player2.currentProjectileWidth = PROJECTILE_WIDTH;
    player2.shootCooldown = 500;
    
    // Reset player positions
    player1.x = canvas.width / 4 - 30;
    player1.y = canvas.height - 30;
    player1.dx = 0;
    
    player2.x = canvas.width * 3 / 4 - 30;
    player2.y = canvas.height - 30;
    player2.dx = 0;
    
    // Update display
    document.getElementById('level').textContent = currentLevel;
    document.getElementById('score1').textContent = player1.score;
    document.getElementById('lives1').textContent = player1.lives;
    document.getElementById('score2').textContent = player2.score;
    document.getElementById('lives2').textContent = player2.lives;
    
    // Clear arrays
    bubbles = [];
    powerUps.length = 0;
    particles.length = 0;
    obstacles = [];
    
    // Initialize obstacles and bubbles
    initializeObstacles();
    initializeBubbles();
    
    console.log(`Game started with ${bubbles.length} bubbles`);
    
    gameRunning = true;
    gamePaused = false;
    gameOver = false;
}

function checkGameOver() {
    const allPlayersOut = players.every(p => !p.active);
    
    if (allPlayersOut && gameRunning) {
        console.log('All players are out - Game Over');
        
        gameRunning = false;
        gameOver = true;
        
        playSound('gameover');
        
        const player1Score = player1.score;
        const player2Score = player2.score;
        
        let gameOverMessage = 'Game Over!\n\n';
        
        if (player1Score > player2Score) {
            gameOverMessage += `Player 1 had the higher score!\nPlayer 1: ${player1Score}\nPlayer 2: ${player2Score}`;
        } else if (player2Score > player1Score) {
            gameOverMessage += `Player 2 had the higher score!\nPlayer 1: ${player1Score}\nPlayer 2: ${player2Score}`;
        } else {
            gameOverMessage += `It was a tie!\nBoth players scored: ${player1Score}`;
        }
        
        showMessage(
            gameOverMessage,
            'Play Again',
            () => {
                hideMessage();
                startNewGame();
            }
        );
    }
}

function gameLoop() {
    if (gameRunning && !gamePaused && !levelTransitioning) {
        clearCanvas();
        handleInput();
        updateBubbles();
        updateObstacles();
        updatePlayers();
        updateProjectiles();
        updatePowerUps();
        updatePlayerPowerUps();
        updateParticles();
        checkCollisions();
        checkLevelComplete();
        checkGameOver();
        drawEverything();
    }
    requestAnimationFrame(gameLoop);
}

console.log("=== UI.JS LOADED ===");