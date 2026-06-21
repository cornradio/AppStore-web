/**
 * Editor UI Logic — Markdown → .md file workflow
 */
document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdownInput');
    const previewArea = document.getElementById('previewArea');
    const saveMdBtn = document.getElementById('saveMdBtn');
    const fileNameInput = document.getElementById('fileNameInput');
    const snippetFilename = document.getElementById('snippetFilename');

    // Load saved content
    const savedMd = localStorage.getItem('editor_md');
    const savedName = localStorage.getItem('editor_filename');
    if (savedMd) markdownInput.value = savedMd;
    if (savedName) fileNameInput.value = savedName;
    updatePreview();
    updateSnippet();

    // Live preview on input
    markdownInput.addEventListener('input', () => {
        updatePreview();
        localStorage.setItem('editor_md', markdownInput.value);
    });

    // Update JSON snippet when filename changes
    fileNameInput.addEventListener('input', () => {
        updateSnippet();
        localStorage.setItem('editor_filename', fileNameInput.value);
    });

    function updatePreview() {
        const md = markdownInput.value;
        if (!md.trim()) {
            previewArea.innerHTML = '<p style="color: #888; text-align: center; margin-top: 50px;">在左侧输入 Markdown，这里实时预览</p>';
            return;
        }
        previewArea.innerHTML = Converter.mdToHtml(md);

        // Handle image loading in preview
        previewArea.querySelectorAll('.desc-img').forEach(img => {
            if (!img.complete) {
                img.addEventListener('load', () => img.classList.add('loaded'));
            } else {
                img.classList.add('loaded');
            }
        });
    }

    function updateSnippet() {
        const name = fileNameInput.value.trim() || '文件名';
        snippetFilename.textContent = name + '.md';
    }

    // Save as .md file (download)
    saveMdBtn.addEventListener('click', () => {
        const md = markdownInput.value;
        if (!md.trim()) return;

        const filename = (fileNameInput.value.trim() || 'description') + '.md';
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        // Visual feedback
        const original = saveMdBtn.textContent;
        saveMdBtn.textContent = '已保存!';
        saveMdBtn.style.borderColor = '#4cd964';
        saveMdBtn.style.color = '#4cd964';
        setTimeout(() => {
            saveMdBtn.textContent = original;
            saveMdBtn.style.borderColor = '';
            saveMdBtn.style.color = '';
        }, 2000);
    });

    // Tab key support in textarea (insert spaces instead of changing focus)
    markdownInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = markdownInput.selectionStart;
            const end = markdownInput.selectionEnd;
            markdownInput.value = markdownInput.value.substring(0, start) + '  ' + markdownInput.value.substring(end);
            markdownInput.selectionStart = markdownInput.selectionEnd = start + 2;
        }
    });

    // Dark mode
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);
});
