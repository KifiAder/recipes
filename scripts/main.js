function getBasePath() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '../' : './';
}

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];


// Функция для создания HTML-разметки рейтинга
function createRatingStars(rating) {
    const maxRating = 5;
    let stars = '';
    for (let i = 0; i < maxRating; i++) {
        if (i < rating) {
            stars += '⭐';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

// Функция для создания карточки рецепта
function createRecipeCard(recipe) {
    const basePath = getBasePath(); 

    console.log('Создание карточки для рецепта:', recipe);
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    if (!recipe || !recipe.name || !recipe.image) {
    }
    const imageUrl = recipe.image.startsWith('data:image') 
        ? recipe.image // Если это Base64 (локальная картинка), используем как есть
        : basePath + 'assets/' + recipe.image; // Иначе, это демо-картинка, строим путь
    
   card.innerHTML = `
        <button class="recipe-toggle ${isFavorite(recipe.id) ? 'active' : ''}" data-recipe-id="${recipe.id}" aria-label="${isFavorite(recipe.id) ? 'Удалить из избранного' : 'Добавить в избранное'}">
            ${isFavorite(recipe.id) ? '×' : '+'}
        </button>
        <img src="${imageUrl}" alt="${recipe.name}" onerror="this.onerror=null; this.src='${basePath}assets/images/logo.svg'; this.classList.add('fallback-image');">
        <div class="recipe-content">
            <h3 class="recipe-title">${recipe.name}</h3>
            <div class="recipe-info">
                <span class="recipe-type">${recipe.type || 'Не указан'}</span>
                <div class="recipe-rating">${createRatingStars(recipe.rating || 0)}</div>
            </div>
            <button class="recipe-button view-recipe" data-id="${recipe.id}">
                Посмотреть рецепт
            </button>
        </div>
    `;

    const viewButton = card.querySelector('.view-recipe');
    const toggleButton = card.querySelector('.recipe-toggle');

    viewButton.addEventListener('click', () => {
    const widget = document.querySelector('recipe-widget');
    if (widget) {
        widget.showRecipe(recipe.id);
    } else {
        console.error('RecipeWidget не найден на странице!');
        // Можно в качестве фолбэка перейти на recipe.html, если виджета нет
        // window.location.href = `/pages/recipe.html?id=${recipe.id}`; 
    }
});

    if (toggleButton) { // Добавляем проверку, что кнопка найдена
        toggleButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(event, recipe.id, toggleButton);
            // Обновление aria-label после изменения состояния
            toggleButton.setAttribute('aria-label', 
                toggleButton.classList.contains('active') ? 'Удалить из избранного' : 'Добавить в избранного'
            );
        });

        if (isFavorite(recipe.id)) {
            toggleButton.classList.add('active');
        }
    }
    return card;
}

// Загрузка и отображение рецептов
async function loadRecipes() {
    console.log('Начало загрузки рецептов...');
    try {
        const recipesJSON = localStorage.getItem('recipes');
        console.log('Данные из localStorage:', recipesJSON);

        if (!recipesJSON) {
            console.log('Рецепты не найдены в localStorage, загружаем демо-данные...');
            const response = await fetch('data/recipes.json');
            const demoRecipes = await response.json();
            localStorage.setItem('recipes', JSON.stringify(demoRecipes));
            return demoRecipes;
        }

        const recipes = JSON.parse(recipesJSON);
        console.log('Распарсенные рецепты:', recipes);

        if (!Array.isArray(recipes)) {
            console.error('Данные рецептов не являются массивом');
            return [];
        }

        return recipes;
    } catch (error) {
        console.error('Ошибка при загрузке рецептов:', error);
        return [];
    }
}

function generateRecipeCards(containerId, recipes) {
    console.log('Генерация карточек рецептов для контейнера:', containerId);
    console.log('Полученные рецепты:', recipes);

    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Контейнер не найден:', containerId);
        return;
    }

    if (!Array.isArray(recipes) || recipes.length === 0) {
        console.log('Нет рецептов для отображения');
        container.innerHTML = '<p class="no-recipes">Рецепты не найдены</p>';
        return;
    }

    container.innerHTML = '';
    recipes.forEach(recipe => {
        console.log('Создание карточки для рецепта:', recipe);
        const card = createRecipeCard(recipe);
        container.appendChild(card);
    });
    const toggleButtons = container.querySelectorAll('.recipe-toggle');
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = button.classList.contains('active');
            button.classList.toggle('active');
        });
    });
}

