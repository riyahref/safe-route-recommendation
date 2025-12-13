# 🚀 QUICK START GUIDE

## ⚠️ IMPORTANT: You CANNOT use a simple "Live Server" extension!
This is a React app that needs to be built and run with Node.js. A simple HTML live server won't work.

## What You Need:
1. **Node.js** installed (download from https://nodejs.org/)
2. **A Mapbox token** (free from https://account.mapbox.com/)

## Step-by-Step Setup:

### 1. Install Node.js (if you don't have it)
- Go to https://nodejs.org/
- Download the LTS version
- Install it (just click through the installer)
- **Restart VS Code** after installing

### 2. Install Dependencies

Open a terminal in VS Code (View → Terminal or press `` Ctrl+` ``)

**Install backend dependencies:**
```bash
cd server
npm install
```

Wait until it finishes (you'll see a lot of text scrolling)

**Install frontend dependencies:**
```bash
cd ..
cd client
npm install
```

Wait until it finishes

### 3. Get Mapbox Token
1. Go to https://account.mapbox.com/
2. Sign up (it's free, no credit card needed)
3. After signing up, you'll see your token on the account page
4. Copy the "Default public token"

### 4. Create .env File
1. In the `client` folder, create a file named `.env`
2. Paste this (replace YOUR_TOKEN with your actual token):

```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsbXh4eHh4eHh4eHh4In0.YOUR_TOKEN_HERE
VITE_API_URL=http://localhost:3001
```

### 5. Run the Application

You need **TWO terminals** running at the same time:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
You should see: `🚀 Server running on http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
You should see: `Local: http://localhost:5173`

### 6. Open in Browser
Click the link that appears (http://localhost:5173) or copy it to your browser.

## ✅ Success!
You should now see the Safety-Aware Routing app with a map!

## ❌ Troubleshooting

**"npm is not recognized" or "command not found"**
- Node.js is not installed or not in your PATH
- Reinstall Node.js and restart VS Code

**"Cannot find module" errors in VS Code**
- You haven't run `npm install` yet
- Make sure you ran it in BOTH `server` and `client` folders

**Blank page in browser**
- Make sure BOTH terminals are running (backend AND frontend)
- Check the browser console (F12) for errors
- Make sure you created the `.env` file with your Mapbox token

**"Mapbox token required" message**
- You didn't create the `.env` file
- Or the token is wrong
- Make sure the file is in the `client` folder, not the root

## Need Help?
- Check the browser console (F12) for error messages
- Make sure both `npm run dev` commands are running
- Verify your `.env` file exists in the `client` folder



