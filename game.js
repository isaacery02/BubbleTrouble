console.log("=== GAME.JS LOADING ===");

console.log("game.js loaded"); // Debug log 1

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

console.log("Canvas element:", canvas); // Debug log 2: Should not be null
console.log("Canvas context:", ctx);   // Debug log 3: Should not be null

// Set canvas dimensions dynamically
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 800);
    canvas.height = Math.min(window.innerHeight * 0.7, 600);
    console.log("Canvas resized to:", canvas.width, "x", canvas.height); // Debug log 4
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize

// Game variables
let gameOver = false;
let gameStarted = false;
let gameRunning = false;
let gamePaused = false;
const MAX_PROJECTILES_PER_PLAYER = 3;

// Common projectile variables
const PROJECTILE_SPEED = 8;
const PROJECTILE_WIDTH = 4; // Default projectile width
const PROJECTILE_HEIGHT = 20;

// Power-up variables
const POWER_UP_DURATION = 5000; // 5 seconds
const POWER_UP_DROP_CHANCE = 0.2; // 20% chance
const powerUps = [];

// Player 1 variables
const player1 = {
    id: 1,
    width: 60,
    height: 20,
    x: canvas.width / 4 - 30, // Initial position for player 1
    y: canvas.height - 30,
    dx: 0,
    speed: 5,
    score: 0,
    lives: 3,
    color: '#48bb78', // Green player
    projectileColor: '#f6e05e', // Yellow projectile
    projectiles: [],
    lastShotTime: 0, // Track last shot time for cooldown
    shootCooldown: 500, // Default cooldown in ms
    currentProjectileWidth: PROJECTILE_WIDTH, // Current projectile width (can change with power-up)
    activePowerUp: null, // Stores active power-up details {type, endTime}
    active: true // Is player still in the game?
};

// Player 2 variables
const player2 = {
    id: 2,
    width: 60,
    height: 20,
    x: canvas.width * 3 / 4 - 30, // Initial position for player 2
    y: canvas.height - 30,
    dx: 0,
    speed: 5,
    score: 0,
    lives: 3,
    color: '#ed8936', // Orange player
    projectileColor: '#63b3ed', // Blue projectile
    projectiles: [],
    lastShotTime: 0,
    shootCooldown: 500,
    currentProjectileWidth: PROJECTILE_WIDTH,
    activePowerUp: null,
    active: true
};

// Array to hold all players for easier iteration
const players = [player1, player2];

// Bubble variables
let bubbles = [];
const bubbleGravity = 0.1; // Gravity effect
const bubbleBounceFactor = -0.98; // How much velocity is retained after bounce

// Message box elements
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const actionButton = document.getElementById('actionButton');

// Function to show message box
function showMessageBox(message, buttonText, buttonAction) {
    messageText.textContent = message;
    actionButton.textContent = buttonText;
    actionButton.onclick = buttonAction;
    messageBox.style.display = 'block';
    gameOver = true; // Stop game loop when message box is shown
}

// Function to hide message box
function hideMessageBox() {
    messageBox.style.display = 'none';
}

// PowerUp class definition
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // 'widerShot', 'rapidFire'
        this.color = this.getColorByType(type);
        this.dy = 1; // Power-ups fall down
    }

    getColorByType(type) {
        switch (type) {
            case 'widerShot': return '#a78bfa'; // Purple
            case 'rapidFire': return '#fcd34d'; // Amber
            default: return '#ffffff';
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Draw text/icon for type
        ctx.fillStyle = '#1a202c'; // Dark text for contrast
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let text = '';
        if (this.type === 'widerShot') text = 'W';
        if (this.type === 'rapidFire') text = 'R';
        ctx.fillText(text, this.x + this.width / 2, this.y + this.height / 2);
    }

    update() {
        this.y += this.dy;
        // Stop at bottom
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
        }
    }
}

// Add new power-up types
function getRandomPowerUpType() {
    const types = ['widerShot', 'rapidFire', 'multiShot', 'shield', 'slowTime'];
    return types[Math.floor(Math.random() * types.length)];
}

