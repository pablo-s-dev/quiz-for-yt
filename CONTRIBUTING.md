# Contributing to Quiz for YouTube

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Chrome browser
- Git

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-for-youtube
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Load extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the project folder

4. **Enable debug mode**
   - Open any YouTube video
   - Open DevTools Console (F12)
   - Run: `localStorage.setItem("AS_DEBUG", "1")`
   - Refresh the page

## 📝 Code Style

### JavaScript
- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Add comments for complex logic
- Keep functions small and focused

### CSS
- Use CSS custom properties (variables)
- Follow BEM naming convention where applicable
- Keep selectors specific but not overly nested
- Add comments for complex layouts

### HTML
- Use semantic HTML5 elements
- Keep markup clean and readable
- Use data attributes for JavaScript hooks

## 🏗️ Project Structure

```
quiz-for-youtube/
├── manifest.json          # Extension manifest (Chrome API config)
├── content.js            # Main quiz logic (runs on YouTube)
├── background.js         # Background service worker
├── chatgpt_content.js    # ChatGPT automation script
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and settings
├── ui-kit.js             # Icon system and UI components
├── main.css              # Quiz overlay styles
├── build.js              # Build script for distribution
└── README.md             # Main documentation
```

## 🔧 Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Test thoroughly in Chrome
   - Check console for errors

3. **Test the extension**
   - Reload extension in `chrome://extensions/`
   - Hard refresh YouTube pages (Ctrl + Shift + R)
   - Test with different videos
   - Test both OpenAI and ChatGPT modes

4. **Build for production**
   ```bash
   npm run build
   ```

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Quiz button appears on YouTube videos
- [ ] Quiz generation works (OpenAI mode)
- [ ] Quiz generation works (ChatGPT mode)
- [ ] Keyboard controls work correctly
- [ ] Quiz history saves properly
- [ ] Language switching works
- [ ] No console errors
- [ ] Responsive design works

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps to reproduce the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**:
   - Chrome version
   - Extension version
   - Operating system
6. **Screenshots**: If applicable
7. **Console logs**: Any error messages from DevTools

## 💡 Feature Requests

When suggesting features:

1. **Use case**: Explain why this feature is needed
2. **Description**: Detailed description of the feature
3. **Mockups**: Visual mockups if applicable
4. **Alternatives**: Any alternative solutions considered

## 🔍 Code Review Process

All contributions go through code review:

1. **Submit a Pull Request**
   - Clear title and description
   - Reference any related issues
   - Include screenshots/videos if UI changes

2. **Review criteria**
   - Code quality and style
   - Functionality and testing
   - Documentation updates
   - No breaking changes

3. **Approval and merge**
   - At least one approval required
   - All tests must pass
   - No merge conflicts

## 📚 Documentation

When adding features:

- Update README.md if needed
- Add inline code comments
- Update CHANGELOG.md
- Document new keyboard shortcuts
- Update translations if adding UI text

## 🌐 Internationalization (i18n)

When adding new UI text:

1. **Add to both languages** in the appropriate file:
   - `content.js`: `textContent` object
   - `popup.js`: `I18N` object

2. **Use translation function**:
   ```javascript
   t("translation_key")
   ```

3. **Keep keys descriptive**:
   ```javascript
   // Good
   "create_quiz": "Create Quiz"
   
   // Bad
   "btn1": "Create Quiz"
   ```

## 🎨 UI/UX Guidelines

- **Consistency**: Follow existing design patterns
- **Accessibility**: Ensure keyboard navigation works
- **Responsiveness**: Test different screen sizes
- **Performance**: Avoid blocking operations
- **Feedback**: Provide visual feedback for actions

## 🔐 Security

- Never commit API keys or secrets
- Validate all user inputs
- Use secure communication (HTTPS)
- Follow Chrome extension security best practices
- Sanitize data from external sources

## 📦 Release Process

1. Update version in `manifest.json`
2. Update CHANGELOG.md
3. Run `npm run build`
4. Test the built zip file
5. Create a git tag
6. Submit to Chrome Web Store

## 🤝 Community

- Be respectful and constructive
- Help others when possible
- Share knowledge and best practices
- Follow the code of conduct

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!

---

**Questions?** Feel free to open an issue for discussion.
