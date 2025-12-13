# Quick Setup Instructions

## Step 1: Install Node.js
If you don't have Node.js installed, download it from: https://nodejs.org/
- Download the LTS version
- Install it (just click Next, Next, Next)
- Restart VS Code after installing

## Step 2: Install Dependencies

### For the Backend (Server):
1. Open a terminal in VS Code (Terminal → New Terminal)
2. Type these commands one by one:

```bash
cd server
npm install
```

Wait for it to finish (may take 1-2 minutes)

### For the Frontend (Client):
1. In the same terminal or a new one, type:

```bash
cd ..
cd client
npm install
```

Wait for it to finish (may take 1-2 minutes)

## Step 3: Get a Mapbox Token (Free)
1. Go to: https://account.mapbox.com/
2. Sign up for a free account (it's free!)
3. Go to your account page
4. Copy your "Default public token"

## Step 4: Create .env File
1. In the `client` folder, create a new file called `.env`
2. Paste this inside (replace YOUR_TOKEN_HERE with your actual token):

```
VITE_MAPBOX_TOKEN=YOUR_TOKEN_HERE
VITE_API_URL=http://localhost:3001
```

## Step 5: Run the Application

### Terminal 1 - Start the Backend:
```bash
cd server
npm run dev
```

You should see: "🚀 Server running on http://localhost:3001"

### Terminal 2 - Start the Frontend:
```bash
cd client
npm run dev
```

You should see: "Local: http://localhost:5173"

## Step 6: Open in Browser
Click on the link that appears (usually http://localhost:5173) or copy-paste it into your browser.

## Troubleshooting

**If you see "Cannot find module" errors:**
- Make sure you ran `npm install` in both `server` and `client` folders
- Close and reopen VS Code

**If the page is blank:**
- Make sure BOTH terminals are running (backend AND frontend)
- Check that you created the `.env` file with your Mapbox token
- Open the browser console (F12) to see any errors

**If npm commands don't work:**
- Make sure Node.js is installed (type `node --version` in terminal)
- Restart VS Code after installing Node.js

## That's it! 🎉
The app should now be running. You can search for routes and see them on the map!



