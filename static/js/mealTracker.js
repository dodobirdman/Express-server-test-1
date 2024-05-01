document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Get the username from the cookie
        const username = document.cookie.split(';')
            .map(cookie => cookie.trim())
            .find(cookie => cookie.startsWith('username='))
            .split('=')[1];

        // Call the fetch-data endpoint to retrieve data from the server
        const response = await fetch('/fetch-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Failed to fetch data from the server');
        }

        // Parse the response JSON
        const responseData = await response.json();
        console.log('Response data:', responseData);

        // Assuming responseData is an object containing the fetched data

        // Save the fetched data to localStorage
        // Modify this part based on the structure of the fetched data and how you want to store it in localStorage
        Object.entries(responseData).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
        });

        console.log('Data fetched and saved to localStorage successfully.');

        // Continue with the rest of your code here...

        // Henter måltiderne fra localStorage
        const savedMeals = Object.keys(localStorage)
            .filter(key => key !== 'trackedMeals' && key !== 'trackedWater') // Ekskluderer trackedMeals og trackedWater
            .map(key => JSON.parse(localStorage.getItem(key)));

        // Sætter måltiderne ind i dropdown menuen
        const mealDropdown = document.getElementById('mealDropdown');
        savedMeals.forEach(meal => {
            const option = document.createElement('option');
            option.value = meal.name;
            option.text = meal.name;
            mealDropdown.appendChild(option);
        });

        // Henter de tidligere tracked meals fra localStorage når siden loader
        const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
        const trackedMealsList = document.getElementById('trackedMealsList');

        // Viser de tracked meals der er gemt i localStorage
        trackedMeals.forEach(renderTrackedMeal);

        // Funktion til at beregne næringsindholdet i portionen
        function calculateNutrition(ingredients, gramsEaten) {
            // Sætter totalNutrition og grams til 0
            const totalNutrition = { calories: 0, protein: 0, fat: 0, fiber: 0 };
            let totalGrams = 0;
            // Løber igennem alle ingredienserne og lægger deres næringsindhold sammen
            ingredients.forEach(ingredient => {
                totalGrams += parseFloat(ingredient.quantity); // Sørger for at quantity er et tal
            });
            // Tager næringsindholdet for hver ingrediens og ganger det med hvor mange gram der er spist af måltidet
            ingredients.forEach(ingredient => {
                const factor = gramsEaten / totalGrams;
                totalNutrition.calories += ingredient.nutrition.calories * factor;
                totalNutrition.protein += ingredient.nutrition.protein * factor;
                totalNutrition.fat += ingredient.nutrition.fat * factor;
                totalNutrition.fiber += ingredient.nutrition.fiber * factor;
            });

            return totalNutrition;
        }

        // Funktion til at logge et måltid med dato og tidspunkt
        window.logMeal = function () {
            const selectedMealName = mealDropdown.value;
            const gramsEaten = parseFloat(document.getElementById('gramsInput').value) || 0; // Sørger for at gramsEaten er et tal
            const dateEaten = document.getElementById('dateInput').value; // Tager dato og tidspunkt fra input-feltet
            const selectedMeal = savedMeals.find(meal => meal.name === selectedMealName); // Finder det valgte måltid
    
            // Gemmer måltidet i localStorage
            if (selectedMeal) {
                const totalNutrition = calculateNutrition(selectedMeal.ingredients, gramsEaten);

                // Bruger tidspunkt som ID i localStorage 
                const trackedMeal = {
                    id: new Date().getTime(),
                    name: selectedMeal.name,
                    gramsEaten: gramsEaten,
                    totalNutrition: totalNutrition,
                    dateEaten: dateEaten
                };

                // Opdaterer eller laver trackedMeals i localStorage
                const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
                trackedMeals.push(trackedMeal);
                localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));

                // Kalder renderTrackedMeal for at vise det nye måltid
                renderTrackedMeal(trackedMeal);
            }
        };

        // Funktion til at redigere et tracked måltid
        window.editMeal = function (mealId) {
            const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
            const editedMeal = trackedMeals.find(meal => meal.id === mealId);
            // If-statement til at redigere måltidet hvis den er fundet i localStorage
            if (editedMeal) {
                // Prompt til at redigere måltidet
                const newGramsEaten = parseFloat(prompt(`Edit grams eaten for ${editedMeal.name}:`, editedMeal.gramsEaten)) || 0;
                const newDateEaten = prompt(`Edit date & time for ${editedMeal.name}:`, editedMeal.dateEaten);

                // Bruger calculateNutrition til at tage ingredienserne fra måltidet og gange dem med den nye mængde
                const updatedNutrition = calculateNutrition(savedMeals.find(meal => meal.name === editedMeal.name).ingredients, newGramsEaten);

                // Opdaterer den redigerede måltid
                editedMeal.gramsEaten = newGramsEaten;
                editedMeal.dateEaten = newDateEaten;
                editedMeal.totalNutrition = updatedNutrition;
                // Sætter den opdaterede måltid ind i trackedMeals
                localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));

                // Sletter den gamle liste og viser den nye liste med måltider
                trackedMealsList.innerHTML = '';
                trackedMeals.forEach(renderTrackedMeal);
            }
        };

        // Funktion til at slette et tracked måltid
        window.deleteMeal = function (mealId) {
            const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
            const updatedTrackedMeals = trackedMeals.filter(meal => meal.id !== mealId);

            localStorage.setItem('trackedMeals', JSON.stringify(updatedTrackedMeals));

            // Sletter den gamle liste og viser den nye liste med måltider
            trackedMealsList.innerHTML = '';
            updatedTrackedMeals.forEach(renderTrackedMeal);
        };
    } catch (error) {
        console.error('Error:', error);
    }
});