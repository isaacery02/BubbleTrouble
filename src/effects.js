// Sound and visual effects system

// Sound loading and management
function loadSound(name, src) {
    try {
        sounds[name] = new Audio(src);
        sounds[name].preload = 'auto';
        sounds[name].addEventListener('error', (e) => {
            // Create a silent placeholder so the game doesn't break
            sounds[name] = { play: () => {}, currentTime: 0 };
        });
    } catch (error) {
        // Create a silent placeholder
        sounds[name] = { play: () => {}, currentTime: 0 };
    }
}

function playSound(name) {
    if (!soundEnabled) return;
    if (!sounds[name]) return;
    try {
        sounds[name].currentTime = 0;
        const playPromise = sounds[name].play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    } catch (error) {}
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        if (soundEnabled) {
            soundToggle.textContent = '🔊 Sound';
            soundToggle.classList.remove('muted');
            initializeSounds();
        } else {
            soundToggle.textContent = '🔇 Muted';
            soundToggle.classList.add('muted');
        }
    }
    return soundEnabled;
}

function initializeSounds() {
    console.log('Initializing sound system...');
    loadSound('shoot', 'media/shoot.wav');
    loadSound('pop', 'media/pop.wav');
    loadSound('hit', 'media/hit.wav');
    loadSound('powerup', 'media/powerup.wav');
    loadSound('levelup', 'media/levelup.wav');
    loadSound('gameover', 'media/gameover.wav');
    loadSound('start', 'media/start.wav');
    console.log('Sound system initialized with', Object.keys(sounds).length, 'sounds');
}

// Particle system
class Particle {
    constructor(x, y, color, life = 30) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.vx *= 0.99; // air resistance
        this.life--;
        return this.life > 0;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
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
        if (!particles[i].update()) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => particle.draw());
}

function initializeSoundToggle() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', toggleSound);
        // Set initial state
        if (soundEnabled) {
            soundToggle.textContent = '🔊 Sound';
            soundToggle.classList.remove('muted');
        } else {
            soundToggle.textContent = '🔇 Muted';
            soundToggle.classList.add('muted');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSoundToggle);

// Initialize sounds when the script loads
if (soundEnabled) {
    initializeSounds();
}

console.log("=== EFFECTS.JS LOADED ===");