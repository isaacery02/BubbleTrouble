// Input handling for keyboard and mobile

// Add keyboard event listeners with preventDefault for game keys
document.addEventListener('keydown', (event) => {
    // List of keys used in the game that should not trigger default browser behavior
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'];
    
    if (gameKeys.includes(event.key)) {
        event.preventDefault(); // Prevent default browser behavior
    }
    
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    // List of keys used in the game that should not trigger default browser behavior
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'];
    
    if (gameKeys.includes(event.key)) {
        event.preventDefault(); // Prevent default browser behavior
    }
    
    keys[event.key] = false;
});

// Handle player input
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

// Mobile controls setup
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

console.log("=== INPUT.JS LOADED ===");