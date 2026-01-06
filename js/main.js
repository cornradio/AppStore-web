// 获取 DOM 元素
const appsGrid = document.getElementById('appsGrid');
const appModal = document.getElementById('appModal');
const searchInput = document.getElementById('searchInput');
const tagsFilter = document.getElementById('tagsFilter');
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

// 添加设置相关的 DOM 元素
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const jsonPathInput = document.getElementById('jsonPath');
const saveButton = settingsModal.querySelector('.save-button');
const cancelButton = settingsModal.querySelector('.cancel-button');

// 加载应用数据
async function loadApps() {
    try {
        // 从本地存储获取自定义 JSON 路径，如果没有则使用默认路径
        const jsonPath = localStorage.getItem('appsJsonPath') || 'data/apps.json';
        const response = await fetch(jsonPath);
        const data = await response.json();
        return data.apps;
    } catch (error) {
        console.error('加载应用数据失败:', error);
        return [];
    }
}

// 添加设置 JSON 路径的函数
function setCustomJsonPath(path) {
    try {
        localStorage.setItem('appsJsonPath', path);
        // 重新加载页面以应用新的 JSON 文件
        window.location.reload();
    } catch (error) {
        console.error('设置 JSON 路径失败:', error);
    }
}

// 可以在控制台使用这个函数来更改 JSON 路径
window.setCustomJsonPath = setCustomJsonPath;

// 平台图标定义
const platformIcons = {
    windows: '<svg class="platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>',
    macos: '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.057 12.793c.03 2.642 2.353 3.543 2.384 3.556-.022.068-.373 1.277-1.242 2.545-.751 1.1-1.531 2.193-2.771 2.217-1.213.02-1.608-.718-2.997-.718-1.392 0-1.828.7-2.997.742-1.22.043-2.126-1.185-2.88-2.277-1.543-2.235-2.722-6.315-1.135-9.065.788-1.365 2.196-2.23 3.731-2.254 1.168-.02 2.27.788 2.984.788.711 0 2.023-.974 3.419-.833.585.024 2.23.235 3.284 1.777-.085.053-1.96 1.144-1.94 3.483zm-2.895-8.541c.624-.755 1.045-1.805.931-2.852-.902.036-1.993.6-2.64 1.353-.58.675-1.089 1.745-.949 2.766.99.077 2.035-.512 2.658-1.267z"/></svg>',
    linux: '<svg class="platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line><polyline points="7 20 12 17 17 20"></polyline></svg>',
    ios: '<svg class="platform-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg>',
    android: '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2c-0.29,0.18-0.39,0.57-0.22,0.86l1.84,3.18C3.1,12.01,0.8,15.68,0.33,20h23.33C23.2,15.68,20.9,12.01,17.6,9.48z M7,16c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S7.55,16,7,16z M17,16c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S17.55,16,17,16z"/></svg>',
    chrome: '<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12"/></svg>'
};

// 获取平台图标 HTML
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

