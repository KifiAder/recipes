class FooterComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <style>
                .footer-container { /* Используем новое имя класса, чтобы точно избежать конфликтов */
                    background-color: #333;
                    color: #fff;
                    text-align: center;
                    padding: 1.5em 1em;
                    width: 100%;
                    display: flex;
                    flex-direction: column; /* Располагаем элементы в колонку */
                    align-items: center; /* Центрируем по горизонтали */
                    gap: 15px; /* Расстояние между блоками */
                    margin-top: auto; /* Прижимает футер к низу, если контента мало */
                }

                .footer-container a {
                    color: #fff;
                    text-decoration: none;
                    transition: color 0.2s ease, transform 0.2s ease;
                }

                /* Используйте ваш --primary-color или любой другой цвет */
                .footer-container a:hover {
                    color: #4CAF50; 
                }

                .social-links {
                    display: flex;
                    justify-content: center;
                    gap: 25px;
                }
                
                .social-links a i {
                    font-size: 1.8rem; /* Размер иконок */
                }

                .social-links a:hover {
                    transform: scale(1.15); /* Эффект увеличения при наведении */
                }

                .copyright-text {
                    font-size: 0.9em;
                }

                .visitor-counter {
                    font-size: 0.9em;
                }
            </style>

            <footer class="footer-container">
                <!-- Блок 1: Ссылки на соцсети -->
                <div class="social-links">
                    <a href="https://vk.com/club230760297?from=groups" target="_blank" rel="noopener noreferrer" aria-label="Наша группа ВКонтакте">
                        <i class="fab fa-vk"></i>
                    </a>
                    <a href="https://t.me/antihype_porno" target="_blank" rel="noopener noreferrer" aria-label="Наш канал в Telegram">
                        <i class="fab fa-telegram"></i>
                    </a>
                </div>

                <!-- Блок 2: Копирайт и политика -->
                <div class="copyright-text">
                    © 2025 | <a href="pages/privacy.html">Политика конфиденциальности</a> | <a href="pages/sitemap.html">Карта сайта</a>
                </div>
                
                <!-- Блок 3: Счетчик -->
                <div class="visitor-counter">
                    <script type="text/javascript" src="https://cdn.livetrafficfeed.com/static/hitcounterjs/live.js?sty=1&min=4&tz=Europe/Moscow"></script>
                    <noscript><a href="https://livetrafficfeed.com/hit-counter">Счетчик посещений</a></noscript>
                </div>
            </footer>
        `;
    }
}

customElements.define('footer-component', FooterComponent);