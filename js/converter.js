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

        // 1. Headers ### Title -> <h3>Title</h3>
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

        // 2. Bold **text** -> <strong>text</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 3. Links [text](url) -> <a href='url' target='_blank'>text</a>
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank'>$1</a>");

        // 4. Lists & Paragraphs
        let lines = html.split('\n');
        let inList = false;
        let processedLines = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) {
                if (inList) {
                    processedLines.push('</ul>');
                    inList = false;
                }
                continue;
            }

            if (line.startsWith('- ') || line.startsWith('* ')) {
                if (!inList) {
                    processedLines.push('<ul>');
                    inList = true;
                }
                processedLines.push(`<li>${line.substring(2)}</li>`);
            } else {
                if (inList) {
                    processedLines.push('</ul>');
                    inList = false;
                }

                // If it's already an HTML tag we ignore p-wrapping to avoid nesting issues
                if (line.startsWith('<') && (line.endsWith('>') || line.includes('>'))) {
                    processedLines.push(line);
                } else {
                    processedLines.push(`<p>${line}</p>`);
                }
            }
        }
        if (inList) processedLines.push('</ul>');

        html = processedLines.join('');

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
