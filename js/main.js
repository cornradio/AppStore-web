// ═══════════════════════════════════════
// DOM Elements
// ═══════════════════════════════════════
const appsGrid = document.getElementById('appsGrid');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const jsonPathInput = document.getElementById('jsonPath');
const saveButton = settingsModal.querySelector('.save-button');
const cancelButton = settingsModal.querySelector('.cancel-button');
const mainEl = document.querySelector('main.container');

// Module-level app data store
let allApps = [];

// ═══════════════════════════════════════
// Data Loading
// ═══════════════════════════════════════
async function loadApps() {
    try {
        const jsonPath = localStorage.getItem('appsJsonPath') || 'data/apps.json';
        const response = await fetch(jsonPath);
        const data = await response.json();
        return data.apps;
    } catch (error) {
        console.error('加载应用数据失败:', error);
        return [];
    }
}

function setCustomJsonPath(path) {
    try {
        localStorage.setItem('appsJsonPath', path);
        window.location.reload();
    } catch (error) {
        console.error('设置 JSON 路径失败:', error);
    }
}

window.setCustomJsonPath = setCustomJsonPath;

// ═══════════════════════════════════════
// Platform Icons
// ═══════════════════════════════════════
const platformIcons = {
    windows: '<svg class="platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>',
    macos: '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.057 12.793c.03 2.642 2.353 3.543 2.384 3.556-.022.068-.373 1.277-1.242 2.545-.751 1.1-1.531 2.193-2.771 2.217-1.213.02-1.608-.718-2.997-.718-1.392 0-1.828.7-2.997.742-1.22.043-2.126-1.185-2.88-2.277-1.543-2.235-2.722-6.315-1.135-9.065.788-1.365 2.196-2.23 3.731-2.254 1.168-.02 2.27.788 2.984.788.711 0 2.023-.974 3.419-.833.585.024 2.23.235 3.284 1.777-.085.053-1.96 1.144-1.94 3.483zm-2.895-8.541c.624-.755 1.045-1.805.931-2.852-.902.036-1.993.6-2.64 1.353-.58.675-1.089 1.745-.949 2.766.99.077 2.035-.512 2.658-1.267z"/></svg>',
    linux: '<svg class="platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line><polyline points="7 20 12 17 17 20"></polyline></svg>',
    ios: '<svg class="platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg>',
    android: '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2c-0.29,0.18-0.39,0.57-0.22,0.86l1.84,3.18C3.1,12.01,0.8,15.68,0.33,20h23.33C23.2,15.68,20.9,12.01,17.6,9.48z M7,16c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S7.55,16,7,16z M17,16c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S17.55,16,17,16z"/></svg>',
    chrome: '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12"/></svg>'
};

function getPlatformIconsHTML(tags) {
    const matched = [];
    const lowerTags = tags.map(tag => tag.toLowerCase());

    if (lowerTags.includes('windows')) matched.push({ name: 'Windows', icon: platformIcons.windows });
    if (lowerTags.includes('macos')) matched.push({ name: 'macOS', icon: platformIcons.macos });
    if (lowerTags.includes('linux')) matched.push({ name: 'Linux', icon: platformIcons.linux });
    if (lowerTags.includes('ios')) matched.push({ name: 'iOS', icon: platformIcons.ios });
    if (lowerTags.includes('android')) matched.push({ name: 'Android', icon: platformIcons.android });
    if (lowerTags.includes('web') || lowerTags.includes('chrome')) matched.push({ name: 'Chrome', icon: platformIcons.chrome });

    if (matched.length === 0) return '';

    const iconsHTML = matched.map(m => m.icon).join('');
    const namesText = matched.map(m => m.name).join('/');

    return `
        <div class="platform-info">
            <span class="platform-text">for ${namesText}</span>
            <div class="platform-icons">${iconsHTML}</div>
        </div>
    `;
}

// ═══════════════════════════════════════
// Card Rendering
// ═══════════════════════════════════════
function renderAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.setAttribute('data-app-name', app.name);
    card.innerHTML = `
        <div class="app-card-main">
            <img src="${app.icon}" alt="${app.name}" class="app-icon">
            <div class="app-info">
                <h3 class="app-name">${app.name}</h3>
                <p class="app-description">${app.short_description}</p>
            </div>
            <div class="download-icon-wrapper">
                <svg class="download-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>
        <div class="tags">
            ${app.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        ${getPlatformIconsHTML(app.tags)}
    `;

    // Download icon click
    const downloadIcon = card.querySelector('.download-icon-wrapper');
    downloadIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(app.download_link, '_blank');
    });

    // Card click → open detail view
    card.addEventListener('click', (e) => {
        if (e.target.closest('.download-icon-wrapper')) return;
        openDetailView(app);
    });

    return card;
}

