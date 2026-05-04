# Quiz for YouTube - Documentation

Complete documentation for developers and contributors.

## Table of Contents

- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Core Components](#core-components)
- [API Reference](#api-reference)
- [Development Guide](#development-guide)
- [Build & Deploy](#build--deploy)
- [Troubleshooting](#troubleshooting)

## Architecture

### Overview

Quiz for YouTube is a Chrome extension that generates AI-powered quizzes from YouTube video transcripts. It uses a content script architecture with background service workers.

```
┌─────────────────┐
│  YouTube Page   │
│   (content.js)  │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼──────┐
    │ Popup UI │    │ Background │
    │(popup.js)│    │(background │
    └──────────┘    │    .js)    │
                    └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │  ChatGPT   │
                    │  Content   │
                    │(chatgpt_   │
                    │content.js) │
                    └────────────┘
```

### Key Features

1. **Dual Generation Modes**
   - OpenAI API: Direct API calls with user's key
   - ChatGPT Automation: Automated interaction with ChatGPT web interface

2. **Quiz Interface**
   - Overlay UI on YouTube
   - Keyboard navigation
   - Progress tracking
   - Answer validation

3. **Data Persistence**
   - Chrome Storage API for settings
   - LocalStorage for quiz history
   - Automatic migration from legacy format

## File Structure

```
quiz-for-youtube/
├── manifest.json              # Extension manifest (v3)
├── content.js                 # Main quiz logic (1600+ lines)
├── background.js              # Service worker for API calls
├── chatgpt_content.js         # ChatGPT automation
├── popup.html                 # Extension popup UI
├── popup.js                   # Popup logic & settings
├── ui-kit.js                  # Icon system (Iconify wrapper)
├── main.css                   # Quiz overlay styles
├── default_icon.png           # Extension icon (128x128)
├── official_icon.svg          # SVG icon
├── build.js                   # Build script
├── package.json               # NPM configuration
├── README.md                  # User documentation
└── DOCS.md                    # This file
```

## Core Components

### 1. Content Script (content.js)

**Purpose**: Injects quiz UI into YouTube pages and manages quiz lifecycle.

**Key Functions**:

```javascript
// Quiz creation
async function startQuizCreation(forceNew = false)
async function loadQuestions(forceNew = false)
async function generateQuizWithOpenAI()
async function generateQuizWithChatGpt()

// UI rendering
function showQuizShell()
function renderQuestion()
function showQuestion(question)
function updateProgressBar()

// Navigation
function nextQuestion()
function prevQuestion()
function checkAns(question)

// Keyboard controls
function handleQuizKeyboard(event)
function updateAlternativeFocus()

// YouTube integration
async function syncQuizLaunchButton()
async function grabVidInfo(force = false)
async function grabSubs(videoId)
```

**Storage Keys**:
- `quizHistory`: Object mapping videoId → quiz data
- `generationSettings`: User settings (API key, mode, language)

**Translation System**:
```javascript
const textContent = {
    "en-US": { /* English strings */ },
    "pt-BR": { /* Portuguese strings */ }
};

function t(key) {
    return textContent[lang][key] || key;
}
```

### 2. Background Service Worker (background.js)

**Purpose**: Handles API calls and ChatGPT tab management.

**Key Functions**:

```javascript
// OpenAI API
async function callOpenAI(prompt, apiKey, model)

// ChatGPT automation
async function openChatGptTab()
async function ensureChatGptReady(tabId)
async function sendPromptToChatGpt(tabId, jobId, prompt)
```

**Message Handlers**:
- `generateQuizWithOpenAI`: Direct OpenAI API call
- `generateQuizWithChatGpt`: Opens ChatGPT and sends prompt
- `chatGptTabReady`: Confirms ChatGPT content script loaded
- `chatGptQuizResponse`: Receives quiz from ChatGPT
- `chatGptQuizError`: Handles ChatGPT errors

### 3. ChatGPT Content Script (chatgpt_content.js)

**Purpose**: Automates ChatGPT web interface for quiz generation.

**Key Features**:
- Waits for ChatGPT UI to load
- Removes "Extended mode" pill automatically
- Types prompt into composer
- Waits for response with stability detection
- Extracts JSON from response

**Configuration**:
```javascript
const RESPONSE_TIMEOUT_MS = 180000;  // 3 minutes
const RESPONSE_STABLE_MS = 2200;     // 2.2 seconds
const POLL_MS = 400;                 // 400ms polling
```

**Selectors** (updated for ChatGPT UI changes):
```javascript
const CHATGPT_SELECTORS = {
    composer: ["#prompt-textarea", ...],
    sendButton: ["button[data-testid='send-button']", ...],
    stopButton: ["button[data-testid='stop-button']", ...],
    assistantMessage: ["[data-message-author-role='assistant']", ...],
    extendedModePill: ["button.__composer-pill-remove", ...]
};
```

### 4. Popup (popup.html + popup.js)

**Purpose**: Extension settings and quiz history.

**Sections**:
1. **Settings**
   - Language selection (System/EN/PT-BR)
   - Generation mode (OpenAI/ChatGPT)
   - API key management
   - Model selection

2. **Current Video**
   - Quick quiz generation button
   - Keyboard shortcut reminder

3. **History & Statistics**
   - Total videos, answers, accuracy
   - List of past quizzes
   - Show/Open video buttons

### 5. UI Kit (ui-kit.js)

**Purpose**: Icon system using Iconify.

**Available Icons**:
```javascript
const ICONS = {
    "mdi:clipboard-question-outline": "...",
    "mdi:close": "...",
    "mdi:chevron-left": "...",
    "mdi:chevron-right": "...",
    "mdi:send": "...",
    "mdi:refresh": "...",
    "mdi:check-circle": "...",
    "mdi:close-circle": "...",
    "mdi:help-circle-outline": "...",
    "mdi:alert-circle-outline": "..."
};
```

**API**:
```javascript
// Create icon element
const icon = ActiveStudyUI.icon(name, options);

// Set button content (icon + label)
ActiveStudyUI.setButtonContent(button, {
    icon: "mdi:close",
    label: "Close",
    ariaLabel: "Close quiz",
    title: "Close",
    iconSize: 18
});

// Create button
const button = ActiveStudyUI.button({
    icon: "mdi:eye-outline",
    label: "Show",
    className: "as_button_secondary"
});
```

## API Reference

### Quiz Data Structure

```javascript
{
    id: "videoId",
    url: "https://www.youtube.com/watch?v=...",
    videoTitle: "Video Title",
    questions: [
        {
            question: "Question text?",
            alternatives: ["A", "B", "C", "D"],
            answer: "A",  // or index 0
            time: 0,
            done: false,
            hit: false,
            user_ans: null
        }
    ],
    source: "openai" | "chatgpt" | "saved" | "legacy",
    createdAt: "2026-05-03T...",
    updatedAt: "2026-05-03T...",
    lastAnsweredAt: null,
    timesGenerated: 1,
    totalQuestions: 7,
    answeredCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    accuracy: 0,
    completed: false
}
```

### Settings Structure

```javascript
{
    generationMode: "openai" | "chatgpt",
    openAiModel: "gpt-4o-mini",
    openAiApiKey: "sk-...",
    uiLanguage: "system" | "en-US" | "pt-BR"
}
```

### Chrome Messages

**From content.js to background.js**:
```javascript
// Generate with OpenAI
{
    request: "generateQuizWithOpenAI",
    prompt: "..."
}

// Generate with ChatGPT
{
    request: "generateQuizWithChatGpt",
    prompt: "...",
    videoId: "...",
    videoTitle: "..."
}
```

**From background.js to content.js**:
```javascript
// Show saved quiz
{
    request: "showQuiz",
    quiz: { /* quiz object */ },
    videoId: "..."
}

// Regenerate quiz
{
    request: "regenerateQuiz"
}
```

**From chatgpt_content.js to background.js**:
```javascript
// Ready notification
{
    request: "chatGptTabReady"
}

// Quiz response
{
    request: "chatGptQuizResponse",
    jobId: "...",
    responseText: "..."
}

// Error
{
    request: "chatGptQuizError",
    jobId: "...",
    error: "..."
}
```

## Development Guide

### Setup

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd quiz-for-youtube
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

### Debug Mode

Enable verbose logging:

```javascript
// In YouTube DevTools console
localStorage.setItem("AS_DEBUG", "1");
// Refresh page

// Logs will show as:
// [ActiveStudy] Button successfully injected
// [ActiveStudy] Checking anchor for video: abc123
```

Disable:
```javascript
localStorage.removeItem("AS_DEBUG");
```

### Testing

**Manual Testing Checklist**:

1. **Button Injection**
   - [ ] Button appears on video page
   - [ ] Button disappears on non-video pages
   - [ ] Button survives YouTube SPA navigation
   - [ ] Button text updates with language change

2. **Quiz Generation**
   - [ ] OpenAI mode works with valid API key
   - [ ] ChatGPT Popup opens tab and generates quiz
   - [ ] Error handling for invalid API key
   - [ ] Error handling for no transcript

3. **Quiz Interface**
   - [ ] Questions render correctly
   - [ ] Alternatives are selectable
   - [ ] Answer validation works
   - [ ] Progress bar updates
   - [ ] Navigation buttons work

4. **Keyboard Controls**
   - [ ] Ctrl+Shift+Q opens/closes quiz
   - [ ] Arrow keys navigate questions
   - [ ] Arrow keys navigate alternatives
   - [ ] Space selects alternative
   - [ ] Enter submits answer
   - [ ] Numbers/letters select alternatives
   - [ ] Escape closes quiz

5. **Persistence**
   - [ ] Quiz saves to history
   - [ ] Settings persist across sessions
   - [ ] History shows in popup
   - [ ] Statistics calculate correctly

### Common Development Tasks

**Add a new translation key**:

1. Add to `content.js`:
```javascript
const textContent = {
    "en-US": {
        // ...
        new_key: "English text"
    },
    "pt-BR": {
        // ...
        new_key: "Texto em português"
    }
};
```

2. Add to `popup.js` if needed:
```javascript
const I18N = {
    "en-US": { new_key: "..." },
    "pt-BR": { new_key: "..." }
};
```

3. Use in code:
```javascript
const text = t("new_key");
```

**Add a new icon**:

1. Find icon on [Iconify](https://icon-sets.iconify.design/mdi/)
2. Add to `ui-kit.js`:
```javascript
const ICONS = {
    // ...
    "mdi:new-icon": "M..."  // SVG path data
};
```

3. Use in code:
```javascript
const icon = window.ActiveStudyUI.icon("mdi:new-icon", {
    size: 20,
    color: "#ff0000"
});
```

**Modify quiz prompt**:

Edit `buildQuizPrompt()` in `content.js`:
```javascript
function buildQuizPrompt() {
    const isPt = lang === "pt-BR";
    const instructions = isPt ? [
        "Aja como um especialista...",
        // Add/modify instructions
    ] : [
        "Act as an expert...",
        // Add/modify instructions
    ];
    return instructions.join("\n");
}
```

## Build & Deploy

### Building for Production

```bash
# Install dependencies
npm install

# Create distribution zip
npm run build
```

This creates `quiz-for-youtube.zip` with:
- All necessary extension files
- Excludes: node_modules, .git, build files, test files

### Chrome Web Store Submission

1. **Prepare Assets**
   - Extension icon: 128x128 PNG (already included)
   - Screenshots: 1280x800 or 640x400
   - Promotional images (optional)

2. **Build Extension**
   ```bash
   npm run build
   ```

3. **Upload to Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Click "New Item"
   - Upload `quiz-for-youtube.zip`
   - Fill in store listing details
   - Submit for review

4. **Store Listing Details**
   - **Name**: Quiz for YouTube
   - **Summary**: AI-powered quiz generator for YouTube videos
   - **Description**: See README.md for full description
   - **Category**: Productivity
   - **Language**: English (primary), Portuguese (secondary)

### Version Management

Update version in `manifest.json`:
```json
{
    "version": "0.2.0"
}
```

Follow [Semantic Versioning](https://semver.org/):
- **Major** (1.0.0): Breaking changes
- **Minor** (0.2.0): New features
- **Patch** (0.1.1): Bug fixes

## Troubleshooting

### Button Not Appearing

**Symptoms**: Quiz button doesn't show on YouTube video page

**Causes**:
1. YouTube DOM not ready
2. Extension context invalidated
3. Anchor element not found

**Solutions**:
```javascript
// Check if button injection is running
console.log("[ActiveStudy] logs in console");

// Force re-injection
syncQuizLaunchButton();

// Hard refresh page
Ctrl + Shift + R
```

### ChatGPT Popup Failing

**Symptoms**: "Timeout waiting for ChatGPT" error

**Causes**:
1. Not logged into ChatGPT
2. ChatGPT UI changed
3. Extended mode pill not removed

**Solutions**:
1. Open [chatgpt.com](https://chatgpt.com) and log in
2. Update selectors in `chatgpt_content.js`
3. Check console for selector errors

### Extension Context Invalidated

**Symptoms**: "Extension context invalidated" error

**Cause**: Extension was reloaded while page was open

**Solution**: Refresh the YouTube page (F5)

### Quiz Not Saving

**Symptoms**: Quiz disappears after closing

**Causes**:
1. Storage quota exceeded
2. Chrome storage API error

**Solutions**:
```javascript
// Check storage usage
chrome.storage.local.getBytesInUse(null, (bytes) => {
    console.log("Storage used:", bytes, "bytes");
});

// Clear old quizzes
chrome.storage.local.clear();
```

### Keyboard Shortcuts Not Working

**Symptoms**: Ctrl+Shift+Q doesn't work

**Causes**:
1. Another extension using same shortcut
2. YouTube video controls intercepting keys

**Solutions**:
- Check for conflicting extensions
- Make sure quiz is not already open
- Try clicking on page first to focus

## Performance Optimization

### Reducing Bundle Size

Current size: ~100KB

**Optimization opportunities**:
1. Minify CSS (saves ~10KB)
2. Remove unused icons (saves ~5KB)
3. Compress images (saves ~20KB)

### Improving Load Time

**Current approach**:
- Content script loads on all YouTube pages
- Lazy-loads quiz UI only when needed

**Best practices**:
- Use `run_at: "document_idle"` (already implemented)
- Minimize DOM queries
- Use event delegation
- Cache DOM references

### Memory Management

**Current memory usage**: ~5-10MB per tab

**Optimization**:
```javascript
// Clean up when quiz closes
function hideQuiz() {
    showingQuiz = false;
    focusedAlternativeIndex = -1;
    const quizContainer = document.querySelector(".quiz_container");
    quizContainer?.remove();  // Remove from DOM
}

// Disconnect observers when not needed
if (activeObserver) {
    activeObserver.disconnect();
}
```

## Contributing

### Code Style

- **Indentation**: 4 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Naming**: camelCase for functions/variables

### Git Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with descriptive message
5. Create pull request

### Commit Messages

Format:
```
<type>: <description>

[optional body]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat: add Spanish translation

- Add es-ES language support
- Update popup and content script
- Add translation strings for all UI elements
```

## License

MIT License - See LICENSE file for details.

---

**Last Updated**: May 3, 2026  
**Version**: 0.1.0
