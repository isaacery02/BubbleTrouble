// Bubble class and management

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
        const config = getLevelConfig(currentLevel);
        const levelColors = config.colors;
        
        switch (size) {
            case 3: return levelColors[0] || '#f56565';
            case 2: return levelColors[1] || '#ecc94b';
            case 1: return levelColors[2] || '#63b3ed';
            default: return '#cbd5e0';
        }
    }

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
            '#f56565': '#e53e3e',
            '#ecc94b': '#d69e2e',
            '#63b3ed': '#3182ce'
        };
        return colors[this.color] || this.color;
    }

    update() {
        this.dy += bubbleGravity;
        this.x += this.dx;
        this.y += this.dy;

        // Wall collision
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx *= -1;
            if (this.x + this.radius > canvas.width) this.x = canvas.width - this.radius;
            if (this.x - this.radius < 0) this.x = this.radius;
        }

        // Floor collision
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.dy *= bubbleBounceFactor;
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

function updateBubbles() {
    bubbles.forEach(bubble => {
        if (bubble.update) {
            bubble.update();
        }
    });
}

function drawBubbles() {
    bubbles.forEach(bubble => {
        if (bubble.draw) {
            bubble.draw();
        }
    });
}

function popBubble(bubble, index, playerWhoShot) {
    createParticles(bubble.x, bubble.y, bubble.color);
    playSound('pop');
    bubbles.splice(index, 1);
    playerWhoShot.score += 10 * bubble.size;
    document.getElementById(`score${playerWhoShot.id}`).textContent = playerWhoShot.score;

    if (bubble.size >= 2 && Math.random() < POWER_UP_DROP_CHANCE) {
        powerUps.push(new PowerUp(bubble.x, bubble.y, getRandomPowerUpType()));
    }

    if (bubble.size > 1) {
        const newSize = bubble.size - 1;
        const newRadius = bubble.radius * 0.7;
        const speedMultiplier = 1.5;
        const numberOfSplits = bubble.size === 3 ? 3 : 2;
        
        for (let i = 0; i < numberOfSplits; i++) {
            const angle = (Math.PI * 2 / numberOfSplits) * i - Math.PI / 2;
            const speed = 2 + Math.random() * 2;
            
            const newBubble = new Bubble(
                bubble.x + Math.cos(angle) * 20,
                bubble.y + Math.sin(angle) * 20,
                newRadius,
                Math.cos(angle + Math.PI / 2) * speed * speedMultiplier,
                Math.sin(angle) * speed * speedMultiplier - 1,
                newSize
            );
            
            bubbles.push(newBubble);
        }
    }

    if (bubbles.length === 0) {
        setTimeout(() => checkLevelComplete(), 100);
    }
}

console.log("=== BUBBLES.JS LOADED ===");