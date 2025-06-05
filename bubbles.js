// Bubble management system

class Bubble {
    constructor(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed || 1;
        this.dx = (Math.random() - 0.5) * 5 * this.speed; // Increased initial speed
        this.dy = Math.random() * -4 - 2; // Stronger initial upward velocity
        this.color = this.getRandomColor();
        this.bounceCount = 0;
        this.minSpeed = 1.0; // Increased minimum speed
        this.maxSpeed = 8.0; // Maximum speed to prevent chaos
    }

    getRandomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', 
            '#f9ca24', '#f0932b', '#eb4d4b',
            '#6c5ce7', '#a29bfe', '#fd79a8'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Apply gravity (reduced for more bouncing)
        this.dy += bubbleGravity;
        
        // Limit maximum falling speed
        if (this.dy > this.maxSpeed) {
            this.dy = this.maxSpeed;
        }
        
        // Update position
        this.x += this.dx;
        this.y += this.dy;
        
        // Bounce off left wall
        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.dx = Math.abs(this.dx) * bubbleBounceFactor;
            // Ensure minimum speed and add some variation
            if (Math.abs(this.dx) < this.minSpeed) {
                this.dx = this.minSpeed + Math.random() * 0.5;
            }
            // Add slight upward boost on wall bounce
            this.dy -= 0.5;
        }
        
        // Bounce off right wall
        if (this.x + this.radius >= canvas.width) {
            this.x = canvas.width - this.radius;
            this.dx = -Math.abs(this.dx) * bubbleBounceFactor;
            // Ensure minimum speed and add some variation
            if (Math.abs(this.dx) < this.minSpeed) {
                this.dx = -(this.minSpeed + Math.random() * 0.5);
            }
            // Add slight upward boost on wall bounce
            this.dy -= 0.5;
        }
        
        // Bounce off ground (more energetic)
        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            
            // More energetic ground bounce
            this.dy = -Math.abs(this.dy) * (bubbleBounceFactor + 0.1);
            this.bounceCount++;
            
            // Ensure strong minimum bounce
            if (Math.abs(this.dy) < this.minSpeed * 3) {
                this.dy = -(this.minSpeed * 3 + Math.random() * 2);
            }
            
            // Add horizontal variation to prevent repetitive bouncing
            this.dx += (Math.random() - 0.5) * 1.0;
            
            // Limit horizontal speed
            if (Math.abs(this.dx) > this.maxSpeed) {
                this.dx = this.dx > 0 ? this.maxSpeed : -this.maxSpeed;
            }
        }
        
        // Bounce off ceiling
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.dy = Math.abs(this.dy) * bubbleBounceFactor;
            // Ensure minimum downward speed
            if (this.dy < this.minSpeed) {
                this.dy = this.minSpeed + Math.random() * 0.5;
            }
        }
        
        // Handle obstacle collisions
        this.checkObstacleCollisions();
        
        // Prevent bubbles from getting too slow
        if (Math.abs(this.dx) < this.minSpeed * 0.5) {
            this.dx = this.dx > 0 ? this.minSpeed : -this.minSpeed;
        }
        if (Math.abs(this.dy) < this.minSpeed * 0.3 && this.dy > 0) {
            this.dy = this.minSpeed * 0.5;
        }
    }

    checkObstacleCollisions() {
        if (typeof obstacles === 'undefined' || !obstacles.length) return;
        
        obstacles.forEach(obstacle => {
            // Check if bubble collides with obstacle
            const closestX = Math.max(obstacle.x, Math.min(this.x, obstacle.x + obstacle.width));
            const closestY = Math.max(obstacle.y, Math.min(this.y, obstacle.y + obstacle.height));
            
            const distance = Math.sqrt(
                (this.x - closestX) * (this.x - closestX) + 
                (this.y - closestY) * (this.y - closestY)
            );
            
            if (distance < this.radius) {
                // Collision detected - determine which side was hit
                const centerX = obstacle.x + obstacle.width / 2;
                const centerY = obstacle.y + obstacle.height / 2;
                
                const deltaX = this.x - centerX;
                const deltaY = this.y - centerY;
                
                // Calculate overlap
                const overlapX = (obstacle.width / 2 + this.radius) - Math.abs(deltaX);
                const overlapY = (obstacle.height / 2 + this.radius) - Math.abs(deltaY);
                
                if (overlapX < overlapY) {
                    // Hit from left or right
                    if (deltaX > 0) {
                        // Hit from right
                        this.x = obstacle.x + obstacle.width + this.radius;
                        this.dx = Math.abs(this.dx) * (bubbleBounceFactor + 0.1);
                    } else {
                        // Hit from left
                        this.x = obstacle.x - this.radius;
                        this.dx = -Math.abs(this.dx) * (bubbleBounceFactor + 0.1);
                    }
                    
                    // Ensure strong horizontal bounce
                    if (Math.abs(this.dx) < this.minSpeed * 1.5) {
                        this.dx = this.dx > 0 ? this.minSpeed * 1.5 : -this.minSpeed * 1.5;
                    }
                } else {
                    // Hit from top or bottom
                    if (deltaY > 0) {
                        // Hit from bottom
                        this.y = obstacle.y + obstacle.height + this.radius;
                        this.dy = Math.abs(this.dy) * (bubbleBounceFactor + 0.1);
                    } else {
                        // Hit from top
                        this.y = obstacle.y - this.radius;
                        this.dy = -Math.abs(this.dy) * (bubbleBounceFactor + 0.1);
                    }
                    
                    // Ensure strong vertical bounce
                    if (Math.abs(this.dy) < this.minSpeed * 1.5) {
                        this.dy = this.dy > 0 ? this.minSpeed * 1.5 : -this.minSpeed * 1.5;
                    }
                }
                
                // Add energetic random variation
                this.dx += (Math.random() - 0.5) * 0.8;
                this.dy += (Math.random() - 0.5) * 0.8;
            }
        });
    }

    draw() {
        // Draw bubble with gradient
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, 
            this.y - this.radius * 0.3, 
            0,
            this.x, 
            this.y, 
            this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.adjustBrightness(this.color, -30));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine effect
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
        
        // Add border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    adjustBrightness(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