// ═══════════════════════════════════════
// Master-Detail View
// ═══════════════════════════════════════
function openDetailView(app) {
    mainEl.classList.add('detail-mode');

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('app', app.name);
    history.replaceState(null, '', url.toString());

    // Highlight active sidebar card
    document.querySelectorAll('.app-card.sidebar-active').forEach(c => c.classList.remove('sidebar-active'));
    const activeCard = appsGrid.querySelector(`.app-card[data-app-name="${CSS.escape(app.name)}"]`);
    if (activeCard) {
        activeCard.classList.add('sidebar-active');
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Render detail panel
    renderDetailPanel(app);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeDetailView() {
    mainEl.classList.remove('detail-mode');
    document.querySelectorAll('.app-card.sidebar-active').forEach(c => c.classList.remove('sidebar-active'));
    const panel = document.querySelector('.detail-panel');
    if (panel) panel.remove();
    // Clean up URL parameter
    const url = new URL(window.location.href);
    if (url.searchParams.has('app')) {
        url.searchParams.delete('app');
        history.replaceState(null, '', url.toString());
    }
}

function renderDetailPanel(app) {
    let panel = document.querySelector('.detail-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.className = 'detail-panel';
        mainEl.appendChild(panel);
    }

    // Platform info
    const platformKeywords = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'web', 'chrome'];
    const platformNames = { windows: 'Windows', macos: 'macOS', linux: 'Linux', ios: 'iOS', android: 'Android', web: 'Web', chrome: 'Chrome' };
    const platforms = app.tags.filter(t => platformKeywords.some(k => k.toLowerCase() === t.toLowerCase()));
    const platformsHTML = platforms.length > 0
        ? `<div class="detail-platforms">
               <span>for ${platforms.map(p => platformNames[p.toLowerCase()] || p).join(' / ')}</span>
               ${platforms.map(p => platformIcons[p.toLowerCase()] || '').join('')}
           </div>`
        : '';

    panel.innerHTML = `
        <button class="detail-back" id="detailBackBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
            返回列表
        </button>
        <div class="detail-header">
            <div class="detail-header-left">
                <img src="${app.icon}" alt="${app.name}" class="app-icon">
                <div>
                    <div class="detail-name-row">
                        <h2 class="app-name">${app.name}</h2>
                        <button class="share-btn" title="复制分享链接" data-app-name="${app.name}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                        </button>
                    </div>
                    <p class="app-description">${app.short_description}</p>
                    ${platformsHTML}
                </div>
            </div>
            <a href="${app.download_link}" target="_blank" class="detail-download">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V3M12 15L8 11M12 15L16 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L2.621 19.485C2.72915 19.9177 2.97882 20.3018 3.33033 20.5763C3.68184 20.8508 4.11501 20.9999 4.561 21H19.439C19.885 20.9999 20.3182 20.8508 20.6697 20.5763C21.0212 20.3018 21.2708 19.9177 21.379 19.485L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${app.download_label || '下载'}
            </a>
        </div>
        <div class="detail-tags">
            ${app.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('')}
        </div>
        <div class="detail-content">${app.long_description}</div>
    `;

    // Back button
    panel.querySelector('#detailBackBtn').addEventListener('click', closeDetailView);

    // Share button
    const shareBtn = panel.querySelector('.share-btn');
    shareBtn.addEventListener('click', async () => {
        const appName = shareBtn.getAttribute('data-app-name');
        const url = new URL(window.location.href);
        url.searchParams.set('app', appName);
        url.hash = '';
        try {
            await navigator.clipboard.writeText(url.toString());
            shareBtn.classList.add('copied');
            shareBtn.setAttribute('title', '已复制!');
            setTimeout(() => {
                shareBtn.classList.remove('copied');
                shareBtn.setAttribute('title', '复制分享链接');
            }, 1500);
        } catch (e) {
            // fallback
            prompt('复制此链接:', url.toString());
        }
    });

    // Image load handling
    panel.querySelectorAll('img').forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => img.classList.add('loaded'));
        }
    });
}

// ═══════════════════════════════════════
// Theme
// ═══════════════════════════════════════
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    sunIcon.style.display = newTheme === 'dark' ? 'none' : 'block';
    moonIcon.style.display = newTheme === 'dark' ? 'block' : 'none';
}

function initializeTheme() {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);

    sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
    moonIcon.style.display = theme === 'dark' ? 'block' : 'none';

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

themeToggle.addEventListener('click', toggleTheme);

// ═══════════════════════════════════════
// Smart Header
// ═══════════════════════════════════════
function initSmartHeader() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    const scrollThreshold = 10;

    window.addEventListener('scroll', () => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScrollTop < 0) return;

        if (Math.abs(currentScrollTop - lastScrollTop) > scrollThreshold) {
            if (currentScrollTop > lastScrollTop && currentScrollTop > header.offsetHeight) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
            lastScrollTop = currentScrollTop;
        }
    }, { passive: true });
}

