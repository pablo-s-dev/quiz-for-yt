# Quiz for YouTube

AI-powered quiz generator for YouTube videos. Test your knowledge with automatically generated questions from any video.

**[Quick Start Guide](QUICKSTART.md)** | **[Installation](INSTALL.md)** | **[FAQ](FAQ.md)** | **[Contributing](CONTRIBUTING.md)**

## 🎯 Features

- **AI-Powered Quiz Generation**: Automatically creates multiple-choice questions from YouTube video transcripts
- **Dual Generation Modes**:
  - OpenAI API (with your own API key)
  - Automatic ChatGPT mode (uses your ChatGPT account)
- **Interactive Quiz Interface**: Clean, modern UI with smooth animations
- **Keyboard Controls**: Full keyboard navigation support
  - Arrow keys (←/→) to navigate between questions
  - Arrow keys (↑/↓) to navigate between alternatives
  - Space to select an alternative
  - Enter to submit answer
  - Numbers (1-4) or letters (A-D) for direct selection
  - Escape to close quiz
- **Progress Tracking**: Visual progress bar and question status indicators
- **Quiz History**: Save and review past quizzes with statistics
- **Bilingual Support**: English and Portuguese (PT-BR)
- **Keyboard Shortcut**: `Ctrl + Shift + Q` to create quiz on any YouTube video

## 📦 Installation

### From Source

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder

### Building for Distribution

```bash
npm run build
```

This creates a `quiz-for-youtube.zip` file ready for Chrome Web Store submission.

## 🚀 Usage

### Quick Start

1. Open any YouTube video
2. Click the "Create Quiz" button below the video title
3. Wait for the AI to generate questions
4. Answer the questions and test your knowledge!

### Using OpenAI API Mode

1. Get an API key from [OpenAI Platform](https://platform.openai.com)
2. Click the extension icon in Chrome toolbar
3. Select "OpenAI API with my token" mode
4. Paste your API key and save
5. Create quizzes on any YouTube video

**Pricing**: Minimum $5 USD prepaid credits. With `gpt-4o-mini`, you can generate thousands of quizzes.

### Using ChatGPT Mode (Free)

1. Make sure you're logged into [ChatGPT](https://chatgpt.com)
2. Click the extension icon
3. Select "Automatic ChatGPT" mode
4. Create quizzes - the extension will automatically use ChatGPT

## ⌨️ Keyboard Shortcuts

### Global
- `Ctrl + Shift + Q` - Create quiz / Close quiz

### During Quiz
- `←` / `→` - Previous/Next question
- `↑` / `↓` - Navigate alternatives
- `Space` - Select focused alternative
- `Enter` - Submit answer
- `1-4` or `A-D` - Direct alternative selection
- `Esc` - Close quiz

## 🛠️ Development

### Project Structure

```
quiz-for-youtube/
├── manifest.json          # Extension manifest
├── content.js            # Main quiz logic (YouTube integration)
├── background.js         # Background service worker
├── chatgpt_content.js    # ChatGPT automation
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── ui-kit.js             # Icon system
├── main.css              # Quiz styles
├── default_icon.png      # Extension icon
└── README.md             # This file
```

### Debug Mode

Enable verbose logging in the browser console:

```javascript
// In YouTube DevTools console
localStorage.setItem("AS_DEBUG", "1");
// Refresh the page

// To disable
localStorage.removeItem("AS_DEBUG");
```

### Building

```bash
# Install dependencies (if any)
npm install

# Create distribution zip
npm run build
```

## 🌐 Supported Languages

- **English (en-US)**: Default
- **Portuguese (pt-BR)**: Full translation

The extension automatically detects your browser language or you can manually select in settings.

## 📊 Quiz History & Statistics

The extension tracks:
- Total videos with quizzes
- Questions answered
- Correct answers
- Accuracy percentage
- Number of quiz generations per video

Access history by clicking the extension icon.

## 🔒 Privacy & Security

- **API Keys**: Stored locally in Chrome's storage, never sent to third parties
- **Video Data**: Transcripts are processed only for quiz generation
- **No Tracking**: No analytics or user tracking
- **Open Source**: All code is visible and auditable

## 📚 Documentation

- **[Installation Guide](INSTALL.md)** - Detailed installation instructions
- **[FAQ](FAQ.md)** - Frequently asked questions
- **[Contributing](CONTRIBUTING.md)** - How to contribute to the project
- **[Changelog](CHANGELOG.md)** - Version history and updates
- **[Privacy Policy](PRIVACY.md)** - How we handle your data
- **[Store Listing](STORE_LISTING.md)** - Chrome Web Store information
- **[License](LICENSE)** - MIT License

## 🐛 Troubleshooting

### Quiz button not appearing
1. Refresh the YouTube page (Ctrl + Shift + R)
2. Make sure you're on a video page (`/watch?v=...`)
3. Check if the video has captions/transcripts available

### ChatGPT mode not working
1. Make sure you're logged into ChatGPT
2. Open [chatgpt.com](https://chatgpt.com) in a new tab first
3. Try creating the quiz again

### Extension context invalidated
This happens when the extension is reloaded. Simply refresh the YouTube page.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

MIT License - feel free to use and modify as needed.

## 🙏 Credits

Built with:
- OpenAI API for quiz generation
- Iconify for icons (Material Design Icons)
- YouTube's transcript API

---

**Made with ❤️ for active learners**
