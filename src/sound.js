console.log("=== SOUND.JS LOADING ===");

// Initialize sound system
function initializeSounds() {
    console.log('Initializing sound system...');
    
    // Preload all game sounds (use the global sounds object from constants.js)
    sounds.pop = new Audio('media/pop.wav');
    sounds.bubble = new Audio('media/bubble.wav');
    sounds.shoot = new Audio('media/shoot.wav');
    sounds.powerup = new Audio('media/powerup.wav');
    sounds.levelup = new Audio('media/levelup.wav');
    sounds.gameover = new Audio('media/gameover.wav');
    sounds.start = new Audio('media/start.wav');
    
    // Set volume for all sounds
    Object.values(sounds).forEach(sound => {
        sound.volume = 0.5; // 50% volume
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
        sound.volume = 0.5;
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
    
    // Update UI button if it exists
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !soundEnabled);
    }
    
    return soundEnabled;
}

console.log("=== SOUND.JS LOADED ===");