function updateBubbles() {
    bubbles.forEach(bubble => bubble.update());
}

function drawBubbles() {
    bubbles.forEach(bubble => bubble.draw());
}

function initializeBubbles() {
    bubbles = []; // Clear existing bubbles
    const config = getLevelConfig(currentLevel);
    
    console.log(`Initializing ${config.bubbleCount} bubbles for level ${currentLevel}`);
    
    for (let i = 0; i < config.bubbleCount; i++) {
        let x, y;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            // Calculate safe position
            x = Math.max(config.size, Math.min(canvas.width - config.size, 
                (canvas.width / (config.bubbleCount + 1)) * (i + 1)));
            y = Math.max(config.size, canvas.height / 4);
            
            // Check for obstacle conflicts
            if (typeof checkObstacleConflict === 'function' && checkObstacleConflict(x, y, config.size)) {
                // Try alternative positions
                const alternatives = [
                    { x: x, y: canvas.height / 6 },
                    { x: x + 50, y: y },
                    { x: x - 50, y: y },
                    { x: x, y: canvas.height / 3 },
                    { x: canvas.width * 0.2 * (i + 1), y: canvas.height / 5 }
                ];
                
                let foundSafe = false;
                for (const alt of alternatives) {
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
            x = canvas.width / 2;
            y = config.size + 10;
        }
        
        const bubble = new Bubble(x, y, config.size, config.speed);
        
        // Validate bubble before adding
        if (isFinite(bubble.x) && isFinite(bubble.y) && isFinite(bubble.radius)) {
            bubbles.push(bubble);
        } else {
            console.error('Invalid bubble created:', bubble);
        }
    }
    
    console.log(`Successfully created ${bubbles.length} bubbles for level ${currentLevel}`);
    
    // Add a global variable to track this
    window.currentBubbleCount = bubbles.length;
}

console.log("=== BUBBLES.JS LOADED ===");