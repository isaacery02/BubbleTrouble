// Input handling system

// Key state tracking
let keys = {};
let keyJustPressed = {}; // Track keys that were just pressed this frame

// Haptic feedback helper
function triggerHapticFeedback(duration = 50) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

// Add visual feedback to mobile buttons
function addButtonPressEffect(button) {
    if (button) {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 100);
    }
}

// Key event listeners
document.addEventListener('keydown', (event) => {
    const wasPressed = keys[event.code];
    keys[event.code] = true;
    
    // Mark as "just pressed" only if it wasn't already pressed
    if (!wasPressed) {
        keyJustPressed[event.code] = true;
        
        // Handle shooting immediately on key press
        if (event.code === 'ArrowUp' && player1.active) {
            if (typeof shootProjectile === 'function') {
                shootProjectile(player1);
            }
        }
        if (event.code === 'KeyW' && (gameMode === 'multi' || gameMode === 'ai-coop') && player2.active) {
            if (typeof shootProjectile === 'function') {
                shootProjectile(player2);
            }
        }
    }
    
    // Prevent default behavior for game keys
    if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyD'].includes(event.code)) {
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
    keyJustPressed[event.code] = false;
});

// Handle keyboard input for both players
function handleInput() {
    // Clear the "just pressed" flags at the start of each frame
    keyJustPressed = {};

    // Handle movement (these can be continuous)
    if (keys['ArrowLeft'] && player1.active) {
        player1.dx = -PLAYER_SPEED;
    } else if (keys['ArrowRight'] && player1.active) {
        player1.dx = PLAYER_SPEED;
    } else if (player1.active) {
        player1.dx = 0;
    }

    if (gameMode === 'multi' || gameMode === 'ai-coop') {
        if (keys['KeyA'] && player2.active) {
            player2.dx = -PLAYER_SPEED;
        } else if (keys['KeyD'] && player2.active) {
            player2.dx = PLAYER_SPEED;
        } else if (player2.active) {
            player2.dx = 0;
        }
    } else if (player2.active) { // Ensure P2 doesn't move if somehow active in single player
        player2.dx = 0;
    }
    // Note: Shooting is now handled in keydown event, not here
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
        addButtonPressEffect(leftBtn);
        triggerHapticFeedback(30);
    });
    
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = false;
    });

    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['ArrowRight'] = true;
        addButtonPressEffect(rightBtn);
        triggerHapticFeedback(30);
    });
    
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ArrowRight'] = false;
    });

    // Update mobile controls in setupMobileControls function
    if (shootBtn) {
        // Remove any existing listeners
        shootBtn.removeEventListener('touchstart', handleMobileShoot);
        shootBtn.removeEventListener('click', handleMobileShoot);
        
        // Add single-fire event listeners
        shootBtn.addEventListener('touchstart', handleMobileShoot, { passive: false });
        shootBtn.addEventListener('click', handleMobileShoot);
    }

    // Also add mouse support for testing
    leftBtn.addEventListener('mousedown', () => {
        keys['ArrowLeft'] = true;
        addButtonPressEffect(leftBtn);
    });
    leftBtn.addEventListener('mouseup', () => keys['ArrowLeft'] = false);
    
    rightBtn.addEventListener('mousedown', () => {
        keys['ArrowRight'] = true;
        addButtonPressEffect(rightBtn);
    });
    rightBtn.addEventListener('mouseup', () => keys['ArrowRight'] = false);
    
    shootBtn.addEventListener('mousedown', () => {
        keys['ArrowUp'] = true;
        addButtonPressEffect(shootBtn);
    });
    shootBtn.addEventListener('mouseup', () => keys['ArrowUp'] = false);
}

function handleMobileShoot(e) {
    e.preventDefault();
    addButtonPressEffect(document.getElementById('shootBtn'));
    triggerHapticFeedback(50);
    // Mobile controls typically control Player 1
    if (player1.active && typeof shootProjectile === 'function') {
        shootProjectile(player1);
    }
}

console.log("=== INPUT.JS LOADED ===");