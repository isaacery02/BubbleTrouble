# Bubble Trouble Game - LLM Development Instructions

## Project Overview
This is a canvas-based JavaScript game inspired by Bubble Trouble. It features:
- Single player, multiplayer, and AI co-op modes
- Progressive level system with increasing difficulty
- Power-ups, obstacles, and special bubble types (golden, boss)
- Particle effects, floating score text, and sound system
- Mobile touch controls support

## Architecture Principles

### 1. Modular File Structure
Each game system is in its own file with clear responsibilities:

- **constants.js**: Global constants, canvas setup, game state variables
- **game.js**: Main game loop, level transitions, game state management
- **player.js**: Player physics, movement, lives, score management
- **bubbles.js**: Bubble physics, types (normal/golden/boss), splitting logic
- **collision.js**: All collision detection between game entities
- **projectiles.js**: Harpoon/projectile physics and lifecycle
- **powerups.js**: Power-up spawning, collection, timer management
- **obstacles.js**: Level-specific obstacle generation
- **levels.js**: Level definitions, bubble initialization, completion logic
- **rescue.js**: Rescue bubble system (player revival mechanics)
- **effects.js**: Particle effects system
- **floating-text.js**: Score popups and bonus text animations
- **ui.js**: HUD rendering, drawing coordination, message boxes
- **input.js**: Keyboard and touch input handling
- **ai.js**: AI player logic for co-op mode

### 2. Critical Pattern: Function Validation
The game uses a validation pattern to avoid runtime errors from missing functions:

```javascript
// Functions are checked before calling
if (typeof functionName === 'function') functionName();

// Or cached in gameFunctions object at startup
if (gameFunctions.updateBubbles) updateBubbles();
```

**When adding new systems**: Always check function existence before calling, especially cross-module calls.

### 3. Game Loop Architecture

The main loop in `game.js` follows this pattern:
```
gameLoop() → updateGameSystems() → drawEverything()
```

**Update order matters**:
1. Input handling
2. Player updates
3. Bubble updates
4. Projectile updates
5. Power-up updates
6. Rescue bubble updates
7. Particle updates
8. **Floating text updates** ← Must be called to age/remove text
9. Collision checks
10. AI updates (if ai-coop mode)
11. Draw everything

**Common bug pattern**: If visual elements don't disappear (particles, text, etc.), the update function is probably not being called in the game loop.

### 4. Drawing Pattern
All drawing is coordinated through `ui.js > drawEverything()`:
- Clear canvas
- Draw obstacles
- Draw bubbles
- Draw players
- Draw projectiles
- Draw power-ups
- Draw rescue bubbles
- Draw particles
- Draw floating text ← Must call drawFloatingTexts()
- Draw HUD/UI

**Pattern**: Create separate `draw()` and `update()` methods for visual systems.

### 5. Game State Management

Key state variables in `constants.js`:
- `gameRunning`: True when game is active
- `gamePaused`: True when paused
- `gameOver`: True after all players lose
- `levelTransitioning`: True during level transitions
- `currentLevel`: Current level number (1-10)
- `gameMode`: 'single', 'multi', or 'ai-coop'

**Pattern**: Always check `gameRunning` and `gamePaused` before updating game logic.

### 6. Player System

Players have:
- Position (x, y) and velocity (dx, dy)
- Lives (starts at 3)
- Score (accumulated across levels)
- Active power-up (activePowerUp, powerUpDuration, powerUpTimerId)
- Projectile array (for tracking active shots)
- Control mappings (keyboard keys for P1/P2)

**Reset patterns**:
- `resetPlayers('new-game')`: Full reset (lives, score, position, powerups)
- `resetPlayers('level-transition')`: Keep lives/score, reset position/powerups
- `resetPlayers('position-only')`: Just respawn position

### 7. Bubble System

Bubble types:
- **Normal**: Standard bubbles, split when hit
- **Golden**: 3x points (900 for small), move 1.5x faster, golden color
- **Boss**: 10 health, 5x points, move 1.2x faster, purple color

**Key properties**:
- `radius`: Size (determines if bubble splits)
- `dx, dy`: Velocity
- `type`: 'normal', 'golden', or 'boss'
- `pointMultiplier`: 1, 3, or 5
- `isFrozen`: For freeze power-up
- `health`: Boss bubbles only

**Physics**:
- Gravity applied every frame: `this.dy += bubbleGravity`
- Wall bounces reverse `dx`
- Floor bounces apply restitution to `dy`
- Splits create two bubbles with explosive force

### 8. Collision System

Collision checks in `collision.js`:
- Player vs Bubble (death)
- Projectile vs Bubble (hit/split)
- Player vs Power-up (collection)
- Player vs Rescue Bubble (revival)

**Pattern**: Collision functions modify arrays directly (splice out hit objects).

### 9. Power-up System

Power-ups have timers managed by `setTimeout`:
- Store `timerId` on player object
- **Must clear timer** with `removePowerUp(player)` before:
  - Applying new power-up
  - Level transitions
  - Game over
  - New game start

**Common bug**: Forgetting to clear timers causes lingering effects.

### 10. Floating Text System

**Critical**: Text objects MUST be both updated AND drawn:
```javascript
// In update loop
updateFloatingTexts(); // Ages text, filters expired ones

// In draw loop  
drawFloatingTexts(); // Renders visible text
```

Properties:
- `lifetime`: 60 frames (~1 second)
- `alpha`: Fades from 1.0 to 0.0
- `dy`: -2 (floats upward)

**Bug pattern**: If text doesn't disappear, `updateFloatingTexts()` is not in game loop.

## Common Fix Patterns

