// 获取 DOM 元素
const appsGrid = document.getElementById('appsGrid');
const appModal = document.getElementById('appModal');
const searchInput = document.getElementById('searchInput');
const tagsFilter = document.getElementById('tagsFilter');
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

// 加载应用数据
async function loadApps() {
    try {
        const response = await fetch('data/apps.json');
        const data = await response.json();
        return data.apps;
    } catch (error) {
        console.error('加载应用数据失败:', error);
        return [];
    }
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
                    <path d="M6.5 19C4.01472 19 2 16.9853 2 14.5C2 12.1564 3.79151 10.2313 6.07974 10.0194C6.54781 7.17213 9.02024 5 12 5C14.9798 5 17.4522 7.17213 17.9203 10.0194C20.2085 10.2313 22 12.1564 22 14.5C22 16.9853 19.9853 19 17.5 19H6.5Z" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 11V15M12 15L14 13M12 15L10 13" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
        
        // 创建遮罩（但暂不显示）
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
                card.style.top = `${window.innerHeight * 0.1 + scrollTop}px`;
                card.style.left = `${(window.innerWidth - Math.min(600, window.innerWidth * 0.9)) / 2}px`;
                card.style.width = `${Math.min(600, window.innerWidth * 0.9)}px`;
                card.style.height = 'auto';
                
                // 监听过渡结束，然后显示遮罩
                card.addEventListener('transitionend', function showOverlay() {
                    overlay.classList.add('active');
                    card.removeEventListener('transitionend', showOverlay);
                });
            });
        });
        
        // 点击遮罩层关闭详情
        overlay.addEventListener('click', () => {
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
                card.style.margin = '';
            }, 300);
        });
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

// 初始化应用
async function initializeApp() {
    initializeTheme();
    const apps = await loadApps();
    
    // 初始化搜索功能
    initializeSearch(apps);
    
    apps.forEach(app => {
        appsGrid.appendChild(renderAppCard(app));
    });
    
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