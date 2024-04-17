
// Laver en tom variabel til at holde måltidsdata
let mealData = {
    name: "",
    ingredients: []
};

// Deklarer en global variabel til foodID og foodName
let currentFood = null; 

// Funktion der viser en loading-GIF
function showLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'flex';
}

// Funktion der fjerner loading-GIF'en
function hideLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'none';
}

// Funktion der henter foodID fra API'en
async function getFoodID(ingredient) {
    // Variabler til at kalde API'en
    const apiKey = "168902";
    const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${encodeURIComponent(ingredient)}`;
    
    // Viser loading-GIF'en
    showLoadingOverlay();

    // Prøver at hente foodID'en fra API'en
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        });
        // Laver en const med resultatet fra API'en
        const result = await response.json();

        // Hvis der er et resultat, så sætter den foodID'en og foodName ind i currentFood
        if (result.length > 0) {
            currentFood = {
                foodID: result[0].foodID,
                foodName: result[0].foodName
            };
            return currentFood.foodID;
            // Hvis der ikke er et resultat, så viser den en fejlbesked
        } else {
            hideLoadingOverlay();
            throw new Error("No results found for the given ingredient.");
        }
    } catch (error) {
        // Hvis der er en fejl med at hente foodID'en, så viser den en fejlbesked
        throw new Error("Error fetching foodID. Please check console for details.");
    }
}

// Funktion der henter nutrition values fra API'en, med foodID'en fra getFoodID
async function getNutritionValues(foodID, quantity) {
    const apiKey = "168902";
    // Tager alle 4 sortKeys så man kan nemt kalde API'en flere gange
    const sortKeys = [1030, 1110, 1310, 1240];
    // Laver en tom variabel til at holde nutrition values
    let nutritionValues = { calories: 0, protein: 0, fat: 0, fiber: 0 };
    // En for loop der bruger "for of" i stedet for et indeks (i) loop, der kalder API'en for hver sortKey
    for (const sortKey of sortKeys) {
        const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`;
        // Prøver at hente nutrition values fra API'en
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-API-Key': apiKey,
                },
            });
            const result = await response.json();

            // Tager svaret fra API'en og sætter resVal ind i nutritionValues
            if (result.length > 0) {
                // Ændrer komma til punktum, så det kan bruges i parseFloat
                const valuePer100g = parseFloat(result[0].resVal.replace(',', '.'));
                // Beregner næringsværdien for den mængde der er indtastet
                const value = valuePer100g * (quantity / 100);
                // Switch case der sætter den rigtige næringsværdi ind i nutritionValues, 
                // baseret på hvilken sortKey der er blevet brugt i API'en
                switch (sortKey) {
                    case 1030:
                        nutritionValues.calories += value;
                        break;
                    case 1110:
                        nutritionValues.protein += value;
                        break;
                    case 1310:
                        nutritionValues.fat += value;
                        break;
                    case 1240:
                        nutritionValues.fiber += value;
                        break;
                    default:
                        break;
                }
            }
        } 
            // Fejlbesked hvis der er en fejl med at hente næringsværdierne
            catch (error) {
            console.error(`Error fetching nutrition values for sortKey ${sortKey}:`, error);
            throw new Error(`Error fetching nutrition values for sortKey ${sortKey}. Please check console for details.`);
        }
    }
    // Returnerer næringsværdierne
    return nutritionValues;
}

// Funktion der tilføjer ingredienser til et måltid
function addIngredient() {
    const mealName = document.getElementById("mealName").value;
    const ingredient = document.getElementById("ingredient").value;
    const quantity = document.getElementById("quantity").value;
    // Giver en alert hvis der ikke er indtastet en navn til måltidet
    if (!mealName) {
        alert("Please enter a meal name first.");
        return;
    }
    if (!ingredient) {
        alert("Please enter an ingredient first.");
        return;
    }
    if (!quantity) {
        alert("Please enter a quantity first.");
        return;
    }
    
    // Opdaterer mealData med navnet på måltidet
    mealData.name = mealName;
    
    // Kalder getFoodID
    getFoodID(ingredient)
        // Kalder getNutritionValues med foodID og mængde
        .then(foodID => getNutritionValues(foodID, quantity))
        // Tager næringsværdierne og sætter dem ind i mealData
        .then(nutritionValues => {
            mealData.ingredients.push({
                foodID: currentFood.foodID,
                foodName: currentFood.foodName,
                quantity,
                nutrition: nutritionValues
            });
            // Opdaterer ingredienslisten
            updateIngredientList();
        })
        .catch(error => {
            alert(error.message);
        });
    // Nulstiller input felterne
    document.getElementById("ingredient").value = "";
    document.getElementById("quantity").value = "";
}

// Funktion der opdaterer ingredienslisten
function updateIngredientList() {
    const ingredientList = document.getElementById("ingredientList");
    // Nulstiller listen hver gang en ingrediens er tilføjet
    ingredientList.innerHTML = "";

    // Opdaterer listen med de nuværende ingredienser og den nye ingrediens
    mealData.ingredients.forEach(({ foodName, quantity, nutrition }) => {
        // Laver en li til hver ingrediens
        const listItem = document.createElement("li");
        // Sætter indholdet af li'en til navn, mængde og næringsværdier
        listItem.textContent = `${foodName} - ${quantity} grams 
        (Calories: ${nutrition.calories.toFixed(2)}, 
        Protein: ${nutrition.protein.toFixed(2)}, 
        Fat: ${nutrition.fat.toFixed(2)}, 
        Fiber: ${nutrition.fiber.toFixed(2)})`;
        ingredientList.appendChild(listItem);
    });
    // Fjerner loading-GIF'en
    hideLoadingOverlay();
}

// Funktion der opretter et måltid
function createMeal() {
    // Alert hvis der er ingen ingredienser
    if (mealData.ingredients.length === 0) {
        alert("Please add at least one ingredient.");
        return;
    }
    // Gemmer måltiden i localStorage
    const jsonContent = JSON.stringify(mealData);
    localStorage.setItem(mealData.name, jsonContent);

    // Nulstiller mealData og ingredienslisten
    mealData = { name: "", ingredients: [] };
    // Opdaterer ingredienslisten så den er tom
    updateIngredientList();
    // Nulstiller input felterne
    document.getElementById("mealName").value = "";
    // Sender brugeren tilbage til Meal Creator
    window.location.href = "mealCreator.html"
}
