// Level configuration and management

function getLevelConfig(level) {
    // Ensure level is a valid number
    level = Math.max(1, Math.floor(level) || 1);
    
    // Level progression with validation
    if (level === 1) {
        return {
            bubbleCount: 1,
            speed: 1.0,
            size: 40,
            hasObstacle: true
        };
    } else if (level <= 5) {
        return {
            bubbleCount: Math.max(1, 1 + Math.floor((level - 1) / 1)), // 1, 2, 3, 4, 5 bubbles
            speed: Math.max(0.5, 1.0 + (level - 1) * 0.15),
            size: Math.max(15, Math.min(60, 40 - (level - 1) * 2)),
            hasObstacle: true
        };
    } else if (level <= 10) {
        return {
            bubbleCount: Math.max(2, 3 + Math.floor((level - 6) / 2)), // 3-6 bubbles
            speed: Math.max(0.5, 1.75 + (level - 5) * 0.1),
            size: Math.max(15, Math.min(40, 30 - Math.floor((level - 5) / 2))),
            hasObstacle: true
        };
    } else {
        // Game should end after level 10
        return null;
    }
}

function initializeBubbles() {
    bubbles = [];
    const config = getLevelConfig(currentLevel);
    
    if (!config) {
        // No more levels - game complete!
        gameComplete();
        return;
    }
    
    console.log(`Level ${currentLevel}: Creating ${config.bubbleCount} bubbles`);
    
    // Validate canvas dimensions
    if (!canvas || !isFinite(canvas.width) || !isFinite(canvas.height)) {
        console.error('Invalid canvas dimensions');
        return;
    }
    
    for (let i = 0; i < config.bubbleCount; i++) {
        // Calculate safe position
        const x = Math.max(config.size, Math.min(canvas.width - config.size, 
            (canvas.width / (config.bubbleCount + 1)) * (i + 1)));
        const y = Math.max(config.size, canvas.height / 4);
        
        const bubble = new Bubble(x, y, config.size, config.speed);
        
        // Validate bubble before adding
        if (isFinite(bubble.x) && isFinite(bubble.y) && isFinite(bubble.radius)) {
            bubbles.push(bubble);
        } else {
            console.error('Invalid bubble created:', bubble);
        }
    }
    
    console.log(`Successfully created ${bubbles.length} bubbles for level ${currentLevel}`);
}

function checkLevelComplete() {
    // Only check if game is running and not transitioning
    if (!gameRunning || levelTransitioning) {
        return;
    }
    
    // Check if all bubbles are destroyed
    if (bubbles.length === 0) {
        console.log(`Level ${currentLevel} completed! Bubbles remaining: ${bubbles.length}`);
        
        levelTransitioning = true;
        gameRunning = false;
        
        // Calculate level completion bonus
        const timeBonus = Math.max(0, 5000 - (Date.now() - levelStartTime));
        const levelBonus = currentLevel * 1000;
        
        // Add bonuses to both players if they're active
        if (player1.active) {
            player1.score += timeBonus + levelBonus;
            document.getElementById('score1').textContent = player1.score;
        }
        
        if (player2.active) {
            player2.score += timeBonus + levelBonus;
            document.getElementById('score2').textContent = player2.score;
        }
        
        playSound('levelup');
        
        // Check if this was the final level
        if (currentLevel >= 10) {
            gameComplete();
        } else {
            // Advance to next level
            currentLevel++;
            
            // Show level complete message
            showMessage(
                `Level ${currentLevel - 1} Complete!\nTime Bonus: ${Math.floor(timeBonus)}\nLevel Bonus: ${levelBonus}\n\nStarting Level ${currentLevel}...`,
                'Continue',
                () => {
                    hideMessage();
                    startLevel(currentLevel);
                }
            );
        }
    }
}

function gameComplete() {
    console.log('Game Complete!');
    
    gameRunning = false;
    levelTransitioning = false;
    gameOver = true;
    
    // Calculate final scores
    const player1FinalScore = player1.score;
    const player2FinalScore = player2.score;
    
    // Determine winner
    let winnerMessage = '';
    if (player1FinalScore > player2FinalScore) {
        winnerMessage = `Player 1 Wins!\nFinal Score: ${player1FinalScore}`;
    } else if (player2FinalScore > player1FinalScore) {
        winnerMessage = `Player 2 Wins!\nFinal Score: ${player2FinalScore}`;
    } else {
        winnerMessage = `It's a Tie!\nBoth scored: ${player1FinalScore}`;
    }
    
    playSound('levelup'); // Use levelup sound for game completion
    
    showMessage(
        `🎉 GAME COMPLETE! 🎉\n\nYou've beaten all 10 levels!\n\n${winnerMessage}\n\nCongratulations!`,
        'Play Again',
        () => {
            hideMessage();
            startNewGame();
        }
    );
}

function startLevel(level) {
    console.log(`Starting level ${level}`);
    
    currentLevel = Math.max(1, level);
    levelStartTime = Date.now();
    levelTransitioning = false;
    
    // Check if level exists
    const config = getLevelConfig(currentLevel);
    if (!config) {
        gameComplete();
        return;
    }
    
    // Update level display
    document.getElementById('level').textContent = currentLevel;
    
    // Clear existing game objects
    bubbles = [];
    powerUps.length = 0;
    particles.length = 0;
    obstacles = [];
    
    // Reset player projectiles
    player1.projectiles = [];
    player2.projectiles = [];
    
    // Initialize level
    if (typeof initializeObstacles === 'function') {
        initializeObstacles();
    }
    initializeBubbles();
    
    // Resume game
    gameRunning = true;
    gamePaused = false;
}

console.log("=== LEVELS.JS LOADED ===");