### Visual Element Not Disappearing
1. Check if update function exists and is called in game loop
2. Verify the update function returns false/filters when lifetime expires
3. Ensure array is being filtered: `array = array.filter(item => item.update())`

### Power-up Not Working
1. Check if `removePowerUp()` is clearing previous effect
2. Verify timer is stored: `player.powerUpTimerId = setTimeout(...)`
3. Ensure effect is applied immediately, timer only for removal
4. Check function validation pattern is used

### Collision Not Detected
1. Verify collision check is in `updateGameSystems()` after entity updates
2. Check hit detection math (AABB, circle, or radius checks)
3. Ensure objects are in correct arrays (bubbles, projectiles, etc.)

### Score/Points Issue
1. Check `pointMultiplier` on bubble object
2. Verify `calculatePoints(radius)` is called with bubble radius
3. For floating text, check `createFloatingText()` is called at bubble position
4. Ensure `updateFloatingTexts()` is in game loop

### Game State Bugs
1. Always reset state variables in `startNewGame()` and `startNextLevel()`
2. Clear all timers (power-ups, etc.) on transitions
3. Check `gameRunning` and `gamePaused` states
4. Verify `clearGameObjects()` empties all arrays

## Debugging Guidelines

### Console Logging
Files include validation logs:
```javascript
console.log("=== FILENAME.JS LOADED ===");
```
Check browser console for load order and errors.

### Function Validation Cache
`game.js` logs validated functions:
```
Game functions validated: 25 / 30
```
If critical functions are missing, they won't execute.

### Common Error Sources
1. **File load order**: Files must load before being called (check index.html script order)
2. **Missing function checks**: Always validate cross-module function calls
3. **Array mutations**: Be careful with splice during iteration
4. **Timer cleanup**: Always clear setTimeout/setInterval on state changes

## Mobile Support
Touch controls are in `input.js` with screen zones:
- Left third: Move left
- Right third: Move right  
- Middle: Shoot

**Pattern**: Mobile controls simulate keyboard keys internally.

## AI Co-op Mode
When `gameMode === 'ai-coop'`:
- Player 2 is AI controlled
- `updateAI()` called in game loop
- Cooperative scoring (team total)
- Both players must die for game over

## Sound System
Sounds managed by global functions:
- `playSound(type)`: 'hit', 'shoot', 'powerup', 'gameover', 'start'
- `playBackgroundMusic()`: Starts loop
- `stopBackgroundMusic()`: Stops loop
- `toggleSound()`: Mutes/unmutes

**Pattern**: Always check if sound functions exist before calling.

## Level System
- 10 levels total
- Bubble count and configuration in `levels.js`
- Level-specific obstacles generated in `obstacles.js`
- Completion triggers next level or game win
- Bonuses: Time bonus, level completion bonus

## Canvas Specifications
- Fixed size: 1000x800 pixels
- Origin (0,0) is top-left
- Players spawn at: P1 x=250, P2 x=750, y=740
- Floor is at y=canvas.height (800)

## Performance Considerations
- Function validation cached at startup, not per-frame
- Avoid creating new objects every frame
- Particle pools would improve performance (not currently implemented)
- Canvas clearing uses fillRect for speed

## Frame Rate Independence (Delta Time)

**Critical**: The game uses delta time to ensure consistent speed across all devices:

```javascript
// In game.js game loop
deltaTime = elapsed / (1000 / targetFPS); // Normalized to 60 FPS
```

**All movement must use delta time**:
```javascript
// Correct - frame-rate independent
this.x += this.dx * deltaTime;
this.y += this.dy * deltaTime;

// Wrong - will run faster on high refresh rate devices
this.x += this.dx;
this.y += this.dy;
```

**Why this matters**:
- Desktop: Typically 60Hz refresh rate
- Mobile: Often 90Hz, 120Hz, or 144Hz
- Without delta time, game runs 2-3x faster on mobile
- Delta time normalizes movement to 60 FPS equivalent

**Files using delta time**:
- `player.js`: Player movement
- `bubbles.js`: Bubble physics (position, gravity)
- `projectiles.js`: Projectile movement
- `effects.js`: Particle physics
- `rescue.js`: Rescue bubble movement
- `floating-text.js`: Text animation

**Pattern for new moving elements**:
1. All position updates: `+= velocity * deltaTime`
2. All acceleration: `+= accel * deltaTime`
3. All friction/damping: `Math.pow(dampingFactor, deltaTime)`
4. All timers/counters: `+= deltaTime` (or `-= deltaTime`)

---

## Quick Reference: Adding New Features

### Adding a New Visual Effect
1. Create class with `update()` and `draw()` methods
2. Add array to store instances in `constants.js`
3. Add `update<Feature>()` function
4. Call in `updateGameSystems()` in `game.js`
5. Add `draw<Feature>()` function  
6. Call in `drawEverything()` in `ui.js`
7. Use function validation pattern

### Adding a New Power-up Type
1. Add type to `powerUpTypes` array in `powerups.js`
2. Add icon in `PowerUp.draw()`
3. Handle collection in `handlePowerUpCollection()`
4. Apply effect immediately
5. Set timer for removal with `setTimeout`
6. Store `timerId` on player object
7. Clear with `removePowerUp()` on transitions

### Adding a New Game Mode
1. Add mode option in `showModeSelectPrompt()` in `game.js`
2. Handle mode in `checkGameOver()` for win condition
3. Handle mode in score display and UI rendering
4. Update player reset logic if needed
5. Add any mode-specific update functions to game loop

---

**Remember**: This is a synchronous, frame-based game. All updates happen sequentially in the game loop. Drawing happens after all updates complete. State changes must be immediate, with timers only for delayed removal/reset.
