// Game constants and global variables

// ========== CANVAS AND CONTEXT ==========
let canvas;
let ctx;

// ========== GAME STATE VARIABLES ==========
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let levelTransitioning = false;
let currentLevel = 1;
let levelStartTime = 0;

// ========== GAME OBJECTS ARRAYS ==========
let bubbles = [];
let powerUps = [];
let particles = [];
let obstacles = [];

// ========== BUBBLE CONSTANTS ==========
const BUBBLE_BASE_SPEED = 2;        // THIS SHOULD BE CONST
let BUBBLE_SPEED = BUBBLE_BASE_SPEED; // This is 'let', reset by resetBubbleSpeed()
let bubbleSpeedMultiplier = 1.0;    // This is 'let', reset by resetBubbleSpeed()

// ========== PHYSICS CONSTANTS ==========
const bubbleGravity = 0.08;
const bubbleBounceFactor = 0.92; // <--- ADD THIS LINE
                                    // If it's 'let' and changes, it MUST be reset in startNewGame or resetBubbleSpeed

// ========== PLAYER CONSTANTS ==========
const PLAYER_SPEED = 5;             // THIS SHOULD BE CONST
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 30;

// ========== PROJECTILE CONSTANTS ==========
const PROJECTILE_SPEED = 8;         // THIS SHOULD BE CONST
const PROJECTILE_WIDTH = 4;
const PROJECTILE_HEIGHT = 20;
const MAX_PROJECTILES_PER_PLAYER = 3; // Default limit
const RAPID_FIRE_MAX_PROJECTILES = 10; // Rapid fire limit

// ========== POWER-UP CONSTANTS ==========
const POWER_UP_DURATION = 5000; // 5 seconds
const POWER_UP_DROP_CHANCE = 0.3; // 30% chance

// ========== OBSTACLE CONSTANTS ==========
const OBSTACLE_WIDTH = 120; // Increased from default
const OBSTACLE_HEIGHT = 80; // Increased from default

// ========== SOUND SYSTEM ==========
let soundEnabled = true;
let sounds = {}; // Sound objects storage

// ========== PLAYER OBJECTS ==========
let player1 = {
    id: 1,
    x: 0,
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0,
    speed: PLAYER_SPEED,
    color: '#667eea',
    score: 0,
    lives: 3,
    active: true,
    projectiles: [],
    lastShotTime: 0,
    activePowerUp: null,
    powerUpTimer: null,
    powerUpEndTime: null,
    currentProjectileWidth: PROJECTILE_WIDTH,
    shootCooldown: 500,
    maxProjectiles: MAX_PROJECTILES_PER_PLAYER,
    hasShield: false,
    invincible: false,
    projectileSpeedMultiplier: 1
};

let player2 = {
    id: 2,
    x: 0,
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0,
    speed: PLAYER_SPEED,
    color: '#f093fb',
    score: 0,
    lives: 3,
    active: true,
    projectiles: [],
    lastShotTime: 0,
    activePowerUp: null,
    powerUpTimer: null,
    powerUpEndTime: null,
    currentProjectileWidth: PROJECTILE_WIDTH,
    shootCooldown: 500,
    maxProjectiles: MAX_PROJECTILES_PER_PLAYER,
    hasShield: false,
    invincible: false,
    projectileSpeedMultiplier: 1
};

// ========== PLAYERS ARRAY ==========
// Array for easier iteration over both players
let players = [player1, player2];

console.log("=== CONSTANTS.JS LOADED ===");