// Apply power-up effect to a player
function applyPowerUp(playerObj, type) {
    playerObj.activePowerUp = { type: type, endTime: Date.now() + POWER_UP_DURATION };
    playSound('powerup');

    switch (type) {
        case 'widerShot':
            playerObj.currentProjectileWidth = PROJECTILE_WIDTH * 3; // Make projectile 3 times wider
            break;
        case 'rapidFire':
            playerObj.shootCooldown = 50; // Reduce cooldown for rapid fire
            break;
        case 'multiShot':
            playerObj.multiShot = true;
            break;
        case 'shield':
            playerObj.hasShield = true;
            break;
        case 'slowTime':
            // Slow down all bubbles temporarily
            bubbles.forEach(b => {
                b.dx *= 0.3;
                b.dy *= 0.3;
            });
            break;
    }
}

// Remove power-up effect from a player
function removePowerUp(playerObj) {
    playerObj.activePowerUp = null;
    playerObj.currentProjectileWidth = PROJECTILE_WIDTH; // Reset projectile width
    playerObj.shootCooldown = 500; // Reset shoot cooldown
}

// Bubble class definition
class Bubble {
    constructor(x, y, radius, dx, dy, size) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.size = size; // 1: small, 2: medium, 3: large
        this.color = this.getColorBySize(size);
    }

    getColorBySize(size) {
        // Get colors from current level config if available
        const config = getLevelConfig(currentLevel);
        const levelColors = config.colors;
        
        switch (size) {
            case 3: 
                return levelColors[0] || '#f56565'; // Use first level color for large
            case 2: 
                return levelColors[1] || '#ecc94b'; // Use second level color for medium
            case 1: 
                return levelColors[2] || '#63b3ed'; // Use third level color for small
            default: 
                return '#cbd5e0';
        }
    }

    // Enhanced bubble drawing with gradient and glow effect
    draw() {
        // Create gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.getDarkerColor());

        // Draw glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Add highlight
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        ctx.strokeStyle = '#a0aec0';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    getDarkerColor() {
        const colors = {
            '#f56565': '#e53e3e', // Red
            '#ecc94b': '#d69e2e', // Yellow
            '#63b3ed': '#3182ce'  // Blue
        };
        return colors[this.color] || this.color;
    }

    update() {
        // Apply gravity
        this.dy += bubbleGravity;

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        // Wall collision (left/right)
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx *= -1;
            // Adjust position to prevent sticking to wall
            if (this.x + this.radius > canvas.width) this.x = canvas.width - this.radius;
            if (this.x - this.radius < 0) this.x = this.radius;
        }

        // Floor collision
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.dy *= bubbleBounceFactor; // Bounce up with less energy loss
            // If velocity is very low, stop bouncing
            if (Math.abs(this.dy) < 0.5) {
                this.dy = 0;
            }
        }
        // Ceiling collision
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.dy *= -1;
        }
    }
}

// Create initial bubbles
function createInitialBubbles() {
    // Reduced initial speed for slower bubbles
    bubbles.push(new Bubble(100, 100, 40, 1.5, 0, 3)); // Large bubble
    bubbles.push(new Bubble(canvas.width - 100, 100, 40, -1.5, 0, 3)); // Large bubble
}

