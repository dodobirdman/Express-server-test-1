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


// Function der sætter dataen fra nutrition API'en ind i dropdown-listen
async function fillDropdown() {
    // Viser loading gif'en så brugeren kan ikke interagere med siden og afbryde koden
    showLoadingOverlay();
    const ingredient = document.getElementById("ingredient").value.trim(); // Henter ingredient-string fra input feltet
    const apiKey = "168902";
    // Tjekker hvis ingredient feltet er tom
    if (!ingredient) {
        alert("Please enter an ingredient.");
        return;
    }
    // Kalder SearchString API'en med SearchString fra input feltet
    try {
        const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${encodeURIComponent(ingredient)}`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        });
        const result = await response.json();

        // Sletter eksisterende ingredienser i dropdown-listen
        const dropdown = document.getElementById("ingredientDropdown");
        dropdown.innerHTML = "";

        // Sætter de hentede ingredienser ind i dropdown-listen
        result.forEach(item => {
            const option = document.createElement("option");
            option.text = item.foodName;
            option.value = item.foodID;
            dropdown.add(option);
        });
    } catch (error) {
        console.error("Error fetching food items:", error);
        alert("Error fetching food items. Please try again later.");
    }
    // Fjerner loading gif'en
    hideLoadingOverlay();
}

// Event listener til ingredient feltet der kører dropdown funktionen når der trykkes enter
document.getElementById("ingredient").addEventListener("keydown", function(event) {
    // Tjekker hvis brugeren trykker "enter"
    if (event.key === "Enter") {
        // Stopper siden fra at reloade automatisk
        event.preventDefault();
        // Trykker på fill dropdown knappen
        document.getElementById("fillDropdownBtn").click();
    }
});
// Event listener til quantity feltet
document.getElementById("quantity").addEventListener("keydown", function(event) {
    // Tjekker hvis brugeren trykker "enter"
    if (event.key === "Enter") {
        // Stopper siden fra at reloade automatisk
        event.preventDefault();
        // Trykker på add ingredient knappen
        document.getElementById("addIngredientButton").click();
    }
});

// Funktion der henter nutrition values fra API'en, med foodID'en fra dropdown listen
async function getNutritionValues(foodID, quantity) {
    showLoadingOverlay();
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
    
    hideLoadingOverlay();
    // Returnerer næringsværdierne
    return nutritionValues;
    
}

function addIngredient() {
    const mealName = document.getElementById("mealName").value;
    const selectedFoodID = document.getElementById("ingredientDropdown").value;
    const quantity = document.getElementById("quantity").value;

    // Tjekker hvis felterne er udfyldt
    if (!mealName || !selectedFoodID || !quantity) {
        alert("Please fill all fields.");
        return;
    }

    // Kalder getNutritionValues med den valgte foodID og mængde
    getNutritionValues(selectedFoodID, quantity)
        .then(nutritionValues => {
            // Sætter dataen ind i mealData variablen
            mealData.name = mealName;
            mealData.ingredients.push({
                foodID: selectedFoodID,
                foodName: document.getElementById("ingredientDropdown").options[document.getElementById("ingredientDropdown").selectedIndex].text,
                quantity: quantity,
                nutrition: nutritionValues
            });

            // Opdaterer ingredienslisten
            updateIngredientList();

            // Fjerner tekst fra input felterne
            document.getElementById("ingredient").value = "";
            document.getElementById("ingredientDropdown").innerHTML = "";
            document.getElementById("quantity").value = "";
        })
        .catch(error => {
            alert(error.message);
        });
}

// Funktion der opdaterer ingredienslisten
function updateIngredientList() {
    const ingredientList = document.getElementById("ingredientList");
    // Nulstiller listen hver gang en ingrediens er tilføjet
    ingredientList.innerHTML = "";

    // Opdaterer listen med de eksisterende ingredienser med den ny ingrediens
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

// Henter brugernavn af den loggede ind brugere 
const brugerNavn = localStorage.getItem('Brugernavn');
// funktion til at gemme måltiden til databasen.
function saveMealsToDatabase(mealsData) {
    const meals = mealsData;
    // Kalder /save-meals API'en med brugernavn og måltider
    fetch('/save-meals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brugerNavn, meals }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save meals to the database');
        }
        return response.json();
    })
    // Giver succesbesked og sender brugeren tilbage til Meal Creator
    .then(data => {
        console.log('Meals saved to the database:', data);
        window.location.href = "mealCreator.html"
    })
    .catch(error => {
        console.error('Error saving meals to the database:', error);
    });
}


// Funktion der opretter et måltid
function createMeal() {
    // Alert hvis der er ingen ingredienser
    if (mealData.ingredients.length === 0) {
        alert("Please add at least one ingredient.");
        return;
    }

    // Henter eksisterende måltider fra localStorage eller opretter en tom liste
    let createdMeals = JSON.parse(localStorage.getItem('createdMeals')) || [];

    // Tilføjer det nye måltid til listen af måltider
    createdMeals.push(mealData);

    // Bruger saveMealsToDatabase til at gemme måltiderne i databasen
    saveMealsToDatabase(JSON.stringify(createdMeals));
    // Gemmer en kopi af måltiderne i localStorage
    localStorage.setItem('createdMeals', JSON.stringify(createdMeals));

    // Nulstiller mealData og ingredienslisten
    mealData = { name: "", ingredients: [] };
    // Opdaterer ingredienslisten så den er tom
    updateIngredientList();
    // Nulstiller input felterne
    document.getElementById("mealName").value = "";
}


