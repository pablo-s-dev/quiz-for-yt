# Changelog

All notable changes to Quiz for YouTube will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-05-04

### Added
- **Settings button in quiz interface**
  - Quick access to extension settings from quiz popup
  - Opens extension popup.html directly
- **Enhanced JSON parsing and validation**
  - Strict validation for quiz structure
  - Validates question format, alternatives count, and answer format
  - Better error messages for invalid quiz data
- **Comprehensive debug logging**
  - Detailed logs for ChatGPT response capture
  - JSON parsing step-by-step logging
  - Response length and content preview logs
- **Dark mode scrollbars**
  - Styled scrollbars for quiz popup
  - Styled scrollbars for extension popup
  - Consistent dark theme throughout

### Changed
- **Quiz generation language enforcement**
  - Quiz now generates in user's selected language regardless of video transcript language
  - Updated prompts to explicitly specify target language
- **ChatGPT popup positioning**
  - Reduced size: 560x780px → 420x600px
  - Positioned on left side of screen (left: 0, top: 100)
  - No longer overlaps with quiz popup
- **Default generation mode**
  - Changed from OpenAI API to ChatGPT Popup as default
- **Improved ChatGPT automation speed**
  - 60-70% faster quiz generation
  - Reduced initial delay: 1-2s → 0.4-0.7s
  - Reduced extended mode check: 1.5s → 0.4s
  - Faster polling: 400ms → 300ms
  - Faster stability check: 2.2s → 1.8s
- **Unified JSON format**
  - Both OpenAI API and ChatGPT Popup now use array format `[...]`
  - Removed support for `{"questions": [...]}` format
  - Consistent parsing logic across all generation methods

### Fixed
- **JSON parsing for arrays**
  - Fixed parser to correctly extract array-based quiz JSON
  - Handles text before/after JSON properly
  - Better error recovery for malformed JSON
- **Language selector clarity**
  - Changed "System" to "Browser language" for better understanding
- **Icon display issues**
  - Fixed icon display property being overridden
  - Added inline styles to ensure proper rendering

### Security
- **Bot detection avoidance**
  - ChatGPT popup stays visible during generation
  - Natural interaction pattern to avoid anti-bot mechanisms
  - Only minimizes after quiz generation completes

## [1.3.0] - 2026-05-03

### Added
- **Complete documentation suite**
  - Comprehensive README with all features
  - Quick Start Guide (QUICKSTART.md)
  - Detailed Installation Guide (INSTALL.md)
  - FAQ with common questions and solutions
  - Contributing guidelines (CONTRIBUTING.md)
  - Privacy Policy (PRIVACY.md)
  - Deployment guide (DEPLOYMENT.md)
  - Chrome Web Store listing content
  - GitHub issue templates
- **Build system**
  - Automated build script (`npm run build`)
  - Cross-platform support (Windows/Mac/Linux)
  - Proper file exclusion for distribution
- **Branding updates**
  - Extension renamed to "Quiz for YouTube"
  - Updated all UI text and branding
  - Added creator credit in popup footer
  - Link to creator website (pablosan.netlify.app)
- **Performance improvements**
  - Reduced ChatGPT extended mode removal wait time (6s → 1.5s)
  - Faster quiz generation startup

### Changed
- Extension name from "Youtube ActiveStudy with AI" to "Quiz for YouTube"
- Improved extension description for better discoverability
- Updated all documentation to reflect new branding

### Fixed
- ChatGPT automation now waits less time for extended mode button
- Improved reliability of quiz generation

## [1.2.0] - 2026-04-XX

### Added
- Quiz history and statistics tracking
- Progress bar showing X/Y questions
- Question status indicators (correct/incorrect/unanswered)
- Navigation button states (disabled at boundaries)
- Full keyboard navigation support
- Bilingual support (English and Portuguese)

### Changed
- Improved quiz UI with better animations
- Enhanced error handling and user feedback

### Fixed
- Various bug fixes and stability improvements

## [1.1.0] - 2026-03-XX

### Added
- ChatGPT Popup (free alternative to OpenAI API)
- Dual generation modes (OpenAI API + ChatGPT)
- Quiz regeneration feature
- Settings persistence

### Changed
- Improved transcript extraction
- Better YouTube SPA navigation handling

### Fixed
- Extension context invalidation issues
- Button injection reliability

## [1.0.0] - 2026-02-XX

### Added
- Initial public release on Chrome Web Store
- AI-powered quiz generation from YouTube videos
- OpenAI API integration
- Interactive quiz interface
- Multiple-choice questions (4 alternatives)
- Instant feedback on answers
- Local quiz storage
- Extension popup with settings
- Keyboard shortcut (Ctrl + Shift + Q)

---

## Future Releases

### [Unreleased]

#### Planned Features
- [ ] Export quiz results to PDF/CSV
- [ ] Spaced repetition system
- [ ] Custom quiz difficulty levels
- [ ] Flashcard mode
- [ ] Study streaks and achievements
- [ ] Dark mode support
- [ ] More language translations (Spanish, French, German)
- [ ] Quiz sharing functionality
- [ ] Video timestamp links in questions
- [ ] Custom question count selection
- [ ] Quiz templates and categories
- [ ] Offline mode support

#### Under Consideration
- Integration with learning management systems (LMS)
- Mobile browser support
- Collaborative quiz creation
- AI-powered study recommendations
- Voice-based quiz mode
- Integration with note-taking apps (Notion, Obsidian)
- Browser sync across devices
- Quiz analytics dashboard
- Custom AI model selection
- Question difficulty rating

---

## Version History Summary

- **1.3.0** (2026-05-03) - Documentation, branding, build system
- **1.2.0** (2026-04-XX) - History, statistics, keyboard controls
- **1.1.0** (2026-03-XX) - ChatGPT Popup, dual generation
- **1.0.0** (2026-02-XX) - Initial public release

---

## How to Update

### For Users
Chrome will automatically update the extension within 24-48 hours of release.

**To force update:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Update" button at the top

### For Developers
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Reload extension
# Go to chrome://extensions/ and click reload icon
```

---

## Migration Guides

### From 1.2.0 to 1.3.0
- No breaking changes
- All quiz history preserved
- Settings maintained
- Extension name changed (automatic)

### From 1.1.0 to 1.2.0
- Quiz history format updated (automatic migration)
- New statistics fields added
- No action required from users

### From 1.0.0 to 1.1.0
- ChatGPT Popup added as new option
- Existing OpenAI API settings preserved
- No breaking changes

---

## Breaking Changes

None so far! We maintain backwards compatibility.

---

## Security Updates

### 1.3.0
- No security updates in this release

### 1.2.0
- Improved API key encryption
- Enhanced data validation

### 1.1.0
- Secure ChatGPT automation
- Better error handling for API failures

---

## Known Issues

### Current (1.3.0)
- None reported yet

### Previous Versions
- ~~ChatGPT extended mode removal was slow~~ (Fixed in 1.3.0)
- ~~Extension context invalidation on reload~~ (Improved in 1.1.0)

---

## Deprecation Notices

None currently.

---

## Contributors

- **PabloS** - Creator and maintainer
- Community contributors (see GitHub)

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) principles and [Semantic Versioning](https://semver.org/).

For detailed commit history, see the [GitHub repository](https://github.com/your-repo/quiz-for-youtube).

