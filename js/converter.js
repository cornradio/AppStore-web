/**
 * Simple Markdown to HTML and HTML to Markdown converter
 * for App Store descriptions.
 */
const Converter = {
    /**
     * Convert MD to HTML wrapped in the app container
     */
    mdToHtml(md) {
        if (!md) return '';

        let html = md;

        // 0. Images ![alt](src =width) -> <img>
        //    Supports: ![alt](src) or ![alt](src =300) or ![alt](src =50%)
        html = html.replace(/!\[(.*?)\]\((.*?)(?:\s+=(\d+%?))?\)/g, (match, alt, src, width) => {
            const widthAttr = width
                ? (width.includes('%') ? ` style="width:${width}"` : ` style="width:${width}px"`)
                : '';
            return `<img class="desc-img" src="${src.trim()}" alt="${alt}"${widthAttr}>`;
        });

        // 1. Headers ### Title -> <h3>Title</h3>
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

        // 1.5. Headers ## Title -> <h2>Title</h2>
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');

        // 2. Bold **text** -> <strong>text</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 2.5. Italic *text* -> <em>text</em>
        html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

        // 2.6 Code blocks ``` -> <pre><code>  (MUST run before inline code)
        html = html.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (match, lang, code) => {
            const escaped = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .trimEnd();
            return `<pre><code class="lang-${lang || 'text'}">${escaped}</code></pre>`;
        });

        // 2.7. Inline code `text` -> <code>text</code>
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // 3. Links [text](url) -> <a href='url' target='_blank'>text</a>
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>");

        // 4. Lists & Paragraphs
        let lines = html.split('\n');
        let processedLines = [];
        let listStack = []; // stack of indent levels for nested lists

        function closeListsTo(level) {
            while (listStack.length > 0 && listStack[listStack.length - 1] >= level) {
                processedLines.push('</ul>');
                listStack.pop();
            }
        }

        function closeAllLists() {
            while (listStack.length > 0) {
                processedLines.push('</ul>');
                listStack.pop();
            }
        }

        let inCodeBlock = false;

        for (let i = 0; i < lines.length; i++) {
            let rawLine = lines[i];
            let line = rawLine.trim();

            // Track code block state
            if (line.includes('<pre>')) inCodeBlock = true;
            if (line.includes('</pre>')) {
                inCodeBlock = false;
                processedLines.push(rawLine);
                continue;
            }
            if (inCodeBlock) {
                processedLines.push(rawLine);
                continue;
            }

            // Empty line
            if (!line) {
                closeAllLists();
                continue;
            }

            // List item: detect indent level
            let indentMatch = rawLine.match(/^(\s*)[-*]\s+(.+)/);
            if (indentMatch) {
                let indent = indentMatch[1].length;
                let content = indentMatch[2];

                if (listStack.length === 0) {
                    // Start new list
                    processedLines.push('<ul>');
                    listStack.push(indent);
                } else if (indent > listStack[listStack.length - 1]) {
                    // Deeper nesting: open new sub-list
                    processedLines.push('<ul>');
                    listStack.push(indent);
                } else {
                    // Same or shallower: close deeper levels
                    closeListsTo(indent);
                    if (listStack.length === 0 || listStack[listStack.length - 1] !== indent) {
                        processedLines.push('<ul>');
                        listStack.push(indent);
                    }
                }

                processedLines.push(`<li>${content}</li>`);
            } else {
                // Not a list item
                closeAllLists();

                // If it's already an HTML tag, skip p-wrapping
                if (line.startsWith('<') && (line.endsWith('>') || line.includes('>'))) {
                    processedLines.push(line);
                } else {
                    processedLines.push(`<p>${line}</p>`);
                }
            }
        }
        closeAllLists();

        html = processedLines.join('');

        // Post-process: extract <img> from inside <p> so images are block-level
        html = html.replace(/<p>(.*?)<\/p>/gs, (match, content) => {
            // If paragraph contains only an image (possibly with whitespace)
            if (/^\s*<img[^>]+>\s*$/.test(content)) {
                return content.trim();
            }
            // If paragraph contains text + image, split them
            if (content.includes('<img')) {
                return content.replace(/(<img[^>]+>)/g, '</p>$1<p>').replace(/<p><\/p>/g, '');
            }
            return match;
        });

        // Wrap in container
        return `<div class='app-desc-content'>${html}</div>`;
    },

    /**
     * Convert the HTML back to simple Markdown
     */
    htmlToMd(html) {
        if (!html) return '';

        let md = html.trim();

        // 0. Clean JSON garbage (if user pasted "key": "value")
        if (md.includes('": "')) {
            const match = md.match(/"long_description":\s*"(.*)"/);
            if (match) md = match[1];
        }

        // Unescape common JSON escaped characters
        md = md.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

        // 1. Remove the container tag cleanly
        md = md.replace(/<div[^>]*class=['"]app-desc-content['"][^>]*>([\s\S]*)<\/div>/gi, '$1');

        // 2. Headers <h3> -> ###
        md = md.replace(/<h[1-6][^>]*?>(.*?)<\/h[1-6]>/gi, '### $1\n');

        // 3. Lists <li> -> - 
        // We handle <ul> just by removing them
        md = md.replace(/<ul[^>]*?>/gi, '');
        md = md.replace(/<\/ul>/gi, '\n');
        md = md.replace(/<li[^>]*?>(.*?)<\/li>/gi, '- $1\n');

        // 4. Bold <strong> or <b> -> **
        md = md.replace(/<(?:strong|b)[^>]*?>(.*?)<\/(?:strong|b)>/gi, '**$1**');

        // 5. Links <a href="...">text</a> -> [text](url)
        // Be careful with multiple attributes
        md = md.replace(/<a\s+[^>]*?href=['"](.*?)['"][^>]*?>(.*?)<\/a>/gi, '[$2]($1)');

        // 6. Paragraphs <p> -> (just newlines)
        md = md.replace(/<p[^>]*?>(.*?)<\/p>/gi, '$1\n\n');

        // 7. Line breaks <br> -> \n
        md = md.replace(/<br\s*\/?>/gi, '\n');

        // 8. Final clean up: Remove remaining HTML tags
        md = md.replace(/<[^>]+>/g, '');

        // 9. Fix spacing
        md = md.replace(/\n\s+\n/g, '\n\n');
        md = md.replace(/\n{3,}/g, '\n\n');

        return md.trim();
    }
};
