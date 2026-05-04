# Installation Guide - Quiz for YouTube

Complete installation instructions for users and developers.

## 📦 For Users

### Option 1: Chrome Web Store (Recommended)

**Coming Soon!** The extension will be available on the Chrome Web Store.

1. Visit the Chrome Web Store page
2. Click "Add to Chrome"
3. Click "Add extension" in the popup
4. Done! The extension is now installed

### Option 2: Manual Installation (Development)

If you want to install from source:

1. **Download the Extension**
   - Download the latest release ZIP
   - Or clone the repository: `git clone <repo-url>`

2. **Extract Files** (if downloaded as ZIP)
   - Extract to a folder on your computer
   - Remember the folder location

3. **Open Chrome Extensions Page**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage Extensions

4. **Enable Developer Mode**
   - Toggle "Developer mode" switch (top right corner)

5. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the extension folder
   - Select the folder and click "Select Folder"

6. **Verify Installation**
   - Extension should appear in the list
   - Icon should appear in Chrome toolbar
   - Visit any YouTube video to test

## 🔧 For Developers

### Prerequisites

- **Node.js** (v14 or higher)
  - Download: https://nodejs.org/
  - Check version: `node --version`

- **npm** (comes with Node.js)
  - Check version: `npm --version`

- **Git** (optional, for cloning)
  - Download: https://git-scm.com/

- **Chrome Browser**
  - Download: https://www.google.com/chrome/

### Setup Development Environment

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd quiz-for-youtube
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Load Extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project folder

4. **Enable Debug Mode** (Optional)
   - Open any YouTube video
   - Open DevTools Console (F12)
   - Run: `localStorage.setItem("AS_DEBUG", "1")`
   - Refresh the page
   - You'll see detailed logs in console

### Building for Distribution

```bash
# Build production-ready ZIP file
npm run build

# Output: quiz-for-youtube.zip
```

## ⚙️ Configuration

### OpenAI API Mode

1. **Get API Key**
   - Go to https://platform.openai.com
   - Sign up or log in
   - Go to API Keys section
   - Create new secret key
   - Copy the key (starts with `sk-...`)

2. **Add Credits**
   - Go to Billing section
   - Add payment method
   - Purchase credits (minimum $5)

3. **Configure Extension**
   - Click extension icon in Chrome toolbar
   - Select "OpenAI API with my token"
   - Paste your API key
   - Click "Save token"
   - (Optional) Change model if needed

### ChatGPT Mode (Free)

1. **Login to ChatGPT**
   - Go to https://chatgpt.com
   - Sign up or log in
   - Keep the tab open

2. **Configure Extension**
   - Click extension icon
   - Select "Automatic ChatGPT"
   - Done!

### Language Settings

1. Click extension icon
2. Select language:
   - **System**: Uses browser language
   - **English**: Force English
   - **Português**: Force Portuguese

## 🧪 Testing Installation

### Quick Test

1. **Open YouTube Video**
   - Go to any YouTube video with captions
   - Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ

2. **Look for Quiz Button**
   - Button should appear below video title
   - Text: "Create Quiz" or "Criar Quiz"

3. **Create a Quiz**
   - Click the button
   - Wait for quiz generation
   - Answer questions

4. **Test Keyboard Shortcuts**
   - Press `Ctrl + Shift + Q` to toggle quiz
   - Use arrow keys to navigate
   - Press `Esc` to close

### Full Test Checklist

- [ ] Extension icon appears in toolbar
- [ ] Quiz button appears on YouTube videos
- [ ] Quiz generation works (OpenAI or ChatGPT)
- [ ] Keyboard shortcuts work
- [ ] Quiz history saves
- [ ] Language switching works
- [ ] Settings persist after browser restart
- [ ] No console errors

## 🐛 Troubleshooting

### Extension Not Loading

**Problem**: Extension doesn't appear in Chrome

**Solutions**:
1. Make sure you're using Chrome (not Edge, Firefox, etc.)
2. Check Chrome version (must be recent)
3. Try restarting Chrome
4. Disable other extensions temporarily
5. Check for Chrome updates

### Quiz Button Not Appearing

**Problem**: Button doesn't show on YouTube

**Solutions**:
1. Hard refresh the page: `Ctrl + Shift + R`
2. Make sure you're on a video page (`/watch?v=...`)
3. Check if video has captions/transcripts
4. Open DevTools Console (F12) and check for errors
5. Try reloading the extension:
   - Go to `chrome://extensions/`
   - Click reload icon on the extension

### OpenAI API Not Working

**Problem**: Quiz generation fails with API error

**Solutions**:
1. Check API key is correct (starts with `sk-...`)
2. Verify you have credits in OpenAI account
3. Check OpenAI API status: https://status.openai.com
4. Try a different model (e.g., `gpt-3.5-turbo`)
5. Check browser console for detailed error

### ChatGPT Mode Not Working

**Problem**: ChatGPT automation fails

**Solutions**:
1. Make sure you're logged into ChatGPT
2. Open https://chatgpt.com in a new tab first
3. Check if ChatGPT is responding normally
4. Try closing and reopening ChatGPT tab
5. Clear ChatGPT cookies and log in again

### Extension Context Invalidated

**Problem**: Error message about invalid context

**Solutions**:
1. This happens when extension is reloaded
2. Simply refresh the YouTube page
3. Hard refresh: `Ctrl + Shift + R`

### Build Script Fails

**Problem**: `npm run build` doesn't work

**Solutions**:
1. Make sure Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Check for error messages in console
4. Try deleting `node_modules` and reinstalling:
   ```bash
   rm -rf node_modules
   npm install
   ```

## 🔄 Updating

### For Users (Chrome Web Store)

Chrome automatically updates extensions. To force update:
1. Go to `chrome://extensions/`
2. Click "Update" button at top

### For Developers

```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Reload extension in Chrome
# Go to chrome://extensions/ and click reload icon
```

## 🗑️ Uninstalling

### Complete Removal

1. **Remove Extension**
   - Go to `chrome://extensions/`
   - Find "Quiz for YouTube"
   - Click "Remove"
   - Confirm removal

2. **Clear Data** (Optional)
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Local Storage
   - Clear Chrome Storage

All quiz history and settings will be deleted.

## 📞 Support

Need help?

- **Documentation**: Check README.md
- **Issues**: Open a GitHub issue
- **Website**: https://pablosan.netlify.app

## ✅ Installation Complete!

You're all set! Visit any YouTube video and start creating quizzes.

**Quick Start**: Press `Ctrl + Shift + Q` on any YouTube video!
