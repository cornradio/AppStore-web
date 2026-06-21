/**
 * 迁移脚本：把 apps.json 里的 long_description HTML 转成独立 .md 文件
 * 运行：node scripts/migrate-descriptions.js
 */
const fs = require('fs');
const path = require('path');

const APPS_JSON = path.join(__dirname, '..', 'data', 'apps.json');
const DESC_DIR = path.join(__dirname, '..', 'data', 'descriptions');

// Simple HTML to Markdown converter (matches converter.js logic)
function htmlToMd(html) {
    if (!html) return '';
    let md = html.trim();

    // Remove app-desc-content wrapper
    md = md.replace(/<div[^>]*class=['"]app-desc-content['"][^>]*>([\s\S]*)<\/div>/gi, '$1');

    // Headers
    md = md.replace(/<h[1-6][^>]*?>(.*?)<\/h[1-6]>/gi, '### $1\n');

    // Images with desc-img class or any img
    md = md.replace(/<img[^>]*?src=['"](.*?)['"][^>]*?alt=['"](.*?)['"][^>]*?\/?>/gi, '![$2]($1)\n');
    md = md.replace(/<img[^>]*?alt=['"](.*?)['"][^>]*?src=['"](.*?)['"][^>]*?\/?>/gi, '![$1]($2)\n');
    md = md.replace(/<img[^>]*?src=['"](.*?)['"][^>]*?\/?>/gi, '![]($1)\n');

    // Lists
    md = md.replace(/<ul[^>]*?>/gi, '');
    md = md.replace(/<\/ul>/gi, '\n');
    md = md.replace(/<li[^>]*?>(.*?)<\/li>/gi, '- $1\n');

    // Bold
    md = md.replace(/<(?:strong|b)[^>]*?>(.*?)<\/(?:strong|b)>/gi, '**$1**');

    // Links
    md = md.replace(/<a\s+[^>]*?href=['"](.*?)['"][^>]*?>(.*?)<\/a>/gi, '[$2]($1)');

    // Paragraphs
    md = md.replace(/<p[^>]*?>(.*?)<\/p>/gi, '$1\n\n');

    // Line breaks
    md = md.replace(/<br\s*\/?>/gi, '\n');

    // Remove remaining HTML tags
    md = md.replace(/<[^>]+>/g, '');

    // Fix spacing
    md = md.replace(/\n\s+\n/g, '\n\n');
    md = md.replace(/\n{3,}/g, '\n\n');

    return md.trim();
}

// Generate a safe filename from app name
function safeFilename(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-|-$/g, '')
        || 'untitled';
}

// Main
const data = JSON.parse(fs.readFileSync(APPS_JSON, 'utf-8'));
const apps = data.apps;
let migrated = 0;
let skipped = 0;

// Ensure descriptions dir exists
if (!fs.existsSync(DESC_DIR)) fs.mkdirSync(DESC_DIR, { recursive: true });

apps.forEach((app) => {
    // Skip if already has description_file
    if (app.description_file) {
        skipped++;
        return;
    }
    // Skip if no long_description
    if (!app.long_description || !app.long_description.trim()) {
        skipped++;
        return;
    }

    const filename = safeFilename(app.name) + '.md';
    const filepath = path.join(DESC_DIR, filename);

    // If file already exists, add a number suffix
    let finalFilename = filename;
    let counter = 1;
    while (fs.existsSync(path.join(DESC_DIR, finalFilename))) {
        finalFilename = safeFilename(app.name) + '-' + counter + '.md';
        counter++;
    }

    const md = htmlToMd(app.long_description);
    fs.writeFileSync(path.join(DESC_DIR, finalFilename), md, 'utf-8');

    // Update app entry
    app.description_file = 'data/descriptions/' + finalFilename;
    delete app.long_description;

    migrated++;
    console.log(`  ${app.name} -> ${finalFilename}`);
});

// Save updated JSON
fs.writeFileSync(APPS_JSON, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log(`\nDone: ${migrated} migrated, ${skipped} skipped.`);
