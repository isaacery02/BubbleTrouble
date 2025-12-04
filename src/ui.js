// UI and game state management

function showMessage(text, buttonText, callback) {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    if (messageBox && messageText && actionButton) {
        messageText.textContent = text;
        actionButton.textContent = buttonText;
        messageBox.style.display = 'flex';
        messageBox.classList.add('has-message'); // Add background styling for actual messages
        
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
        messageBox.classList.remove('has-message'); // Remove background styling
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
    
    // Draw time challenge timer if active
    if (isTimeChallengeLevel && levelTimeLimit > 0 && gameRunning) {
        const elapsed = (Date.now() - levelStartTime) / 1000;
        const remaining = Math.max(0, levelTimeLimit - elapsed);
        const timeColor = remaining < 10 ? '#ff6b6b' : (remaining < 20 ? '#fbbf24' : '#4ade80');
        
        ctx.font = 'bold 20px Inter';
        ctx.fillStyle = timeColor;
        ctx.fillText(`⏱️ ${remaining.toFixed(1)}s`, canvas.width / 2, 55);
        
        // Check if time ran out
        if (remaining <= 0 && typeof handleTimeChallengeFailure === 'function') {
            handleTimeChallengeFailure();
        }
    } else {
        // Draw difficulty indicators (center, below level info)
        ctx.font = '12px Inter';
        ctx.fillStyle = '#e2e8f0';
        
        const difficultyText = `Speed: ${config.speed.toFixed(1)}x | Size: ${config.size}px`;
        ctx.fillText(difficultyText, canvas.width / 2, 50);
    }
    
    // Player 1 stats (TOP LEFT)
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
    ctx.fillStyle = player1.color;
    ctx.fillText(`P1 Score: ${player1.score}`, 10, 20);
    ctx.fillText(`P1 Lives: ${player1.lives}`, 10, 40);
    const p1Max = player1.maxProjectiles || MAX_PROJECTILES_PER_PLAYER;
    ctx.fillText(`P1 Bullets: ${player1.projectiles.length}/${p1Max}`, 10, 60);
    
    // Player 2 stats (TOP RIGHT) - only if in multiplayer/ai-coop and P2 is active
    if ((gameMode === 'multi' || gameMode === 'ai-coop') && player2.active) {
        ctx.textAlign = 'right';
        ctx.fillStyle = player2.color;
        const p2Label = gameMode === 'ai-coop' ? 'AI' : 'P2';
        ctx.fillText(`${p2Label} Score: ${player2.score}`, canvas.width - 10, 20);
        ctx.fillText(`${p2Label} Lives: ${player2.lives}`, canvas.width - 10, 40);
        const p2Max = player2.maxProjectiles || MAX_PROJECTILES_PER_PLAYER;
        ctx.fillText(`${p2Label} Bullets: ${player2.projectiles.length}/${p2Max}`, canvas.width - 10, 60);
    }
    
    // Show active power-ups (canvas text, less prominent than DOM timers)
    let p1PowerUpY = 80;
    if (player1.active && player1.activePowerUp && player1.powerUpEndTime) {
        ctx.textAlign = 'left';
        const timeLeft = Math.max(0, Math.ceil((player1.powerUpEndTime - Date.now()) / 1000));
        let powerUpColor = getPowerUpColor(player1.activePowerUp);
        if (player1.activePowerUp === 'shield') {
            powerUpColor = '#60a5fa';
        }
        ctx.fillStyle = powerUpColor;
        ctx.fillText(`P1 ${player1.activePowerUp.replace('_', ' ').toUpperCase()}: ${timeLeft}s`, 10, p1PowerUpY);
        p1PowerUpY += 15;
        if (player1.activePowerUp === 'shield' && player1.hasShield) {
            ctx.fillStyle = '#60a5fa';
            ctx.fillText(`P1 SHIELD ACTIVE`, 10, p1PowerUpY);
            p1PowerUpY += 15;
        }
    }
    
    if ((gameMode === 'multi' || gameMode === 'ai-coop') && player2.active && player2.activePowerUp && player2.powerUpEndTime) {
        let p2PowerUpY = 80;
        ctx.textAlign = 'right';
        const timeLeft = Math.max(0, Math.ceil((player2.powerUpEndTime - Date.now()) / 1000));
        let powerUpColor = getPowerUpColor(player2.activePowerUp);
        if (player2.activePowerUp === 'shield') {
            powerUpColor = '#60a5fa';
        }
        ctx.fillStyle = powerUpColor;
        const p2Label = gameMode === 'ai-coop' ? 'AI' : 'P2';
        ctx.fillText(`${p2Label} ${player2.activePowerUp.replace('_', ' ').toUpperCase()}: ${timeLeft}s`, canvas.width - 10, p2PowerUpY);
        p2PowerUpY += 15;
        if (player2.activePowerUp === 'shield' && player2.hasShield) {
            ctx.fillStyle = '#60a5fa';
            ctx.fillText(`${p2Label} SHIELD ACTIVE`, canvas.width - 10, p2PowerUpY);
        }
    }
}

function drawEverything() {
    // Draw game objects only
    if (typeof drawBubbles === 'function') drawBubbles();
    if (typeof drawPlayers === 'function') drawPlayers();
    if (typeof drawPowerUps === 'function') drawPowerUps();
    if (typeof drawObstacles === 'function') drawObstacles();
    if (typeof drawProjectiles === 'function') drawProjectiles();
    if (typeof drawRescueBubbles === 'function') drawRescueBubbles(); // Add this line
    if (typeof drawParticles === 'function') drawParticles();
    if (typeof drawFloatingTexts === 'function') drawFloatingTexts();
    if (typeof drawUI === 'function') drawUI();
    if (gameMode === 'ai-coop' && typeof drawAIIndicator === 'function') drawAIIndicator();
}

function resetPlayerPowerUps() {
    // Clear all active power-ups and reset to defaults
    players.forEach(playerObj => {
        console.log(`Resetting power-ups for Player ${playerObj.id}`);
        
        playerObj.activePowerUp = null;
        playerObj.currentProjectileWidth = PROJECTILE_WIDTH;
        playerObj.shootCooldown = 250;
        playerObj.maxProjectiles = MAX_PROJECTILES_PER_PLAYER;
        playerObj.hasShield = false;
        playerObj.invincible = false;
        playerObj.powerUpEndTime = null;
        
        // Note: We don't clear powerUpTimer here since we're using powerUpEndTime for tracking
    });
    
    console.log('All player power-ups reset');
}

// Time challenge functions
function showTimeChallengeIntro() {
    const overlay = document.createElement('div');
    overlay.id = 'timeChallengeOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 60px;
        border-radius: 20px;
        text-align: center;
        animation: bounceIn 0.5s ease-out;
        border: 4px solid #fbbf24;
        box-shadow: 0 0 40px rgba(251, 191, 36, 0.6);
    `;
    
    content.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 20px;">⏱️</div>
        <div style="font-size: 36px; font-weight: bold; color: #fbbf24; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
            TIME CHALLENGE!
        </div>
        <div style="font-size: 24px; color: #fff; margin-bottom: 20px;">
            Complete in ${levelTimeLimit} seconds<br>
            for BONUS POINTS!
        </div>
        <div style="font-size: 18px; color: #fbbf24; animation: pulse 1s infinite;">
            Get ready...
        </div>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => overlay.remove(), 300);
    }, 3000);
}

function handleTimeChallengeFailure() {
    gameRunning = false;
    showMessage(
        `⏱️ TIME'S UP! ⏱️\n\nYou ran out of time!\nDon't worry, keep trying!`,
        'Retry Level',
        () => {
            hideMessage();
            startLevel(currentLevel);
        }
    );
}

function showBossIntro() {
    const overlay = document.createElement('div');
    overlay.id = 'bossIntroOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.5s ease-out;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        text-align: center;
        animation: shakeIntro 0.8s ease-out;
    `;
    
    content.innerHTML = `
        <div style="font-size: 100px; margin-bottom: 20px; animation: pulse 1s infinite;">👾</div>
        <div style="font-size: 48px; font-weight: bold; color: #ff6b6b; margin-bottom: 10px; text-shadow: 3px 3px 6px rgba(0,0,0,0.8); animation: glowRed 1s infinite;">
            ⚠️ BOSS LEVEL ⚠️
        </div>
        <div style="font-size: 28px; color: #fbbf24; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
            MEGA BUBBLE INCOMING!
        </div>
        <div style="font-size: 20px; color: #fff;">
            Defeat the giant bubble to continue!
        </div>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => overlay.remove(), 500);
    }, 4000);
}

function gameLoop(currentTime = 0) {
    // Frame rate limiting - ensure consistent 60 FPS across all devices
    const elapsed = currentTime - lastFrameTime;
    
    if (elapsed >= targetFrameTime) {
        lastFrameTime = currentTime - (elapsed % targetFrameTime);
        
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
            if (typeof updateFloatingTexts === 'function') {
                updateFloatingTexts();
            }
            if (typeof checkCollisions === 'function') {
                checkCollisions();
            }
            
            drawEverything();
            checkGameOver();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

console.log("=== UI.JS LOADED ===");