// 渲染应用卡片
function renderAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
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
        <div class="app-details">
            <div class="long-description">${app.long_description}</div>
            <a href="${app.download_link}" class="download-button" target="_blank">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V3M12 15L8 11M12 15L16 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L2.621 19.485C2.72915 19.9177 2.97882 20.3018 3.33033 20.5763C3.68184 20.8508 4.11501 20.9999 4.561 21H19.439C19.885 20.9999 20.3182 20.8508 20.6697 20.5763C21.0212 20.3018 21.2708 19.9177 21.379 19.485L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                下载应用
            </a>
        </div>
        ${getPlatformIconsHTML(app.tags)}
        <div class="close-expanded"></div>
    `;

    // 为下载图标添加单独的点击事件
    const downloadIcon = card.querySelector('.download-icon-wrapper');
    downloadIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(app.download_link, '_blank');
    });

    // 修改卡片点击事件处理
    card.addEventListener('click', () => {
        // 如果卡片已经展开，则不执行任何操作
        if (card.classList.contains('expanded')) {
            return;
        }

        const rect = card.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 创建遮罩
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);

        // 创建占位元素，保持原来的空间
        const placeholder = document.createElement('div');
        placeholder.style.width = `${rect.width}px`;
        placeholder.style.height = `${rect.height}px`;
        placeholder.style.margin = window.getComputedStyle(card).margin;
        placeholder.style.visibility = 'hidden';
        card.parentNode.insertBefore(placeholder, card);

        // 定义关闭函数
        const closeCard = (e) => {
            if (e) e.stopPropagation(); // 阻止事件冒泡，避免点击关闭按钮时触发卡片展开
            overlay.classList.remove('active');
            card.classList.remove('expanded');
            card.style.top = `${rect.top}px`;
            card.style.left = `${rect.left}px`;
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;

            // 动画结束后清理
            setTimeout(() => {
                overlay.remove();
                placeholder.remove();
                card.style.position = '';
                card.style.top = '';
                card.style.left = '';
                card.style.width = '';
                card.style.height = '';
                card.style.maxHeight = ''; // Reset maxHeight
                card.style.margin = '';
            }, 300);
        };

        // 设置展开后的位置
        requestAnimationFrame(() => {
            card.style.position = 'fixed';
            card.style.top = `${rect.top}px`;
            card.style.left = `${rect.left}px`;
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.style.margin = '0';

            requestAnimationFrame(() => {
                card.classList.add('expanded');

                // 简化位置计算，使用固定值
                const expandedWidth = Math.min(600, window.innerWidth * 0.9);
                const expandedLeft = (window.innerWidth - expandedWidth) / 2;
                const fixedTopMargin = 80; // 固定上边距为80px

                card.style.top = `${fixedTopMargin}px`;
                card.style.left = `${expandedLeft}px`;
                card.style.width = `${expandedWidth}px`;
                card.style.maxHeight = `${window.innerHeight - fixedTopMargin - 60}px`; // 底部留60px空间
                card.style.height = 'auto';

                // 监听过渡结束，然后显示遮罩
                card.addEventListener('transitionend', function showOverlay() {
                    overlay.classList.add('active');
                    card.removeEventListener('transitionend', showOverlay);
                });
            });
        });

        // 点击遮罩层关闭详情
        overlay.addEventListener('click', closeCard);
        // 点击关闭按钮关闭
        card.querySelector('.close-expanded').addEventListener('click', closeCard);
    });

    // 添加图片加载处理
    const images = card.querySelectorAll('.desc-img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    });

    return card;
}

// 主题切换函数
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // 切换图标
    sunIcon.style.display = newTheme === 'dark' ? 'none' : 'block';
    moonIcon.style.display = newTheme === 'dark' ? 'block' : 'none';
}

// 初始化主题
function initializeTheme() {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 使用保存的主题或系统主题
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);

    // 设置正确的图标
    sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
    moonIcon.style.display = theme === 'dark' ? 'block' : 'none';

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// 添加主题切换事件监听
themeToggle.addEventListener('click', toggleTheme);

// 智能顶部栏逻辑
function initSmartHeader() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    const scrollThreshold = 10; // 触发变化的最小滚动距离

    window.addEventListener('scroll', () => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 忽略负滚动（例如 iOS 回弹效果）
        if (currentScrollTop < 0) return;

        // 只有当滚动距离超过阈值时才触发
        if (Math.abs(currentScrollTop - lastScrollTop) > scrollThreshold) {
            if (currentScrollTop > lastScrollTop && currentScrollTop > header.offsetHeight) {
                // 向下滚动且已滚过头部高度 -> 隐藏
                header.classList.add('header-hidden');
            } else {
                // 向上滚动 -> 显示
                header.classList.remove('header-hidden');
            }
            lastScrollTop = currentScrollTop;
        }
    }, { passive: true });
}

// 初始化应用
async function initializeApp() {
    initializeTheme();
    initSmartHeader(); // 初始化智能顶部栏
    const apps = await loadApps();

    // 初始化搜索功能
    initializeSearch(apps);

    // 收集所有唯一的标签
    const allTags = [...new Set(apps.flatMap(app => app.tags))];

    // 初始化标签过滤器
    const tagsFilter = document.getElementById('tagsFilter');
    allTags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'filter-tag';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            tagElement.classList.toggle('active');
            filterApps();
        });
        tagsFilter.appendChild(tagElement);
    });

    // 渲染应用卡片
    apps.forEach(app => {
        appsGrid.appendChild(renderAppCard(app));
    });

    // 过滤应用的函数
    function filterApps() {
        const selectedTags = Array.from(document.querySelectorAll('.filter-tag.active'))
            .map(tag => tag.textContent);

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
    }

    // 关闭模态框
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        appModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === appModal) {
            appModal.style.display = 'none';
        }
    });
}

// 启动应用
document.addEventListener('DOMContentLoaded', initializeApp);

// 显示当前的 JSON 路径
jsonPathInput.value = localStorage.getItem('appsJsonPath') || 'data/apps.json';

// 设置按钮点击事件
settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

// 保存按钮点击事件
saveButton.addEventListener('click', () => {
    const newPath = jsonPathInput.value.trim();
    if (newPath) {
        setCustomJsonPath(newPath);
    }
    settingsModal.style.display = 'none';
});

// 取消按钮点击事件
cancelButton.addEventListener('click', () => {
    jsonPathInput.value = localStorage.getItem('appsJsonPath') || 'data/apps.json';
    settingsModal.style.display = 'none';
});

// 点击弹窗外部关闭
settingsModal.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
}); 