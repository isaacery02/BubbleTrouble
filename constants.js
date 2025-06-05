// Game constants and shared variables

// Canvas and context (will be initialized in game.js)
let canvas, ctx;

// Game state variables
let gameOver = false;
let gameStarted = false;
let gameRunning = false;
let gamePaused = false;

// Projectile constants
const MAX_PROJECTILES_PER_PLAYER = 3;
const PROJECTILE_SPEED = 8;
const PROJECTILE_WIDTH = 4;
const PROJECTILE_HEIGHT = 20;

// Power-up constants
const POWER_UP_DURATION = 5000;
const POWER_UP_DROP_CHANCE = 0.2;

// Bubble constants
const bubbleGravity = 0.1;
const bubbleBounceFactor = -0.98;

// Level variables
let currentLevel = 1;
let levelStartTime = 0;
let levelTransitioning = false;

// Game arrays
let bubbles = [];
const powerUps = [];
const particles = [];

// Input handling
const keys = {};

console.log("=== CONSTANTS.JS LOADED ===");