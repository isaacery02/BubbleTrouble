console.log("=== GAME.JS LOADING ===");

// Initialize canvas and context (variables are declared in constants.js)
canvas = document.getElementById('gameCanvas');
ctx = canvas.getContext('2d');

// Set canvas dimensions dynamically
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 800);
    canvas.height = Math.min(window.innerHeight * 0.7, 600);
    console.log("Canvas resized to:", canvas.width, "x", canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initialize and start the game when page loads
window.addEventListener('load', () => {
    console.log("=== WINDOW LOADED - GAME STARTING ===");
    
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const actionButton = document.getElementById('actionButton');
    
    if (!canvas || !messageBox || !messageText || !actionButton) {
        console.error("CRITICAL: Required elements not found!");
        return;
    }
    
    setupMobileControls();
    
    showMessage(
        "Welcome to Theo's Bubble Trouble!\nReady to start?",
        'Start Game',
        () => {
            hideMessage();
            startNewGame();
            gameLoop();
        }
    );
});

console.log("=== GAME.JS FULLY LOADED ===");