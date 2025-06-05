console.log("=== GAME.JS LOADING ===");

// Initialize canvas and context (variables are declared in constants.js)
canvas = document.getElementById('gameCanvas');
ctx = canvas.getContext('2d');

// Canvas management
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 800);
    canvas.height = Math.min(window.innerHeight * 0.7, 600);
    console.log("Canvas resized to:", canvas.width, "x", canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game initialization
window.addEventListener('load', () => {
    console.log('=== WINDOW LOADED - GAME STARTING ===');
    setupGame();
});

function setupGame() {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    if (!canvas || !messageBox || !messageText || !actionButton) {
        console.error("CRITICAL: Required elements not found!");
        return;
    }
    
    setupMobileControls();
    
    showMessage(
        "Welcome to Theo's Bubble Trouble!\nReady to start?",
        'Start Game',
        () => {
            hideMessage();
            startNewGame();
            gameLoop();
        }
    );
}

// Main game loop
function gameLoop() {
    if (!gameRunning || gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update all game systems
    updateGameSystems();
    
    // Check game conditions
    checkLevelComplete();
    checkGameOver();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Consolidated update function
function updateGameSystems() {
    // Handle input
    if (typeof handleInput === 'function') handleInput();
    
    // Update game objects
    if (typeof updatePlayers === 'function') updatePlayers();
    if (typeof updateBubbles === 'function') updateBubbles();
    if (typeof updateProjectiles === 'function') updateProjectiles();
    if (typeof updatePowerUps === 'function') updatePowerUps();
    if (typeof updateParticles === 'function') updateParticles();
    
    // Check collisions
    if (typeof checkCollisions === 'function') checkCollisions();
    
    // Draw everything
    if (typeof drawEverything === 'function') drawEverything();
}

// Level completion logic
function checkLevelComplete() {
    if (bubbles.length === 0 && gameRunning && !levelTransitioning) {
        levelTransitioning = true;
        console.log(`Level ${currentLevel} complete!`);
        
        if (typeof playSound === 'function') {
            playSound('levelup');
        }
        
        currentLevel++;
        showMessage(
            `Level ${currentLevel - 1} Complete!\nStarting Level ${currentLevel}`,
            'Continue',
            () => {
                hideMessage();
                startNextLevel();
            }
        );
    }
}

// Start next level (separated from checkLevelComplete)
function startNextLevel() {
    console.log('Starting next level...');
    
    // Clear game state
    clearGameObjects();
    
    // Reset players
    if (typeof resetPlayerPowerUps === 'function') resetPlayerPowerUps();
    if (typeof resetPlayerPositions === 'function') resetPlayerPositions();
    
    // Initialize new level
    initializeLevel();
    
    // Resume game
    levelTransitioning = false;
    gameRunning = true;
    gamePaused = false;
    
    console.log(`Level ${currentLevel} started with ${bubbles.length} bubbles`);
}

// Game over logic
function checkGameOver() {
    const allPlayersOut = players.every(p => !p.active);
    
    if (allPlayersOut && gameRunning) {
        console.log('Game Over');
        
        gameRunning = false;
        gameOver = true;
        
        if (typeof resetPlayerPowerUps === 'function') resetPlayerPowerUps();
        if (typeof playSound === 'function') playSound('gameover');
        
        showGameOverMessage();
    }
}

// Show game over message with scores
function showGameOverMessage() {
    const player1Score = player1.score;
    const player2Score = player2.score;
    
    let message = 'Game Over!\n\n';
    
    if (player1Score > player2Score) {
        message += `Player 1 wins!\nPlayer 1: ${player1Score}\nPlayer 2: ${player2Score}`;
    } else if (player2Score > player1Score) {
        message += `Player 2 wins!\nPlayer 1: ${player1Score}\nPlayer 2: ${player2Score}`;
    } else {
        message += `It's a tie!\nBoth players scored: ${player1Score}`;
    }
    
    showMessage(message, 'Play Again', () => {
        hideMessage();
        startNewGame();
        gameLoop();
    });
}

// Start new game
function startNewGame() {
    console.log('Starting new game...');
    
    // 1. RESET CORE SPEED VARIABLES ABSOLUTELY FIRST
    if (typeof resetBubbleSpeed === 'function') {
        resetBubbleSpeed(); 
    } else {
        console.error("CRITICAL: resetBubbleSpeed function is not defined!");
        // Manual fallback for critical resets if function is missing
        if (typeof BUBBLE_BASE_SPEED !== 'undefined') BUBBLE_SPEED = BUBBLE_BASE_SPEED; else BUBBLE_SPEED = 2;
        if (typeof bubbleSpeedMultiplier !== 'undefined') bubbleSpeedMultiplier = 1.0; else bubbleSpeedMultiplier = 1.0;
        // if (typeof bubbleGravity !== 'undefined') bubbleGravity = 0.08; // If bubbleGravity is 'let'
    }

    // 2. Reset game state
    gameRunning = true;
    gamePaused = false;
    gameOver = false;
    levelTransitioning = false;
    currentLevel = 1; // Crucial for getLevelConfig to fetch level 1 settings
    
    // 3. Reset players (positions, scores, lives, etc.)
    resetPlayers();
    
    // 4. Start level 1, which will call initializeBubbles
    // initializeBubbles should use getLevelConfig(currentLevel)
    // getLevelConfig(1) should return a speed based on BUBBLE_BASE_SPEED
    if (typeof startLevel === 'function') {
        startLevel(1); 
    } else {
        console.error('startLevel function not found! Attempting direct initializeLevel.');
        initializeLevel(); // Fallback
    }
    
    console.log('New game started. Initial BUBBLE_SPEED should be based on BUBBLE_BASE_SPEED.');
}

// Helper functions
function clearGameObjects() {
    players.forEach(p => p.projectiles = []);
    particles.length = 0;
    powerUps.length = 0;
    obstacles = [];
    bubbles = [];
}

function initializeLevel() {
    if (typeof initializeObstacles === 'function') {
        initializeObstacles();
        console.log('Obstacles initialized for level', currentLevel);
    }
    
    if (typeof initializeBubbles === 'function') {
        initializeBubbles();
        console.log('Bubbles initialized for level', currentLevel, '- Count:', bubbles.length);
    }
}

function resetPlayers() {
    // Reset player 1
    player1.x = canvas.width / 2 - 15;
    player1.y = canvas.height - 40;
    player1.lives = 3;
    player1.score = 0;
    player1.active = true;
    player1.projectiles = [];
    if (typeof PLAYER_SPEED !== 'undefined') { // Ensure PLAYER_SPEED is defined
        player1.speed = PLAYER_SPEED; // Reset player speed
    }
    player1.dx = 0; // Reset horizontal movement
    // Reset any other player-specific properties that might affect speed or state
    player1.activePowerUp = null;
    player1.powerUpTimer = null;
    player1.powerUpEndTime = null;
    player1.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    player1.shootCooldown = 500; // Or a default player shoot cooldown constant
    player1.hasShield = false;
    player1.invincible = false;

    // Reset player 2
    player2.x = canvas.width / 4;
    player2.y = canvas.height - 40;
    player2.lives = 3;
    player2.score = 0;
    player2.active = true;
    player2.projectiles = [];
    if (typeof PLAYER_SPEED !== 'undefined') { // Ensure PLAYER_SPEED is defined
        player2.speed = PLAYER_SPEED; // Reset player speed
    }
    player2.dx = 0; // Reset horizontal movement
    // Reset any other player-specific properties for player 2
    player2.activePowerUp = null;
    player2.powerUpTimer = null;
    player2.powerUpEndTime = null;
    player2.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    player2.shootCooldown = 500; // Or a default player shoot cooldown constant
    player2.hasShield = false;
    player2.invincible = false;

    console.log("Players reset. Player 1 speed:", player1.speed, "Player 2 speed:", player2.speed);
}

console.log("=== GAME.JS FULLY LOADED ===");