// Particle effects and visual enhancements

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

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => particle.draw());
}

// Sound system using actual audio files
const sounds = {};
let soundsEnabled = true;

// Preload sounds
function loadSounds() {
    const soundFiles = {
        'shoot': 'sounds/shoot.wav',
        'pop': 'sounds/pop.wav',
        'powerup': 'sounds/powerup.wav',
        'levelup': 'sounds/levelup.wav',
        'gameover': 'sounds/gameover.wav',
        'hit': 'sounds/hit.wav',
        'start': 'sounds/start.wav'  // Add the start sound
    };

    for (const [name, path] of Object.entries(soundFiles)) {
        sounds[name] = new Audio(path);
        sounds[name].volume = 0.3; // Set default volume
        sounds[name].preload = 'auto';
        
        // Handle load errors gracefully
        sounds[name].addEventListener('error', () => {
            console.warn(`Failed to load sound: ${path}`);
        });
        
        sounds[name].addEventListener('canplaythrough', () => {
            console.log(`Sound loaded: ${name}`);
        });
    }
}

// Play sound function
function playSound(soundName) {
    if (!soundsEnabled || !sounds[soundName]) {
        console.log(`Sound not available: ${soundName}`);
        return;
    }

    try {
        // Reset the sound to beginning and play
        sounds[soundName].currentTime = 0;
        const playPromise = sounds[soundName].play();
        
        // Handle play promise (required for some browsers)
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn(`Error playing sound ${soundName}:`, error);
            });
        }
    } catch (error) {
        console.warn(`Error playing sound ${soundName}:`, error);
    }
}

// Function to toggle sound on/off
function toggleSound() {
    soundsEnabled = !soundsEnabled;
    console.log('Sounds', soundsEnabled ? 'enabled' : 'disabled');
    return soundsEnabled;
}

// Set volume for all sounds
function setSoundVolume(volume) {
    volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    for (const sound of Object.values(sounds)) {
        sound.volume = volume;
    }
}

// Load sounds when the script loads
loadSounds();

console.log("=== EFFECTS.JS LOADED ===");