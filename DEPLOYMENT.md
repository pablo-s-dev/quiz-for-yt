# Deployment Guide - Quiz for YouTube

Complete guide for building and deploying the extension to Chrome Web Store.

## 📦 Building for Production

### Prerequisites

1. **Node.js installed**
   ```bash
   node --version  # Should be v14+
   ```

2. **Dependencies installed**
   ```bash
   npm install
   ```

### Build Steps

1. **Clean previous builds**
   ```bash
   # Remove old zip if exists
   rm quiz-for-youtube.zip
   ```

2. **Run build script**
   ```bash
   npm run build
   ```

3. **Verify output**
   - Check that `quiz-for-youtube.zip` was created
   - Verify file size (should be < 5MB)
   - Check console output for any errors

### What Gets Included

The build script includes:
- `manifest.json`
- `*.js` files (content.js, background.js, etc.)
- `*.html` files (popup.html)
- `*.css` files (main.css)
- `*.png`, `*.svg` icon files
- `README.md`

### What Gets Excluded

The build script excludes:
- `node_modules/`
- `.git/`
- `.vscode/`
- `build.js`
- `package.json`
- `package-lock.json`
- `*.zip` files
- `Api/` folder
- `Imgs/` folder
- Development files

## 🚀 Chrome Web Store Submission

### First-Time Setup

1. **Create Developer Account**
   - Go to https://chrome.google.com/webstore/devconsole
   - Pay one-time $5 registration fee
   - Complete account setup

2. **Prepare Assets**

   **Required Images:**
   - Icon 128x128 (already have: `default_icon.png`)
   - Screenshot 1280x800 or 640x400 (at least 1, max 5)
   - Small tile 440x280 (optional)
   - Marquee tile 1400x560 (optional)

   **Screenshot Ideas:**
   - Quiz button on YouTube
   - Quiz interface with questions
   - Answer feedback (correct/incorrect)
   - Extension popup with settings
   - Quiz history and statistics
   - Keyboard controls demonstration

3. **Prepare Store Listing**
   - Use content from `STORE_LISTING.md`
   - Review and customize as needed
   - Prepare promotional text
   - Write version notes

### Submission Process

1. **Upload Package**
   - Go to Chrome Web Store Developer Dashboard
   - Click "New Item"
   - Upload `quiz-for-youtube.zip`
   - Wait for upload to complete

2. **Fill Store Listing**
   
   **Product Details:**
   - Name: `Quiz for YouTube`
   - Summary: (132 chars max - see STORE_LISTING.md)
   - Description: (see STORE_LISTING.md)
   - Category: `Productivity`
   - Language: `English`

   **Graphic Assets:**
   - Upload icon (128x128)
   - Upload screenshots (1-5 images)
   - Upload promotional tiles (optional)

   **Privacy:**
   - Privacy policy: Link to PRIVACY.md (hosted on GitHub)
   - Permissions justification: (see STORE_LISTING.md)
   - Data usage disclosure: Fill out form

   **Distribution:**
   - Visibility: `Public`
   - Regions: `All regions` or select specific
   - Pricing: `Free`

3. **Submit for Review**
   - Review all information
   - Click "Submit for review"
   - Wait for approval (typically 1-3 days)

### Review Process

**What Google Reviews:**
- Manifest compliance
- Permission usage
- Privacy policy
- Functionality
- Content policy compliance
- Security

**Common Rejection Reasons:**
- Missing privacy policy
- Excessive permissions
- Misleading description
- Broken functionality
- Policy violations

**If Rejected:**
1. Read rejection reason carefully
2. Fix the issues
3. Increment version number
4. Rebuild and resubmit

## 🔄 Updating the Extension

### Version Numbering

Follow Semantic Versioning (semver):
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backwards compatible
- **Patch** (0.0.1): Bug fixes

### Update Process

1. **Make Changes**
   - Implement features/fixes
   - Test thoroughly
   - Update documentation

