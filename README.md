# Bubble Trouble

HI Theo!!

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

### GitHub Actions (Automated Deployment)

**What are GitHub Actions?**
GitHub Actions are automated workflows that run when you push code to GitHub. They handle building, testing, and deploying your code automatically.

**The emails you received** are notifications that the workflow ran when you pushed code. This is normal!

### Deploy to Azure Static Web Apps

This game is configured for automatic deployment to Azure Static Web Apps.

#### Option 1: Azure Portal (Easiest)

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → Search for **Static Web App**
3. Click **Create**
4. Fill in the details:
   - **Subscription:** Your Azure subscription
   - **Resource Group:** Create new (e.g., `BubbleTrouble-rg`)
   - **Name:** `bubble-trouble-game` (or any unique name)
   - **Region:** Choose closest to you (e.g., `East US 2`)
   - **Source:** GitHub
   - **Sign in with GitHub** → Authorize Azure
   - **Organization:** `isaacery02`
   - **Repository:** `BubbleTrouble`
   - **Branch:** `main`
   - **Build Presets:** Custom
   - **App location:** `/`
   - **Output location:** *(leave empty)*
5. Click **Review + create** → **Create**

Azure will automatically:

- Add the GitHub Actions workflow to your repo
- Add a deployment secret (`AZURE_STATIC_WEB_APPS_API_TOKEN`)
- Deploy your game whenever you push to `main`

Your game will be live at: `https://bubble-trouble-game.azurestaticapps.net`

#### Option 2: Azure CLI

```powershell
# Login to Azure
az login

# Create resource group
az group create --name BubbleTrouble-rg --location eastus2

# Create Static Web App (connects to GitHub)
az staticwebapp create `
  --name bubble-trouble-game `
  --resource-group BubbleTrouble-rg `
  --source https://github.com/isaacery02/BubbleTrouble `
  --location eastus2 `
  --branch main `
  --app-location "/" `
  --login-with-github
```

#### Option 3: VS Code Extension

1. Install the **Azure Static Web Apps** extension in VS Code
2. Click the Azure icon in the sidebar
3. Right-click **Static Web Apps** → **Create Static Web App**
4. Follow the prompts

### Disable GitHub Actions Emails

If you don't want email notifications:

1. Go to **GitHub Settings** → **Notifications**
2. Under **Actions**, uncheck **Email**
3. Or go to your repo → **Settings** → **Notifications** → Configure

### Manual Deployment (Other Hosts)

This app is static and can be hosted on:

- **GitHub Pages:** Push to `gh-pages` branch
- **Netlify:** Drag & drop the folder
- **Vercel:** Import from GitHub
- **Any web server:** Just upload all files

---

## 🧑‍💻 Credits

Made by Dad for Theo & Otto.
