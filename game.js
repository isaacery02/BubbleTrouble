console.log("=== GAME.JS LOADING ===");

// Initialize canvas and context (variables are declared in constants.js)
canvas = document.getElementById('gameCanvas');
ctx = canvas.getContext('2d');

// Canvas management
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.98, 1200); // Wider: up to 1200px or 98% of window
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
    setupMobileControls();
    showMessage(
        "Welcome to Ottos & Theo's Bubble Trouble!\nReady to start?",
        'Start Game',
        () => {
            hideMessage();
            if (typeof playSound === 'function') playSound('start'); // <-- Play start sound here
            startNewGame();
        }
    );
}

let animationFrameId = null;

// Main game loop
function gameLoop() {
    if (!gameRunning || gamePaused) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }
    // Only clear old game objects, do NOT fill with color or draw a background image!
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw your game objects (bubbles, players, etc) here
    updateGameSystems();
    checkLevelComplete();
    checkGameOver();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Consolidated update function
function updateGameSystems() {
    if (typeof handleInput === 'function') handleInput();
    if (typeof updatePlayers === 'function') updatePlayers();
    if (typeof updateBubbles === 'function') updateBubbles();
    if (typeof updateProjectiles === 'function') updateProjectiles();
    if (typeof updatePowerUps === 'function') updatePowerUps();
    if (typeof updateParticles === 'function') updateParticles();
    if (typeof checkCollisions === 'function') checkCollisions();
    if (typeof drawEverything === 'function') drawEverything();
}

// Level completion logic
function checkLevelComplete() {
    if (bubbles.length === 0 && gameRunning && !levelTransitioning) {
        levelTransitioning = true;
        console.log(`Level ${currentLevel} complete!`);
        if (typeof playSound === 'function') playSound('levelup');
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

// Start next level
function startNextLevel() {
    console.log('Starting next level...');
    clearGameObjects();
    if (typeof resetPlayerPowerUps === 'function') resetPlayerPowerUps();
    if (typeof resetPlayerPositions === 'function') resetPlayerPositions();
    initializeLevel();
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
        if (typeof playSound === 'function') playSound('gameover'); // <-- Play gameover sound here
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
    });
}

// Start new game
function startNewGame() {
    console.log('Starting new game...');
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (typeof resetBubbleSpeed === 'function') {
        resetBubbleSpeed();
    } else {
        if (typeof BUBBLE_BASE_SPEED !== 'undefined') BUBBLE_SPEED = BUBBLE_BASE_SPEED; else BUBBLE_SPEED = 2;
        if (typeof bubbleSpeedMultiplier !== 'undefined') bubbleSpeedMultiplier = 1.0; else bubbleSpeedMultiplier = 1.0;
    }
    gameRunning = true;
    gamePaused = false;
    gameOver = false;
    levelTransitioning = false;
    currentLevel = 1;
    resetPlayers();
    if (typeof startLevel === 'function') {
        startLevel(1);
    } else {
        initializeLevel();
    }
    animationFrameId = requestAnimationFrame(gameLoop);
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
    player1.x = canvas.width / 2 - 15;
    player1.y = canvas.height - 40;
    player1.lives = 3;
    player1.score = 0;
    player1.active = true;
    player1.projectiles = [];
    if (typeof PLAYER_SPEED !== 'undefined') player1.speed = PLAYER_SPEED;
    player1.dx = 0;
    player1.activePowerUp = null;
    player1.powerUpTimer = null;
    player1.powerUpEndTime = null;
    player1.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    player1.shootCooldown = 500;
    player1.hasShield = false;
    player1.invincible = false;

    player2.x = canvas.width / 4;
    player2.y = canvas.height - 40;
    player2.lives = 3;
    player2.score = 0;
    player2.active = true;
    player2.projectiles = [];
    if (typeof PLAYER_SPEED !== 'undefined') player2.speed = PLAYER_SPEED;
    player2.dx = 0;
    player2.activePowerUp = null;
    player2.powerUpTimer = null;
    player2.powerUpEndTime = null;
    player2.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
    player2.shootCooldown = 500;
    player2.hasShield = false;
    player2.invincible = false;

    console.log("Players reset. Player 1 speed:", player1.speed, "Player 2 speed:", player2.speed);
}

const backgroundImage = new Image();
backgroundImage.src = 'media/your-castle.gif'; // Use your actual image file name

function drawBackground() {
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        backgroundImage.onload = () => {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        };
    }
}

function initializeObstacles() {
    obstacles = [];
    const numObstacles = 3;
    // Scale obstacle size to 30% of original
    const scaledWidth = OBSTACLE_WIDTH * 0.3;
    const scaledHeight = OBSTACLE_HEIGHT * 0.3;

    for (let i = 0; i < numObstacles; i++) {
        // Random x within canvas, leaving a margin so obstacles don't go offscreen
        const margin = 40;
        const x = Math.random() * (canvas.width - scaledWidth - margin * 2) + margin;
        // Random y within middle 60% of canvas height
        const y = Math.random() * (canvas.height * 0.6 - scaledHeight) + canvas.height * 0.2;
        obstacles.push({
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
            draw: function() {
                ctx.save();
                ctx.fillStyle = "#444";
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                ctx.restore();
            }
        });
    }
    console.log('Three obstacles initialized:', obstacles);
}

console.log("=== GAME.JS FULLY LOADED ===");