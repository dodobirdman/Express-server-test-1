function loadMealData() {
    const mealListContainer = document.getElementById("box1-2");
    mealListContainer.innerHTML = ""; // Sletter eksisternde indhold fra HTML

    // Loop igennem createdMeals i localstorage
    const createdMeals = JSON.parse(localStorage.getItem('createdMeals')) || [];
    createdMeals.forEach(mealData => {
        // Tjekker hvis strukturen af dataen er korrekt
        if (mealData && Array.isArray(mealData.ingredients)) {
            let totalCalories = 0;
            let totalProtein = 0;
            let totalFat = 0;
            let totalFiber = 0;

            // Skaber HTML elementer for hvert måltid
            const mealContainer = document.createElement("div");
            mealContainer.className = "meal-item";

            const mealNameElement = document.createElement("div");
            mealNameElement.textContent = mealData.name;
            mealNameElement.className = "meal-name";
            mealContainer.appendChild(mealNameElement);

            // laver en liste af ingredienser
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

            // Laver et element for total nutrition
            mealContainer.appendChild(ingredientsList);
            const totalNutritionTitle = document.createElement("li");
            totalNutritionTitle.textContent = "Total Nutrition:";
            ingredientsList.appendChild(totalNutritionTitle);

            // Sætter total nutrition ind som <li> elementer
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
            
            // Laver en slet knap for hvert måltid
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-button";
            deleteButton.onclick = function () {
                deleteMeal(mealData.name);
                loadMealData();
            };
            // Sætter elementer ind i HTML
            mealContainer.appendChild(deleteButton);
            mealListContainer.appendChild(mealContainer);
        } else {
            console.error(`Invalid data for meal: ${mealData}`);
        }
    });
}

// Henter brugernaven fra localstorage
const brugerNavn = localStorage.getItem('Brugernavn');
// Kalder save-meals API'en med brugernavn og måltider
function saveMealsToDatabase(mealsData) {
    
    const meals = mealsData;
    fetch('/save-meals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brugerNavn, meals }), // Laver et JSON objekt med brugernavn og måltider
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

// Funktion der sletter måltider fra databasen og opdater localStorage
function deleteMeal(mealName) {
    const createdMeals = JSON.parse(localStorage.getItem('createdMeals')) || [];
    const updatedMeals = createdMeals.filter(meal => meal.name !== mealName);
    saveMealsToDatabase(JSON.stringify(updatedMeals));
    localStorage.setItem('createdMeals', JSON.stringify(updatedMeals));
}

// Loader måltiderne når siden er loadet
window.onload = function () {
    loadMealData();
};

// Funktion til at hente brugerdata fra databasen
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
        console.log(responseData);
        Object.entries(responseData).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });

        console.log('Data fetched and saved to localStorage successfully.');
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}
// Kalder fetchUserData med brugernavnet
fetchUserData(brugerNavn);
