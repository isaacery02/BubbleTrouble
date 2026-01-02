// Rescue bubble system - brings back dead players

let rescueBubbles = [];
const RESCUE_BUBBLE_DURATION = 4000; // 4 seconds
const RESCUE_BUBBLE_SIZE = 40;
const RESCUE_BUBBLE_SPEED = 1.5;

class RescueBubble {
    constructor(x, y, targetPlayerId) {
        this.x = x;
        this.y = y;
        this.targetPlayerId = targetPlayerId; // Which player this bubble will rescue
        this.size = RESCUE_BUBBLE_SIZE;
        this.dx = (Math.random() - 0.5) * RESCUE_BUBBLE_SPEED;
        this.dy = (Math.random() - 0.5) * RESCUE_BUBBLE_SPEED;
        this.createdAt = Date.now();
        this.expiresAt = Date.now() + RESCUE_BUBBLE_DURATION;
        this.pulsePhase = 0;
        this.collected = false;
    }

    update() {
        // Move the bubble with delta time
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;

        // Bounce off walls
        if (this.x <= this.size/2 || this.x >= canvas.width - this.size/2) {
            this.dx = -this.dx;
            this.x = Math.max(this.size/2, Math.min(canvas.width - this.size/2, this.x));
        }
        if (this.y <= this.size/2 || this.y >= canvas.height - this.size/2) {
            this.dy = -this.dy;
            this.y = Math.max(this.size/2, Math.min(canvas.height - this.size/2, this.y));
        }

        // Bounce off obstacles
        if (typeof obstacles !== 'undefined') {
            obstacles.forEach(obstacle => {
                if (this.x - this.size/2 < obstacle.x + obstacle.width &&
                    this.x + this.size/2 > obstacle.x &&
                    this.y - this.size/2 < obstacle.y + obstacle.height &&
                    this.y + this.size/2 > obstacle.y) {
                    
                    // Simple bounce - reverse both directions
                    this.dx = -this.dx;
                    this.dy = -this.dy;
                    
                    // Move bubble away from obstacle
                    if (this.x < obstacle.x + obstacle.width/2) {
                        this.x = obstacle.x - this.size/2;
                    } else {
                        this.x = obstacle.x + obstacle.width + this.size/2;
                    }
                }
            });
        }

        // Update pulse animation
        this.pulsePhase += 0.15;

        // Check if expired
        return Date.now() < this.expiresAt && !this.collected;
    }