// Draw player
function drawPlayer(playerObj) {
    if (!playerObj.active) return; // Don't draw if player is out

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

// Draw projectiles
function drawProjectiles(projectilesArray, color) {
    projectilesArray.forEach(p => {
        ctx.fillStyle = color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

// Update projectiles
function updateProjectiles(projectilesArray, playerObj) {
    for (let i = projectilesArray.length - 1; i >= 0; i--) {
        const p = projectilesArray[i];
        p.y -= p.dy;

        // Remove if off screen
        if (p.y < 0) {
            projectilesArray.splice(i, 1);
            // No longer setting canShoot to true here, it's handled by cooldown
        }
    }
}

// Collision detection: Projectile and Bubble
function detectCollisions() {
    players.forEach(playerObj => {
        if (!playerObj.active) return;

        // Projectile vs Bubble collision
        for (let i = playerObj.projectiles.length - 1; i >= 0; i--) {
            const p = playerObj.projectiles[i];
            let projectileHit = false;
            
            for (let j = bubbles.length - 1; j >= 0; j--) {
                const b = bubbles[j];

                // Circle vs Rectangle collision detection
                const closestX = Math.max(p.x, Math.min(b.x, p.x + p.width));
                const closestY = Math.max(p.y, Math.min(b.y, p.y + p.height));
                const distance = Math.sqrt((b.x - closestX) ** 2 + (b.y - closestY) ** 2);

                if (distance < b.radius) {
                    popBubble(b, j, playerObj);
                    playerObj.projectiles.splice(i, 1); // Remove projectile
                    projectileHit = true;
                    break; // Break inner loop as projectile is gone
                }
            }
            
            if (projectileHit) break; // Break outer loop if projectile was removed
        }
    });

    // Player vs Bubble collision (existing code)
    players.forEach(playerObj => {
        if (!playerObj.active) return;

        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            const dx = Math.abs(playerObj.x + playerObj.width / 2 - b.x);
            const dy = Math.abs(playerObj.y + playerObj.height / 2 - b.y);

            if (dx < (playerObj.width / 2 + b.radius) && dy < (playerObj.height / 2 + b.radius)) {
                const testX = Math.max(playerObj.x, Math.min(b.x, playerObj.x + playerObj.width));
                const testY = Math.max(playerObj.y, Math.min(b.y, playerObj.y + playerObj.height));
                const distance = Math.sqrt((b.x - testX) * (b.x - testX) + (b.y - testY) * (b.y - testY));

                if (distance < b.radius) {
                    loseLife(playerObj);
                    // Bubble bounce back
                    b.dx *= -1;
                    b.dy = -Math.abs(b.dy);
                    b.x += b.dx * 5;
                    b.y += b.dy * 5;
                }
            }
        }
    });

    // Player vs Power-up collision (existing code)
    players.forEach(playerObj => {
        if (!playerObj.active) return;

        for (let i = powerUps.length - 1; i >= 0; i--) {
            const pu = powerUps[i];

            if (playerObj.x < pu.x + pu.width &&
                playerObj.x + playerObj.width > pu.x &&
                playerObj.y < pu.y + pu.height &&
                playerObj.y + playerObj.height > pu.y) {
                applyPowerUp(playerObj, pu.type);
                powerUps.splice(i, 1);
            }
        }
    });
}

// Pop a bubble
function popBubble(bubble, index, playerWhoShot) {
    createParticles(bubble.x, bubble.y, bubble.color);
    playSound('pop');
    bubbles.splice(index, 1); // Remove current bubble
    playerWhoShot.score += 10 * bubble.size; // More points for bigger bubbles
    document.getElementById(`score${playerWhoShot.id}`).textContent = playerWhoShot.score;

    // Chance to drop a power-up (only for medium and large bubbles)
    if (bubble.size >= 2 && Math.random() < POWER_UP_DROP_CHANCE) {
        powerUps.push(new PowerUp(bubble.x, bubble.y, getRandomPowerUpType()));
    }

    // Split bubble into smaller ones if it's not the smallest size
    if (bubble.size > 1) {
        const newSize = bubble.size - 1;
        const newRadius = bubble.radius * 0.7; // Smaller radius
        const speedMultiplier = 1.5; // Speed boost for smaller bubbles
        const numberOfSplits = bubble.size === 3 ? 3 : 2; // Large bubbles split into 3, medium into 2
        
        for (let i = 0; i < numberOfSplits; i++) {
            // Calculate angle for spreading bubbles
            const angle = (Math.PI * 2 / numberOfSplits) * i - Math.PI / 2; // Start from top
            const speed = 2 + Math.random() * 2; // Random speed between 2-4
            
            const newBubble = new Bubble(
                bubble.x + Math.cos(angle) * 20, // Offset position slightly
                bubble.y + Math.sin(angle) * 20,
                newRadius,
                Math.cos(angle + Math.PI / 2) * speed * speedMultiplier, // Perpendicular to angle for spread
                Math.sin(angle) * speed * speedMultiplier - 1, // Upward bias
                newSize
            );
            
            bubbles.push(newBubble);
        }
    }

    // Check for level complete (no more bubbles)
    if (bubbles.length === 0) {
        setTimeout(() => checkLevelComplete(), 100); // Small delay to ensure all bubbles are processed
    }
}

// Lose a life
function loseLife(playerObj) {
    playerObj.lives--;
    document.getElementById(`lives${playerObj.id}`).textContent = playerObj.lives;

    if (playerObj.lives <= 0) {
        playerObj.active = false; // Player is out of the game
        playerObj.dx = 0; // Stop movement
        playerObj.projectiles = []; // Clear any remaining projectiles
        removePowerUp(playerObj); // Remove any active power-ups

        // Check if all players are out
        const allPlayersOut = players.every(p => !p.active);
        if (allPlayersOut) {
            playSound('gameover'); // Add this line
            showMessageBox('Game Over! Both players ran out of lives.', 'Restart Game', () => {
                hideMessageBox();
                resetGame();
                startGame();
            });
        }
    } else {
        // Reset player position after losing a life
        playerObj.x = canvas.width / 2 - playerObj.width / 2 + (playerObj.id === 1 ? -canvas.width / 4 : canvas.width / 4);
        playerObj.y = canvas.height - playerObj.height - 10;
        playerObj.dx = 0;
    }
}

// Reset game state
function resetGame() {
    gameOver = false;
    bubbles = [];
    powerUps.length = 0; // Clear power-ups
    createInitialBubbles();

    players.forEach(playerObj => {
        playerObj.score = 0;
        playerObj.lives = 3;
        playerObj.projectiles = [];
        playerObj.lastShotTime = 0;
        playerObj.shootCooldown = 500; // Reset to default
        playerObj.currentProjectileWidth = PROJECTILE_WIDTH; // Reset to default
        playerObj.activePowerUp = null; // Clear active power-up
        playerObj.active = true;
        document.getElementById(`score${playerObj.id}`).textContent = playerObj.score;
        document.getElementById(`lives${playerObj.id}`).textContent = playerObj.lives;
        // Reset player position
        playerObj.x = canvas.width / 2 - playerObj.width / 2 + (playerObj.id === 1 ? -canvas.width / 4 : canvas.width / 4);
        playerObj.y = canvas.height - playerObj.height - 10;
        playerObj.dx = 0;
    });
}

// Add level configuration at the top of your game.js file
const LEVEL_CONFIG = {
    1: { bubbles: 2, speed: 1, size: 80, colors: ['#f56565'] },
    2: { bubbles: 3, speed: 1.2, size: 85, colors: ['#f56565', '#ecc94b'] },
    3: { bubbles: 4, speed: 1.4, size: 90, colors: ['#f56565', '#ecc94b'] },
    4: { bubbles: 4, speed: 1.6, size: 95, colors: ['#f56565', '#ecc94b', '#63b3ed'] },
    5: { bubbles: 5, speed: 1.8, size: 100, colors: ['#f56565', '#ecc94b', '#63b3ed'] },
    6: { bubbles: 5, speed: 2.0, size: 105, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea'] },
    7: { bubbles: 6, speed: 2.2, size: 110, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea'] },
    8: { bubbles: 6, speed: 2.4, size: 115, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea', '#38b2ac'] },
    9: { bubbles: 7, speed: 2.6, size: 120, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea', '#38b2ac'] },
    10: { bubbles: 8, speed: 3.0, size: 125, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea', '#38b2ac', '#f093fb'] }
};

// Add level variables
let currentLevel = 1;
let levelStartTime = 0;
let levelTransitioning = false;

// Function to get level configuration (handles levels beyond 10)
function getLevelConfig(level) {
    if (LEVEL_CONFIG[level]) {
        return LEVEL_CONFIG[level];
    }
    
    // For levels beyond 10, scale difficulty
    const baseConfig = LEVEL_CONFIG[10];
    const scaleFactor = Math.floor((level - 10) / 5) + 1;
    
    return {
        bubbles: Math.min(baseConfig.bubbles + scaleFactor, 12),
        speed: Math.min(baseConfig.speed + (scaleFactor * 0.3), 4.0),
        size: Math.min(baseConfig.size + (scaleFactor * 5), 150),
        colors: baseConfig.colors
    };
}

// Update the initializeBubbles function
function initializeBubbles() {
    bubbles = [];
    const config = getLevelConfig(currentLevel);
    
    for (let i = 0; i < config.bubbles; i++) {
        // Create large bubbles (size 3) for the level system
        const x = Math.random() * (canvas.width - config.size * 2) + config.size;
        const y = Math.random() * (canvas.height / 2 - config.size) + config.size; // Keep in upper half
        const dx = (Math.random() - 0.5) * 3 * config.speed;
        const dy = Math.random() * 2 * config.speed;
        
        const newBubble = new Bubble(x, y, config.size, dx, dy, 3); // Always start with large bubbles (size 3)
        bubbles.push(newBubble);
    }
}

// Add level progression logic
function checkLevelComplete() {
    if (bubbles.length === 0 && !levelTransitioning) {
        levelTransitioning = true;
        currentLevel++;
        
        // Play level complete sound
        playSound('levelup');
        
        // Show level complete message
        showMessage(
            `Level ${currentLevel - 1} Complete!\nGet ready for Level ${currentLevel}`,
            'Next Level',
            () => {
                levelTransitioning = false;
                initializeBubbles();
                hideMessage();
                levelStartTime = Date.now();
            }
        );
        
        // Update level display
        document.getElementById('level').textContent = currentLevel;
        
        // Add bonus points for completing level quickly
        const timeBonus = Math.max(0, 30000 - (Date.now() - levelStartTime));
        const bonusPoints = Math.floor(timeBonus / 1000) * 10;
        
        if (bonusPoints > 0) {
            // Add bonus to both players (or just active players)
            if (player1.active) {
                player1.score += bonusPoints;
                document.getElementById('score1').textContent = player1.score;
            }
            if (player2.active) {
                player2.score += bonusPoints;
                document.getElementById('score2').textContent = player2.score;
            }
        }
    }
}

// Update controls handling
function handleInput() {
    // Player 1 controls (Arrow keys)
    if (keys['ArrowLeft'] && player1.active) {
        player1.dx = -player1.speed;
    } else if (keys['ArrowRight'] && player1.active) {
        player1.dx = player1.speed;
    } else if (player1.active) {
        player1.dx = 0;
    }

    // Player 2 controls (WASD keys)
    if (keys['a'] && player2.active) {
        player2.dx = -player2.speed;
    } else if (keys['d'] && player2.active) {
        player2.dx = player2.speed;
    } else if (player2.active) {
        player2.dx = 0;
    }

    // Shooting - with proper bullet limit checking
    if (keys['ArrowUp'] && player1.active && 
        player1.projectiles.length < MAX_PROJECTILES_PER_PLAYER && 
        Date.now() - player1.lastShotTime > player1.shootCooldown) {
        shootProjectile(player1);
    }

    if (keys['w'] && player2.active && 
        player2.projectiles.length < MAX_PROJECTILES_PER_PLAYER && 
        Date.now() - player2.lastShotTime > player2.shootCooldown) {
        shootProjectile(player2);
    }
}

// Fix the bullet limit system - replace the shootProjectile function:
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

// Clear canvas function
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update bubbles function
function updateBubbles() {
    bubbles.forEach(bubble => {
        if (bubble.update) {
            bubble.update();
        } else {
            // For non-class bubbles, apply the update logic directly
            bubble.dy += bubbleGravity;
            bubble.x += bubble.dx;
            bubble.y += bubble.dy;

            // Wall collision
            if (bubble.x + bubble.radius > canvas.width || bubble.x - bubble.radius < 0) {
                bubble.dx *= -1;
                if (bubble.x + bubble.radius > canvas.width) bubble.x = canvas.width - bubble.radius;
                if (bubble.x - bubble.radius < 0) bubble.x = bubble.radius;
            }

            // Floor collision
            if (bubble.y + bubble.radius > canvas.height) {
                bubble.y = canvas.height - bubble.radius;
                bubble.dy *= bubbleBounceFactor;
                if (Math.abs(bubble.dy) < 0.5) {
                    bubble.dy = 0;
                }
            }
            // Ceiling collision
            if (bubble.y - bubble.radius < 0) {
                bubble.y = bubble.radius;
                bubble.dy *= -1;
            }
        }
    });
}

// Draw bubbles function
function drawBubbles() {
    bubbles.forEach(bubble => {
        if (bubble.draw) {
            bubble.draw();
        } else {
            // Draw non-class bubbles
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx.fillStyle = bubble.color;
            ctx.fill();
            ctx.strokeStyle = '#a0aec0';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    });
}

// Update players function
function updatePlayers() {
    players.forEach(player => updatePlayer(player));
}

// Draw players function
function drawPlayers() {
    players.forEach(player => drawPlayer(player));
}

// Update projectiles function
function updateProjectiles() {
    updateProjectilesForAllPlayers();
}

// Draw projectiles function  
function drawProjectiles() {
    drawProjectilesForAllPlayers();
}

// Update power-ups function
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        pu.update();
        if (pu.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

// Draw power-ups function
function drawPowerUps() {
    powerUps.forEach(pu => pu.draw());
}

// Check collisions function
function checkCollisions() {
    detectCollisions();
}

// Message functions (replace showMessageBox references)
function showMessage(message, buttonText, buttonAction) {
    console.log("showMessage called with:", message, buttonText);
    
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    if (!messageBox || !messageText || !actionButton) {
        console.error("Message elements not found!");
        console.log("messageBox:", messageBox);
        console.log("messageText:", messageText);
        console.log("actionButton:", actionButton);
        return;
    }
    
    messageText.textContent = message;
    actionButton.textContent = buttonText;
    actionButton.onclick = buttonAction;
    messageBox.style.display = 'block';
    gamePaused = true;
    
    console.log("Message shown successfully");
}

function hideMessage() {
    console.log("hideMessage called");
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.style.display = 'none';
        gamePaused = false;
        console.log("Message hidden successfully");
    } else {
        console.error("MessageBox not found in hideMessage!");
    }
}

// Fix the main game loop
function gameLoop() {
    if (gameRunning && !gamePaused) {
        clearCanvas();
        handleInput();
        updateBubbles();
        updatePlayers();
        updateProjectiles();
        updatePowerUps();
        checkCollisions();
        checkLevelComplete();
        drawEverything();
        
        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.update();
            particle.draw();
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }
    requestAnimationFrame(gameLoop);
}

// Player input handling loop
function handlePlayerInput() {
    // Player 1 controls
    if (keys['ArrowLeft'] && player1.active) {
        player1.dx = -player1.speed;
    } else if (keys['ArrowRight'] && player1.active) {
        player1.dx = player1.speed;
    } else if (player1.active) {
        player1.dx = 0;
    }

    // Player 2 controls  
    if (keys['a'] && player2.active) {
        player2.dx = -player2.speed;
    } else if (keys['d'] && player2.active) {
        player2.dx = player2.speed;
    } else if (player2.active) {
        player2.dx = 0;
    }

    // Shooting
    if (keys['ArrowUp'] && player1.active && player1.projectiles.length < MAX_PROJECTILES_PER_PLAYER && 
        Date.now() - player1.lastShotTime > player1.shootCooldown) {
        shootProjectile(player1);
        playSound('shoot');
    }

    if (keys['w'] && player2.active && player2.projectiles.length < MAX_PROJECTILES_PER_PLAYER && 
        Date.now() - player2.lastShotTime > player2.shootCooldown) {
        shootProjectile(player2);
        playSound('shoot');
    }

    requestAnimationFrame(handlePlayerInput);
}

// Initialize and start the game when page loads
window.addEventListener('load', () => {
    console.log("=== WINDOW LOADED - GAME STARTING ===");
    
    // Check if canvas exists
    const canvas = document.getElementById('gameCanvas');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    console.log("Canvas found:", !!canvas);
    console.log("MessageBox found:", !!messageBox);
    console.log("MessageText found:", !!messageText);
    console.log("ActionButton found:", !!actionButton);
    
    if (!canvas) {
        console.error("CRITICAL: Canvas not found!");
        return;
    }
    
    if (!messageBox || !messageText || !actionButton) {
        console.error("CRITICAL: Message elements not found!");
        return;
    }
    
    setupMobileControls();
    
    // Show start message
    console.log("=== SHOWING START MESSAGE ===");
    showMessage(
        "Welcome to Theo's Bubble Trouble!\nReady to start?",
        'Start Game',
        () => {
            console.log("=== START BUTTON CLICKED ===");
            hideMessage();
            startNewGame();
            gameLoop();
            // Remove the handlePlayerInput call as it was causing issues
        }
    );
});

console.log("=== GAME.JS FULLY LOADED ===");

// Missing keyboard input handling
const keys = {}

// Add keyboard event listeners
document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

// Missing particle system
const particles = [];

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1.0;
        this.decay = 0.02;
        this.color = color;
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.99;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Missing sound system
function playSound(soundName) {
    // Placeholder for sound - you can add actual sound files later
    console.log(`Playing sound: ${soundName}`);
}

// Missing setupMobileControls function
function setupMobileControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');
    
    if (leftBtn && rightBtn && shootBtn) {
        // Touch events for mobile
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys['ArrowLeft'] = true;
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['ArrowLeft'] = false;
        });
        
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys['ArrowRight'] = true;
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['ArrowRight'] = false;
        });
        
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys['ArrowUp'] = true;
        });
        
        shootBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys['ArrowUp'] = false;
        });
        
        // Also add mouse events for desktop testing
        leftBtn.addEventListener('mousedown', () => keys['ArrowLeft'] = true);
        leftBtn.addEventListener('mouseup', () => keys['ArrowLeft'] = false);
        rightBtn.addEventListener('mousedown', () => keys['ArrowRight'] = true);
        rightBtn.addEventListener('mouseup', () => keys['ArrowRight'] = false);
        shootBtn.addEventListener('mousedown', () => keys['ArrowUp'] = true);
        shootBtn.addEventListener('mouseup', () => keys['ArrowUp'] = false);
    }
}

