// Input handling system

// Key state tracking
const keys = {};

// Key event listeners
document.addEventListener('keydown', (event) => {
    // List of keys used in the game that should not trigger default browser behavior
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'];
    
    if (gameKeys.includes(event.key)) {
        event.preventDefault(); // Prevent default browser behavior
    }
    
    keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    // List of keys used in the game that should not trigger default browser behavior
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'];
    
    if (gameKeys.includes(event.key)) {
        event.preventDefault(); // Prevent default browser behavior
    }
    
    keys[event.code] = false;
});

// Handle keyboard input for both players
function handleInput() {
    // Player 1 controls (Arrow keys)
    if (keys['ArrowLeft'] && player1.active) {
        player1.dx = -PLAYER_SPEED;
    } else if (keys['ArrowRight'] && player1.active) {
        player1.dx = PLAYER_SPEED;
    } else if (player1.active) {
        player1.dx = 0;
    }

    if (keys['ArrowUp'] && player1.active) {
        shootProjectile(player1);
    }

    // Player 2 controls (WASD keys)
    if (keys['KeyA'] && player2.active) {
        player2.dx = -PLAYER_SPEED;
    } else if (keys['KeyD'] && player2.active) {
        player2.dx = PLAYER_SPEED;
    } else if (player2.active) {
        player2.dx = 0;
    }

    if (keys['KeyW'] && player2.active) {
        shootProjectile(player2);
    }
}

// Mobile controls setup
function setupMobileControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');
    const mobileControls = document.getElementById('mobileControls');

    if (!leftBtn || !rightBtn || !shootBtn || !mobileControls) {
        console.log('Mobile controls not found - running on desktop');
        return;
    }

    // Show mobile controls only on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        mobileControls.style.display = 'flex';
    }

    // Touch controls for movement
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

    // Also add mouse support for testing
    leftBtn.addEventListener('mousedown', () => keys['ArrowLeft'] = true);
    leftBtn.addEventListener('mouseup', () => keys['ArrowLeft'] = false);
    rightBtn.addEventListener('mousedown', () => keys['ArrowRight'] = true);
    rightBtn.addEventListener('mouseup', () => keys['ArrowRight'] = false);
    shootBtn.addEventListener('mousedown', () => keys['ArrowUp'] = true);
    shootBtn.addEventListener('mouseup', () => keys['ArrowUp'] = false);
}

console.log("=== INPUT.JS LOADED ===");