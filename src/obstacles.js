// Obstacle management system

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#4a5568';
        this.borderColor = '#718096';
    }

    draw() {
        // Draw obstacle with a nice border effect
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Add a small highlight for 3D effect
        ctx.fillStyle = '#a0aec0';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 8);
    }

    // Check collision with a bubble
    checkCollision(bubble) {
        const closestX = Math.max(this.x, Math.min(bubble.x, this.x + this.width));
        const closestY = Math.max(this.y, Math.min(bubble.y, this.y + this.height));
        
        const distance = Math.sqrt((bubble.x - closestX) ** 2 + (bubble.y - closestY) ** 2);
        
        if (distance < bubble.radius) {
            // Calculate which side the bubble hit
            const bubbleLeft = bubble.x - bubble.radius;
            const bubbleRight = bubble.x + bubble.radius;
            const bubbleTop = bubble.y - bubble.radius;
            const bubbleBottom = bubble.y + bubble.radius;
            
            const obstacleLeft = this.x;
            const obstacleRight = this.x + this.width;
            const obstacleTop = this.y;
            const obstacleBottom = this.y + this.height;
            
            // Determine collision side and reflect accordingly
            const overlapLeft = bubbleRight - obstacleLeft;
            const overlapRight = obstacleRight - bubbleLeft;
            const overlapTop = bubbleBottom - obstacleTop;
            const overlapBottom = obstacleBottom - bubbleTop;
            
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            
            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                // Hit left or right side
                bubble.dx *= -1;
                // Push bubble further away to prevent getting stuck
                bubble.x += bubble.dx * 5;
            } else {
                // Hit top or bottom side
                bubble.dy *= -1;
                // Push bubble further away to prevent getting stuck
                bubble.y += bubble.dy * 5;
            }
            
            // Ensure bubble doesn't get stuck by giving it minimum velocity
            if (Math.abs(bubble.dx) < 0.5) {
                bubble.dx = bubble.dx > 0 ? 1 : -1;
            }
            if (Math.abs(bubble.dy) < 0.5) {
                bubble.dy = bubble.dy > 0 ? 1 : -1;
            }
            
            return true;
        }
        
        return false;
    }
}

// Add this function if it doesn't exist

function checkObstacleConflict(x, y, radius) {
    if (typeof obstacles === 'undefined' || !obstacles.length) return false;
    
    return obstacles.some(obstacle => {
        // Check if bubble would overlap with obstacle
        const closestX = Math.max(obstacle.x, Math.min(x, obstacle.x + obstacle.width));
        const closestY = Math.max(obstacle.y, Math.min(y, obstacle.y + obstacle.height));
        
        const distance = Math.sqrt(
            (x - closestX) * (x - closestX) + 
            (y - closestY) * (y - closestY)
        );
        
        return distance < radius + 5; // Add 5px buffer
    });
}

function getRandomObstaclePosition() {
    // Define safe zones where obstacles can be placed
    const margin = 50; // Margin from edges
    const playerZoneWidth = 100; // Keep away from player starting positions
    
    // Available positions (avoiding player spawn areas and edges)
    const positions = [
        // Left side (but not too close to player 1)
        { 
            x: margin + playerZoneWidth, 
            y: canvas.height * 0.3,
            weight: 1 
        },
        // Right side (but not too close to player 2)
        { 
            x: canvas.width - OBSTACLE_WIDTH - margin - playerZoneWidth, 
            y: canvas.height * 0.3,
            weight: 1 
        },
        // Center-left
        { 
            x: canvas.width * 0.25, 
            y: canvas.height * 0.4,
            weight: 2 
        },
        // Center-right
        { 
            x: canvas.width * 0.75 - OBSTACLE_WIDTH, 
            y: canvas.height * 0.4,
            weight: 2 
        },
        // Upper center
        { 
            x: canvas.width * 0.5 - OBSTACLE_WIDTH / 2, 
            y: canvas.height * 0.25,
            weight: 1.5 
        },
        // Lower center
        { 
            x: canvas.width * 0.5 - OBSTACLE_WIDTH / 2, 
            y: canvas.height * 0.6,
            weight: 1.5 
        },
        // Off-center positions for variety
        { 
            x: canvas.width * 0.35, 
            y: canvas.height * 0.5,
            weight: 1.5 
        },
        { 
            x: canvas.width * 0.65 - OBSTACLE_WIDTH, 
            y: canvas.height * 0.35,
            weight: 1.5 
        }
    ];
    
    // Filter out positions that would be off-screen
    const validPositions = positions.filter(pos => 
        pos.x >= margin && 
        pos.x + OBSTACLE_WIDTH <= canvas.width - margin &&
        pos.y >= margin && 
        pos.y + OBSTACLE_HEIGHT <= canvas.height - 100 // Keep away from bottom
    );
    
    if (validPositions.length === 0) {
        // Fallback to center if no valid positions
        return {
            x: canvas.width / 2 - OBSTACLE_WIDTH / 2,
            y: canvas.height / 2 - OBSTACLE_HEIGHT / 2
        };
    }
    
    // Weighted random selection (some positions are more likely)
    const totalWeight = validPositions.reduce((sum, pos) => sum + pos.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    
    for (const position of validPositions) {
        randomWeight -= position.weight;
        if (randomWeight <= 0) {
            return { x: position.x, y: position.y };
        }
    }
    
    // Fallback to first valid position
    return { x: validPositions[0].x, y: validPositions[0].y };
}

function initializeObstacles() {
    obstacles = [];
    
    const config = getLevelConfig(currentLevel);
    
    if (config && config.hasObstacle) {
        // Get a random position for this level
        const position = getRandomObstaclePosition();
        
        // Randomize obstacle size for variety
        const shapes = [
            { width: 120, height: 80 },   // Default rectangle
            { width: 80, height: 120 },   // Tall rectangle
            { width: 100, height: 100 },  // Square
            { width: 150, height: 60 },   // Wide flat
            { width: 60, height: 150 },   // Thin tall
            { width: 140, height: 70 },   // Wide rectangle
            { width: 90, height: 90 },    // Small square
            { width: 160, height: 50 }    // Very wide
        ];
        
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        
        console.log(`Placing obstacle at (${position.x}, ${position.y}) size ${randomShape.width}x${randomShape.height} for level ${currentLevel}`);
        
        obstacles.push(new Obstacle(position.x, position.y, randomShape.width, randomShape.height));
    }
}

function updateObstacles() {
    // Check collisions between bubbles and obstacles
    bubbles.forEach(bubble => {
        obstacles.forEach(obstacle => {
            obstacle.checkCollision(bubble);
        });
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => obstacle.draw());
}

console.log("=== OBSTACLES.JS LOADED ===");