2. **Update Version**
   ```json
   // manifest.json
   {
     "version": "0.2.0"  // Increment appropriately
   }
   ```

3. **Update Changelog**
   ```markdown
   // CHANGELOG.md
   ## [0.2.0] - 2026-05-10
   
   ### Added
   - New feature X
   
   ### Fixed
   - Bug Y
   ```

4. **Build New Package**
   ```bash
   npm run build
   ```

5. **Test Package**
   - Load unpacked in Chrome
   - Test all functionality
   - Verify no regressions

6. **Submit Update**
   - Go to Developer Dashboard
   - Select your extension
   - Click "Upload Updated Package"
   - Upload new zip
   - Update version notes
   - Submit for review

### Update Rollout

- **Automatic**: Chrome auto-updates extensions
- **Timeline**: Updates roll out over several hours/days
- **Force Update**: Users can manually update in `chrome://extensions/`

## 📊 Post-Launch

### Monitor Performance

**Chrome Web Store Dashboard:**
- Impressions and installs
- User ratings and reviews
- Crash reports
- Uninstall feedback

**User Feedback:**
- Monitor reviews on Chrome Web Store
- Check GitHub issues
- Respond to user questions

### Marketing

**Launch Announcement:**
- Post on social media (Twitter, LinkedIn)
- Share on Reddit (r/chrome, r/learnprogramming)
- Post on Product Hunt
- Share in relevant communities

**Ongoing Promotion:**
- Create tutorial videos
- Write blog posts
- Engage with users
- Collect testimonials

### Analytics (Optional)

Consider adding (with user consent):
- Usage statistics
- Error tracking
- Feature usage metrics

**Important**: Always respect privacy and get user consent!

## 🔐 Security

### Before Each Release

- [ ] Review all code changes
- [ ] Check for security vulnerabilities
- [ ] Verify permission usage
- [ ] Test with different accounts
- [ ] Check for data leaks
- [ ] Review third-party dependencies

### API Key Security

- [ ] Never commit API keys
- [ ] Use environment variables for testing
- [ ] Encrypt stored keys
- [ ] Validate key format
- [ ] Handle key errors gracefully

## 📝 Checklist for Release

### Pre-Release

- [ ] All features tested
- [ ] No console errors
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number incremented
- [ ] Screenshots updated (if UI changed)
- [ ] Privacy policy reviewed
- [ ] Build script runs successfully

### Release

- [ ] Package built (`npm run build`)
- [ ] Package tested locally
- [ ] Uploaded to Chrome Web Store
- [ ] Store listing reviewed
- [ ] Privacy disclosures completed
- [ ] Submitted for review

### Post-Release

- [ ] Monitor for approval
- [ ] Respond to review feedback (if any)
- [ ] Announce release
- [ ] Monitor user feedback
- [ ] Track installation metrics
- [ ] Plan next version

## 🆘 Troubleshooting

### Build Fails

**Error: `archiver` not found**
```bash
npm install
```

**Error: Permission denied**
```bash
# Windows
# Run as administrator

# macOS/Linux
chmod +x build.js
```

### Upload Fails

**Error: Package too large**
- Check file size (max 100MB, recommended < 5MB)
- Remove unnecessary files
- Optimize images

**Error: Invalid manifest**
- Validate manifest.json syntax
- Check all required fields
- Verify permission format

### Review Rejection

**Privacy Policy Issues**
- Host PRIVACY.md on GitHub Pages
- Link in manifest and store listing
- Ensure it's accessible

**Permission Issues**
- Justify each permission
- Remove unused permissions
- Provide clear explanations

## 📞 Support

**Chrome Web Store Help:**
- https://support.google.com/chrome_webstore/

**Developer Documentation:**
- https://developer.chrome.com/docs/webstore/

**Questions?**
- Open an issue on GitHub
- Contact: https://pablosan.netlify.app

---

**Good luck with your deployment! 🚀**
