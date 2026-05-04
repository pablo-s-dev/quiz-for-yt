# Frequently Asked Questions (FAQ)

## General Questions

### What is Quiz for YouTube?

Quiz for YouTube is a Chrome extension that uses AI to automatically generate interactive quizzes from YouTube videos. It helps you test your understanding and improve retention of video content.

### Is it free?

Yes! The extension offers two modes:
- **ChatGPT Mode**: Completely free (requires a ChatGPT account)
- **OpenAI API Mode**: Pay-as-you-go (minimum $5 prepaid, generates thousands of quizzes)

### What languages are supported?

The extension interface supports:
- English (en-US)
- Portuguese (pt-BR)

Quiz questions are generated in the same language as the video transcript.

### Does it work on all YouTube videos?

It works on any YouTube video that has captions/transcripts available. Most educational videos have transcripts.

---

## Installation & Setup

### How do I install the extension?

1. Visit the Chrome Web Store page
2. Click "Add to Chrome"
3. Click "Add extension"
4. Done!

For detailed instructions, see [INSTALL.md](INSTALL.md).

### Do I need an OpenAI API key?

No! You can use the free ChatGPT mode. The OpenAI API key is only needed if you want to use the API mode for faster, more reliable generation.

### How do I get an OpenAI API key?

1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy and paste it in the extension settings

### How much does OpenAI API cost?

- Minimum purchase: $5 USD
- With `gpt-4o-mini` (default): ~$0.15-0.30 per 1M tokens
- You can generate thousands of quizzes with $5

---

## Usage

### How do I create a quiz?

**Method 1**: Click the "Create Quiz" button below the video title

**Method 2**: Press `Ctrl + Shift + Q` on any YouTube video

### How long does it take to generate a quiz?

- **OpenAI API Mode**: 5-15 seconds
- **ChatGPT Mode**: 15-30 seconds (depends on ChatGPT response time)

### Can I regenerate a quiz for the same video?

Yes! Click the refresh icon in the quiz header or use the extension popup to generate a new quiz with different questions.

### How many questions are generated?

The AI typically generates 3-7 questions per video, depending on the video length and content complexity.

### Can I customize the number of questions?

Not yet, but this feature is planned for a future update!

### How do keyboard controls work?

- `←` / `→` - Navigate between questions
- `↑` / `↓` - Navigate between alternatives
- `Space` - Select focused alternative
- `Enter` - Submit answer
- `1-4` or `A-D` - Direct alternative selection
- `Esc` - Close quiz
- `Ctrl + Shift + Q` - Create/close quiz

---

## Features

### Does it save my quiz history?

Yes! All quizzes are saved locally in your browser. You can view them in the extension popup.

### Can I review past quizzes?

Yes! Click the extension icon and you'll see your quiz history with statistics. Click "Show" to review any past quiz.

### What statistics are tracked?

- Total videos with quizzes
- Questions answered
- Correct answers
- Accuracy percentage
- Number of quiz generations per video

### Can I export my quiz data?

Not directly through the UI yet, but you can access it via browser DevTools (Application > Local Storage). Export feature is planned for future updates.

### Does it work offline?

No, it requires an internet connection to:
- Access YouTube transcripts
- Generate quizzes via OpenAI or ChatGPT

---

## Technical Questions

### What AI models are used?

- **Default**: `gpt-4o-mini` (fast and economical)
- **Customizable**: You can change the model in settings (e.g., `gpt-4`, `gpt-3.5-turbo`)

### How does ChatGPT mode work?

The extension automates your ChatGPT browser session:
1. Opens ChatGPT in the background
2. Sends the video transcript
3. Waits for the quiz response
4. Extracts and displays the quiz

### Is my data private?

Yes! All data is stored locally in your browser:
- Quiz history
- Settings
- API keys (encrypted)

