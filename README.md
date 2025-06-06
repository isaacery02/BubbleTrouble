# Bubble Trouble

HI!
A fun browser-based bubble-popping game for two players, made with HTML, CSS, and JavaScript.

## 🚀 Quick Start

### 1. **Clone the Repository**

```sh
git clone https://github.com/isaacery/bubbletrouble.git
cd bubbletrouble
```

### 2. **Run Locally (No Docker)**

Just open `index.html` in your browser.  
No build step or server is required for local development.

### 3. **Run with Docker**

#### Build the Docker image:

```sh
docker build -t bubbletrouble .
```

#### Run the container:

```sh
docker run -p 8080:80 bubbletrouble
```

Now open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🕹️ Controls

- **Pause:** Click the ⏸️ Pause button or press `P`
- **Restart:** Click the 🔄 Restart button or press `R`
- **Player 1:** Arrow keys to move and shoot
- **Player 2:** `A`/`D` to move, `W` to shoot
- **Mobile:** Use on-screen controls

---

## 📝 Project Structure

```
.
├── index.html
├── css/
│   └── main.css
├── src/
│   ├── constants.js
│   ├── game.js
│   ├── input.js
│   ├── ...
├── media/
│   └── panda.gif
├── Dockerfile
└── ...
```

---

## 🛠️ Customization

- Edit `src/` files to change game logic, powerups, or visuals.
- Edit `css/main.css` for styling.

---

## 📦 Deployment

This app is static and can be hosted on any web server (Nginx, GitHub Pages, Azure Static Web Apps, etc).

---

## 🧑‍💻 Credits

Made by Dad for Theo & Otto.

---