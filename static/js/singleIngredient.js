// Funktion der henter madvarer fra API'en og viser dem i en dropdown menu.
async function fillDropdown() {
    // viser loading-gif
    showLoadingOverlay();
    const ingredient = document.getElementById("ingredient").value.trim(); 
    const apiKey = "168902";
    // Funktion der autoudfylder dato og tid
    fillDateTimeInput();

    // Tjekker hvis ingredient feltet er tomt
    if (!ingredient) {
        alert("Please enter an ingredient.");
        hideLoadingOverlay();
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

        // Sletter mulige eksisterende elementer i dropdown menuen
        const dropdown = document.getElementById("ingredientDropdown");
        dropdown.innerHTML = "";

        // Tager array'et fra API'et og laver en option for hver fødevare
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
    // Skjuler loading-gif
    hideLoadingOverlay();
}

// Funktion til at vise loading gif
function showLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'flex';
}

// Funktion til at skjule loading gif
function hideLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'none';
}

// Event listener der kalder fillDropdown når brugeren trykker Enter
document.getElementById("ingredient").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        // Stopper default reload af siden
        event.preventDefault();
        // Trykker på HTML Fill Dropdown knappen
        document.getElementById("fillDropdownBtn").click();
    }
});

//  Event listener der kalder fillDropdown når brugeren trykker Enter
document.getElementById("quantity").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        // Stopper default reload af siden
        event.preventDefault();
        // Trykker på HTML Log Ingredient knappen
        document.getElementById("createMealBtn").click();
    }
});
document.getElementById("dateInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        // Stopper default reload af siden
        event.preventDefault();
        // Trykker på HTML Log Ingredient knappen
        document.getElementById("createMealBtn").click();
    }
});

//Funktion der gemmer trackedMeals i databasen ud fra den bruger som er logget ind.
// Henter brugernavn fra localStorage
const brugerNavn = localStorage.getItem('Brugernavn');
function saveTrackedMealsToDatabase(trackedMeals) {
    const meals = trackedMeals;
    // kalder /track-meals API'en, der gemmer trackedMeals i databasen
    fetch('/track-meals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brugerNavn, meals }), 
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save Trackedmeals to the database');
            }
            return response.json();
        }) 
        .then(data => {
            // Viderestiller til mealTracker.html
            console.log('TrackedMeals saved to the database:', data);
            window.location.href = "mealTracker.html";
        })
        .catch(error => {
            console.error('Error saving Trackedmeals to the database:', error);
        });
}


// Funktion der henter nutrition values fra Nutrition API'en, ved at bruge den valge foodID fra dropdown menuen
async function getNutritionValues(foodID, quantity) {
    // Viser loading-gif
    showLoadingOverlay();
    const apiKey = "168902";
    // Laver array af sort keys der står for kalorier, protein, fedt og fiber
    const sortKeys = [1030, 1110, 1310, 1240];
    let nutritionValues = { calories: 0, protein: 0, fat: 0, fiber: 0 };

    // Bruger for-of loop til at loope igennem arrayet, hvor hver loop har den tilsvarende sortKey sat til variablen sortKey
    for (const sortKey of sortKeys) {
        const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`;
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-API-Key': apiKey,
                },
            });
            const result = await response.json();
            // Tjekker at resultatet er større end 0, og regner nutrition values ud
            if (result.length > 0) {
                // Erstatter kommaer med punktummer
                const valuePer100g = parseFloat(result[0].resVal.replace(',', '.'));
                // Dividerer den indtastede kvantitet med 100, og ganger det med værdien per 100g for at få næringsværdien for den indtastede mængde
                const value = valuePer100g * (quantity / 100);
                // Bruger switch til at se hvilken sortKey er brugt i den nuværende loop, og sætter værdien til den tilsvarende attribut
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
        } catch (error) {
            console.error(`Error fetching nutrition values for sortKey ${sortKey}:`, error);
            throw new Error(`Error fetching nutrition values for sortKey ${sortKey}. Please check console for details.`);
        }
    }
    // Gemmer loading ikon
    hideLoadingOverlay();
    return nutritionValues;
}

// Funktion der autoudfylder dato og tid
function fillDateTimeInput() {
    const dateInput = document.getElementById('dateInput');
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
    dateInput.value = currentDatetime;
}

// Kalder autoudfyldning af dato og tid
fillDateTimeInput();

// Function der henter geolokation
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    // Sætter latitude og longitude til de hentede værdier
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve({ latitude, longitude });
                },
                error => {
                    reject(error);
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}

// Funktion der gemmer ingrediensen i den samme format som et måltid
window.logIngredient = async function () {
    // Henter værdier fra HTML
    const ingredientName = document.getElementById("ingredientDropdown").options[document.getElementById("ingredientDropdown").selectedIndex].text;
    const selectedFoodID = document.getElementById("ingredientDropdown").value;
    const quantity = document.getElementById("quantity").value;
    const dateEaten = document.getElementById("dateInput").value; 

    // Tjekker om alle felter er udfyldt
    if (!ingredientName || !selectedFoodID || !quantity || !dateEaten) {
        alert("Please fill all fields.");
        return;
    }

    // Kalder getNutritionValues funktionen, og gemmer resultatet i nutritionValues
    try {
        const nutritionValues = await getNutritionValues(selectedFoodID, quantity);
        const location = await getUserLocation();
        const trackedMeal = {
            id: new Date().getTime(), // Bruger tid som unik id
            name: ingredientName, // Sætter navnet til det valgte navn fra dropdown menuen
            gramsEaten: parseFloat(quantity),
            totalNutrition: nutritionValues,
            dateEaten: dateEaten, 
            latitude: location.latitude, 
            longitude: location.longitude 
        };

        // Opdaterer trackedMeals i localStorage eller skaber array'en hvis den ikke eksisterer
        const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
        // Pusher trackedMeal til trackedMeals arrayet
        trackedMeals.push(trackedMeal);
        // Gemmer til databasen
        saveTrackedMealsToDatabase(JSON.stringify(trackedMeals));
        // Opdaterer den lokal kopi af trackedMeals
        localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));
        


    } catch (error) {
        console.error('Error logging ingredient:', error);
        alert('Error logging ingredient. Please try again later.');
    }
};



