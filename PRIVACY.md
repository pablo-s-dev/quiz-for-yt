# Privacy Policy for Quiz for YouTube

**Last Updated**: May 3, 2026

## Overview

Quiz for YouTube ("the Extension") is committed to protecting your privacy. This privacy policy explains how we handle your data.

## Data Collection

### What We Collect

The Extension collects and stores the following data **locally on your device only**:

1. **Quiz History**
   - Video IDs of quizzes you've created
   - Video titles
   - Generated questions and answers
   - Your answers and quiz statistics
   - Timestamps of quiz creation and completion

2. **Settings**
   - Your language preference
   - Generation mode preference (OpenAI API or ChatGPT)
   - OpenAI API key (if provided)
   - Selected AI model

3. **YouTube Video Data**
   - Video transcripts (temporarily, only during quiz generation)
   - Video titles
   - Video IDs

### What We DON'T Collect

- Personal identification information
- Browsing history
- Video watch history
- Any data outside of quiz-related activities
- Analytics or tracking data
- Cookies or similar tracking technologies

## Data Storage

### Local Storage Only

All data is stored **locally** in your browser using:
- Chrome's `chrome.storage.local` API
- Browser's `localStorage` API

**Your data never leaves your device** except when:
1. You use OpenAI API mode (data sent directly to OpenAI)
2. You use ChatGPT mode (data sent directly to ChatGPT)

### No Remote Servers

The Extension does **not**:
- Upload your data to our servers (we don't have any)
- Send analytics to third parties
- Track your usage
- Share your data with anyone

## Third-Party Services

### OpenAI API (Optional)

If you choose to use OpenAI API mode:
- Your API key is stored locally in your browser
- Video transcripts are sent directly to OpenAI's API
- OpenAI's privacy policy applies: https://openai.com/privacy
- We do not have access to your API key or requests

### ChatGPT (Optional)

If you choose to use ChatGPT mode:
- The Extension automates your ChatGPT browser session
- Video transcripts are sent directly to ChatGPT
- OpenAI's privacy policy applies: https://openai.com/privacy
- We do not intercept or store your ChatGPT conversations

### YouTube

The Extension:
- Reads video transcripts from YouTube
- Does not modify YouTube's functionality
- Does not track your YouTube activity
- Google's privacy policy applies: https://policies.google.com/privacy

## Data Security

### Your API Keys

If you provide an OpenAI API key:
- It is stored encrypted in Chrome's local storage
- It is never transmitted to us
- It is only sent directly to OpenAI's API
- You can delete it anytime from the Extension settings

### Quiz Data

Your quiz history:
- Is stored locally in your browser
- Is not backed up to any cloud service
- Can be cleared by clearing browser data
- Is not accessible to other websites or extensions

## Your Rights

You have the right to:

1. **Access Your Data**
   - View all stored quizzes in the Extension popup
   - Export your data (manually via browser DevTools)

2. **Delete Your Data**
   - Clear individual quizzes
   - Clear all quiz history
   - Remove your API key
   - Uninstall the Extension (removes all data)

3. **Control Data Collection**
   - Choose which generation mode to use
   - Decide whether to save quiz history
   - Control what data is sent to third parties

## Data Deletion

### How to Delete Your Data

1. **Delete API Key**
   - Open Extension popup
   - Click "Remove token"

2. **Clear Quiz History**
   - Open Chrome DevTools (F12)
   - Go to Application > Storage > Local Storage
   - Delete entries for the Extension

3. **Complete Removal**
   - Uninstall the Extension from `chrome://extensions/`
   - All local data is automatically deleted

## Children's Privacy

The Extension does not knowingly collect data from children under 13. If you are a parent or guardian and believe your child has used the Extension, please contact us.

## Changes to Privacy Policy

We may update this privacy policy. Changes will be posted with a new "Last Updated" date. Continued use of the Extension after changes constitutes acceptance.

## Compliance

This Extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Children's Online Privacy Protection Act (COPPA)

## Contact

For privacy concerns or questions:
- Website: https://pablosan.netlify.app
- GitHub: [Create an issue in the repository]

## Transparency

This Extension is open source. You can:
- Review all code
- Verify data handling practices
- Audit security measures
- Contribute improvements

## Summary

**In Plain English:**
- We don't collect your personal data
- Everything stays on your device
- We don't have servers or databases
- Your API keys are stored locally and encrypted
- You control all your data
- You can delete everything anytime

---

**Your privacy matters to us. If you have any questions, please reach out.**
