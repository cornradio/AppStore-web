/**
 * Editor UI Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdownInput');
    const htmlOutput = document.getElementById('htmlOutput');
    const previewArea = document.getElementById('previewArea');
    const convertToHtmlBtn = document.getElementById('convertToHtml');
    const convertFromHtmlBtn = document.getElementById('convertFromHtml');
    const copyBtn = document.getElementById('copyBtn');

    // Load initial content from local storage if available
    const savedMd = localStorage.getItem('editor_md');
    if (savedMd) {
        markdownInput.value = savedMd;
        updatePreview();
    }

    /**
     * Update the preview and HTML output
     */
    function updatePreview() {
        const md = markdownInput.value;
        const html = Converter.mdToHtml(md);

        // Show in preview (rendered)
        previewArea.innerHTML = html;

        // Show in output (string for JSON)
        htmlOutput.value = html;

        // Save to local storage for persistence
        localStorage.setItem('editor_md', md);
    }

    // Auto-update as user types in markdown
    markdownInput.addEventListener('input', updatePreview);

    // Manual triggers
    convertToHtmlBtn.addEventListener('click', () => {
        updatePreview();
    });

    convertFromHtmlBtn.addEventListener('click', () => {
        const html = htmlOutput.value;
        const md = Converter.htmlToMd(html);
        markdownInput.value = md;
        updatePreview();
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        htmlOutput.select();
        document.execCommand('copy');

        const originalText = copyBtn.innerText;
        copyBtn.innerText = '已复制！';
        copyBtn.style.borderColor = '#4cd964';
        copyBtn.style.color = '#4cd964';

        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
        }, 2000);
    });

    // Handle dark mode tracking from main site
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);
});
