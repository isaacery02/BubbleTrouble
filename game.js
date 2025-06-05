console.log("=== GAME.JS LOADING ===");

// Initialize canvas and context (variables are declared in constants.js)
canvas = document.getElementById('gameCanvas');
ctx = canvas.getContext('2d');

// Set canvas dimensions dynamically
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 800);
    canvas.height = Math.min(window.innerHeight * 0.7, 600);
    console.log("Canvas resized to:", canvas.width, "x", canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initialize and start the game when page loads
window.addEventListener('load', () => {
    console.log("=== WINDOW LOADED - GAME STARTING ===");
    
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    if (!canvas || !messageBox || !messageText || !actionButton) {
        console.error("CRITICAL: Required elements not found!");
        return;
    }
    
    setupMobileControls();
    
    // Set initial audio button state
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        if (soundEnabled) {
            soundToggle.textContent = '🔊';
            soundToggle.classList.remove('audio-disabled');
        } else {
            soundToggle.textContent = '🔇';
            soundToggle.classList.add('audio-disabled');
        }
        
        // Add sound toggle event listener
        soundToggle.addEventListener('click', toggleSound);
    }
    
    showMessage(
        "Welcome to Theo's Bubble Trouble!\nReady to start?",
        'Start Game',
        () => {
            hideMessage();
            startNewGame();
            gameLoop();
        }
    );
});

function gameLoop() {
    if (!gameRunning || gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Handle input
    if (typeof handleInput === 'function') {
        handleInput();
    }
    
    // Update game objects
    if (typeof updateBubbles === 'function') {
        updateBubbles();
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
    
    // Check collisions
    if (typeof checkCollisions === 'function') {
        checkCollisions();
    }
    
    // Draw everything
    if (typeof drawEverything === 'function') {
        drawEverything();
    }
    
    // Check win/lose conditions
    checkGameOver();
    checkLevelComplete();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

function checkLevelComplete() {
    if (bubbles.length === 0 && gameRunning && !levelTransitioning) {
        levelTransitioning = true;
        console.log(`Level ${currentLevel} complete! Bubbles remaining: ${bubbles.length}`);
        
        if (typeof playSound === 'function') {
            playSound('levelup');
        }
        
        // Immediately show the message
        currentLevel++;
        showMessage(
            `Level ${currentLevel - 1} Complete!\nStarting Level ${currentLevel}`,
            'Continue',
            () => {
                console.log('Continue button clicked - Starting next level...');
                hideMessage();
                
                // Reset power-ups and clear timers
                if (typeof resetPlayerPowerUps === 'function') {
                    resetPlayerPowerUps();
                }
                
                // Clear projectiles
                players.forEach(playerObj => {
                    playerObj.projectiles = [];
                });
                
                // Clear particles and power-ups
                particles.length = 0;
                powerUps.length = 0;
                
                // Reset player positions
                if (typeof resetPlayerPositions === 'function') {
                    resetPlayerPositions();
                }
                
                // Initialize new level
                obstacles = []; // Clear old obstacles
                if (typeof initializeObstacles === 'function') {
                    initializeObstacles();
                    console.log('Obstacles initialized for level', currentLevel);
                }
                
                bubbles = []; // Clear old bubbles
                if (typeof initializeBubbles === 'function') {
                    initializeBubbles();
                    console.log('Bubbles initialized for level', currentLevel, '- Count:', bubbles.length);
                }
                
                // Reset game state
                levelTransitioning = false;
                gameRunning = true;
                gamePaused = false;
                
                console.log(`Level ${currentLevel} fully initialized with ${bubbles.length} bubbles`);
            }
        );
    }
}

function checkGameOver() {
    const allPlayersOut = players.every(p => !p.active);
    
    if (allPlayersOut && gameRunning) {
        console.log('All players are out - Game Over');
        
        gameRunning = false;
        gameOver = true;
        
        // Clear any active power-up timers
        if (typeof resetPlayerPowerUps === 'function') {
            resetPlayerPowerUps();
        }
        
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
                console.log('Play Again button clicked');
                hideMessage();
                startNewGame();
                gameLoop();
            }
        );
    }
}

console.log("=== GAME.JS FULLY LOADED ===");