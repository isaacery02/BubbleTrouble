console.log("=== SOUND.JS LOADING ===");

// Initialize sound system
function initializeSounds() {
    console.log('Initializing sound system...');
    
    // Add hit sound to the sound files
    sounds.pop = new Audio('media/pop.wav');
    sounds.bubble = new Audio('media/bubble.wav');
    sounds.shoot = new Audio('media/shoot.wav');
    sounds.powerup = new Audio('media/powerup.wav');
    sounds.levelup = new Audio('media/levelup.wav');
    sounds.gameover = new Audio('media/gameover.wav');
    sounds.start = new Audio('media/start.wav');
    sounds.hit = new Audio('media/hit.wav');
    
    // Set volume for all sounds
    Object.values(sounds).forEach(sound => {
        sound.volume = 0.3;
        sound.preload = 'auto';
    });
    
    console.log('Sound system initialized with', Object.keys(sounds).length, 'sounds');
}

// Play sound function
function playSound(soundName) {
    if (!soundEnabled || !sounds[soundName]) {
        console.log('Sound not played:', soundName, 'enabled:', soundEnabled, 'exists:', !!sounds[soundName]);
        return;
    }
    
    try {
        // Clone the audio to allow overlapping sounds
        const sound = sounds[soundName].cloneNode();
        sound.currentTime = 0;
        sound.volume = 0.3;
        sound.play().catch(error => {
            console.log('Sound play failed (autoplay policy):', soundName, error.message);
        });
        console.log('Playing sound:', soundName);
    } catch (error) {
        console.error('Error playing sound:', soundName, error);
    }
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    console.log('Sound', soundEnabled ? 'enabled' : 'disabled');
    return soundEnabled; // Return the current state
}

// In player.js, find the function that handles player getting hit
function handlePlayerHit(player) {
    // Play hit sound
    if (typeof playSound === 'function') {
        playSound('hit');
    }
    
    player.lives--;
    console.log(`Player ${player.id} hit! Lives remaining: ${player.lives}`);
    
    // Your existing hit handling code...
}

console.log("=== SOUND.JS LOADED ===");