function generateFavoriteCards(containerId, recipes) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    recipes.forEach((recipe) => {
        const card = `
            <div class="recipe-card">
                <img src="${recipe.image}" 
                     alt="${recipe.name}"
                     onerror="this.onerror=null; this.src='assets/images/logo.svg'; this.classList.add('fallback-image');">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-rating">${createRatingStars(recipe.rating)}</div>
                    <button 
                        class="recipe-button" 
                        onclick="document.querySelector('recipe-widget').showRecipe('${recipe.id}')"
                        aria-label="Открыть рецепт ${recipe.name}">
                        Подробнее
                    </button>
                    <button 
                        class="recipe-button remove-favorite" 
                        onclick="removeFromFavorites('${recipe.id}')"
                        aria-label="Удалить из избранного">
                        Удалить из избранного
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });
}

async function showRecipeDetails() {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get("id");

    const allRecipes = await loadRecipes();
    const foundRecipe = allRecipes.find(r => r.id === recipeId);

    if (foundRecipe) {
        document.getElementById('recipe-name').innerText = foundRecipe.name;
        document.getElementById('recipe-img').src = foundRecipe.image;
        document.getElementById('recipe-rating').innerText = `Рейтинг: ${foundRecipe.rating}`;

        const ingredientList = document.getElementById('ingredient-list');
        foundRecipe.ingredients.forEach(ing => {
            let li = document.createElement('li');
            li.textContent = ing;
            ingredientList.appendChild(li);
        });

        const stepsOl = document.getElementById('instruction-steps');
        foundRecipe.steps.forEach(step => {
            let stepLi = document.createElement('li');
            stepLi.textContent = step;
            stepsOl.appendChild(stepLi);
        });
    }
}

function addToFavorites() {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get("id");

    if (!favorites.includes(recipeId)) {
        favorites.push(recipeId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`Рецепт успешно добавлен в избранное.`);
    } else {
        alert(`Рецепт уже находится в избранном.`);
    }
}

function removeFromFavorites(recipeId) {
    const index = favorites.indexOf(recipeId);
    if (index >= 0) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`Рецепт удалён из избранного.`);
        loadFavoriteRecipes();
    } else {
        alert(`Рецепт отсутствует в избранном.`);
    }
}

function isFavorite(recipeId) {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites.includes(recipeId);
    } catch (error) {
        console.error('Ошибка при проверке избранного:', error);
        return false;
    }
}

function toggleFavorite(event, recipeId, button) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Переключение избранного для рецепта:', recipeId);
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(recipeId);
    
    if (index === -1) {
        favorites.push(recipeId);
        button.classList.add('active');
        button.innerHTML = '×'; // <-- ДОБАВЛЕНО
        button.setAttribute('aria-label', 'Удалить из избранного');
    } else {
        favorites.splice(index, 1);
        button.classList.remove('active');
        button.innerHTML = '+'; // <-- ДОБАВЛЕНО
        button.setAttribute('aria-label', 'Добавить в избранное');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log('Обновленный список избранного:', favorites);
    
    // Если мы находимся на странице избранного, обновляем список
    if (window.location.pathname.endsWith('favorite.html')) {
        loadFavoriteRecipes();
    }
}


// Обновляем функцию загрузки избранных рецептов
async function loadFavoriteRecipes() {
    console.log('Загрузка избранных рецептов...');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    console.log('Список ID избранных рецептов:', favorites);
    
    try {
        const recipes = await loadRecipes();
        console.log('Загруженные рецепты:', recipes);
        
        const favoriteRecipes = recipes.filter(recipe => favorites.includes(recipe.id));
        console.log('Отфильтрованные избранные рецепты:', favoriteRecipes);
        
        const container = document.getElementById('favorites-container');
        if (container) {
            if (favoriteRecipes.length > 0) {
                generateRecipeCards('favorites-container', favoriteRecipes);
            } else {
                container.innerHTML = '<p class="no-favorites">У вас пока нет избранных рецептов</p>';
            }
        } else {
            console.error('Контейнер для избранных рецептов не найден');
        }
    } catch (error) {
        console.error('Ошибка при загрузке избранных рецептов:', error);
    }
}

// Функции для каталога
let filteredRecipes = [];
let currentSearchQuery = '';
let currentTypeFilter = 'all';
let currentRatingFilter = 'all';

function filterRecipes(recipes) {
    return recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(currentSearchQuery.toLowerCase());
        const matchesType = currentTypeFilter === 'all' || recipe.type.toLowerCase() === currentTypeFilter.toLowerCase();
        const matchesRating = currentRatingFilter === 'all' || recipe.rating >= parseInt(currentRatingFilter);
        return matchesSearch && matchesType && matchesRating;
    });
}

function updateCatalog() {
    const catalogContainer = document.getElementById('catalog-recipes');
    if (!catalogContainer) return;

    loadRecipes().then(recipes => {
        filteredRecipes = filterRecipes(recipes);
        generateRecipeCards('catalog-recipes', filteredRecipes);
    });
}

// Обработчики событий для фильтров
function setupCatalogControls() {
    const searchInput = document.getElementById('recipe-search');
    const typeFilter = document.getElementById('type-filter');
    const ratingFilter = document.getElementById('rating-filter');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            updateCatalog();
        });
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            currentTypeFilter = e.target.value;
            updateCatalog();
        });
    }

    if (ratingFilter) {
        ratingFilter.addEventListener('change', (e) => {
            currentRatingFilter = e.target.value;
            updateCatalog();
        });
    }
}

async function showBestRecipes() {
    try {
        const recipes = await loadRecipes();
        if (recipes && recipes.length > 0) {
            const bestRecipes = recipes
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5);
            
            generateRecipeCards('best-recipes', bestRecipes);
            const popularRecipes = recipes
                .sort(() => Math.random() - 0.5)
                .slice(0, 5);
            
            generateRecipeCards('popular-recipes', popularRecipes);
        }
    } catch (error) {
        console.error('Ошибка при отображении лучших рецептов:', error);
    }
}

function clearAllRecipes() {
    console.log('Очистка всех рецептов...');
    try {
        localStorage.clear();
        console.log('Локальное хранилище очищено');
        window.location.reload();
    } catch (error) {
        console.error('Ошибка при очистке хранилища:', error);
        alert('Произошла ошибка при очистке рецептов');
    }
}

function addClearButton(container) {
    if (!container.querySelector('.clear-recipes')) {
        const clearButton = document.createElement('button');
        clearButton.className = 'button clear-recipes';
        clearButton.textContent = 'Очистить все рецепты';
        clearButton.onclick = clearAllRecipes;
        container.parentElement.insertBefore(clearButton, container);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM загружен, начинаем инициализацию...');
    const path = window.location.pathname;
    
    try {
        const allRecipes = await loadRecipes();

        // Логика для разных страниц
        if (path.endsWith('index.html') || path === '/' || path.endsWith('Cooks-Manuscript/')) {
            const bestRecipes = [...allRecipes].sort((a, b) => b.rating - a.rating).slice(0, 5);
            generateRecipeCards('best-recipes', bestRecipes);
            
            const popularRecipes = [...allRecipes].sort(() => Math.random() - 0.5).slice(0, 5);
            generateRecipeCards('popular-recipes', popularRecipes);
        } 
        
        else if (path.endsWith('catalog.html')) {
            generateRecipeCards('catalog-recipes', allRecipes);
            setupCatalogControls();
        } 
        
        else if (path.endsWith('favorite.html')) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));
            const container = document.getElementById('favorites-container');
            if (container) {
                if (favoriteRecipes.length > 0) {
                    generateRecipeCards('favorites-container', favoriteRecipes);
                } else {
                    container.innerHTML = '<p class="no-favorites">У вас пока нет избранных рецептов</p>';
                }
            }
        }
    } catch (error) {
        console.error('Ошибка при инициализации страницы:', error);
    }
});