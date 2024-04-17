// Venter på at DOM er loadet før koden køres
document.addEventListener('DOMContentLoaded', function () {
    // Henter trackedMeals og trackedWater fra localStorage
    const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
    const trackedWater = JSON.parse(localStorage.getItem('trackedWater')) || [];
    const box1_3 = document.getElementById('box1-3'); // Finder div'en hvor data skal sættes ind
    const mealClass = 'meal-info'; // Laver en CSS klasse til måltiderne

    // Bruger funktionen combineDataByDate til at samle trackedMeals og trackedWater
    const combinedData = combineDataByDate(trackedMeals, trackedWater);

    // Itererer over alle de kombinerede data, og kalder de to funktioner der opdaterer næringsinfoen og vandinfoen
    combinedData.forEach(function (combined) {
        // Prøver at finde se hvis datoen allerede findes på siden
        const dateElement = document.querySelector(`.${mealClass}[data-date="${combined.date}"]`);
        // Hvis elementet findes, så opdaterer næringsinfoen for den dag
        if (dateElement) {
            updateNutritionalInfo(dateElement, combined.meal, mealClass);
            updateWaterInfo(dateElement, combined.water, mealClass);
        } else { // Hvis datoen ikke findes, så laver den et nyt element
            const newMealElement = createMealElement(combined.meal, mealClass);
            updateWaterInfo(newMealElement, combined.water, mealClass);
            box1_3.appendChild(newMealElement);
        }
    });
});

// Funktion der kombinerer data fra trackedMeals og trackedWater
function combineDataByDate(meals, water) {
    const combinedData = [];

    // Itererer over alle måltiderne
    meals.forEach(function (meal) {
        const date = meal.dateEaten.split('T')[0];
        // Bruger .filter til at finde vand-logs for den samme dag
        const waterOnDate = water.filter((w) => w.dateAndTime.split('T')[0] === date);

        // Tilføjer et nyt objekt til combinedData med måltidet og vand-logs
        combinedData.push({
            date,
            meal,
            water: waterOnDate,
        });
    });

    // Itererer gennem alle vand-logs og tjekker hvis der er en dato der ikke er i combinedData
    // Det her er for at sørge for at vand-logs der ikke har et måltid også bliver vist
    water.forEach(function (w) {
        const date = w.dateAndTime.split('T')[0];
        const hasMeals = combinedData.some((item) => item.date === date);
        // Hvis der ikke er et måltid på den dato, så tilføjer den et nyt objekt til combinedData med måltidsværdier sat til 0
        if (!hasMeals) {
            combinedData.push({
                date,
                meal: { dateEaten: w.dateAndTime, totalNutrition: { calories: 0, protein: 0, fat: 0, fiber: 0 } },
                water: [w],
            });
        }
    });

    return combinedData;
}


// Funktion der laver et nyt HTML-element for et måltid
function createMealElement(meal, mealClass) {
    // Laver et nyt div-element
    const mealElement = document.createElement('div');
    mealElement.classList.add('box1-2', mealClass);
    mealElement.dataset.date = meal.dateEaten.split('T')[0];
    
    // Laver et div-element for hver næringsværdi
    const dateDiv = document.createElement('div');
    dateDiv.textContent = meal.dateEaten.split('T')[0];

    const mealsDiv = document.createElement('div');
    mealsDiv.textContent = meal.totalNutrition.calories ? '1' : ''; // Display blank if no meal, '1' otherwise

    const waterDiv = document.createElement('div');
    waterDiv.textContent = '';

    const kcalDiv = document.createElement('div');
    kcalDiv.textContent = meal.totalNutrition.calories ? meal.totalNutrition.calories.toFixed(2) : '';

    const proteinDiv = document.createElement('div');
    proteinDiv.textContent = meal.totalNutrition.protein ? meal.totalNutrition.protein.toFixed(2) : '';

    const fatDiv = document.createElement('div');
    fatDiv.textContent = meal.totalNutrition.fat ? meal.totalNutrition.fat.toFixed(2) : '';

    const fiberDiv = document.createElement('div');
    fiberDiv.textContent = meal.totalNutrition.fiber ? meal.totalNutrition.fiber.toFixed(2) : '';
    
    // Tilføjer hver div til det nye div-element
    mealElement.appendChild(dateDiv);
    mealElement.appendChild(mealsDiv);
    mealElement.appendChild(waterDiv);
    mealElement.appendChild(kcalDiv);
    mealElement.appendChild(proteinDiv);
    mealElement.appendChild(fatDiv);
    mealElement.appendChild(fiberDiv);

    return mealElement;
}

// Funktion der opdaterer næringsinfoen for et måltid
function updateNutritionalInfo(element, meal, mealClass) {
    const mealsDiv = element.querySelector(`.${mealClass} > div:nth-child(2)`);
    mealsDiv.textContent = meal.totalNutrition.calories ? (parseInt(mealsDiv.textContent) + 1).toString() : ''; 

    const kcalDiv = element.querySelector(`.${mealClass} > div:nth-child(4)`);
    kcalDiv.textContent = meal.totalNutrition.calories ? (parseFloat(kcalDiv.textContent) + meal.totalNutrition.calories).toFixed(2) : '';

    const proteinDiv = element.querySelector(`.${mealClass} > div:nth-child(5)`);
    proteinDiv.textContent = meal.totalNutrition.protein ? (parseFloat(proteinDiv.textContent) + meal.totalNutrition.protein).toFixed(2) : '';

    const fatDiv = element.querySelector(`.${mealClass} > div:nth-child(6)`);
    fatDiv.textContent = meal.totalNutrition.fat ? (parseFloat(fatDiv.textContent) + meal.totalNutrition.fat).toFixed(2) : '';

    const fiberDiv = element.querySelector(`.${mealClass} > div:nth-child(7)`);
    fiberDiv.textContent = meal.totalNutrition.fiber ? (parseFloat(fiberDiv.textContent) + meal.totalNutrition.fiber).toFixed(2) : '';
}


// Funktion der opdaterer vandinfoen for et måltid
function updateWaterInfo(element, water, mealClass) {
    if (water.length > 0) {
        const waterDiv = element.querySelector(`.${mealClass} > div:nth-child(3)`);
        const totalWater = water.reduce((sum, w) => sum + w.amount, 0);
        waterDiv.textContent = totalWater;
    }
}
