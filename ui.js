// UI and game state management

function showMessage(text, buttonText, callback) {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    if (messageBox && messageText && actionButton) {
        messageText.textContent = text;
        actionButton.textContent = buttonText;
        messageBox.style.display = 'flex';
        
        // Remove all existing event listeners by cloning the button
        const newButton = actionButton.cloneNode(true);
        actionButton.parentNode.replaceChild(newButton, actionButton);
        
        // Add the new event listener
        newButton.addEventListener('click', () => {
            console.log('Message button clicked:', buttonText);
            callback();
        });
        
        gamePaused = true;
        console.log('Message shown:', text);
    } else {
        console.error('Message elements not found!');
    }
}

function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.style.display = 'none';
        gamePaused = false;
        console.log('Message hidden, game unpaused');
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Add the missing drawUI function
function drawUI() {
    drawLevelInfo();
}

function drawLevelInfo() {
    // Get level configuration
    const config = typeof getLevelConfig === 'function' ? getLevelConfig(currentLevel) : { speed: 1, size: 20 };
    
    // Draw level progress indicator (center top)
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter';
    ctx.textAlign = 'center';
    
    const progressText = `Level ${currentLevel} - ${bubbles.length} bubbles remaining`;
    ctx.fillText(progressText, canvas.width / 2, 30);
    
    // Draw difficulty indicators (center, below level info)
    ctx.font = '12px Inter';
    ctx.fillStyle = '#e2e8f0';
    
    const difficultyText = `Speed: ${config.speed.toFixed(1)}x | Size: ${config.size}px`;
    ctx.fillText(difficultyText, canvas.width / 2, 50);
    
    // Player 1 stats (TOP LEFT)
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#818cf8';
    ctx.fillText(`P1 Score: ${player1.score}`, 10, 20);
    ctx.fillText(`P1 Lives: ${player1.lives}`, 10, 40);
    
    // Player 2 stats (TOP RIGHT)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f472b6';
    ctx.fillText(`P2 Score: ${player2.score}`, canvas.width - 10, 20);
    ctx.fillText(`P2 Lives: ${player2.lives}`, canvas.width - 10, 40);
    
    // Draw bullet count for each player (left side, below level info)
    ctx.font = '10px Inter';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
    const p1Max = player1.maxProjectiles || MAX_PROJECTILES_PER_PLAYER;
    ctx.fillText(`P1 Bullets: ${player1.projectiles.length}/${p1Max}`, 10, 70);
    
    ctx.fillStyle = '#60a5fa';
    const p2Max = player2.maxProjectiles || MAX_PROJECTILES_PER_PLAYER;
    ctx.fillText(`P2 Bullets: ${player2.projectiles.length}/${p2Max}`, 10, 85);
    
    // Show active power-ups with remaining time
    if (player1.activePowerUp && player1.powerUpEndTime) {
        const timeLeft = Math.max(0, Math.ceil((player1.powerUpEndTime - Date.now()) / 1000));
        ctx.fillStyle = '#34d399';
        
        if (player1.activePowerUp === 'shield') {
            ctx.fillStyle = '#60a5fa';
        } else if (player1.activePowerUp === 'rapid_fire') {
            ctx.fillStyle = '#f87171';
        } else if (player1.activePowerUp === 'wide_shot') {
            ctx.fillStyle = '#34d399';
        }
        
        ctx.fillText(`P1 ${player1.activePowerUp.toUpperCase()}: ${timeLeft}s`, 10, 100);
        
        if (player1.activePowerUp === 'shield' && player1.hasShield) {
            ctx.fillStyle = '#60a5fa';
            ctx.fillText(`P1 SHIELD ACTIVE`, 10, 115);
        }
    }
    
    if (player2.activePowerUp && player2.powerUpEndTime) {
        const timeLeft = Math.max(0, Math.ceil((player2.powerUpEndTime - Date.now()) / 1000));
        
        if (player2.activePowerUp === 'shield') {
            ctx.fillStyle = '#60a5fa';
        } else if (player2.activePowerUp === 'rapid_fire') {
            ctx.fillStyle = '#f87171';
        } else if (player2.activePowerUp === 'wide_shot') {
            ctx.fillStyle = '#34d399';
        }
        
        const yPos = player1.activePowerUp ? 130 : 115;
        ctx.fillText(`P2 ${player2.activePowerUp.toUpperCase()}: ${timeLeft}s`, 10, yPos);
        
        if (player2.activePowerUp === 'shield' && player2.hasShield) {
            ctx.fillStyle = '#60a5fa';
            ctx.fillText(`P2 SHIELD ACTIVE`, 10, yPos + 15);
        }
    }
    
    // Show power-up count
    ctx.fillStyle = '#e5e7eb';
    const powerUpY = (player1.activePowerUp || player2.activePowerUp) ? 160 : 130;
    ctx.fillText(`Power-ups: ${powerUps.length}`, 10, powerUpY);
}

const backgroundImage = new Image();
backgroundImage.src = 'media/your-castle.gif';

function drawBackground() {
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        backgroundImage.onload = () => {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        };
    }
}

