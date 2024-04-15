function loadMealData() {
    const mealListContainer = document.getElementById("box1-2");
    mealListContainer.innerHTML = ""; // Sletter eksisterende måltider fra siden

    // Looper igennem localStorage keys og sætter nøglen (navnet) til variablen mealName
    for (let i = 0; i < localStorage.length; i++) {
        const mealName = localStorage.key(i);
        // Henter dataen med nøglen (mealName)
        const mealData = JSON.parse(localStorage.getItem(mealName));

        // Tjekker hvis strukturen for den valgt localStorage-item er korrekt
        if (mealData && Array.isArray(mealData.ingredients)) {
            // Sætter total næringsværdier til 0
            let totalCalories = 0;
            let totalProtein = 0;
            let totalFat = 0;
            let totalFiber = 0;

            // Laver en div til hver måltid
            const mealContainer = document.createElement("div");
            mealContainer.className = "meal-item";

            // Laver en div til at vise mealName og sætter den til en klasse
            const mealNameElement = document.createElement("div");
            mealNameElement.textContent = mealName;
            mealNameElement.className = "meal-name";
            mealContainer.appendChild(mealNameElement);

            // Laver en ul til ingredienserne og sætter den til en klasse
            const ingredientsList = document.createElement("ul");
            mealData.ingredients.forEach(ingredient => {
                const ingredientItem = document.createElement("li");

                // Laver en span til foodName, med en klasse så den kan blive styled som en link
                const foodNameSpan = document.createElement("span");
                foodNameSpan.textContent = ingredient.foodName;
                foodNameSpan.className = "food-name-link";

                // Sætter foodName-span ind foran ingrediensens næringsværdier
                ingredientItem.appendChild(foodNameSpan);

                // Tæller næringsværdierne sammen for hver ingrediens
                if (ingredient.nutrition) {
                    totalCalories += ingredient.nutrition.calories;
                    totalProtein += ingredient.nutrition.protein;
                    totalFat += ingredient.nutrition.fat;
                    totalFiber += ingredient.nutrition.fiber;

                    // Sætter næringsinfo ind i HTML og afrunder værdierne
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

                // Sætter ingredientItem ind i ingredientsList
                ingredientsList.appendChild(ingredientItem);
            });

            // Sætter ingredientsList ind i mealContainer
            mealContainer.appendChild(ingredientsList);

            // Laver en li til total næringsværdier
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

            // Viser hvor mange ingredienser der er i alt
            const totalIngredientsElement = document.createElement("div");
            totalIngredientsElement.textContent = `Total Ingredients: ${mealData.ingredients.length}`;
            totalIngredientsElement.className = "total-ingredients";
            mealContainer.appendChild(totalIngredientsElement);

            // Laver en slet-knap 
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-button";
            deleteButton.onclick = function () {
                deleteMeal(mealName);
                loadMealData(); // Kalder deleteMeal når knappen er trykket, og så loader siden igen så den bliver fjernet
            };
            mealContainer.appendChild(deleteButton);

            // Sætter mealContainer ind i mealListContainer
            mealListContainer.appendChild(mealContainer);
        } else {
            // Skipper localStorage elementer med forkert data (fx trackedMeals og trackedWater)
            console.error(`Invalid data for meal: ${mealName}`);
        }
    }
}


// Kører openFoodInspector hvis en food-name er clicket, ved at filtrer baseret på klassen "food-name-link"
document.getElementById("box1-2").addEventListener("click", function (event) {
    const clickedElement = event.target;
    if (clickedElement.classList.contains("food-name-link")) {
        // Sætter navnet der blev trykket på ind i openFoodInspector
        const foodName = clickedElement.textContent;
        openFoodInspector(foodName);
    }
});

// Funktion der tager den foodName der blev trykket på og åbner en ny fane med Food Inspector
function openFoodInspector(foodName) {
    // Sætter foodName ind i linket så navnet kan blive brugt af getParameterByName i Food Inspector
    window.open(`foodInspector.html?foodName=${encodeURIComponent(foodName)}`, '_blank');
}


// Funktion til at slet et måltid
function deleteMeal(mealName) {
    localStorage.removeItem(mealName);
}

// Kører loadMealData når siden er åbnet
window.onload = function () {
    loadMealData();
};
