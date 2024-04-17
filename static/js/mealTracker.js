// Kører koden når DOM er loadet 
document.addEventListener('DOMContentLoaded', function () {

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


    // Funktion til at vise tracked måltider
    function renderTrackedMeal(trackedMeal) {
        const tableRow = document.createElement('li');
        tableRow.classList.add('tracked-meal-row');

        // Laver en fast bredde til navnet på måltidet
        const nameColumnWidth = '80px';

        // Laver en array med de egenskaber der skal vises
        const properties = ['name', 'gramsEaten', 'totalNutrition.calories', 'totalNutrition.protein', 'totalNutrition.fat', 'totalNutrition.fiber', 'dateEaten'];

        // Laver en div for hver egenskab og sætter den til den rigtige bredde
        properties.forEach((property, index) => {
            const cell = document.createElement('div');
            const value = property.split('.').reduce((obj, key) => obj[key], trackedMeal);

            // Sætter en fast decimalplads på talværdierne
            if (typeof value === 'number') {
                cell.textContent = value.toFixed(1);
            } else {
                cell.textContent = value;

                // Sætter en fast bredde på cellen
                if (index === 0) {
                    cell.style.width = nameColumnWidth;
                }
            }
            // Sætter cellen ind i tabelrækken
            tableRow.appendChild(cell);
        });

        // Laver en knap til at redigere måltidet
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'editButton';
        editButton.onclick = function () {
            editMeal(trackedMeal.id);
        };
        // Laver en knap til at slette måltidet
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'deleteButton';
        deleteButton.onclick = function () {
            deleteMeal(trackedMeal.id);
        };

        // Sætter knapperne ind i tabelrækken
        tableRow.appendChild(editButton);
        tableRow.appendChild(deleteButton);

        // Sætter rækken ind i tabellen
        trackedMealsList.appendChild(tableRow);
    }


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
});
