console.log("=== GAME.JS LOADING ===");

// Initialize canvas and context (variables are declared in constants.js)
canvas = document.getElementById('gameCanvas');
ctx = canvas.getContext('2d');

// Canvas management
function resizeCanvas() {
    // Fixed canvas size for consistent gameplay
    canvas.width = 1000;
    canvas.height = 800;
    console.log("Canvas set to fixed size:", canvas.width, "x", canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game initialization
window.addEventListener('load', () => {
    console.log('=== WINDOW LOADED - GAME STARTING ===');
    setupGame();
});

function setupGame() {
    // Initialize sound system first
    if (typeof initializeSounds === 'function') {
        initializeSounds();
    }
    
    setupMobileControls();
    showMessage(
        "Welcome to Ottos & Theo's Bubble Trouble!\nReady to start?",
        'Start Game',
        () => {
            hideMessage();
            // Play start sound after user interaction
            if (typeof playSound === 'function') {
                playSound('start');
            }
            startNewGame();
        }
    );
}

let animationFrameId = null;
let isPaused = false;
let pauseOverlay = null;

// Main game loop
function gameLoop() {
    if (isPaused) return; // <--- Add this line
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
    
    // Clear any active power-up timers and UI
    clearAllPowerUpTimers();
    
    // Reset positions but PRESERVE shooting settings
    player1.x = canvas.width / 2 - 15;
    player1.y = canvas.height - 40;
    player1.projectiles = [];
    player1.dx = 0;
    
    player2.x = canvas.width / 4;
    player2.y = canvas.height - 40;
    player2.projectiles = [];
    player2.dx = 0;
    
    // Reset power-ups manually without touching shootCooldown
    resetPlayerPowerUpsOnly();
    
    initializeLevel();
    levelTransitioning = false;
    gameRunning = true;
    gamePaused = false;
    
    console.log(`Level ${currentLevel} started. Shooting cooldown preserved:`, {
        player1: player1.shootCooldown,
        player2: player2.shootCooldown
    });
}

// Add this new function to clear all power-up timers
function clearAllPowerUpTimers() {
    // Clear player 1 power-up timers
    if (player1.powerUpTimer) {
        clearTimeout(player1.powerUpTimer);
        player1.powerUpTimer = null;
    }
    
    // Clear player 2 power-up timers
    if (player2.powerUpTimer) {
        clearTimeout(player2.powerUpTimer);
        player2.powerUpTimer = null;
    }
    
    // Force remove power-ups (this will clear UI elements)
    if (typeof removePowerUp === 'function') {
        if (player1.activePowerUp) {
            removePowerUp(player1);
        }
        if (player2.activePowerUp) {
            removePowerUp(player2);
        }
    }
    
    console.log('All power-up timers cleared for level transition');
}

// Add this function to reset only power-ups without affecting shooting
function resetPlayerPowerUpsOnly() {
    // Reset power-ups but DON'T touch shootCooldown or maxProjectiles
    player1.activePowerUp = null;
    player1.powerUpTimer = null;
    player1.powerUpEndTime = null;
    player1.hasShield = false;
    player1.invincible = false;
    player1.currentProjectileWidth = PROJECTILE_WIDTH; // Reset to normal width
    
    player2.activePowerUp = null;
    player2.powerUpTimer = null;
    player2.powerUpEndTime = null;
    player2.hasShield = false;
    player2.invincible = false;
    player2.currentProjectileWidth = PROJECTILE_WIDTH; // Reset to normal width
    
    console.log("Power-ups reset for level transition. Shooting settings preserved.");
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
    if (typeof player1 === 'undefined' || typeof player2 === 'undefined') {
        console.error('Players not initialized!');
        return;
    }
    
    // Reset player 1
    player1.x = canvas.width / 2 - 15;
    player1.y = canvas.height - 40;
    player1.lives = 3;
    player1.score = 0;
    player1.active = true;
    player1.projectiles = [];
    player1.speed = PLAYER_SPEED;
    player1.dx = 0;
    player1.activePowerUp = null;
    player1.powerUpTimer = null;
    player1.powerUpEndTime = null;
    player1.maxProjectiles = 6;
    player1.shootCooldown = 250; // <-- Ensure this is always set!
    player1.hasShield = false;
    player1.invincible = false;

    // Reset player 2
    player2.x = canvas.width / 4;
    player2.y = canvas.height - 40;
    player2.lives = 3;
    player2.score = 0;
    player2.active = true;
    player2.projectiles = [];
    player2.speed = PLAYER_SPEED;
    player2.dx = 0;
    player2.activePowerUp = null;
    player2.powerUpTimer = null;
    player2.powerUpEndTime = null;
    player2.maxProjectiles = 6;
    player2.shootCooldown = 250; // <-- Ensure this is always set!
    player2.hasShield = false;
    player2.invincible = false;

    console.log("Players reset. Max projectiles: 6, Shoot cooldown: 250ms");
}

function initializeObstacles() {
    obstacles = [];
    const numObstacles = 3;
    // Increased min/max scaling factors for larger obstacles
    const minScale = 0.4, maxScale = 0.8; // Was 0.2-0.5, now 0.4-0.8
    // Array of fun colors for obstacles
    const colors = ["#ff6b6b", "#4ecdc4", "#f9ca24", "#b388ff", "#f093fb", "#45b7d1", "#ffb300", "#fdcb6e"];

    for (let i = 0; i < numObstacles; i++) {
        // Random scale for width and height
        const widthScale = Math.random() * (maxScale - minScale) + minScale;
        const heightScale = Math.random() * (maxScale - minScale) + minScale;
        const scaledWidth = OBSTACLE_WIDTH * widthScale;
        const scaledHeight = OBSTACLE_HEIGHT * heightScale;

        // Random x within canvas, leaving a margin so obstacles don't go offscreen
        const margin = 60; // Increased margin for larger obstacles
        const x = Math.random() * (canvas.width - scaledWidth - margin * 2) + margin;
        // Random y within middle 60% of canvas height
        const y = Math.random() * (canvas.height * 0.6 - scaledHeight) + canvas.height * 0.2;

        // Pick a random color for each obstacle
        const color = colors[Math.floor(Math.random() * colors.length)];

        obstacles.push({
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
            color,
            draw: function() {
                ctx.save();
                ctx.fillStyle = this.color;
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 3; // Thicker border for larger obstacles
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                
                // Add a subtle inner glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.restore();
            }
        });
    }
    console.log('Three obstacles initialized:', obstacles);
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        showPauseOverlay();
    } else {
        hidePauseOverlay();
        requestAnimationFrame(gameLoop);
    }
}

function showPauseOverlay() {
    if (!pauseOverlay) pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) pauseOverlay.style.display = 'flex';
}

function hidePauseOverlay() {
    if (!pauseOverlay) pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) pauseOverlay.style.display = 'none';
}

window.addEventListener('DOMContentLoaded', () => {
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    pauseOverlay = document.getElementById('pauseOverlay');

    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            isPaused = false;
            hidePauseOverlay();
            startNewGame();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyP') {
            togglePause();
        }
        if (e.code === 'KeyR') {
            isPaused = false;
            hidePauseOverlay();
            startNewGame();
        }
        if (e.code === 'KeyM') {
            // Use direct toggle instead of clicking button
            if (typeof toggleSound === 'function') {
                toggleSound();
            }
        }
    });
});

console.log("=== GAME.JS FULLY LOADED ===");