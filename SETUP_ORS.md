# OpenRouteService Setup Guide

## Quick Fix for "Failed to fetch routes" Error

### Step 1: Get Your Free ORS API Key

1. Go to https://openrouteservice.org/dev/#/signup
2. Sign up for a free account
3. Copy your API key from the dashboard

### Step 2: Set Up Environment Variable

**Option A: Create .env file (Recommended)**

1. In the `server` directory, create a file named `.env`
2. Add this line:
   ```
   ORS_API_KEY=your_actual_api_key_here
   ```
3. Replace `your_actual_api_key_here` with your actual API key

**Option B: Set Environment Variable Directly**

**Windows (PowerShell):**
```powershell
$env:ORS_API_KEY="your_actual_api_key_here"
```

**Windows (CMD):**
```cmd
set ORS_API_KEY=your_actual_api_key_here
```

**Mac/Linux:**
```bash
export ORS_API_KEY="your_actual_api_key_here"
```

### Step 3: Restart Your Server

After setting the API key, restart your server:

```bash
cd server
npm run dev
```

### Step 4: Test

1. Open your app in the browser
2. Enter origin and destination coordinates
3. Click "Search Routes"
4. You should now see real routes from OpenRouteService!

## Troubleshooting

### Error: "ORS_API_KEY environment variable is not set"
- Make sure you created the `.env` file in the `server` directory
- Make sure the file is named exactly `.env` (not `.env.txt` or `.env.example`)
- Restart your server after creating/editing the `.env` file

### Error: "Invalid ORS API key" or "401 Unauthorized"
- Double-check your API key is correct
- Make sure there are no extra spaces or quotes around the key
- Verify your API key is active at https://openrouteservice.org/dev/

### Error: "Fetch API not available"
- Make sure you're using Node.js 18 or higher
- Check your Node version: `node --version`
- If using older Node.js, install node-fetch: `npm install node-fetch`

### Still Having Issues?

1. Check the server console for detailed error messages
2. Verify your API key works by testing it directly:
   ```bash
   curl -X POST 'https://api.openrouteservice.org/v2/directions/driving-car' \
     -H 'Authorization: YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"coordinates":[[-74.006,40.7128],[-73.9855,40.7580]]}'
   ```

## Free Tier Limits

The free ORS API key includes:
- 2,000 requests per day
- 40 requests per minute
- Perfect for development and testing!

