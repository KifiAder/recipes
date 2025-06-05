class RecipeForm {
    constructor() {
        this.form = document.getElementById('add-recipe-form');
        this.ingredientsContainer = document.getElementById('ingredients-container');
        this.stepsContainer = document.getElementById('steps-container');
        this.addIngredientButton = document.getElementById('add-ingredient');
        this.addStepButton = document.getElementById('add-step');
        
        this.init();
    }

    init() {
        this.addEventListeners();
    }

    addEventListeners() {
        if (this.addIngredientButton) {
            this.addIngredientButton.addEventListener('click', () => this.addIngredientField());
        }
        if (this.addStepButton) {
            this.addStepButton.addEventListener('click', () => this.addStepField());
        }
        if (this.form) {
            // Удаляем старые обработчики перед добавлением нового
            this.form.removeEventListener('submit', this.handleSubmit.bind(this));
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        // Удаляем старый обработчик перед добавлением нового
        document.removeEventListener('click', this.handleRemoveClick.bind(this));
        document.addEventListener('click', this.handleRemoveClick.bind(this));
    }

    generateRandomRating() {
        return Math.floor(Math.random() * (5 - 3 + 1)) + 3;
    }

    createIngredientField() {
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        div.innerHTML = `
            <input type="text" name="ingredients[]" placeholder="Введите ингредиент" required>
            <button type="button" class="remove-ingredient" aria-label="Удалить ингредиент">×</button>
        `;
        return div;
    }

    createStepField() {
        const div = document.createElement('div');
        div.className = 'step-item';
        div.innerHTML = `
            <textarea name="steps[]" placeholder="Опишите шаг приготовления" required></textarea>
            <button type="button" class="remove-step" aria-label="Удалить шаг">×</button>
        `;
        return div;
    }

    addIngredientField() {
        this.ingredientsContainer.appendChild(this.createIngredientField());
    }

    addStepField() {
        this.stepsContainer.appendChild(this.createStepField());
    }

    handleRemoveClick(e) {
        if (e.target.classList.contains('remove-ingredient')) {
            this.removeItem(e.target, '.ingredient-item', this.ingredientsContainer, 'ингредиент');
        }
        
        if (e.target.classList.contains('remove-step')) {
            this.removeItem(e.target, '.step-item', this.stepsContainer, 'шаг приготовления');
        }
    }

    removeItem(button, itemSelector, container, itemName) {
        const item = button.closest(itemSelector);
        if (container.children.length > 1) {
            item.remove();
        } else {
            alert(`Должен быть хотя бы один ${itemName}!`);
        }
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const recipeData = {
            id: Date.now().toString(),
            name: formData.get('name'),
            type: formData.get('type'),
            rating: this.generateRandomRating(),
            ingredients: formData.getAll('ingredients[]')
                .map(ingredient => ingredient.trim())
                .filter(ingredient => ingredient),
            steps: formData.getAll('steps[]')
                .map(step => step.trim())
                .filter(step => step),
            image: formData.get('image')
        };
        console.log('Собранные данные формы:', recipeData);
        return recipeData;
    }

    async handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('Начало обработки отправки формы...');

        // Проверяем наличие хотя бы одного шага
        const steps = this.stepsContainer.querySelectorAll('textarea[name="steps[]"]');
        if (steps.length === 0) {
            alert('Должен быть хотя бы один шаг приготовления!');
            return;
        }

        const recipeData = this.collectFormData();
        console.log('Собранные данные рецепта:', recipeData);
        
        try {
            const saved = await this.saveRecipe(recipeData);
            if (saved) {
                alert('Рецепт успешно добавлен!');
                
                // Очищаем форму
                this.form.reset();
                
                // Очищаем контейнеры ингредиентов и шагов
                while (this.ingredientsContainer.children.length > 1) {
                    this.ingredientsContainer.removeChild(this.ingredientsContainer.lastChild);
                }
                while (this.stepsContainer.children.length > 1) {
                    this.stepsContainer.removeChild(this.stepsContainer.lastChild);
                }

                // Очищаем значения оставшихся полей
                const remainingInputs = this.form.querySelectorAll('input[type="text"], textarea');
                remainingInputs.forEach(input => input.value = '');

                // Перенаправляем на страницу каталога
                window.location.href = 'catalog.html';
            } else {
                alert('Произошла ошибка при сохранении рецепта. Попробуйте еще раз.');
            }
        } catch (error) {
            console.error('Ошибка при сохранении рецепта:', error);
            alert('Произошла ошибка при сохранении рецепта. Попробуйте еще раз.');
        }
    }

    async saveRecipe(recipeData) {
        try {
            console.log('Начало сохранения рецепта...');
            
            // Получаем текущие рецепты
            let recipes = [];
            const savedRecipes = localStorage.getItem('recipes');
            console.log('Текущие рецепты в localStorage:', savedRecipes);

            if (savedRecipes) {
                try {
                    recipes = JSON.parse(savedRecipes);
                    if (!Array.isArray(recipes)) {
                        console.error('Сохраненные рецепты не являются массивом, создаем новый массив');
                        recipes = [];
                    }
                } catch (e) {
                    console.error('Ошибка при разборе JSON из localStorage:', e);
                    recipes = [];
                }
            }

            // Обрабатываем изображение
            const imageFile = recipeData.image;
            if (imageFile instanceof File) {
                recipeData.image = `assets/${imageFile.name}`;
            } else {
                recipeData.image = 'assets/images/logo.svg';
            }

            // Проверяем обязательные поля
            if (!recipeData.name || !recipeData.type || !recipeData.ingredients.length || !recipeData.steps.length) {
                console.error('Не все обязательные поля заполнены:', recipeData);
                return false;
            }

            // Добавляем новый рецепт
            const newRecipe = {
                ...recipeData,
                id: Date.now().toString(),
                rating: this.generateRandomRating()
            };
            
            recipes.push(newRecipe);
            console.log('Массив рецептов перед сохранением:', recipes);

            // Сохраняем обновленный список
            const recipesJSON = JSON.stringify(recipes);
            localStorage.setItem('recipes', recipesJSON);
            console.log('Рецепты успешно сохранены в localStorage');

            // Проверяем, что данные действительно сохранились
            const savedData = localStorage.getItem('recipes');
            console.log('Проверка сохраненных данных:', savedData);

            return true;
        } catch (error) {
            console.error('Ошибка при сохранении рецепта:', error);
            return false;
        }
    }
}

// Инициализация формы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.recipeForm = new RecipeForm();
}); 