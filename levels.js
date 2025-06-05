// Level configuration and management

const LEVEL_CONFIG = {
    1: { bubbles: 2, speed: 1, size: 80, colors: ['#f56565'] },
    2: { bubbles: 3, speed: 1.2, size: 85, colors: ['#f56565', '#ecc94b'] },
    3: { bubbles: 4, speed: 1.4, size: 90, colors: ['#f56565', '#ecc94b'] },
    4: { bubbles: 4, speed: 1.6, size: 95, colors: ['#f56565', '#ecc94b', '#63b3ed'] },
    5: { bubbles: 5, speed: 1.8, size: 100, colors: ['#f56565', '#ecc94b', '#63b3ed'] },
    6: { bubbles: 5, speed: 2.0, size: 105, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea'] },
    7: { bubbles: 6, speed: 2.2, size: 110, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea'] },
    8: { bubbles: 6, speed: 2.4, size: 115, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea', '#38b2ac'] },
    9: { bubbles: 7, speed: 2.6, size: 120, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea', '#38b2ac'] },
    10: { bubbles: 8, speed: 3.0, size: 125, colors: ['#f56565', '#ecc94b', '#63b3ed', '#9f7aea', '#38b2ac', '#f093fb'] }
};

function getLevelConfig(level) {
    if (LEVEL_CONFIG[level]) {
        return LEVEL_CONFIG[level];
    }
    
    const baseConfig = LEVEL_CONFIG[10];
    const scaleFactor = Math.floor((level - 10) / 5) + 1;
    
    return {
        bubbles: Math.min(baseConfig.bubbles + scaleFactor, 12),
        speed: Math.min(baseConfig.speed + (scaleFactor * 0.3), 4.0),
        size: Math.min(baseConfig.size + (scaleFactor * 5), 150),
        colors: baseConfig.colors
    };
}

function initializeBubbles() {
    bubbles = [];
    const config = getLevelConfig(currentLevel);
    
    for (let i = 0; i < config.bubbles; i++) {
        const x = Math.random() * (canvas.width - config.size * 2) + config.size;
        const y = Math.random() * (canvas.height / 2 - config.size) + config.size;
        const dx = (Math.random() - 0.5) * 3 * config.speed;
        const dy = Math.random() * 2 * config.speed;
        
        const newBubble = new Bubble(x, y, config.size, dx, dy, 3);
        bubbles.push(newBubble);
    }
}

function checkLevelComplete() {
    if (bubbles.length === 0 && !levelTransitioning) {
        levelTransitioning = true;
        currentLevel++;
        
        playSound('levelup');
        
        showMessage(
            `Level ${currentLevel - 1} Complete!\nGet ready for Level ${currentLevel}`,
            'Next Level',
            () => {
                levelTransitioning = false;
                initializeBubbles();
                hideMessage();
                levelStartTime = Date.now();
            }
        );
        
        document.getElementById('level').textContent = currentLevel;
        
        const timeBonus = Math.max(0, 30000 - (Date.now() - levelStartTime));
        const bonusPoints = Math.floor(timeBonus / 1000) * 10;
        
        if (bonusPoints > 0) {
            if (player1.active) {
                player1.score += bonusPoints;
                document.getElementById('score1').textContent = player1.score;
            }
            if (player2.active) {
                player2.score += bonusPoints;
                document.getElementById('score2').textContent = player2.score;
            }
        }
    }
}

console.log("=== LEVELS.JS LOADED ===");