Nothing is sent to our servers (we don't have any!). See [PRIVACY.md](PRIVACY.md) for details.

### What permissions does it need?

- **storage**: Save quiz history and settings locally
- **activeTab**: Inject quiz interface on YouTube
- **host_permissions**: Access YouTube transcripts and AI services

### Is it open source?

Yes! The code is available on GitHub. You can review, audit, and contribute.

---

## Troubleshooting

### The quiz button doesn't appear

**Solutions**:
1. Hard refresh the page: `Ctrl + Shift + R`
2. Make sure you're on a video page (`/watch?v=...`)
3. Check if the video has captions/transcripts
4. Reload the extension in `chrome://extensions/`

### Quiz generation fails

**For OpenAI API Mode**:
1. Check your API key is correct
2. Verify you have credits in your OpenAI account
3. Check OpenAI API status: https://status.openai.com
4. Try a different model

**For ChatGPT Mode**:
1. Make sure you're logged into ChatGPT
2. Open https://chatgpt.com in a new tab first
3. Check if ChatGPT is responding normally
4. Try again after a few minutes

### "Extension context invalidated" error

This happens when the extension is reloaded. Simply refresh the YouTube page (`Ctrl + Shift + R`).

### Keyboard shortcuts don't work

1. Make sure the quiz is open
2. Click inside the quiz area to focus it
3. Check if another extension is using the same shortcuts
4. Try reloading the page

### Questions are in the wrong language

The quiz language matches the video transcript language. If the transcript is in a different language than expected, YouTube may have auto-generated it incorrectly.

### The quiz is stuck on "Generating..."

1. Wait up to 60 seconds (some videos take longer)
2. Check your internet connection
3. Try closing and reopening the quiz
4. Check browser console (F12) for errors

---

## Privacy & Security

### Where is my data stored?

All data is stored locally in your browser using Chrome's storage API. Nothing is sent to external servers (except to OpenAI/ChatGPT for quiz generation).

### Can others see my quiz history?

No, it's stored locally on your device only.

### What happens to my API key?

Your OpenAI API key is:
- Stored encrypted in Chrome's local storage
- Never sent to us (we don't have servers)
- Only sent directly to OpenAI's API
- Can be deleted anytime

### Is my YouTube activity tracked?

No! The extension only:
- Reads video transcripts when you create a quiz
- Does not track what videos you watch
- Does not collect browsing history

---

## Comparison with Other Tools

### How is this different from Ulearn?

- **Quiz for YouTube**: Free ChatGPT mode, full keyboard control, open source
- **Ulearn**: Spaced repetition system, gamification features

### How is this different from QuizFirst?

- **Quiz for YouTube**: Dual modes (API + ChatGPT), better keyboard navigation
- **QuizFirst**: Similar features, different UI

### Why choose Quiz for YouTube?

- ✅ Completely free option (ChatGPT mode)
- ✅ Full keyboard control
- ✅ Open source and transparent
- ✅ Privacy-first design
- ✅ Bilingual support
- ✅ Active development

---

## Future Features

### What features are planned?

- [ ] Export quizzes to PDF/CSV
- [ ] Spaced repetition system
- [ ] Custom quiz difficulty levels
- [ ] Flashcard mode
- [ ] Dark mode
- [ ] More language translations
- [ ] Quiz sharing
- [ ] Custom question count

See [CHANGELOG.md](CHANGELOG.md) for the full roadmap.

### Can I request a feature?

Yes! Open an issue on GitHub or contact us through the website.

### How can I contribute?

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## Support

### How do I report a bug?

1. Open an issue on GitHub
2. Include:
   - Chrome version
   - Extension version
   - Steps to reproduce
   - Screenshots if applicable
   - Console errors (F12)

### How do I get help?

- **Documentation**: Check README.md and other docs
- **GitHub Issues**: For bugs and feature requests
- **Website**: https://pablosan.netlify.app

### Is there a community?

We're building one! Join the discussion on GitHub.

---

## Miscellaneous

### Can I use this for commercial purposes?

Yes! The extension is MIT licensed. You can use it freely for personal or commercial purposes.

### Can I modify the extension?

Yes! It's open source. Fork it, modify it, and even publish your own version (with attribution).

### Does it work on mobile?

Not yet. Chrome extensions are not supported on mobile browsers. This may change in the future.

### Does it work on other browsers?

Currently Chrome only. Firefox and Edge support may come in future updates.

### Can teachers use this in classrooms?

Absolutely! It's perfect for:
- Creating quick assessments
- Testing student comprehension
- Flipped classroom activities
- Homework assignments

### Is there an API?

Not currently, but it's being considered for future releases.

---

## Still Have Questions?

- **Website**: https://pablosan.netlify.app
- **GitHub**: [Open an issue]
- **Email**: [Contact information]

We're here to help! 🚀
