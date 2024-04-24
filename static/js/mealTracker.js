document.addEventListener('DOMContentLoaded', function () {








    
    // Retrieve meals from the createdMeals object
    const createdMeals = JSON.parse(localStorage.getItem('createdMeals')) || [];

    // Populate the dropdown menu with meals from createdMeals
    const mealDropdown = document.getElementById('mealDropdown');
    createdMeals.forEach(meal => {
        const option = document.createElement('option');
        option.value = meal.name;
        option.text = meal.name;
        mealDropdown.appendChild(option);
    });

    // Retrieve tracked meals from localStorage
    const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
    const trackedMealsList = document.getElementById('trackedMealsList');

    // Function to render tracked meals
    function renderTrackedMeal(trackedMeal) {
        const tableRow = document.createElement('li');
        tableRow.classList.add('tracked-meal-row');

        const nameColumnWidth = '80px';
        const properties = ['name', 'gramsEaten', 'totalNutrition.calories', 'totalNutrition.protein', 'totalNutrition.fat', 'totalNutrition.fiber', 'dateEaten'];

        properties.forEach((property, index) => {
            const cell = document.createElement('div');
            const value = property.split('.').reduce((obj, key) => obj[key], trackedMeal);

            if (typeof value === 'number') {
                cell.textContent = value.toFixed(1);
            } else {
                cell.textContent = value;

                if (index === 0) {
                    cell.style.width = nameColumnWidth;
                }
            }
            tableRow.appendChild(cell);
        });

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'editButton';
        editButton.onclick = function () {
            editMeal(trackedMeal.id);
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'deleteButton';
        deleteButton.onclick = function () {
            deleteMeal(trackedMeal.id);
        };

        tableRow.appendChild(editButton);
        tableRow.appendChild(deleteButton);

        trackedMealsList.appendChild(tableRow);
    }

    trackedMeals.forEach(renderTrackedMeal);

    function calculateNutrition(ingredients, gramsEaten) {
        const totalNutrition = { calories: 0, protein: 0, fat: 0, fiber: 0 };
        let totalGrams = 0;
        ingredients.forEach(ingredient => {
            totalGrams += parseFloat(ingredient.quantity);
        });
        ingredients.forEach(ingredient => {
            const factor = gramsEaten / totalGrams;
            totalNutrition.calories += ingredient.nutrition.calories * factor;
            totalNutrition.protein += ingredient.nutrition.protein * factor;
            totalNutrition.fat += ingredient.nutrition.fat * factor;
            totalNutrition.fiber += ingredient.nutrition.fiber * factor;
        });

        return totalNutrition;
    }

    window.logMeal = function () {
        const selectedMealName = mealDropdown.value;
        const gramsEaten = parseFloat(document.getElementById('gramsInput').value) || 0;
        const dateEaten = document.getElementById('dateInput').value;
        const selectedMeal = createdMeals.find(meal => meal.name === selectedMealName);

        if (selectedMeal) {
            const totalNutrition = calculateNutrition(selectedMeal.ingredients, gramsEaten);

            const trackedMeal = {
                id: new Date().getTime(),
                name: selectedMeal.name,
                gramsEaten: gramsEaten,
                totalNutrition: totalNutrition,
                dateEaten: dateEaten
            };

            const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
            trackedMeals.push(trackedMeal);
            localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));

            renderTrackedMeal(trackedMeal);
        }
    };

    window.editMeal = function (mealId) {
        const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
        const editedMeal = trackedMeals.find(meal => meal.id === mealId);

        if (editedMeal) {
            const newGramsEaten = parseFloat(prompt(`Edit grams eaten for ${editedMeal.name}:`, editedMeal.gramsEaten)) || 0;
            const newDateEaten = prompt(`Edit date & time for ${editedMeal.name}:`, editedMeal.dateEaten);

            const updatedNutrition = calculateNutrition(createdMeals.find(meal => meal.name === editedMeal.name).ingredients, newGramsEaten);

            editedMeal.gramsEaten = newGramsEaten;
            editedMeal.dateEaten = newDateEaten;
            editedMeal.totalNutrition = updatedNutrition;
            localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));

            trackedMealsList.innerHTML = '';
            trackedMeals.forEach(renderTrackedMeal);
        }
    };

    window.deleteMeal = function (mealId) {
        const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
        const updatedTrackedMeals = trackedMeals.filter(meal => meal.id !== mealId);

        localStorage.setItem('trackedMeals', JSON.stringify(updatedTrackedMeals));

        trackedMealsList.innerHTML = '';
        updatedTrackedMeals.forEach(renderTrackedMeal);
    };
});
