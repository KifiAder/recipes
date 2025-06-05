class RecipeWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isOpen = false;
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    }

    connectedCallback() {
        this.render();
        // Event listeners теперь настраиваются внутри render, после того как контент создан
    }

    // --- Логика работы с данными ---

    async loadAllRecipes() {
        try {
            const recipesJSON = localStorage.getItem('recipes');
            if (!recipesJSON) {
                // Если в localStorage пусто, загружаем из файла
                const response = await fetch('../data/recipes.json');
                const demoRecipes = await response.json();
                localStorage.setItem('recipes', JSON.stringify(demoRecipes));
                return demoRecipes;
            }
            return JSON.parse(recipesJSON);
        } catch (error) {
            console.error('Ошибка загрузки всех рецептов:', error);
            return [];
        }
    }

    async showRecipe(recipeId) {
        const allRecipes = await this.loadAllRecipes();
        const recipe = allRecipes.find(r => r.id === recipeId);

        if (!recipe) return;

        // Убедимся, что у рецепта есть массив для отзывов
        if (!recipe.reviews) {
            recipe.reviews = [];
        }

        this.isOpen = true;
        this.recipe = recipe;
        this.render();
    }

    // --- Логика для избранного и отзывов ---

    toggleFavorite() {
        if (!this.recipe) return;
        const index = this.favorites.indexOf(this.recipe.id);
        if (index === -1) {
            this.favorites.push(this.recipe.id);
        } else {
            this.favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.render(); // Перерисовываем виджет, чтобы обновить кнопку
    }

    isFavorite() {
        return this.recipe && this.favorites.includes(this.recipe.id);
    }

    async handleReviewSubmit(event) {
        event.preventDefault();
        const form = event.target;

        const name = form.querySelector('#reviewer-name').value;
        const rating = parseInt(form.querySelector('#review-rating').value, 10);
        const text = form.querySelector('#review-text').value;

        if (!name || !rating || !text) {
            alert('Пожалуйста, заполните все поля отзыва.');
            return;
        }

        const newReview = { name, rating, text };

        // 1. Получаем все рецепты
        const allRecipes = await this.loadAllRecipes();
        // 2. Находим индекс нашего рецепта
        const recipeIndex = allRecipes.findIndex(r => r.id === this.recipe.id);

        if (recipeIndex !== -1) {
            // 3. Добавляем отзыв
            if (!allRecipes[recipeIndex].reviews) {
                allRecipes[recipeIndex].reviews = [];
            }
            allRecipes[recipeIndex].reviews.push(newReview);

            // 4. Сохраняем обновленный массив рецептов обратно в localStorage
            localStorage.setItem('recipes', JSON.stringify(allRecipes));

            const widgetElement = this.shadowRoot.querySelector('.widget');
            const scrollPosition = widgetElement ? widgetElement.scrollTop : 0;

            this.recipe.reviews.push(newReview);

            this.render();

            requestAnimationFrame(() => {
                const newWidgetElement = this.shadowRoot.querySelector('.widget');
                if (newWidgetElement) {
                    newWidgetElement.scrollTop = scrollPosition;
                }
            });

        }
    }


    // --- Вспомогательные функции и рендеринг ---

    setupEventListeners() {
        if (!this.isOpen) return; // Не навешивать слушатели, если виджет закрыт

        const closeButton = this.shadowRoot.querySelector('.close-button');
        const overlay = this.shadowRoot.querySelector('.overlay');
        const favoriteButton = this.shadowRoot.querySelector('.favorite-button');
        const reviewForm = this.shadowRoot.querySelector('#review-form');

        const closeWidget = () => {
            this.isOpen = false;
            this.render();
        };

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeWidget();
                }
            });
        }
        if (closeButton) {
            closeButton.addEventListener('click', closeWidget);
        }
        if (favoriteButton) {
            favoriteButton.addEventListener('click', () => this.toggleFavorite());
        }
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => this.handleReviewSubmit(e));
        }
    }

    createRatingStars(rating) {
        const maxRating = 5;
        let stars = '';
        for (let i = 0; i < maxRating; i++) {
            stars += i < rating ? '⭐' : '☆';
        }
        return stars;
    }

    render() {
        const styles = `
            /* ... все ваши существующие стили для виджета ... */
            .overlay { display: ${this.isOpen ? 'flex' : 'none'}; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
            .widget { background: white; border-radius: 8px; padding: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .close-button { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; padding: 5px; color: #333; line-height: 1; }
            .recipe-image { width: 100%; height: 300px; object-fit: cover; border-radius: 4px; margin-bottom: 20px; }
            .recipe-title { font-size: 24px; margin-bottom: 10px; color: #333; }
            .recipe-rating { margin-bottom: 20px; font-size: 18px; }
            .recipe-section { margin-bottom: 20px; border-top: 1px solid #eee; padding-top: 20px; }
            .recipe-section h3, .recipe-section h4 { color: #333; margin-bottom: 10px; }
            .ingredients-list, .steps-list { list-style-position: inside; padding-left: 0; }
            .ingredients-list li, .steps-list li { margin-bottom: 8px; line-height: 1.5; }
            .favorite-button { display: block; width: 100%; padding: 12px; margin-bottom: 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background-color 0.3s; }
            .favorite-button.active { background-color: #ff4444; color: white; }
            .favorite-button:not(.active) { background-color: #4CAF50; color: white; }

            /* НОВЫЕ СТИЛИ ДЛЯ ОТЗЫВОВ */
            .reviews-list .review-item {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
            }
            .reviews-list .review-item:last-child {
                border-bottom: none;
            }
            .review-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }
            .review-header strong { font-size: 1.1em; }
            .review-text { color: #555; }
            
            #review-form { display: flex; flex-direction: column; gap: 10px; }
            #review-form input, #review-form select, #review-form textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 1rem;
                box-sizing: border-box; /* Важно для правильного padding */
            }
            #review-form button {
                background-color: var(--text-color, #333);
                color: white;
                padding: 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.3s;
            }
            #review-form button:hover { background-color: #555; }
        `;

        const content = this.isOpen && this.recipe ? `
            <div class="overlay">
                <div class="widget">
                    <button class="close-button" aria-label="Закрыть">×</button>
                    <img src="${this.recipe.image}" alt="${this.recipe.name}" class="recipe-image">
                    <h2 class="recipe-title">${this.recipe.name}</h2>
                    <div class="recipe-rating">${this.createRatingStars(this.recipe.rating)}</div>
                    
                    <button class="favorite-button ${this.isFavorite() ? 'active' : ''}">
                        ${this.isFavorite() ? 'Убрать из избранного' : 'Добавить в избранное'}
                    </button>

                    <div class="recipe-section">
                        <h3>Ингредиенты:</h3>
                        <ul class="ingredients-list">${this.recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
                    </div>
                    
                    <div class="recipe-section">
                        <h3>Инструкция приготовления:</h3>
                        <ol class="steps-list">${this.recipe.steps.map(step => `<li>${step}</li>`).join('')}</ol>
                    </div>

                    <!-- НОВЫЙ БЛОК ДЛЯ ОТЗЫВОВ -->
                    <div class="recipe-section reviews-section">
                        <h3>Отзывы:</h3>
                        <div class="reviews-list">
                            ${this.recipe.reviews && this.recipe.reviews.length > 0
                ? this.recipe.reviews.map(review => `
                                    <div class="review-item">
                                        <div class="review-header">
                                            <strong>${review.name}</strong>
                                            <span>${this.createRatingStars(review.rating)}</span>
                                        </div>
                                        <p class="review-text">${review.text}</p>
                                    </div>
                                `).join('')
                : '<p>Отзывов пока нет. Будьте первым!</p>'
            }
                        </div>
                    </div>

                    <!-- НОВАЯ ФОРМА ДЛЯ ДОБАВЛЕНИЯ ОТЗЫВА -->
                    <div class="recipe-section review-form-section">
                        <h4>Оставить отзыв</h4>
                        <form id="review-form">
                            <input type="text" id="reviewer-name" placeholder="Ваше имя" required>
                            <select id="review-rating" required>
                                <option value="" disabled selected>Выберите оценку</option>
                                <option value="5">5 звезд ⭐⭐⭐⭐⭐</option>
                                <option value="4">4 звезды ⭐⭐⭐⭐</option>
                                <option value="3">3 звезды ⭐⭐⭐</option>
                                <option value="2">2 звезды ⭐⭐</option>
                                <option value="1">1 звезда ⭐</option>
                            </select>
                            <textarea id="review-text" rows="4" placeholder="Напишите ваш отзыв..." required></textarea>
                            <button type="submit">Отправить отзыв</button>
                        </form>
                    </div>
                </div>
            </div>
        ` : '';

        this.shadowRoot.innerHTML = `<style>${styles}</style>${content}`;
        this.setupEventListeners(); // Переносим вызов сюда, чтобы слушатели навешивались на актуальный DOM
    }
}

customElements.define('recipe-widget', RecipeWidget);