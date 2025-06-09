function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

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
            this.form.removeEventListener('submit', this.handleSubmit.bind(this));
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
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
                this.form.reset();
                while (this.ingredientsContainer.children.length > 1) {
                    this.ingredientsContainer.removeChild(this.ingredientsContainer.lastChild);
                }
                while (this.stepsContainer.children.length > 1) {
                    this.stepsContainer.removeChild(this.stepsContainer.lastChild);
                }
                const remainingInputs = this.form.querySelectorAll('input[type="text"], textarea');
                remainingInputs.forEach(input => input.value = '');
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
            const savedRecipesJSON = localStorage.getItem('recipes');

            if (savedRecipesJSON) {
                recipes = JSON.parse(savedRecipesJSON);
                if (!Array.isArray(recipes)) recipes = [];
            } else {
                console.log('Хранилище пусто, загружаем демо-данные перед добавлением нового...');
                try {
                    const response = await fetch(`${getBasePath()}data/recipes.json`);
                    recipes = await response.json();
                } catch (e) {
                    console.error('Не удалось загрузить демо-рецепты:', e);
                    recipes = [];
                }
            }
            const imageFile = recipeData.image;

            if (imageFile instanceof File && imageFile.size > 0) {
                try {
                    recipeData.image = await toBase64(imageFile);
                } catch (error) {
                    console.error('Ошибка при чтении файла изображения:', error);
                    alert('Не удалось обработать изображение.');
                    return false;
                }
            } else {
                // В противном случае, это либо не файл, либо пустой файл. Ставим заглушку.
                recipeData.image = 'logo.svg';
            }

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
            const recipesJSON = JSON.stringify(recipes);
            localStorage.setItem('recipes', recipesJSON);
            console.log('Рецепты успешно сохранены в localStorage');
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