function loadMealData() {
    const mealListContainer = document.getElementById("box1-2");
    mealListContainer.innerHTML = ""; // Clear existing meals from the page

    // Loop through the createdMeals array in localStorage
    const createdMeals = JSON.parse(localStorage.getItem('createdMeals')) || [];
    createdMeals.forEach(mealData => {
        // Check if the structure of the meal data is correct
        if (mealData && Array.isArray(mealData.ingredients)) {
            let totalCalories = 0;
            let totalProtein = 0;
            let totalFat = 0;
            let totalFiber = 0;

            const mealContainer = document.createElement("div");
            mealContainer.className = "meal-item";

            const mealNameElement = document.createElement("div");
            mealNameElement.textContent = mealData.name;
            mealNameElement.className = "meal-name";
            mealContainer.appendChild(mealNameElement);

            const ingredientsList = document.createElement("ul");
            mealData.ingredients.forEach(ingredient => {
                const ingredientItem = document.createElement("li");

                const foodNameSpan = document.createElement("span");
                foodNameSpan.textContent = ingredient.foodName;
                foodNameSpan.className = "food-name-link";
                ingredientItem.appendChild(foodNameSpan);

                if (ingredient.nutrition) {
                    totalCalories += ingredient.nutrition.calories;
                    totalProtein += ingredient.nutrition.protein;
                    totalFat += ingredient.nutrition.fat;
                    totalFiber += ingredient.nutrition.fiber;

                    ingredientItem.innerHTML += 
                    ` - ${ingredient.quantity} grams 
                    (Calories: ${ingredient.nutrition.calories.toFixed(2)}, 
                    Protein: ${ingredient.nutrition.protein.toFixed(2)}, 
                    Fat: ${ingredient.nutrition.fat.toFixed(2)}, 
                    Fiber: ${ingredient.nutrition.fiber.toFixed(2)})`;
                } else {
                    ingredientItem.innerHTML += 
                    ` - ${ingredient.quantity} grams`;
                }

                ingredientsList.appendChild(ingredientItem);
            });

            mealContainer.appendChild(ingredientsList);

            const totalNutritionTitle = document.createElement("li");
            totalNutritionTitle.textContent = "Total Nutrition:";
            ingredientsList.appendChild(totalNutritionTitle);

            const totalNutritionValues = document.createElement("li");
            totalNutritionValues.textContent = 
            `Calories: ${totalCalories.toFixed(2)}, 
            Protein: ${totalProtein.toFixed(2)}, 
            Fat: ${totalFat.toFixed(2)}, 
            Fiber: ${totalFiber.toFixed(2)}`;
            ingredientsList.appendChild(totalNutritionValues);

            const totalIngredientsElement = document.createElement("div");
            totalIngredientsElement.textContent = `Total Ingredients: ${mealData.ingredients.length}`;
            totalIngredientsElement.className = "total-ingredients";
            mealContainer.appendChild(totalIngredientsElement);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-button";
            deleteButton.onclick = function () {
                deleteMeal(mealData.name);
                loadMealData();
            };
            mealContainer.appendChild(deleteButton);

            mealListContainer.appendChild(mealContainer);
        } else {
            console.error(`Invalid data for meal: ${mealData}`);
        }
    });
}

const brugerNavn = localStorage.getItem('Brugernavn');
// Add this function to your client-side JavaScript file
function saveMealsToDatabase(mealsData) {
    
    const meals = mealsData;
       
    fetch('/save-meals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brugerNavn, meals }), // Stringify the entire object containing mealsData and id
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save meals to the database');
        }
        return response.json();
    })
    .then(data => {
        console.log('Meals saved to the database:', data);
    })
    .catch(error => {
        console.error('Error saving meals to the database:', error);
    });
}





document.getElementById("box1-2").addEventListener("click", function (event) {
    const clickedElement = event.target;
    if (clickedElement.classList.contains("food-name-link")) {
        const foodName = clickedElement.textContent;
        openFoodInspector(foodName);
    }
});

function openFoodInspector(foodName) {
    window.open(`foodInspector.html?foodName=${encodeURIComponent(foodName)}`, '_blank');
}

function deleteMeal(mealName) {
    // Remove the meal from the createdMeals array in localStorage
    const createdMeals = JSON.parse(localStorage.getItem('createdMeals')) || [];
    const updatedMeals = createdMeals.filter(meal => meal.name !== mealName);
    saveMealsToDatabase(JSON.stringify(updatedMeals));
    localStorage.setItem('createdMeals', JSON.stringify(updatedMeals));
}

window.onload = function () {
    loadMealData();
};


async function fetchUserData(username) {
    try {
        const response = await fetch('/fetch-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from the server');
        }

        const responseData = await response.json();

        Object.entries(responseData).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });

        console.log('Data fetched and saved to localStorage successfully.');
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}
fetchUserData(brugerNavn);