    draw() {
        ctx.save();
        
        // Pulsing effect based on remaining time
        const timeLeft = this.expiresAt - Date.now();
        const urgency = 1 - (timeLeft / RESCUE_BUBBLE_DURATION);
        const pulseIntensity = 0.8 + 0.2 * Math.sin(this.pulsePhase);
        
        // Star gradient
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${pulseIntensity})`); // Gold center
        gradient.addColorStop(0.7, `rgba(255, 165, 0, ${pulseIntensity * 0.8})`); // Orange
        gradient.addColorStop(1, `rgba(255, 69, 0, ${pulseIntensity * 0.6})`); // Red edge
        
        // Outer glow for urgency
        if (urgency > 0.5) {
            ctx.shadowBlur = 20 * urgency;
            ctx.shadowColor = '#ff0000';
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffd700';
        }
        
        // Draw star shape
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        
        this.drawStar(this.x, this.y, this.size * pulseIntensity);
        
        // Draw target player indicator
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.targetPlayerId, this.x, this.y + 5);
        
        // Draw timer bar
        const barWidth = this.size * 1.5;
        const barHeight = 4;
        const timeProgress = timeLeft / RESCUE_BUBBLE_DURATION;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x - barWidth/2, this.y + this.size/2 + 10, barWidth, barHeight);
        
        ctx.fillStyle = timeProgress > 0.3 ? '#ffd700' : '#ff4444';
        ctx.fillRect(this.x - barWidth/2, this.y + this.size/2 + 10, barWidth * timeProgress, barHeight);
        
        ctx.restore();
    }

    drawStar(centerX, centerY, radius) {
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.5;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const currentRadius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + Math.cos(angle) * currentRadius;
            const y = centerY + Math.sin(angle) * currentRadius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    getBounds() {
        return {
            x: this.x - this.size/2,
            y: this.y - this.size/2,
            width: this.size,
            height: this.size
        };
    }
}

function createRescueBubble(deadPlayer) {
    // Only create if the other player is still alive
    const alivePlayer = deadPlayer.id === 1 ? player2 : player1;
    if (!alivePlayer.active) {
        console.log('Both players dead, no rescue bubble created');
        return;
    }

    // Don't create if one already exists for this player
    if (rescueBubbles.some(bubble => bubble.targetPlayerId === deadPlayer.id)) {
        console.log(`Rescue bubble already exists for Player ${deadPlayer.id}`);
        return;
    }

    // Create rescue bubble near center of screen
    const x = canvas.width/2 + (Math.random() - 0.5) * 200;
    const y = canvas.height/2 + (Math.random() - 0.5) * 200;
    
    const rescueBubble = new RescueBubble(x, y, deadPlayer.id);
    rescueBubbles.push(rescueBubble);
    
    console.log(`Rescue bubble created for Player ${deadPlayer.id}`);
    
    // Play special sound
    if (typeof playSound === 'function') {
        playSound('powerup'); // Use powerup sound or create a special rescue sound
    }
}

function updateRescueBubbles() {
    for (let i = rescueBubbles.length - 1; i >= 0; i--) {
        const bubble = rescueBubbles[i];
        
        if (!bubble.update()) {
            // Bubble expired or was collected
            rescueBubbles.splice(i, 1);
            if (!bubble.collected) {
                console.log(`Rescue bubble for Player ${bubble.targetPlayerId} expired`);
            }
        }
    }
}

function drawRescueBubbles() {
    rescueBubbles.forEach(bubble => bubble.draw());
}

function checkRescueBubbleCollisions() {
    // Only alive players can collect rescue bubbles
    const alivePlayers = players.filter(p => p.active);
    
    for (let i = rescueBubbles.length - 1; i >= 0; i--) {
        const bubble = rescueBubbles[i];
        
        for (const player of alivePlayers) {
            // Check collision with alive player
            if (player.x < bubble.x + bubble.size/2 &&
                player.x + player.width > bubble.x - bubble.size/2 &&
                player.y < bubble.y + bubble.size/2 &&
                player.y + player.height > bubble.y - bubble.size/2) {
                
                // Rescue the target player
                rescuePlayer(bubble.targetPlayerId);
                
                // Remove the rescue bubble
                bubble.collected = true;
                rescueBubbles.splice(i, 1);
                
                // Play rescue sound
                if (typeof playSound === 'function') {
                    playSound('levelup'); // Use levelup sound or create special rescue sound
                }
                
                // Create celebration particles
                if (typeof createParticles === 'function') {
                    createParticles(bubble.x, bubble.y, '#ffd700', 15);
                }
                
                break;
            }
        }
    }
}

function checkProjectileRescueBubbleCollision(projectile) {
    for (let i = rescueBubbles.length - 1; i >= 0; i--) {
        const bubble = rescueBubbles[i];
        
        // Check collision between projectile and rescue bubble
        if (projectile.x < bubble.x + bubble.size/2 &&
            projectile.x + projectile.width > bubble.x - bubble.size/2 &&
            projectile.y < bubble.y + bubble.size/2 &&
            projectile.y + projectile.height > bubble.y - bubble.size/2) {
            
            // Rescue the target player
            rescuePlayer(bubble.targetPlayerId);
            
            // Remove the rescue bubble
            bubble.collected = true;
            rescueBubbles.splice(i, 1);
            
            // Play rescue sound
            if (typeof playSound === 'function') {
                playSound('levelup');
            }
            
            // Create celebration particles
            if (typeof createParticles === 'function') {
                createParticles(bubble.x, bubble.y, '#ffd700', 15);
            }
            
            console.log(`Rescue bubble shot by projectile! Player ${bubble.targetPlayerId} rescued!`);
            return true; // Projectile hit something
        }
    }
    return false; // No collision
}

function rescuePlayer(playerId) {
    const playerToRescue = playerId === 1 ? player1 : player2;
    
    if (playerToRescue.active) {
        console.log(`Player ${playerId} is already alive!`);
        return;
    }
    
    // Bring player back to life
    playerToRescue.active = true;
    playerToRescue.lives = Math.max(1, playerToRescue.lives); // Ensure at least 1 life
    playerToRescue.invincible = true; // Brief invincibility
    
    // Reset position
    if (playerId === 1) {
        playerToRescue.x = canvas.width / 2 - 15;
    } else {
        playerToRescue.x = canvas.width / 4;
    }
    playerToRescue.y = canvas.height - 40;
    playerToRescue.dx = 0;
    
    // Clear any projectiles
    playerToRescue.projectiles = [];
    
    // Remove invincibility after 2 seconds
    setTimeout(() => {
        playerToRescue.invincible = false;
    }, 2000);
    
    console.log(`Player ${playerId} has been rescued! Lives: ${playerToRescue.lives}`);
}

function clearAllRescueBubbles() {
    rescueBubbles.length = 0;
    console.log('All rescue bubbles cleared');
}

console.log("=== RESCUE.JS LOADED ===");