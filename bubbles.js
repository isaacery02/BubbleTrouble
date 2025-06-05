// Bubble class and management

class Bubble {
    constructor(x, y, radius, speed = 1) {
        this.x = x || 0;
        this.y = y || 0;
        this.radius = Math.max(10, radius || 20); // Ensure minimum radius
        this.speed = Math.max(0.5, speed || 1); // Ensure minimum speed
        
        // Set initial velocity - ensure they're finite numbers
        this.dx = (Math.random() - 0.5) * this.speed * 2;
        this.dy = -Math.abs(Math.random() * this.speed + 1); // Always start moving up
        
        // Ensure all values are finite
        if (!isFinite(this.dx)) this.dx = 1;
        if (!isFinite(this.dy)) this.dy = -1;
        if (!isFinite(this.x)) this.x = 100;
        if (!isFinite(this.y)) this.y = 100;
        if (!isFinite(this.radius)) this.radius = 20;
        
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        // Validate all values before drawing
        if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.radius)) {
            console.error('Invalid bubble values:', this.x, this.y, this.radius);
            return;
        }
        
        ctx.save();
        
        // Create gradient with validated values
        try {
            const gradient = ctx.createRadialGradient(
                this.x - this.radius * 0.3, 
                this.y - this.radius * 0.3, 
                0,
                this.x, 
                this.y, 
                this.radius
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.7, this.color + '88');
            gradient.addColorStop(1, this.color + '44');
            
            ctx.fillStyle = gradient;
        } catch (error) {
            console.warn('Gradient creation failed, using solid color:', error);
            ctx.fillStyle = this.color;
        }
        
        // Draw bubble
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.3, 
            this.y - this.radius * 0.3, 
            this.radius * 0.3, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }

    update() {
        // Validate velocities before updating
        if (!isFinite(this.dx)) this.dx = 1;
        if (!isFinite(this.dy)) this.dy = -1;
        
        // Apply gravity
        this.dy += bubbleGravity;
        
        // Update position
        this.x += this.dx;
        this.y += this.dy;
        
        // Validate position after update
        if (!isFinite(this.x)) this.x = canvas.width / 2;
        if (!isFinite(this.y)) this.y = canvas.height / 2;
    }
}

function initializeBubbles() {
    const config = getLevelConfig(currentLevel);
    console.log(`Initializing ${config.bubbleCount} bubbles for level ${currentLevel}`);
    console.log('Config:', config);
    
    bubbles = []; // Clear existing bubbles
    
    // Validate canvas dimensions
    if (!canvas || !isFinite(canvas.width) || !isFinite(canvas.height)) {
        console.error('Invalid canvas dimensions');
        return;
    }
    
    for (let i = 0; i < config.bubbleCount; i++) {
        let x, y;
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loops
        
        do {
            // Calculate safe position
            x = Math.max(config.size, Math.min(canvas.width - config.size, 
                (canvas.width / (config.bubbleCount + 1)) * (i + 1)));
            y = Math.max(config.size, canvas.height / 4);
            
            // If there's a conflict, try alternative positions
            if (typeof checkObstacleConflict === 'function' && checkObstacleConflict(x, y, config.size)) {
                // Try alternative spawn positions
                const alternatives = [
                    { x: x, y: canvas.height / 6 }, // Higher up
                    { x: x + 50, y: y }, // Shifted right
                    { x: x - 50, y: y }, // Shifted left
                    { x: x, y: canvas.height / 3 }, // Lower
                    { x: canvas.width * 0.2 * (i + 1), y: canvas.height / 5 }, // Spread out more
                ];
                
                let foundSafe = false;
                for (const alt of alternatives) {
                    // Make sure alternative is within bounds
                    if (alt.x >= config.size && alt.x <= canvas.width - config.size &&
                        alt.y >= config.size && alt.y <= canvas.height - 100) {
                        
                        if (!checkObstacleConflict(alt.x, alt.y, config.size)) {
                            x = alt.x;
                            y = alt.y;
                            foundSafe = true;
                            break;
                        }
                    }
                }
                
                if (!foundSafe) {
                    // Last resort: random position away from obstacles
                    x = Math.random() * (canvas.width - config.size * 2) + config.size;
                    y = Math.random() * (canvas.height / 3) + config.size;
                }
            }
            
            attempts++;
        } while (typeof checkObstacleConflict === 'function' && 
                 checkObstacleConflict(x, y, config.size) && 
                 attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            console.warn(`Could not find safe spawn position for bubble ${i + 1}, using fallback`);
            // Use a guaranteed safe position (far from obstacles)
            x = canvas.width / 2;
            y = config.size + 10;
        }
        
        console.log(`Creating bubble ${i + 1} at (${x}, ${y}) with radius ${config.size} (attempts: ${attempts})`);
        
        const bubble = new Bubble(x, y, config.size, config.speed);
        
        // Validate bubble before adding
        if (isFinite(bubble.x) && isFinite(bubble.y) && isFinite(bubble.radius)) {
            bubbles.push(bubble);
        } else {
            console.error('Invalid bubble created:', bubble);
        }
    }
    
    console.log(`Successfully created ${bubbles.length} bubbles`);
}

function updateBubbles() {
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        
        // Validate bubble before updating
        if (!b || !isFinite(b.x) || !isFinite(b.y)) {
            console.warn('Removing invalid bubble at index', i);
            bubbles.splice(i, 1);
            continue;
        }
        
        b.update();
        
        // Wall collisions
        if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) {
            b.dx *= -1;
            b.x = Math.max(b.radius, Math.min(canvas.width - b.radius, b.x));
        }
        
        // Floor collision
        if (b.y + b.radius > canvas.height) {
            b.dy *= bubbleBounceFactor;
            b.y = canvas.height - b.radius;
            
            if (Math.abs(b.dy) < 0.5) {
                b.dy = -2;
            }
        }
        
        // Ceiling collision
        if (b.y - b.radius < 0) {
            b.dy *= -1;
            b.y = b.radius;
        }
        
        // Check obstacle collisions
        if (typeof obstacles !== 'undefined' && obstacles.length > 0) {
            obstacles.forEach(obstacle => {
                if (obstacle.checkCollision) {
                    obstacle.checkCollision(b);
                }
            });
        }
    }
}

function drawBubbles() {
    bubbles.forEach(bubble => {
        if (bubble && isFinite(bubble.x) && isFinite(bubble.y) && isFinite(bubble.radius)) {
            bubble.draw();
        }
    });
}

console.log("=== BUBBLES.JS LOADED ===");