function drawEverything() {
    // Draw background FIRST
    drawBackground();
    
    // Then draw game objects
    if (typeof drawBubbles === 'function') drawBubbles();
    if (typeof drawPlayers === 'function') drawPlayers();
    if (typeof drawPowerUps === 'function') drawPowerUps();
    if (typeof drawObstacles === 'function') drawObstacles();
    if (typeof drawProjectiles === 'function') drawProjectiles();
    if (typeof drawParticles === 'function') drawParticles();
    if (typeof drawUI === 'function') drawUI();
}

function resetPlayerPowerUps() {
    // Clear all active power-ups and reset to defaults
    players.forEach(playerObj => {
        console.log(`Resetting power-ups for Player ${playerObj.id}`);
        
        playerObj.activePowerUp = null;
        playerObj.currentProjectileWidth = PROJECTILE_WIDTH;
        playerObj.shootCooldown = 500;
        playerObj.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
        playerObj.hasShield = false;
        playerObj.invincible = false;
        playerObj.powerUpEndTime = null;
        
        // Note: We don't clear powerUpTimer here since we're using powerUpEndTime for tracking
    });
    
    console.log('All player power-ups reset');
}

function startNewGame() {
    console.log("Starting new game...");
    
    // Play start sound when game begins (only if function exists)
    if (typeof playSound === 'function') {
        playSound('start');
    }
    
    currentLevel = 1;
    levelStartTime = Date.now();
    levelTransitioning = false;
    gameOver = false;
    
    // Reset player stats
    player1.score = 0;
    player1.lives = 3;
    player1.active = true;
    player1.projectiles = [];
    player1.activePowerUp = null;
    player1.currentProjectileWidth = PROJECTILE_WIDTH;
    player1.shootCooldown = 500;
    player1.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    player1.hasShield = false;
    player1.lastShotTime = 0;
    player1.invincible = false;
    player1.powerUpTimer = null;
    player1.powerUpEndTime = null;
    
    player2.score = 0;
    player2.lives = 3;
    player2.active = true;
    player2.projectiles = [];
    player2.activePowerUp = null;
    player2.currentProjectileWidth = PROJECTILE_WIDTH;
    player2.shootCooldown = 500;
    player2.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    player2.hasShield = false;
    player2.lastShotTime = 0;
    player2.invincible = false;
    player2.powerUpTimer = null;
    player2.powerUpEndTime = null;
    
    // Clear any existing power-up timers
    resetPlayerPowerUps();
    
    // Reset player positions
    resetPlayerPositions();
    
    // Clear arrays
    bubbles = [];
    powerUps.length = 0;
    particles.length = 0;
    obstacles = [];
    
    // Initialize obstacles and bubbles
    if (typeof initializeObstacles === 'function') {
        initializeObstacles();
    }
    if (typeof initializeBubbles === 'function') {
        initializeBubbles();
    }
    
    console.log(`Game started with ${bubbles.length} bubbles`);
    
    gameRunning = true;
    gamePaused = false;
}

function checkGameOver() {
    const allPlayersOut = players.every(p => !p.active);
    
    if (allPlayersOut && gameRunning) {
        console.log('All players are out - Game Over');
        
        gameRunning = false;
        gameOver = true;
        
        // Clear any active power-up timers
        resetPlayerPowerUps();
        
        if (typeof playSound === 'function') {
            playSound('gameover');
        }
        
        const player1Score = player1.score;
        const player2Score = player2.score;
        
        let gameOverMessage = 'Game Over!\n\n';
        
        if (player1Score > player2Score) {
            gameOverMessage += `Player 1 wins!\nPlayer 1: ${player1Score}\nPlayer 2: ${player2Score}`;
        } else if (player2Score > player1Score) {
            gameOverMessage += `Player 2 wins!\nPlayer 1: ${player1Score}\nPlayer 2: ${player2Score}`;
        } else {
            gameOverMessage += `It's a tie!\nBoth players scored: ${player1Score}`;
        }
        
        showMessage(
            gameOverMessage,
            'Play Again',
            () => {
                hideMessage();
                startNewGame();
                gameLoop();
            }
        );
    }
}

function gameLoop() {
    if (gameRunning && !gamePaused && !levelTransitioning) {
        clearCanvas();
        
        if (typeof handleInput === 'function') {
            handleInput();
        }
        if (typeof updateBubbles === 'function') {
            updateBubbles();
        }
        if (typeof updateObstacles === 'function') {
            updateObstacles();
        }
        if (typeof updatePlayers === 'function') {
            updatePlayers();
        }
        if (typeof updateProjectiles === 'function') {
            updateProjectiles();
        }
        if (typeof updatePowerUps === 'function') {
            updatePowerUps();
        }
        if (typeof updatePlayerPowerUps === 'function') {
            updatePlayerPowerUps();
        }
        if (typeof updateParticles === 'function') {
            updateParticles();
        }
        if (typeof checkCollisions === 'function') {
            checkCollisions();
        }
        
        drawEverything();
        checkGameOver();
    }
    
    requestAnimationFrame(gameLoop);
}

console.log("=== UI.JS LOADED ===");