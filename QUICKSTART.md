# Quick Start Guide - Quiz for YouTube

Get started in 2 minutes! ⚡

## 🚀 Installation (30 seconds)

### Chrome Web Store
1. Visit Chrome Web Store (coming soon!)
2. Click "Add to Chrome"
3. Done! ✅

### Manual Install
1. Download/clone this repository
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder
6. Done! ✅

## 🎯 First Quiz (1 minute)

### Step 1: Open a YouTube Video
Go to any educational video, for example:
- https://www.youtube.com/watch?v=dQw4w9WgXcQ

### Step 2: Create Quiz
**Option A**: Click the "Create Quiz" button below the video title

**Option B**: Press `Ctrl + Shift + Q`

### Step 3: Wait for Generation
⏳ Takes 5-30 seconds depending on mode

### Step 4: Answer Questions
- Use mouse or keyboard
- Get instant feedback
- Review correct answers

### Step 5: Done! 🎉
Your quiz is saved automatically in history

## ⚙️ Setup (Optional)

### Free Mode (ChatGPT)
1. Login to https://chatgpt.com
2. Click extension icon
3. Select "ChatGPT Popup"
4. Done! ✅

### Paid Mode (OpenAI API)
1. Get API key from https://platform.openai.com
2. Add $5 credits minimum
3. Click extension icon
4. Select "OpenAI API with my token"
5. Paste API key
6. Click "Save token"
7. Done! ✅

## ⌨️ Keyboard Shortcuts

### Global
- `Ctrl + Shift + Q` - Create/close quiz

### During Quiz
- `←` `→` - Previous/next question
- `↑` `↓` - Navigate alternatives
- `Space` - Select alternative
- `Enter` - Submit answer
- `1-4` or `A-D` - Quick select
- `Esc` - Close quiz

## 💡 Pro Tips

### Tip 1: Use Keyboard
Navigate entirely with keyboard for faster studying!

### Tip 2: Review History
Click extension icon to see all past quizzes and stats

### Tip 3: Regenerate
Click refresh icon to get new questions for same video

### Tip 4: Debug Mode
Enable verbose logging:
```javascript
localStorage.setItem("AS_DEBUG", "1")
```

### Tip 5: Change Language
Extension popup → Language → Select your preference

## 🎓 Best Practices

### For Students
1. Watch video first
2. Create quiz immediately after
3. Answer without looking back
4. Review incorrect answers
5. Regenerate quiz after a few days

### For Teachers
1. Create quizzes for assigned videos
2. Share video links with students
3. Students create their own quizzes
4. Compare results and discuss

### For Self-Learners
1. Use on all educational videos
2. Track your progress over time
3. Focus on topics with low accuracy
4. Regenerate quizzes for spaced repetition

## 📊 Understanding Statistics

### In Extension Popup
- **Videos**: Total videos with quizzes
- **Answers**: Total questions answered
- **Accuracy**: Overall correct percentage

### Per Video
- **X/Y answered**: Questions completed
- **Z correct**: Correct answers
- **W%**: Accuracy for this video
- **N generations**: Times quiz was created

## 🔧 Common Issues

### Button Not Showing?
→ Hard refresh: `Ctrl + Shift + R`

### Generation Failed?
→ Check API key or ChatGPT login

### Context Invalidated?
→ Refresh the YouTube page

### More help?
→ See [FAQ.md](FAQ.md)

## 📚 Learn More

- **Full Documentation**: [README.md](README.md)
- **Installation Guide**: [INSTALL.md](INSTALL.md)
- **FAQ**: [FAQ.md](FAQ.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

## 🎉 You're Ready!

Start creating quizzes and boost your learning! 🚀

**Quick Test**: Press `Ctrl + Shift + Q` on any YouTube video right now!

---

**Need Help?** Visit https://pablosan.netlify.app
