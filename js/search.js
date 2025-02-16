// 搜索状态管理
let searchState = {
    searchTerm: '',
    apps: []
};

// 初始化搜索功能
function initializeSearch(apps) {
    searchState.apps = apps;
    const searchInput = document.getElementById('searchInput');

    // 监听搜索输入
    searchInput.addEventListener('input', (e) => {
        searchState.searchTerm = e.target.value.toLowerCase().trim();
        updateResults();
    });
}

// 搜索应用
function filterApps() {
    return searchState.apps.filter(app => {
        return app.name.toLowerCase().includes(searchState.searchTerm) ||
               app.short_description.toLowerCase().includes(searchState.searchTerm) ||
               app.long_description.toLowerCase().includes(searchState.searchTerm) ||
               app.tags.some(tag => tag.toLowerCase().includes(searchState.searchTerm));
    });
}

// 更新搜索结果
function updateResults() {
    const filteredApps = filterApps();
    const appsGrid = document.getElementById('appsGrid');
    
    // 清空现有内容
    appsGrid.innerHTML = '';
    
    if (filteredApps.length === 0) {
        appsGrid.innerHTML = `
            <div class="no-results">
                <p>没有找到匹配的应用</p>
            </div>
        `;
        return;
    }

    // 渲染过滤后的应用
    filteredApps.forEach(app => {
        appsGrid.appendChild(renderAppCard(app));
    });
}

window.initializeSearch = initializeSearch; 