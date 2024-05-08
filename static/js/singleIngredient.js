// Function to fill the dropdown with food items
async function fillDropdown() {
    showLoadingOverlay();
    const ingredient = document.getElementById("ingredient").value.trim(); // Get the ingredient from the input field
    const apiKey = "168902";
    console.log("Test");
    fillDateTimeInput();

    // Check if the ingredient field is empty
    if (!ingredient) {
        alert("Please enter an ingredient.");
        hideLoadingOverlay();
        return;
    }

    try {
        const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${encodeURIComponent(ingredient)}`, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        });
        const result = await response.json();

        // Clear previous dropdown options
        const dropdown = document.getElementById("ingredientDropdown");
        dropdown.innerHTML = "";

        // Populate dropdown with food items
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
    hideLoadingOverlay();
}

// Function to show loading overlay
function showLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'flex';
}

// Function to hide loading overlay
function hideLoadingOverlay() {
    document.getElementById('loading-foodinspector').style.display = 'none';
}

// Add an event listener to the "ingredient" input field
document.getElementById("ingredient").addEventListener("keydown", function (event) {
    // Check if the pressed key is the Enter key
    if (event.key === "Enter") {
        // Prevent the default action of the Enter key (form submission)
        event.preventDefault();
        // Trigger the click event of the "Fill Dropdown" button
        document.getElementById("fillDropdownBtn").click();
    }
});

document.getElementById("quantity").addEventListener("keydown", function (event) {
    // Check if the pressed key is the Enter key
    if (event.key === "Enter") {
        // Prevent the default action of the Enter key (form submission)
        event.preventDefault();
        // Trigger the click event of the "Add Ingredient" button
        document.getElementById("createMealBtn").click();
    }
});

document.getElementById("dateInput").addEventListener("keydown", function (event) {
    // Check if the pressed key is the Enter key
    if (event.key === "Enter") {
        // Prevent the default action of the Enter key (form submission)
        event.preventDefault();
        // Trigger the click event of the "Add Ingredient" button
        document.getElementById("createMealBtn").click();
    }
});

//Funktion der gemmer gemmer trackedMeals i databasen ud fra den bruger som er logget ind.
const brugerNavn = localStorage.getItem('Brugernavn');
function saveTrackedMealsToDatabase(trackedMeals) {

    const meals = trackedMeals;

    fetch('/track-meals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brugerNavn, meals }), // Stringify the entire object containing mealsData and id
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save Trackedmeals to the database');
            }
            return response.json();
        })
        .then(data => {
            console.log('TrackedMeals saved to the database:', data);
            window.location.href = "mealTracker.html";
        })
        .catch(error => {
            console.error('Error saving Trackedmeals to the database:', error);
        });
}


// Function to get nutrition values from API
async function getNutritionValues(foodID, quantity) {
    showLoadingOverlay();
    const apiKey = "168902";
    const sortKeys = [1030, 1110, 1310, 1240];
    let nutritionValues = { calories: 0, protein: 0, fat: 0, fiber: 0 };

    // Loop through each sortKey and fetch nutrition values
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

            if (result.length > 0) {
                const valuePer100g = parseFloat(result[0].resVal.replace(',', '.'));
                const value = valuePer100g * (quantity / 100);
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
    hideLoadingOverlay();
    return nutritionValues;
}

// Function to auto-fill the date and time input field
function fillDateTimeInput() {
    const dateInput = document.getElementById('dateInput');
    const currentDate = new Date();
    const currentDatetime = currentDate.toISOString().slice(0, 16);
    dateInput.value = currentDatetime;
}

// Call the fillDateTimeInput function when the page loads
fillDateTimeInput();

// Function to get the user's location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
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

// Function to log a single ingredient as a meal
window.logIngredient = async function () {
    const ingredientName = document.getElementById("ingredientDropdown").options[document.getElementById("ingredientDropdown").selectedIndex].text;
    const selectedFoodID = document.getElementById("ingredientDropdown").value;

    console.log("Ingredient Name:", ingredientName);
    console.log("Selected Food ID:", selectedFoodID);

    const quantity = document.getElementById("quantity").value;
    const dateEaten = document.getElementById("dateInput").value; // Get the value of the date and time input field

    // Check if all fields are filled
    if (!ingredientName || !selectedFoodID || !quantity || !dateEaten) {
        alert("Please fill all fields.");
        return;
    }

    // Call getNutritionValues with the selected food ID
    try {
        const nutritionValues = await getNutritionValues(selectedFoodID, quantity);
        const location = await getUserLocation();
        const trackedMeal = {
            id: new Date().getTime(), // Using timestamp as ID
            name: ingredientName, // Name of the ingredient as meal name
            gramsEaten: parseFloat(quantity),
            totalNutrition: nutritionValues,
            dateEaten: dateEaten, // Use the value from the date and time input field
            latitude: location.latitude, // Leave as null for now, can be added later
            longitude: location.longitude // Leave as null for now, can be added later
        };

        // Update or create trackedMeals in localStorage
        const trackedMeals = JSON.parse(localStorage.getItem('trackedMeals')) || [];
        trackedMeals.push(trackedMeal);
        saveTrackedMealsToDatabase(JSON.stringify(trackedMeals));
        localStorage.setItem('trackedMeals', JSON.stringify(trackedMeals));
        


    } catch (error) {
        console.error('Error logging ingredient:', error);
        alert('Error logging ingredient. Please try again later.');
    }
};



