class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.activeUsers = 0;
        this.isAccessibilityMode = localStorage.getItem('accessibilityMode') === 'true';

        this.attachShadow({ mode: 'open' });
        this.setupUserCounter();
    }

    startClock() {
        this.updateClock();
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
            }
            .logo-container {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .logo-image {
                width: 40px;
                height: 40px;
            }
            .logo-text {
                color: var(--header-text-color);
                font-size: 1.5rem;
                font-weight: bold;
            }
            .nav-container {
                display: flex;
                align-items: center;
                gap: 2rem;
            }
            .nav {
                display: flex;
                gap: 1rem;
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
            }
            .nav-link:hover, .nav-link.active {
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

            /* --- СТИЛИ ДЛЯ МОБИЛЬНОГО МЕНЮ --- */
            .menu-toggle {
                display: none;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
                z-index: 1001;
            }
            .menu-toggle .icon-bar {
                display: block;
                width: 25px;
                height: 3px;
                background-color: var(--header-text-color);
                margin: 5px 0;
                transition: all 0.3s ease;
            }
            
            /* Стили для мобильной версии */
            @media (max-width: 900px)
                .header {
                    padding: 0 1rem;
                }
                .nav-container {
                    display: none;
                    position: absolute;
                    top: 60px;
                    left: 0;
                    right: 0;
                    background-color: var(--header-bg-color);
                    flex-direction: column;
                    padding: 1rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .nav-container.is-open {
                    display: flex;
                }
                .nav {
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                }
                .user-actions {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                    width: 100%;
                    justify-content: center;
                }
                .menu-toggle {
                    display: block;
                }
                .accessibility-controls {
                    display: none;
                }
            }
                </style>
        <header class="header">
            <a href="${basePath}index.html" class="logo">
                <img src="${basePath}assets/images/logo.svg" alt="Логотип" class="logo-image">
                <span class="logo-text">Cook's Manuscript</span>
            </a>
            
            <div class="nav-container">
                <nav class="nav">
                    <a href="${basePath}index.html" class="nav-link"><span>🏠</span><span>Главная</span></a>
                    <a href="${basePath}pages/catalog.html" class="nav-link"><span>📚</span><span>Каталог</span></a>
                    <a href="${basePath}pages/about.html" class="nav-link"><span>ℹ️</span><span>О нас</span></a>
                    <a href="${basePath}pages/favorite.html" class="nav-link"><span>❤️</span><span>Избранное</span></a>
                </nav>
                <div class="user-actions">
                    <span class="user-count">${this.activeUsers}</span>
                    <button class="add-recipe-btn"><span>📝</span> Добавить свой рецепт</button>
                </div>
            </div>

            <div class="accessibility-controls">
                <div class="clock"></div>
                <button class="accessibility-toggle" aria-pressed="${this.isAccessibilityMode.toString()}">
                    <span>👁️</span>
                </button>
            </div>

            <button class="menu-toggle" aria-label="Открыть меню" aria-expanded="false">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        </header>
    `;

        if (this.isAccessibilityMode) {
            document.documentElement.classList.add('accessibility-mode');
        }
        this.startClock();
        this.setupEventListeners();
    }
    setupEventListeners() {
        const menuToggle = this.shadowRoot.querySelector('.menu-toggle');
        const navContainer = this.shadowRoot.querySelector('.nav-container');

        // Обработчик для меню-гамбургера
        if (menuToggle && navContainer) {
            menuToggle.addEventListener('click', () => {
                const isOpen = navContainer.classList.toggle('is-open');
                menuToggle.setAttribute('aria-expanded', isOpen.toString());
            });
        }

        // Обработчик для кнопки доступности
        const accessibilityToggle = this.shadowRoot.querySelector('.accessibility-toggle');
        if (accessibilityToggle) {
            accessibilityToggle.addEventListener('click', () => {
                this.isAccessibilityMode = !this.isAccessibilityMode;
                accessibilityToggle.setAttribute('aria-pressed', this.isAccessibilityMode.toString());

                if (this.isAccessibilityMode) {
                    document.documentElement.classList.add('accessibility-mode');
                } else {
                    document.documentElement.classList.remove('accessibility-mode');
                }
                localStorage.setItem('accessibilityMode', this.isAccessibilityMode.toString());
            });
        }

        // Обработчик для кнопки "Добавить рецепт"
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
        ;
        const currentPath = window.location.pathname;
        const links = this.shadowRoot.querySelectorAll('.nav-link');
        const basePath = this.getBasePath();

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
            this.activeUsers = parseInt(storedUsers, 10);
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
    }
}

customElements.define('header-component', HeaderComponent);