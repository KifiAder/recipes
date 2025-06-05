class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.activeUsers = 0;
        // 1. Читаем сохраненное состояние режима доступности
        this.isAccessibilityMode = localStorage.getItem('accessibilityMode') === 'true';
        
        this.attachShadow({ mode: 'open' });
        
        // setupUserCounter можно оставить здесь, если он не зависит от DOM, который будет создан позже
        this.setupUserCounter(); 
    }

    startClock() {
        this.updateClock();
        // Сохраняем ID интервала, чтобы его можно было очистить
        this.clockIntervalId = setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const clockElement = this.shadowRoot.querySelector('.clock');
        if (clockElement) {
            clockElement.textContent = `${hours}:${minutes}`;
        }
    }

    getBasePath() {
        const path = window.location.pathname;
        return path.includes('/pages/') ? '../' : './';
    }

    connectedCallback() {
        const basePath = this.getBasePath();
        
        // 2. Рендерим HTML. Атрибут aria-pressed на кнопке будет установлен на основе this.isAccessibilityMode
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --header-bg-color: #4CAF50;
                    --header-text-color: white;
                    --header-accent-color: #2c5c85;
                    --header-accent-text-color: white;
                    --header-hover-bg-color: rgba(255, 255, 255, 0.1);
                    display: block;
                }
                /* ... (остальные ваши стили внутри <style> остаются без изменений) ... */
                .header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background-color: var(--header-bg-color); 
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                    transition: background-color 0.3s ease, color 0.3s ease; 
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .accessibility-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .clock {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: var(--header-text-color); 
                    padding: 0.5rem 1rem;
                    background-color: rgba(0, 0, 0, 0.1); 
                    border-radius: 4px;
                }

                .accessibility-toggle {
                    background: none;
                    border: 1px solid transparent;
                    color: var(--header-text-color); 
                    font-size: 1.5rem;
                    padding: 0.5rem;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .accessibility-toggle[aria-pressed="true"] {
                    background-color: var(--header-text-color); 
                    color: var(--header-bg-color); 
                    border: 1px solid var(--header-bg-color);
                }

                .accessibility-toggle:hover {
                    background-color: var(--header-hover-bg-color); 
                }
                
                .accessibility-toggle[aria-pressed="true"]:hover {
                    opacity: 0.8; 
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    text-decoration: none;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: background-color 0.2s ease;
                }

                .logo:hover {
                    background-color: var(--header-hover-bg-color);
                }

                .logo-image {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                }

                .logo-text {
                    color: var(--header-text-color); 
                    font-size: 1.5rem;
                    font-weight: bold;
                    white-space: nowrap;
                }

                .nav {
                    display: flex;
                    gap: 2rem;
                }

                .nav-link {
                    color: var(--header-text-color); 
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    transition: background-color 0.2s ease;
                    line-height: 1;
                }

                .nav-link .icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2em;
                    line-height: 1;
                }

                .nav-link:hover,
                .nav-link.active { 
                    background-color: var(--header-hover-bg-color);
                }

                .user-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-count {
                    background-color: var(--header-accent-color); 
                    color: var(--header-accent-text-color); 
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.9rem;
                    font-weight: bold;
                    min-width: 2rem;
                    text-align: center;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .user-count::before {
                    content: '👥';
                    margin-right: 0.5rem;
                    line-height: 1;
                }

                .add-recipe-btn {
                    background-color: var(--header-accent-color); 
                    color: var(--header-accent-text-color); 
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    line-height: 1;
                }

                .add-recipe-btn:hover {
                    filter: brightness(110%);
                }

                @media (max-width: 768px) {
                    .logo-text {
                        font-size: 1.2rem;
                    }
                    
                    .logo-image {
                        width: 32px;
                        height: 32px;
                    }

                    .nav {
                        gap: 1rem;
                    }

                    .nav-link {
                        padding: 0.5rem;
                    }
                }
            </style>
            <header class="header">
                <div class="logo-container">
                    <a href="${basePath}index.html" class="logo">
                        <img src="${basePath}assets/images/logo.svg" alt="Логотип" class="logo-image">
                        <span class="logo-text">Cook's Manuscript</span>
                    </a>
                    <div class="accessibility-controls">
                        <div class="clock"></div>
                        <button 
                            class="accessibility-toggle" 
                            aria-pressed="${this.isAccessibilityMode.toString()}" 
                            aria-label="Режим для людей с особенностями зрения"
                            title="Режим для людей с особенностями зрения"
                        ><span>👁️</span></button>
                    </div>
                </div>
                <nav class="nav">
                    <a href="${basePath}index.html" class="nav-link">
                        <span class="icon">🏠</span>
                        <span>Главная</span>
                    </a>
                    <a href="${basePath}pages/catalog.html" class="nav-link">
                        <span class="icon">📚</span>
                        <span>Каталог</span>
                    </a>
                    <a href="${basePath}pages/about.html" class="nav-link">
                        <span class="icon">ℹ️</span>
                        <span>О нас</span>
                    </a>
                    <a href="${basePath}pages/favorite.html" class="nav-link">
                        <span class="icon">❤️</span>
                        <span>Избранное</span>
                    </a>
                </nav>
                <div class="user-actions">
                    <span class="user-count">${this.activeUsers}</span>
                    <button class="add-recipe-btn">
                        <span class="icon">📝</span>
                        Добавить свой рецепт
                    </button>
                </div>
            </header>
        `;

        // 3. Применяем класс 'accessibility-mode' к <html>, если нужно
        if (this.isAccessibilityMode) {
            document.documentElement.classList.add('accessibility-mode');
        } else {
            // Важно убедиться, что класс снят, если режим выключен (на случай, если он был добавлен ранее)
            document.documentElement.classList.remove('accessibility-mode');
        }

        this.startClock();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const accessibilityToggle = this.shadowRoot.querySelector('.accessibility-toggle');
        if (accessibilityToggle) {
            accessibilityToggle.addEventListener('click', () => {
                this.isAccessibilityMode = !this.isAccessibilityMode;
                // Обновляем aria-pressed непосредственно на элементе
                accessibilityToggle.setAttribute('aria-pressed', this.isAccessibilityMode.toString()); 
                
                if (this.isAccessibilityMode) {
                    document.documentElement.classList.add('accessibility-mode');
                } else {
                    document.documentElement.classList.remove('accessibility-mode');
                }
                // Сохраняем как строку
                localStorage.setItem('accessibilityMode', this.isAccessibilityMode.toString());
            });
        }

        const addRecipeBtn = this.shadowRoot.querySelector('.add-recipe-btn');
        if (addRecipeBtn) {
            addRecipeBtn.addEventListener('click', () => {
                const basePath = this.getBasePath();
                window.location.href = `${basePath}pages/add-recipe.html`;
            });
        }
        this.updateActiveLink();
    }

    updateActiveLink() {
        const currentPath = window.location.pathname;
        const links = this.shadowRoot.querySelectorAll('.nav-link');
        const basePath = this.getBasePath(); // Получаем basePath для корректного сравнения

        links.forEach(link => {
            link.classList.remove('active');
            // Нормализуем href для сравнения (убираем возможные './' или '../')
            const linkHref = new URL(link.getAttribute('href'), document.baseURI).pathname;
            const targetPath = new URL(basePath + link.getAttribute('href').replace(/^\.\//, ''), document.baseURI).pathname;
            
            // Более точное сравнение путей
            if (currentPath === linkHref || currentPath === targetPath || (currentPath === '/' && (linkHref === '/index.html' || targetPath === '/index.html'))) {
                 link.classList.add('active');
            }
        });
    }

    setupUserCounter() {
        const storedUsers = localStorage.getItem('activeUsers');
        if (storedUsers) {
            this.activeUsers = parseInt(storedUsers, 10); // Уточняем систему счисления
        }

        this.sessionId = Math.random().toString(36).substring(2, 15);
        this.registerUser();
        
        // Сохраняем ID интервала, чтобы его можно было очистить
        this.userCountIntervalId = setInterval(() => this.updateUserCount(), 30000);

        window.addEventListener('beforeunload', () => {
            this.unregisterUser();
        });
    }

    registerUser() {
        const now = Date.now();
        const sessions = JSON.parse(localStorage.getItem('userSessions') || '{}');
        
        Object.keys(sessions).forEach(id => {
            if (now - sessions[id] > 120000) { // 2 минуты
                delete sessions[id];
            }
        });
        
        sessions[this.sessionId] = now;
        localStorage.setItem('userSessions', JSON.stringify(sessions));
        this.updateUserCount();
    }

    unregisterUser() {
        const sessions = JSON.parse(localStorage.getItem('userSessions') || '{}');
        delete sessions[this.sessionId];
        localStorage.setItem('userSessions', JSON.stringify(sessions));
        // Нет необходимости вызывать updateUserCount здесь, так как страница закрывается
    }

    updateUserCount() {
        const sessions = JSON.parse(localStorage.getItem('userSessions') || '{}');
        const now = Date.now();
        
        const activeCount = Object.values(sessions).filter(timestamp => 
            now - timestamp < 120000 // 2 минуты
        ).length;

        this.activeUsers = activeCount;
        localStorage.setItem('activeUsers', activeCount.toString());
        
        const userCountElement = this.shadowRoot.querySelector('.user-count');
        if (userCountElement) {
            userCountElement.textContent = this.activeUsers;
        }
    }

    // Добавляем disconnectedCallback для очистки интервалов
    disconnectedCallback() {
        if (this.clockIntervalId) {
            clearInterval(this.clockIntervalId);
        }
        if (this.userCountIntervalId) {
            clearInterval(this.userCountIntervalId);
        }
        // При удалении компонента (например, при переходе на другую страницу без полной перезагрузки)
        // стоит отрегистрировать пользователя, если это не происходит через beforeunload
        // this.unregisterUser(); // Раскомментируйте, если 'beforeunload' не всегда срабатывает
    }
}

customElements.define('header-component', HeaderComponent);