// ═══════════════════════════════════════
// Contact Dropdown
// ═══════════════════════════════════════
function initContactDropdown() {
    const dropdown = document.getElementById('contactDropdown');
    const btn = document.getElementById('contactBtn');
    if (!dropdown || !btn) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

// ═══════════════════════════════════════
// Stats (subtle app count only)
// ═══════════════════════════════════════
function updateAppCount(apps) {
    const el = document.getElementById('heroAppCount');
    if (!el) return;
    el.textContent = `${apps.length} apps`;
}

// ═══════════════════════════════════════
// Initialize
// ═══════════════════════════════════════
async function initializeApp() {
    initializeTheme();
    initSmartHeader();
    initContactDropdown();

    allApps = await loadApps();

    // Initialize search
    initializeSearch(allApps);

    // Collect unique tags with counts
    const tagCounts = {};
    allApps.forEach(app => {
        app.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    const allTags = Object.keys(tagCounts).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // Update sidebar title with total count
    const sidebarTitle = document.getElementById('sidebarTitle');
    sidebarTitle.innerHTML = `筛选<span class="title-count">${allApps.length}</span>`;

    // Initialize tag filter dropdown
    const tagFilterMenu = document.getElementById('tagFilterMenu');
    const tagFilterLabel = document.getElementById('tagFilterLabel');
    allTags.forEach(tag => {
        const label = document.createElement('label');
        label.className = 'tag-option';
        label.innerHTML = `<input type="checkbox" value="${tag}"><span class="tag-option-label">${tag}</span><span class="tag-count">${tagCounts[tag]}</span>`;
        label.querySelector('input').addEventListener('change', () => {
            filterApps();
            updateTagLabel();
        });
        tagFilterMenu.appendChild(label);
    });

    // Tag filter dropdown open/close
    const tagFilterDropdown = document.getElementById('tagFilterDropdown');
    const tagFilterBtn = document.getElementById('tagFilterBtn');
    tagFilterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tagFilterDropdown.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!tagFilterDropdown.contains(e.target)) {
            tagFilterDropdown.classList.remove('open');
        }
    });

    // Sidebar toggle (wide screen collapse)
    const sidebarToggle = document.getElementById('sidebarToggle');
    sidebarToggle.addEventListener('click', () => {
        tagFilterDropdown.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');
        const isCollapsed = tagFilterDropdown.classList.contains('collapsed');
        sidebarToggle.textContent = isCollapsed ? '›' : '‹';
    });

    // Clear all filters
    const sidebarClear = document.getElementById('sidebarClear');
    sidebarClear.addEventListener('click', () => {
        tagFilterMenu.querySelectorAll('input:checked').forEach(cb => { cb.checked = false; });
        filterApps();
        updateTagLabel();
    });

    function updateTagLabel() {
        const count = tagFilterMenu.querySelectorAll('input:checked').length;
        tagFilterLabel.textContent = count > 0 ? `筛选 (${count})` : '筛选';
    }

    // Render cards
    allApps.forEach(app => {
        appsGrid.appendChild(renderAppCard(app));
    });

    // Stats
    updateAppCount(allApps);

    // Tag filter function
    function filterApps() {
        const selectedTags = Array.from(tagFilterMenu.querySelectorAll('input:checked'))
            .map(cb => cb.value);

        const cards = document.querySelectorAll('.app-card');
        cards.forEach(card => {
            const cardTags = Array.from(card.querySelectorAll('.tag'))
                .map(tag => tag.textContent);

            if (selectedTags.length === 0 || selectedTags.some(tag => cardTags.includes(tag))) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });

        // If in detail mode, also close it
        if (mainEl.classList.contains('detail-mode')) {
            closeDetailView();
        }
    }

    // Keyboard: ESC to close detail view
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainEl.classList.contains('detail-mode')) {
            closeDetailView();
        }
    });

    // URL parameter: auto-open app detail
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    if (appParam) {
        const targetApp = allApps.find(a => a.name === appParam);
        if (targetApp) {
            openDetailView(targetApp);
        }
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

// Settings
jsonPathInput.value = localStorage.getItem('appsJsonPath') || 'data/apps.json';

settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

saveButton.addEventListener('click', () => {
    const newPath = jsonPathInput.value.trim();
    if (newPath) setCustomJsonPath(newPath);
    settingsModal.style.display = 'none';
});

cancelButton.addEventListener('click', () => {
    jsonPathInput.value = localStorage.getItem('appsJsonPath') || 'data/apps.json';
    settingsModal.style.display = 'none';
});

settingsModal.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});
