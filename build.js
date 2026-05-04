#!/usr/bin/env node

/**
 * Build script for Quiz for YouTube extension
 * Creates a production-ready zip file for Chrome Web Store submission
 * Works on Windows, macOS, and Linux
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const OUTPUT_NAME = 'quiz-for-youtube.zip';
const EXCLUDE_PATTERNS = [
    'node_modules',
    '.git',
    '.gitignore',
    '.vscode',
    'build.js',
    'package.json',
    'package-lock.json',
    OUTPUT_NAME,
    'ActiveStudy.AI.zip',
    'Api',
    'AGENTS.md',
    'Imgs',
    'keybinding_choice.html',
    'review.html',
    '.github'
];

console.log('🚀 Building Quiz for YouTube extension...\n');

// Remove old zip if exists
if (fs.existsSync(OUTPUT_NAME)) {
    console.log(`🗑️  Removing old ${OUTPUT_NAME}...`);
    fs.unlinkSync(OUTPUT_NAME);
}

// Create zip file
console.log('📦 Creating zip file...');

const output = fs.createWriteStream(OUTPUT_NAME);
const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
    const fileSizeInKB = (archive.pointer() / 1024).toFixed(2);
    console.log('\n✅ Build successful!');
    console.log(`📦 Output: ${OUTPUT_NAME}`);
    console.log(`📊 Size: ${fileSizeInKB} KB`);
    console.log(`📄 Total bytes: ${archive.pointer()}`);
    console.log('\n🎉 Ready for Chrome Web Store submission!');
});

archive.on('error', (err) => {
    console.error('\n❌ Build failed:', err.message);
    process.exit(1);
});

archive.pipe(output);

// Add files to archive
const files = fs.readdirSync('.');

files.forEach(file => {
    // Skip excluded patterns
    if (EXCLUDE_PATTERNS.includes(file)) {
        console.log(`⏭️  Skipping: ${file}`);
        return;
    }

    // Skip hidden files
    if (file.startsWith('.')) {
        console.log(`⏭️  Skipping: ${file}`);
        return;
    }

    const filePath = path.join('.', file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
        console.log(`📁 Adding directory: ${file}/`);
        archive.directory(filePath, file);
    } else {
        console.log(`📄 Adding file: ${file}`);
        archive.file(filePath, { name: file });
    }
});

archive.finalize();