// Missing drawEverything function
function drawEverything() {
    drawBubbles();
    drawPlayers();
    drawProjectiles();
    drawPowerUps();
    drawLevelInfo();
}

// Missing drawLevelInfo function
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

// Missing startNewGame function
function startNewGame() {
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
    
    // Initialize bubbles using the level system
    initializeBubbles();
    
    gameRunning = true;
    gamePaused = false;
    gameOver = false;
}

// Fix the recursive function calls in updateProjectiles and drawProjectiles
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

// Update the handlePlayerInput function to remove the recursive call
function handlePlayerInput() {
    // This function was calling itself recursively - remove the recursive call
    // The game loop will handle continuous input checking
}

// Replace the window load event with this corrected version:
window.addEventListener('load', () => {
    console.log("=== WINDOW LOADED - GAME STARTING ===");
    
    // Check if canvas exists
    const canvas = document.getElementById('gameCanvas');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    console.log("Canvas found:", !!canvas);
    console.log("MessageBox found:", !!messageBox);
    console.log("MessageText found:", !!messageText);
    console.log("ActionButton found:", !!actionButton);
    
    if (!canvas) {
        console.error("CRITICAL: Canvas not found!");
        return;
    }
    
    if (!messageBox || !messageText || !actionButton) {
        console.error("CRITICAL: Message elements not found!");
        return;
    }
    
    setupMobileControls();
    
    // Show start message
    console.log("=== SHOWING START MESSAGE ===");
    showMessage(
        "Welcome to Theo's Bubble Trouble!\nReady to start?",
        'Start Game',
        () => {
            console.log("=== START BUTTON CLICKED ===");
            hideMessage();
            startNewGame();
            gameLoop();
            // Remove the handlePlayerInput call as it was causing issues
        }
    );
});

console.log("=== GAME.JS FULLY LOADED ===");
