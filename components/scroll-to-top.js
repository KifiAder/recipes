class ScrollToTop extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                .scroll-to-top {
                    display: none;
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 50px;
                    height: 50px;
                    background-color: var(--secondary-color, #4CAF50);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                    z-index: 1000;
                    opacity: 0.8;
                }

                .scroll-to-top:hover {
                    opacity: 1;
                    transform: translateY(-3px);
                }

                .scroll-to-top::before {
                    content: "↑";
                    font-size: 24px;
                    line-height: 50px;
                    display: block;
                }

                @media (max-width: 768px) {
                    .scroll-to-top {
                        bottom: 20px;
                        right: 20px;
                        width: 40px;
                        height: 40px;
                    }

                    .scroll-to-top::before {
                        line-height: 40px;
                        font-size: 20px;
                    }
                }
            </style>
            <button class="scroll-to-top" title="Наверх"></button>
        `;

        this.button = this.shadowRoot.querySelector('.scroll-to-top');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Показывать/скрывать кнопку при прокрутке
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.button.style.display = 'block';
            } else {
                this.button.style.display = 'none';
            }
        });

        // Плавная прокрутка наверх при клике
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Доступность с клавиатуры
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
}

customElements.define('scroll-to-top', ScrollToTop); 