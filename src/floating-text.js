// Floating text system for scores and bonuses

let floatingTexts = [];

class FloatingText {
    constructor(x, y, text, color = '#FFD700') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.alpha = 1.0;
        this.dy = -2; // Float upward
        this.lifetime = 60; // frames
        this.age = 0;
    }
    
    update() {
        this.y += this.dy;
        this.alpha = 1 - (this.age / this.lifetime);
        this.age++;
        return this.age < this.lifetime;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = 'bold 24px Inter';
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push(new FloatingText(x, y, text, color));
}

function updateFloatingTexts() {
    floatingTexts = floatingTexts.filter(text => text.update());
}

function drawFloatingTexts() {
    floatingTexts.forEach(text => text.draw());
}

console.log("=== FLOATING-TEXT.JS LOADED ===");
