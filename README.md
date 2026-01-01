# USCIS Case Tracker - Mobile PWA

A Progressive Web App (PWA) for tracking your USCIS immigration case status on mobile devices (iPhone & Android).

## ✨ Features

- ✅ Works on **iPhone** and **Android**
- ✅ **Install on home screen** (works like a native app)
- ✅ **Offline support** (loads even without internet)
- ✅ Real-time data from USCIS API
- ✅ Timezone support (Central Time default)
- ✅ Event code descriptions
- ✅ Change tracking with 🆕 badges
- ✅ Touch-optimized interface
- ✅ Case history (last 10 searches)
- ✅ No app store needed!

## 🚀 How to Install

### Method 1: Using a Web Server (Recommended)

Since this needs to connect to USCIS (requires HTTPS), you need to host it on a web server.

#### Option A: Use GitHub Pages (FREE!)

1. **Create a GitHub account** (if you don't have one)
2. **Create a new repository** named `uscis-tracker`
3. **Upload all files** from the `uscis-mobile` folder
4. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Click Save
5. **Your app will be live at:** `https://yourusername.github.io/uscis-tracker/`

#### Option B: Use Netlify (FREE!)

1. Go to [netlify.com](https://netlify.com)
2. Sign up for free
3. Drag and drop the `uscis-mobile` folder
4. Your app will be live instantly!

#### Option C: Use Vercel (FREE!)

1. Go to [vercel.com](https://vercel.com)
2. Sign up for free
3. Import the project
4. Deploy!

### Method 2: Local Server (For Testing)

```bash
# Navigate to the folder
cd uscis-mobile

# Start a simple web server (Python 3)
python3 -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Open in browser
# Go to: http://localhost:8000
```

**Note:** Local servers won't work with USCIS API due to CORS. Use Method 1 for full functionality.

## 📱 Installing on Your Phone

### iPhone (Safari)

1. Open the app URL in Safari
2. Tap the **Share button** (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. The app icon will appear on your home screen!

### Android (Chrome)

1. Open the app URL in Chrome
2. Tap the **menu** (three dots)
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Tap **"Add"** or **"Install"**
5. The app icon will appear on your home screen!

## 🔐 How to Use

### Step 1: Login to USCIS
1. Open Safari/Chrome on your phone
2. Go to [https://my.uscis.gov/account](https://my.uscis.gov/account)
3. **Log in** with your USCIS credentials
4. **Keep this tab open** or make sure you stay logged in

### Step 2: Open the App
1. Tap the USCIS Tracker icon on your home screen
2. If authenticated, you'll see a green ✅
3. If not, you'll see a warning to log in

### Step 3: Check Your Case
1. Select your timezone (Central Time is default)
2. Enter your receipt number (e.g., `IOE0934989946`)
3. Tap **"Check Case Status"**
4. View your case details!

### Step 4: Check Again Later
1. Open the app anytime
2. Previous searches are saved
3. Tap on a saved case to view it again
4. Check for updates with 🆕 badges

## 📂 Files Included

```
uscis-mobile/
├── index.html       # Main app interface
├── app.js           # JavaScript logic
├── manifest.json    # PWA configuration
├── sw.js            # Service worker (offline support)
├── icon-192.png     # App icon (192x192)
├── icon-512.png     # App icon (512x512)
└── README.md        # This file
```

## 🔧 How It Works

### Progressive Web App (PWA)
- **Installable:** Can be added to home screen
- **Offline:** Works without internet (after first load)
- **Fast:** Cached for instant loading
- **Responsive:** Optimized for mobile screens

### Authentication
- Uses your browser's USCIS session cookies
- No passwords stored in the app
- Must be logged into USCIS website first

### Data Storage
- **localStorage:** Saves timezone preference and case history
- **Service Worker Cache:** Stores app files for offline use
- **No server:** Everything runs on your phone!

## 🎨 Features Explained

### Timezone Selector
- Choose your timezone (Central Time default)
- All dates convert automatically
- Preference is saved

### Event Descriptions
Each event code (IAF, RFE, etc.) shows what it means in plain English

### Change Tracking
- Compares with previous check
- Shows 🆕 NEW badge for changes
- Highlights updated sections

### Case History
- Saves last 10 cases checked
- Tap to reload instantly
- Stored locally on your device

## ⚠️ Important Notes

### Authentication Required
- You MUST be logged into [my.uscis.gov](https://my.uscis.gov) first
- The app uses your session cookies
- If you log out of USCIS, the app won't work

### HTTPS Required
- Must be served over HTTPS (not http://)
- Use GitHub Pages, Netlify, or Vercel
- Local servers (http://localhost) won't work with USCIS API

### Browser Compatibility
- **Safari** (iPhone): ✅ Full support
- **Chrome** (Android): ✅ Full support
- **Firefox** (Mobile): ✅ Full support
- **Other browsers:** May vary

## 🐛 Troubleshooting

### "Not Logged In" Error
1. Open Safari/Chrome
2. Go to https://my.uscis.gov/account
3. Log in
4. Return to the app
5. Refresh the page

### "Failed to fetch" Error
1. Check your internet connection
2. Make sure you're logged into USCIS
3. Try refreshing the page
4. Check if USCIS website is down

### App Won't Install
1. Make sure you're using Safari (iPhone) or Chrome (Android)
2. App must be served over HTTPS
3. Try clearing browser cache
4. Update your browser to latest version

### Times Are Wrong
1. Check timezone selector at top
2. Select correct timezone
3. Times will update automatically

## 🔒 Privacy & Security

- ✅ No data sent to external servers
- ✅ All data stays on your device
- ✅ Uses your existing USCIS login
- ✅ No passwords stored
- ✅ History stored locally only
- ✅ Open source (you can review the code)

## 📊 Data Storage

**What's Stored Locally:**
- Timezone preference
- Last 10 case searches
- Previous case data (for change detection)

**What's NOT Stored:**
- USCIS passwords
- Session tokens
- Personal information

**Storage Location:**
- Browser's localStorage (on your device)
- Service Worker cache (app files)

## 🆚 PWA vs Browser Extension

### PWA (This App)
- ✅ Works on iPhone and Android
- ✅ No installation needed
- ✅ Can be on home screen
- ✅ Works offline
- ❌ Needs separate USCIS login tab

### Browser Extension (Desktop)
- ✅ Desktop only (Chrome/Edge)
- ✅ Uses same browser session
- ✅ Easier authentication
- ❌ Doesn't work on mobile

## 🚀 Deployment Examples

### GitHub Pages
```bash
# 1. Create repo on GitHub
# 2. Upload files
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/uscis-tracker.git
git push -u origin main

# 3. Enable Pages in repo settings
```

### Netlify (Drag & Drop)
1. Go to https://app.netlify.com/drop
2. Drag the `uscis-mobile` folder
3. Done! App is live

## 📱 Screenshots

The app shows:
- ✅ Authentication status
- 📋 Receipt number input
- ⏰ Timezone selector
- 🟢 Case status (Active/Closed)
- 📄 Form type and name
- 👤 Applicant information
- 📅 Important dates
- 📬 Notices (with appointment times)
- 📊 Events (with descriptions)
- 🆕 Change indicators
- 📱 Recent case history

## 🎯 Tips for Best Experience

1. **Install to Home Screen** - Works like a native app
2. **Stay Logged In** - Keep USCIS session active
3. **Check Regularly** - See updates with 🆕 badges
4. **Use WiFi** - For fastest loading
5. **Enable Notifications** - (Coming soon!)

## 🔄 Updates

To update the app:
1. Refresh the page in your browser
2. If installed, it will auto-update
3. Or reinstall from home screen

## ❓ FAQ

**Q: Does this work offline?**
A: The app loads offline, but you need internet to fetch USCIS data.

**Q: Is this official?**
A: No, this is an unofficial tool using the official USCIS API.

**Q: Is it safe?**
A: Yes! All code is open source and runs on your device only.

**Q: Do I need an app store?**
A: No! It's a web app that can be installed directly.

**Q: Can I use it on iPad/Tablet?**
A: Yes! Works on all mobile devices with a modern browser.

**Q: Will it drain my battery?**
A: No, it only runs when you open it.

---

## 📞 Support

If you encounter issues:
1. Check if you're logged into USCIS
2. Verify your internet connection
3. Try refreshing the page
4. Clear browser cache and try again

---

**Disclaimer:** This is an unofficial tool and is not affiliated with USCIS. Always verify important case information on the official USCIS website at https://my.uscis.gov

---

Made with ❤️ for immigration case tracking
